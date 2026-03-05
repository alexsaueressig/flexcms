/**
 * Converts a BCP-47 language tag (e.g. "en-US", "pt-BR") to a flag emoji.
 * Falls back to 🌐 when no region subtag is present.
 */
export function localeToFlag(language: string): string {
    const region = language.split('-')[1]
    if (!region) return '🌐'
    return [...region.toUpperCase()]
        .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
        .join('')
}
