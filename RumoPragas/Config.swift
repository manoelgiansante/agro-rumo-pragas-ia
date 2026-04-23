import Foundation

nonisolated enum Config {
    private static func value(for key: String) -> String {
        Bundle.main.infoDictionary?[key] as? String ?? ""
    }

    static let supabaseURL = value(for: "SUPABASE_URL")
    static let supabaseAnonKey = value(for: "SUPABASE_ANON_KEY")
    static let stripePublishableKey = value(for: "STRIPE_PUBLISHABLE_KEY")
    static let googleClientID = value(for: "GOOGLE_CLIENT_ID")
    static let toolkitURL = value(for: "TOOLKIT_URL")

    // Aliases for backward compatibility with services that reference EXPO_PUBLIC_* names
    static let EXPO_PUBLIC_SUPABASE_URL = supabaseURL
    static let EXPO_PUBLIC_SUPABASE_ANON_KEY = supabaseAnonKey
    static let EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY = stripePublishableKey
    static let EXPO_PUBLIC_GOOGLE_CLIENT_ID = googleClientID
    static let EXPO_PUBLIC_TOOLKIT_URL = toolkitURL
}
