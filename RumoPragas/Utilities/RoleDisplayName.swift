import Foundation

enum RoleDisplayName {
    static func displayName(for role: String) -> String {
        switch role {
        case "produtor": "Produtor Rural"
        case "agronomo": "Agrônomo"
        case "tecnico": "Técnico Agrícola"
        case "consultor": "Consultor MIP"
        case "estudante": "Estudante"
        default: "Produtor Rural"
        }
    }
}
