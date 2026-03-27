import SwiftUI

enum AppTheme {
    static let accent = Color(red: 0.10, green: 0.59, blue: 0.42)
    static let accentDark = Color(red: 0.06, green: 0.42, blue: 0.30)
    static let accentLight = Color(red: 0.16, green: 0.72, blue: 0.53)

    static let techBlue = Color(red: 0.22, green: 0.51, blue: 0.95)
    static let techIndigo = Color(red: 0.35, green: 0.34, blue: 0.84)

    static let warmAmber = Color(red: 0.92, green: 0.69, blue: 0.15)
    static let coral = Color(red: 0.94, green: 0.40, blue: 0.32)

    static let surfaceCard = Color(.secondarySystemGroupedBackground)

    static let heroGradient = LinearGradient(
        colors: [
            Color(red: 0.06, green: 0.42, blue: 0.30),
            Color(red: 0.10, green: 0.59, blue: 0.42),
            Color(red: 0.16, green: 0.72, blue: 0.53)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let techGradient = LinearGradient(
        colors: [
            Color(red: 0.10, green: 0.59, blue: 0.42),
            Color(red: 0.22, green: 0.51, blue: 0.95)
        ],
        startPoint: .leading,
        endPoint: .trailing
    )

    static var meshBackground: some View {
        MeshGradient(
            width: 3, height: 3,
            points: [
                [0.0, 0.0], [0.5, 0.0], [1.0, 0.0],
                [0.0, 0.5], [0.5, 0.5], [1.0, 0.5],
                [0.0, 1.0], [0.5, 1.0], [1.0, 1.0]
            ],
            colors: [
                Color(red: 0.06, green: 0.42, blue: 0.30),
                Color(red: 0.10, green: 0.55, blue: 0.40),
                Color(red: 0.18, green: 0.50, blue: 0.85),
                Color(red: 0.08, green: 0.48, blue: 0.35),
                Color(red: 0.12, green: 0.62, blue: 0.46),
                Color(red: 0.20, green: 0.55, blue: 0.78),
                Color(red: 0.06, green: 0.38, blue: 0.28),
                Color(red: 0.10, green: 0.52, blue: 0.38),
                Color(red: 0.15, green: 0.46, blue: 0.70)
            ]
        )
        .ignoresSafeArea()
    }
}

struct ModernCardModifier: ViewModifier {
    var padding: CGFloat = 16

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(.rect(cornerRadius: 16))
            .shadow(color: .black.opacity(0.06), radius: 10, y: 4)
    }
}

extension View {
    func premiumCard(padding: CGFloat = 16) -> some View {
        modifier(ModernCardModifier(padding: padding))
    }
}
