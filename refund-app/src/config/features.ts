/**
 * FEATURE_FLAGS
 * A central repository for toggling application features.
 * Set to 'false' to instantly disable a feature and revert to legacy logic.
 */
export const FEATURE_FLAGS = {
    // Toggles the experimental scoreboard aggregation logic
    // STATUS: ENABLED (Go-Live)
    ENABLE_SCOREBOARD_AGGREGATION: true,

    // Toggles identity verification requirement on public payment links
    ENABLE_SECURE_PAY_LINK: true,

    // Toggles branded status email notifications
    ENABLE_STATUS_EMAILS: true,
} as const;

export type FeatureKey = keyof typeof FEATURE_FLAGS;

/**
 * Checks if a specific feature is enabled in the current environment.
 */
export function isFeatureEnabled(featureName: FeatureKey): boolean {
    return FEATURE_FLAGS[featureName] ?? false;
}
