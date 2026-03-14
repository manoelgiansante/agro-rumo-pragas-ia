import Foundation

// MARK: - App Configuration
// Values should be set via Xcode build settings or xcconfig files for security.
// Never commit real API keys to source control.
nonisolated enum Config {
    // MARK: Supabase (projeto: jxcnfyeemdltdfqtgbcl)
    static let supabaseURL: String = {
        Bundle.main.infoDictionary?["SUPABASE_URL"] as? String ?? ""
    }()
    static let supabaseAnonKey: String = {
        Bundle.main.infoDictionary?["SUPABASE_ANON_KEY"] as? String ?? ""
    }()

    // MARK: AI Chat Toolkit
    static let toolkitURL: String = {
        Bundle.main.infoDictionary?["TOOLKIT_URL"] as? String ?? ""
    }()

    // MARK: Stripe (optional)
    static let stripePublishableKey: String = {
        Bundle.main.infoDictionary?["STRIPE_PUBLISHABLE_KEY"] as? String ?? ""
    }()

    // MARK: Google Sign-In (optional)
    static let googleClientID: String = {
        Bundle.main.infoDictionary?["GOOGLE_CLIENT_ID"] as? String ?? ""
    }()

    // MARK: Legacy compatibility aliases
    static var EXPO_PUBLIC_SUPABASE_URL: String { supabaseURL }
    static var EXPO_PUBLIC_SUPABASE_ANON_KEY: String { supabaseAnonKey }
    static var EXPO_PUBLIC_TOOLKIT_URL: String { toolkitURL }
    static var EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: String { stripePublishableKey }
    static var EXPO_PUBLIC_GOOGLE_CLIENT_ID: String { googleClientID }
    static let EXPO_PUBLIC_RORK_API_BASE_URL = ""
    static let EXPO_PUBLIC_PROJECT_ID = ""
    static let EXPO_PUBLIC_TEAM_ID = ""
    static let EXPO_PUBLIC_RORK_AUTH_URL = ""
    static let EXPO_PUBLIC_RORK_APP_KEY = ""
    static let EXPO_PUBLIC_RORK_DB_ENDPOINT = ""
    static let EXPO_PUBLIC_RORK_DB_NAMESPACE = ""
    static let EXPO_PUBLIC_RORK_DB_TOKEN = ""
}
