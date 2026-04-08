import Foundation

nonisolated final class AIChatService: Sendable {
    static let shared = AIChatService()

    private let supabaseURL: String
    private let supabaseAnonKey: String

    private init() {
        self.supabaseURL = Config.supabaseURL
        self.supabaseAnonKey = Config.supabaseAnonKey
    }

    func sendMessage(messages: [[String: String]], token: String) async throws -> String {
        let endpoint = "\(supabaseURL)/functions/v1/ai-chat"
        guard let url = URL(string: endpoint) else {
            throw APIError.invalidURL
        }

        let payload: [String: Any] = ["messages": messages]
        let body = try JSONSerialization.data(withJSONObject: payload)

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.httpBody = body
        request.timeoutInterval = 60

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw APIError.serverError("Erro de conexão")
        }

        if http.statusCode == 401 {
            throw APIError.unauthorized
        }

        if http.statusCode == 403 {
            if let errorResponse = try? JSONDecoder().decode(ChatErrorResponse.self, from: data),
               errorResponse.code == "CHAT_LIMIT_REACHED" {
                throw APIError.serverError("Limite de mensagens atingido no plano gratuito. Faça upgrade para continuar.")
            }
            throw APIError.serverError("Acesso negado")
        }

        if http.statusCode == 429 {
            throw APIError.serverError("Muitas mensagens. Aguarde um momento.")
        }

        guard (200...299).contains(http.statusCode) else {
            throw APIError.serverError("Erro ao se comunicar com a IA")
        }

        if let result = try? JSONDecoder().decode(ChatAPIResponse.self, from: data) {
            return result.response
        }

        throw APIError.decodingError
    }
}

struct ChatAPIResponse: Codable, Sendable {
    let response: String
}

struct ChatErrorResponse: Codable, Sendable {
    let error: String
    let code: String?
    let limit: Int?
}
