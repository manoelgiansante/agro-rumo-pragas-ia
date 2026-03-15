import Testing
@testable import RumoPragas

struct RumoPragasTests {

    // MARK: - ConfidenceLevel

    @Test func confidenceLevelDisplayNames() {
        #expect(ConfidenceLevel.high.displayName == "Alta")
        #expect(ConfidenceLevel.medium.displayName == "Média")
        #expect(ConfidenceLevel.low.displayName == "Baixa")
        #expect(ConfidenceLevel.veryLow.displayName == "Muito Baixa")
    }

    @Test func confidenceLevelPercentages() {
        #expect(ConfidenceLevel.high.percentage == "85%+")
        #expect(ConfidenceLevel.medium.percentage == "60-84%")
        #expect(ConfidenceLevel.low.percentage == "40-59%")
        #expect(ConfidenceLevel.veryLow.percentage == "<40%")
    }

    // MARK: - SeverityLevel

    @Test func severityLevelDisplayNames() {
        #expect(SeverityLevel.critical.displayName == "Crítico")
        #expect(SeverityLevel.high.displayName == "Alto")
        #expect(SeverityLevel.medium.displayName == "Médio")
        #expect(SeverityLevel.low.displayName == "Baixo")
        #expect(SeverityLevel.none.displayName == "Nenhum")
    }

    @Test func severityLevelFromRawValue() {
        #expect(SeverityLevel(rawValue: "critical") == .critical)
        #expect(SeverityLevel(rawValue: "high") == .high)
        #expect(SeverityLevel(rawValue: "invalid") == nil)
    }

    @Test func severityLevelAllCases() {
        #expect(SeverityLevel.allCases.count == 5)
    }

    // MARK: - CropType

    @Test func cropTypeDisplayNames() {
        #expect(CropType.soja.displayName == "Soja")
        #expect(CropType.cafe.displayName == "Café")
        #expect(CropType.milho.displayName == "Milho")
        #expect(CropType.algodao.displayName == "Algodão")
    }

    @Test func cropTypeApiNames() {
        #expect(CropType.soja.apiName == "Soybean")
        #expect(CropType.cafe.apiName == "Coffee")
        #expect(CropType.milho.apiName == "Corn")
        #expect(CropType.cana.apiName == "Sugarcane")
    }

    @Test func cropTypeAllCasesCount() {
        #expect(CropType.allCases.count == 18)
    }

    @Test func cropTypeIdentifiable() {
        #expect(CropType.soja.id == "soja")
        #expect(CropType.cafe.id == "cafe")
    }

    // MARK: - DateFormatUtility

    @Test func dateParsingISO8601() {
        let date = DateFormatUtility.parse("2026-03-15T10:30:00Z")
        #expect(date != nil)
    }

    @Test func dateParsingWithFractionalSeconds() {
        let date = DateFormatUtility.parse("2026-03-15T10:30:00.000Z")
        #expect(date != nil)
    }

    @Test func dateParsingInvalidString() {
        let date = DateFormatUtility.parse("not-a-date")
        #expect(date == nil)
    }

    @Test func shortDateFormat() {
        let result = DateFormatUtility.shortDate("2026-03-15T10:30:00Z")
        #expect(result == "15/03")
    }

    @Test func shortDateInvalidReturnsEmpty() {
        let result = DateFormatUtility.shortDate("invalid")
        #expect(result == "")
    }

    @Test func mediumDateInvalidReturnsSame() {
        let result = DateFormatUtility.mediumDate("invalid")
        #expect(result == "invalid")
    }

    // MARK: - DiagnosisResult

    @Test func diagnosisConfidenceLevelHigh() {
        let diagnosis = makeDiagnosis(confidence: 0.90)
        #expect(diagnosis.confidenceLevel == .high)
    }

    @Test func diagnosisConfidenceLevelMedium() {
        let diagnosis = makeDiagnosis(confidence: 0.70)
        #expect(diagnosis.confidenceLevel == .medium)
    }

    @Test func diagnosisConfidenceLevelLow() {
        let diagnosis = makeDiagnosis(confidence: 0.45)
        #expect(diagnosis.confidenceLevel == .low)
    }

    @Test func diagnosisConfidenceLevelVeryLow() {
        let diagnosis = makeDiagnosis(confidence: 0.20)
        #expect(diagnosis.confidenceLevel == .veryLow)
    }

    @Test func diagnosisConfidenceLevelNilDefaultsToLow() {
        let diagnosis = makeDiagnosis(confidence: nil)
        #expect(diagnosis.confidenceLevel == .low)
    }

    @Test func diagnosisIsHealthy() {
        let healthy1 = makeDiagnosis(pestId: "Healthy")
        #expect(healthy1.isHealthy == true)

        let healthy2 = makeDiagnosis(pestName: "Healthy")
        #expect(healthy2.isHealthy == true)

        let notHealthy = makeDiagnosis(pestId: "some_pest")
        #expect(notHealthy.isHealthy == false)
    }

    @Test func diagnosisCropTypeMapping() {
        #expect(makeDiagnosis(crop: "soja").cropType == .soja)
        #expect(makeDiagnosis(crop: "soybean").cropType == .soja)
        #expect(makeDiagnosis(crop: "Soybean").cropType == .soja)
        #expect(makeDiagnosis(crop: "corn").cropType == .milho)
        #expect(makeDiagnosis(crop: "milho").cropType == .milho)
        #expect(makeDiagnosis(crop: "coffee").cropType == .cafe)
        #expect(makeDiagnosis(crop: "café").cropType == .cafe)
    }

    @Test func diagnosisCropTypeUnknown() {
        #expect(makeDiagnosis(crop: "unknown").cropType == nil)
    }

    @Test func diagnosisDisplayNameFallbacks() {
        let withPestName = makeDiagnosis(pestName: "Ferrugem")
        #expect(withPestName.displayName == "Ferrugem")

        let withPestId = makeDiagnosis(pestId: "rust_001")
        #expect(withPestId.displayName == "rust_001")

        let withNothing = makeDiagnosis()
        #expect(withNothing.displayName == "Diagnóstico")
    }

    @Test func diagnosisSeverityDefaultsMedium() {
        let diagnosis = makeDiagnosis()
        #expect(diagnosis.severityLevel == .medium)
    }

    @Test func diagnosisEquality() {
        let a = makeDiagnosis(id: "same-id")
        let b = makeDiagnosis(id: "same-id", crop: "milho")
        #expect(a == b)

        let c = makeDiagnosis(id: "different-id")
        #expect(a != c)
    }

    // MARK: - RoleDisplayName

    @Test func roleDisplayNames() {
        #expect(RoleDisplayName.displayName(for: "produtor") == "Produtor Rural")
        #expect(RoleDisplayName.displayName(for: "agronomo") == "Agrônomo")
        #expect(RoleDisplayName.displayName(for: "tecnico") == "Técnico Agrícola")
        #expect(RoleDisplayName.displayName(for: "consultor") == "Consultor MIP")
        #expect(RoleDisplayName.displayName(for: "estudante") == "Estudante")
    }

    @Test func roleDisplayNameUnknownDefaultsProdutor() {
        #expect(RoleDisplayName.displayName(for: "unknown") == "Produtor Rural")
        #expect(RoleDisplayName.displayName(for: "") == "Produtor Rural")
    }

    // MARK: - ChatMessage Codable

    @Test func chatMessageCodableRoundTrip() throws {
        let original = ChatMessage(role: .user, content: "Teste de mensagem")
        let data = try JSONEncoder().encode(original)
        let decoded = try JSONDecoder().decode(ChatMessage.self, from: data)

        #expect(decoded.id == original.id)
        #expect(decoded.role == original.role)
        #expect(decoded.content == original.content)
    }

    @Test func chatRoleCodableRoundTrip() throws {
        let roles: [ChatRole] = [.user, .assistant]
        for role in roles {
            let data = try JSONEncoder().encode(role)
            let decoded = try JSONDecoder().decode(ChatRole.self, from: data)
            #expect(decoded == role)
        }
    }

    // MARK: - Helpers

    private func makeDiagnosis(
        id: String = "test-id",
        confidence: Double? = 0.5,
        pestId: String? = nil,
        pestName: String? = nil,
        crop: String = "soja"
    ) -> DiagnosisResult {
        DiagnosisResult(
            id: id,
            userId: "user-id",
            crop: crop,
            pestId: pestId,
            pestName: pestName,
            confidence: confidence,
            imageUrl: nil,
            notes: nil,
            locationLat: nil,
            locationLng: nil,
            locationName: nil,
            createdAt: "2026-03-15T00:00:00Z"
        )
    }
}
