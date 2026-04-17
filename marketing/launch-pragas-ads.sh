#!/usr/bin/env bash
# launch-pragas-ads.sh
# Orquestra o launch das campanhas Meta Ads do Rumo Pragas IA quando o token for reativado.
#
# Anti-ban guardrails (REGRA ZERO-B):
#   - WRITE_INTERVAL_MS >= 1500
#   - MAX_WRITES_PER_5MIN = 15
#   - Cria TUDO em PAUSED por default. Ativa só após aprovação humana.
#   - Circuit breaker: se 3x HTTP 429 em 1min, aborta e alerta.
#
# Requisitos de ambiente:
#   META_ACCESS_TOKEN         (System User, long-lived, scope: ads_management + pages_read_engagement)
#   META_AD_ACCOUNT_ID        (act_25112854085004456)
#   META_PAGE_ID
#   META_IG_ACTOR_ID
#   META_PIXEL_ID
#   META_APP_ID
#   META_TEST_EVENT_CODE      (CAPI validation — opcional, só pra smoke test)
#
# Uso:
#   ./launch-pragas-ads.sh dry-run    # monta payloads e imprime, NÃO escreve
#   ./launch-pragas-ads.sh validate   # valida /me + CAPI + pixel
#   ./launch-pragas-ads.sh create     # cria campaign+adsets+ads em PAUSED
#   ./launch-pragas-ads.sh activate   # flipa pra ACTIVE (precisa confirmação interativa)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUNDLE="${SCRIPT_DIR}/meta-ads-launch-bundle.json"
LOG_DIR="${SCRIPT_DIR}/.launch-logs"
mkdir -p "$LOG_DIR"
RUN_TS="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="${LOG_DIR}/launch-${RUN_TS}.log"

GRAPH_VERSION="${GRAPH_VERSION:-v21.0}"
GRAPH_BASE="https://graph.facebook.com/${GRAPH_VERSION}"
WRITE_INTERVAL_MS="${WRITE_INTERVAL_MS:-1500}"
MAX_WRITES_5MIN=15

c_red='\033[0;31m'; c_green='\033[0;32m'; c_yellow='\033[0;33m'; c_blue='\033[0;34m'; c_reset='\033[0m'

log()  { echo -e "[$(date +%H:%M:%S)] $*" | tee -a "$LOG_FILE"; }
info() { log "${c_blue}INFO${c_reset}  $*"; }
warn() { log "${c_yellow}WARN${c_reset}  $*"; }
err()  { log "${c_red}ERR${c_reset}   $*"; }
ok()   { log "${c_green}OK${c_reset}    $*"; }

require_env() {
  local missing=0
  for v in META_ACCESS_TOKEN META_AD_ACCOUNT_ID META_PAGE_ID META_IG_ACTOR_ID META_PIXEL_ID; do
    if [[ -z "${!v:-}" ]]; then err "env var missing: $v"; missing=1; fi
  done
  [[ $missing -eq 0 ]] || { err "Abortando. Configure ~/.zshrc ou passe via env."; exit 1; }
}

require_tools() {
  for bin in jq curl python3; do
    command -v "$bin" >/dev/null || { err "Missing tool: $bin"; exit 1; }
  done
}

sleep_between_writes() {
  local sec
  sec=$(python3 -c "print(${WRITE_INTERVAL_MS}/1000)")
  sleep "$sec"
}

# ---- Rate-limit tracker (sliding 5min) ----
RATE_STATE="${LOG_DIR}/.rate-state"
touch "$RATE_STATE"

rate_check() {
  local now; now=$(date +%s)
  local cutoff=$((now - 300))
  python3 -c "
import sys
cutoff=$cutoff
now=$now
lines=[int(l.strip()) for l in open('$RATE_STATE') if l.strip().isdigit() and int(l.strip()) > cutoff]
if len(lines) >= $MAX_WRITES_5MIN:
    sys.stderr.write(f'Rate limit local: {len(lines)} writes in last 5min\n')
    sys.exit(2)
lines.append(now)
open('$RATE_STATE','w').write('\n'.join(str(x) for x in lines))
"
}

# ---- Circuit breaker ----
ERROR_429_COUNT=0
ERROR_429_WINDOW_START=$(date +%s)

circuit_breaker_check() {
  local http_code=$1
  local now; now=$(date +%s)
  if (( now - ERROR_429_WINDOW_START > 60 )); then
    ERROR_429_COUNT=0
    ERROR_429_WINDOW_START=$now
  fi
  if [[ "$http_code" == "429" ]]; then
    ERROR_429_COUNT=$((ERROR_429_COUNT+1))
    if (( ERROR_429_COUNT >= 3 )); then
      err "CIRCUIT BREAKER TRIPPED: 3x HTTP 429 em 1min. ABORTANDO."
      err "Parar todas as writes por 1h. Notificar CEO via WhatsApp."
      exit 99
    fi
  fi
}

graph_post() {
  local path=$1; shift
  rate_check
  local response http_code body
  response=$(curl -sS -o /tmp/graph_body.$$ -w '%{http_code}' -X POST \
    -H "Content-Type: application/json" \
    -d "$1" \
    "${GRAPH_BASE}${path}?access_token=${META_ACCESS_TOKEN}" || echo "000")
  http_code=$response
  body=$(cat /tmp/graph_body.$$); rm -f /tmp/graph_body.$$
  circuit_breaker_check "$http_code"
  if [[ ! "$http_code" =~ ^2 ]]; then
    err "POST $path -> $http_code"
    echo "$body" | jq . >> "$LOG_FILE" 2>/dev/null || echo "$body" >> "$LOG_FILE"
    return 1
  fi
  echo "$body"
  sleep_between_writes
}

graph_get() {
  local path=$1
  local response http_code body
  response=$(curl -sS -o /tmp/graph_body.$$ -w '%{http_code}' \
    "${GRAPH_BASE}${path}?access_token=${META_ACCESS_TOKEN}" || echo "000")
  http_code=$response
  body=$(cat /tmp/graph_body.$$); rm -f /tmp/graph_body.$$
  if [[ ! "$http_code" =~ ^2 ]]; then
    err "GET $path -> $http_code"
    echo "$body" >> "$LOG_FILE"
    return 1
  fi
  echo "$body"
}

# ==============================================================
# COMMAND: validate
# ==============================================================
cmd_validate() {
  info "=== VALIDATE ==="
  info "Testando /me (token health)..."
  local me; me=$(graph_get "/me") || { err "Token INVÁLIDO. Parar aqui."; exit 1; }
  ok "Token vivo: $(echo "$me" | jq -r '.name // .id')"

  info "Testando ad account..."
  local acct; acct=$(graph_get "/${META_AD_ACCOUNT_ID}?fields=id,name,account_status,currency,disable_reason") \
    || { err "Não consegui ler ad account"; exit 1; }
  local status; status=$(echo "$acct" | jq -r '.account_status')
  if [[ "$status" != "1" ]]; then
    err "Ad account não está ACTIVE (status=$status)."
    err "1 = ACTIVE, 2 = DISABLED, 3 = UNSETTLED, 7 = PENDING_REVIEW, 9 = IN_GRACE_PERIOD"
    err "Disable reason: $(echo "$acct" | jq -r '.disable_reason // "n/a"')"
    exit 1
  fi
  ok "Ad account ACTIVE: $(echo "$acct" | jq -r '.name') ($(echo "$acct" | jq -r '.currency'))"

  info "Testando Pixel..."
  graph_get "/${META_PIXEL_ID}?fields=id,name,last_fired_time" | jq -r '"  pixel: \(.name) last_fire=\(.last_fired_time // "never")"' | tee -a "$LOG_FILE"

  info "Testando CAPI endpoint da landing..."
  local capi_resp
  capi_resp=$(curl -sS -w '\n%{http_code}' -X POST https://pragas.agrorumo.com/api/capi \
    -H "Content-Type: application/json" \
    -d "{\"event_name\":\"PageView\",\"event_id\":\"validate-${RUN_TS}\",\"test_event_code\":\"${META_TEST_EVENT_CODE:-}\"}" || echo "000")
  local capi_http; capi_http=$(echo "$capi_resp" | tail -n1)
  if [[ "$capi_http" =~ ^2 ]]; then
    ok "CAPI /api/capi respondeu $capi_http"
  else
    warn "CAPI /api/capi respondeu $capi_http — não vai bloquear launch mas investigar."
  fi

  ok "Validação OK. Pode prosseguir para 'create'."
}

# ==============================================================
# COMMAND: dry-run
# ==============================================================
cmd_dry_run() {
  info "=== DRY RUN (nenhuma chamada à API será feita) ==="
  jq '{
    campaign: .campaign,
    adsets_names: [.adsets[].name],
    creatives_names: [.creatives[].name],
    headlines_chars: [.creatives[] | {name, h: (.headline|length), p: (.primary_text|length), d: (.description|length)}]
  }' "$BUNDLE"
  info "Headlines/primary/description dentro dos limites (<=40 / <=125 / <=30)? Revisar acima."
  info "Rode './launch-pragas-ads.sh validate' antes do 'create'."
}

# ==============================================================
# COMMAND: create (PAUSED)
# ==============================================================
cmd_create() {
  info "=== CREATE (status=PAUSED) ==="
  require_env
  cmd_validate

  local manifest="${LOG_DIR}/manifest-${RUN_TS}.json"
  echo '{"campaign_id":null,"adsets":{},"creatives":{},"ads":{}}' > "$manifest"

  # --- 1) Campaign ---
  info "Criando campaign..."
  local camp_payload; camp_payload=$(jq -c '.campaign | {
    name, objective, status, special_ad_categories,
    buying_type, daily_budget,
    bid_strategy,
    spend_cap
  }' "$BUNDLE")
  local camp_resp camp_id
  camp_resp=$(graph_post "/${META_AD_ACCOUNT_ID}/campaigns" "$camp_payload") || exit 1
  camp_id=$(echo "$camp_resp" | jq -r '.id')
  ok "Campaign criada: $camp_id"
  jq --arg id "$camp_id" '.campaign_id = $id' "$manifest" > "$manifest.tmp" && mv "$manifest.tmp" "$manifest"

  # --- 2) Ad Sets ---
  local adsets_count; adsets_count=$(jq '.adsets | length' "$BUNDLE")
  for i in $(seq 0 $((adsets_count-1))); do
    info "Criando ad set [$i]..."
    local ads_payload
    ads_payload=$(jq -c --arg camp "$camp_id" --arg pixel "$META_PIXEL_ID" \
      --argjson idx "$i" '
      .adsets[$idx] | {
        name,
        campaign_id: $camp,
        status,
        optimization_goal,
        billing_event,
        destination_type,
        promoted_object: (.promoted_object | .pixel_id = $pixel),
        attribution_spec,
        targeting
      }' "$BUNDLE")
    local ads_resp ads_id ads_name
    ads_resp=$(graph_post "/${META_AD_ACCOUNT_ID}/adsets" "$ads_payload") || exit 1
    ads_id=$(echo "$ads_resp" | jq -r '.id')
    ads_name=$(jq -r --argjson idx "$i" '.adsets[$idx].name' "$BUNDLE")
    ok "Ad set criado: $ads_id ($ads_name)"
    jq --arg name "$ads_name" --arg id "$ads_id" '.adsets[$name] = $id' "$manifest" > "$manifest.tmp" && mv "$manifest.tmp" "$manifest"
  done

  # --- 3) Creatives + Ads ---
  local creative_count; creative_count=$(jq '.creatives | length' "$BUNDLE")
  for i in $(seq 0 $((creative_count-1))); do
    local creative
    creative=$(jq -c --argjson idx "$i" '.creatives[$idx]' "$BUNDLE")
    local cr_name cr_headline cr_primary cr_desc cr_link cr_img_hash adset_ref adset_id
    cr_name=$(echo "$creative" | jq -r '.name')
    cr_headline=$(echo "$creative" | jq -r '.headline')
    cr_primary=$(echo "$creative" | jq -r '.primary_text')
    cr_desc=$(echo "$creative" | jq -r '.description')
    cr_link=$(echo "$creative" | jq -r '.link_url')
    cr_img_hash=$(echo "$creative" | jq -r '.image_hash_placeholder')
    adset_ref=$(echo "$creative" | jq -r '.adset_ref')
    adset_id=$(jq -r --arg n "$adset_ref" '.adsets[$n]' "$manifest")

    if [[ "$cr_img_hash" == REPLACE_WITH_* ]]; then
      warn "Creative [$i] $cr_name — image_hash ainda é placeholder. Pulando."
      warn "  Upload primeiro: curl -F 'filename=@image.jpg' ${GRAPH_BASE}/${META_AD_ACCOUNT_ID}/adimages?access_token=..."
      continue
    fi

    info "Criando creative [$i] $cr_name..."
    local creative_payload
    creative_payload=$(python3 -c "
import json
payload = {
  'name': '$cr_name',
  'object_story_spec': {
    'page_id': '$META_PAGE_ID',
    'instagram_actor_id': '$META_IG_ACTOR_ID',
    'link_data': {
      'image_hash': '$cr_img_hash',
      'link': '$cr_link',
      'message': '''$cr_primary''',
      'name': '''$cr_headline''',
      'description': '''$cr_desc''',
      'call_to_action': {'type':'DOWNLOAD','value':{'link':'$cr_link'}}
    }
  },
  'degrees_of_freedom_spec': {'creative_features_spec': {'standard_enhancements': {'enroll_status':'OPT_OUT'}}}
}
print(json.dumps(payload))
")
    local creative_resp creative_id
    creative_resp=$(graph_post "/${META_AD_ACCOUNT_ID}/adcreatives" "$creative_payload") || exit 1
    creative_id=$(echo "$creative_resp" | jq -r '.id')
    ok "Creative: $creative_id"
    jq --arg name "$cr_name" --arg id "$creative_id" '.creatives[$name] = $id' "$manifest" > "$manifest.tmp" && mv "$manifest.tmp" "$manifest"

    info "Criando ad [$i] $cr_name..."
    local ad_payload
    ad_payload=$(jq -nc --arg name "$cr_name" --arg adset "$adset_id" --arg cr "$creative_id" \
      '{ name: $name, adset_id: $adset, creative: { creative_id: $cr }, status: "PAUSED" }')
    local ad_resp ad_id
    ad_resp=$(graph_post "/${META_AD_ACCOUNT_ID}/ads" "$ad_payload") || exit 1
    ad_id=$(echo "$ad_resp" | jq -r '.id')
    ok "Ad: $ad_id"
    jq --arg name "$cr_name" --arg id "$ad_id" '.ads[$name] = $id' "$manifest" > "$manifest.tmp" && mv "$manifest.tmp" "$manifest"
  done

  ok "Todos os recursos criados em PAUSED."
  ok "Manifest: $manifest"
  info ""
  info "==> PRÓXIMO PASSO (aprovação humana obrigatória):"
  info "    ./launch-pragas-ads.sh activate"
}

# ==============================================================
# COMMAND: activate
# ==============================================================
cmd_activate() {
  info "=== ACTIVATE ==="
  require_env
  local latest_manifest
  latest_manifest=$(ls -t "${LOG_DIR}"/manifest-*.json 2>/dev/null | head -n1)
  [[ -n "$latest_manifest" ]] || { err "Nenhum manifest encontrado. Rode 'create' primeiro."; exit 1; }
  info "Manifest: $latest_manifest"

  echo ""
  warn "ATENÇÃO: Vai ativar campaign + 3 ad sets + 9 ads em produção (gasto real)."
  warn "Daily budget: R\$ 90 / spend cap total: R\$ 2.700"
  read -r -p "Digite ATIVAR para confirmar: " confirm
  [[ "$confirm" == "ATIVAR" ]] || { err "Cancelado pelo usuário."; exit 1; }

  local camp_id; camp_id=$(jq -r '.campaign_id' "$latest_manifest")
  info "Ativando campaign $camp_id..."
  graph_post "/$camp_id" '{"status":"ACTIVE"}' > /dev/null || exit 1
  ok "Campaign ACTIVE"

  # Ad sets
  jq -r '.adsets | to_entries[] | .value' "$latest_manifest" | while read -r aid; do
    info "Ativando ad set $aid..."
    graph_post "/$aid" '{"status":"ACTIVE"}' > /dev/null || warn "Falhou $aid"
  done

  # Ads
  jq -r '.ads | to_entries[] | .value' "$latest_manifest" | while read -r ad_id; do
    info "Ativando ad $ad_id..."
    graph_post "/$ad_id" '{"status":"ACTIVE"}' > /dev/null || warn "Falhou $ad_id"
  done

  ok "Launch ATIVO. Monitorar por 2h; se 0 delivery, pausar tudo."
  info "Ver health: ./launch-pragas-ads.sh health"
}

# ==============================================================
# COMMAND: health (pós-launch)
# ==============================================================
cmd_health() {
  info "=== HEALTH CHECK ==="
  local latest_manifest
  latest_manifest=$(ls -t "${LOG_DIR}"/manifest-*.json 2>/dev/null | head -n1)
  [[ -n "$latest_manifest" ]] || { err "Sem manifest."; exit 1; }
  local camp_id; camp_id=$(jq -r '.campaign_id' "$latest_manifest")
  graph_get "/$camp_id/insights?fields=impressions,clicks,ctr,spend,cpm,actions&date_preset=today" | jq .
}

# ==============================================================
# Main
# ==============================================================
require_tools
[[ -f "$BUNDLE" ]] || { err "Bundle não encontrado: $BUNDLE"; exit 1; }

case "${1:-}" in
  dry-run)  cmd_dry_run ;;
  validate) require_env; cmd_validate ;;
  create)   cmd_create ;;
  activate) cmd_activate ;;
  health)   cmd_health ;;
  *)
    cat <<EOF
Uso: $0 <comando>

Comandos:
  dry-run   Mostra payloads sem chamar API
  validate  Valida /me, ad account, pixel, CAPI
  create    Cria campaign+adsets+ads em PAUSED (seguro)
  activate  Ativa tudo (requer confirmação interativa 'ATIVAR')
  health    Insights da campanha de hoje

Anti-ban: WRITE_INTERVAL=${WRITE_INTERVAL_MS}ms, MAX=${MAX_WRITES_5MIN}/5min, circuit breaker 3x429/60s.
EOF
    exit 1 ;;
esac
