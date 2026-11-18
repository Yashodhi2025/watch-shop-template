export function safeIntroColor(value: string, fallback: string) {
  return /^(?:#[0-9a-f]{3}|#[0-9a-f]{6}|#[0-9a-f]{8}|rgb\(|rgba\(|hsl\(|hsla\()/i.test(value.trim()) ? value.trim() : fallback;
}
