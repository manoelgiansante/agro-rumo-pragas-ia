import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_PROMPT = `Voce e um especialista em fitossanidade e entomologia agricola brasileira. Analise a imagem enviada e identifique pragas, doencas ou condicoes da planta.

IMPORTANTE: Responda EXCLUSIVAMENTE em portugues brasileiro. Nunca responda em ingles.

Responda APENAS com um JSON valido (sem markdown, sem backticks, sem texto extra) no seguinte formato:

{
  "pest_id": "identificador_da_praga_ou_doenca",
  "pest_name": "Nome popular em portugues",
  "confidence": 0.85,
  "message": "Resumo curto do diagnostico",
  "crop": "cultura_identificada",
  "crop_confidence": 0.9,
  "predictions": [
    {
      "id": "identificador",
      "confidence": 0.85,
      "common_name": "Nome popular",
      "scientific_name": "Nome cientifico",
      "category": "pest|disease|deficiency|healthy",
      "type": "insect|fungus|bacteria|virus|nematode|deficiency|healthy"
    }
  ],
  "enrichment": {
    "name_pt": "Nome em portugues",
    "description": "Descricao detalhada da praga/doenca, ciclo de vida, como afeta a cultura",
    "causes": ["Causa 1", "Causa 2"],
    "symptoms": ["Sintoma 1 visivel", "Sintoma 2"],
    "chemical_treatment": ["Produto/principio ativo 1 com dosagem", "Produto 2"],
    "biological_treatment": ["Controle biologico 1", "Controle biologico 2"],
    "cultural_treatment": ["Pratica cultural 1", "Pratica cultural 2"],
    "prevention": ["Medida preventiva 1", "Medida preventiva 2"],
    "severity": "critical|high|medium|low|none",
    "lifecycle": "Descricao do ciclo de vida da praga",
    "economic_impact": "Impacto economico na producao",
    "monitoring": ["Como monitorar 1", "Como monitorar 2"],
    "favorable_conditions": ["Condicao favoravel 1", "Condicao 2"],
    "resistance_info": "Informacoes sobre resistencia",
    "recommended_products": [
      {
        "name": "Nome do produto",
        "active_ingredient": "Principio ativo",
        "dosage": "Dosagem recomendada",
        "interval": "Intervalo de aplicacao",
        "safety_period": "Periodo de carencia",
        "toxic_class": "Classe toxicologica"
      }
    ],
    "related_pests": ["Praga relacionada 1"],
    "action_threshold": "Nivel de acao/controle",
    "mip_strategy": "Estrategia de Manejo Integrado de Pragas recomendada"
  }
}

Regras:
- Se a planta estiver saudavel, use pest_id "Healthy" e severity "none"
- Confidence deve ser um numero entre 0 e 1
- Todos os textos DEVEM estar em portugues brasileiro
- Seja especifico para a realidade agricola brasileira (produtos registrados no MAPA, praticas locais)
- Inclua SEMPRE recomendacoes de MIP (Manejo Integrado de Pragas)
- Para tratamentos quimicos, mencione que e necessario receituario agronomico
- Se nao conseguir identificar com certeza, indique baixa confianca e possibilidades`

interface DiagnosisRequest {
  image_base64: string
  crop_type: string
  latitude: number | null
  longitude: number | null
}

serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  // Verify auth
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Token de autenticacao ausente' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Validate user token
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Token invalido' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body: DiagnosisRequest = await req.json()
    const { image_base64, crop_type, latitude, longitude } = body

    if (!image_base64) {
      return new Response(JSON.stringify({ error: 'Imagem nao fornecida' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'API de diagnostico nao configurada' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Clean base64 (remove data URI prefix if present)
    const cleanBase64 = image_base64.replace(/^data:image\/\w+;base64,/, '')

    // Build the prompt with crop context
    const cropContext = crop_type ? `\nA cultura informada pelo produtor e: ${crop_type}. Considere isso na sua analise.` : ''
    const locationContext = latitude && longitude
      ? `\nLocalizacao aproximada: lat ${latitude.toFixed(2)}, lng ${longitude.toFixed(2)} (Brasil).`
      : ''

    const userPrompt = `Analise esta imagem de uma planta/lavoura e faca o diagnostico fitossanitario completo.${cropContext}${locationContext}\n\nRetorne APENAS o JSON conforme o formato especificado, sem nenhum texto adicional.`

    // Call Gemini Vision API
    const geminiResponse = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: SYSTEM_PROMPT + '\n\n' + userPrompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: cleanBase64,
              },
            },
          ],
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        },
      }),
    })

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text()
      console.error('Gemini API error:', errText)
      return new Response(JSON.stringify({ error: 'Erro na analise da imagem. Tente novamente.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const geminiData = await geminiResponse.json()

    // Extract text from Gemini response
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) {
      return new Response(JSON.stringify({ error: 'Resposta vazia da IA. Tente com outra imagem.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse JSON from response (handle possible markdown code blocks)
    let diagnosisData: Record<string, unknown>
    try {
      const jsonStr = rawText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim()
      diagnosisData = JSON.parse(jsonStr)
    } catch {
      console.error('Failed to parse Gemini response:', rawText)
      return new Response(JSON.stringify({ error: 'Erro ao processar resultado. Tente novamente.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Build the notes JSON (matches AgrioNotesData format)
    const notes = {
      message: diagnosisData.message || 'Diagnostico concluido',
      crop: diagnosisData.crop || crop_type,
      crop_confidence: diagnosisData.crop_confidence || 0.8,
      predictions: diagnosisData.predictions || [],
      enrichment: diagnosisData.enrichment || {},
    }

    // Map crop_type to internal crop ID
    const cropMap: Record<string, string> = {
      'Soybean': 'soja', 'Corn': 'milho', 'Coffee': 'cafe', 'Cotton': 'algodao',
      'Sugarcane': 'cana', 'Wheat': 'trigo', 'Rice': 'arroz', 'Bean': 'feijao',
      'Potato': 'batata', 'Tomato': 'tomate', 'Cassava': 'mandioca', 'Citrus': 'citros',
      'Grape': 'uva', 'Banana': 'banana', 'Sorghum': 'sorgo', 'Peanut': 'amendoim',
      'Sunflower': 'girassol', 'Onion': 'cebola',
    }
    const cropId = cropMap[crop_type] || crop_type?.toLowerCase() || 'outro'

    // Save to database
    const { data: saved, error: dbError } = await supabase
      .from('pragas_diagnoses')
      .insert({
        user_id: user.id,
        crop: cropId,
        pest_id: (diagnosisData.pest_id as string) || null,
        pest_name: (diagnosisData.pest_name as string) || null,
        confidence: (diagnosisData.confidence as number) || 0,
        notes: JSON.stringify(notes),
        location_lat: latitude,
        location_lng: longitude,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(JSON.stringify({ error: 'Erro ao salvar diagnostico' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Return result matching DiagnosisResult type
    return new Response(JSON.stringify({
      ...saved,
      parsedNotes: notes,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Diagnosis error:', error)
    return new Response(JSON.stringify({ error: 'Erro interno. Tente novamente.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
