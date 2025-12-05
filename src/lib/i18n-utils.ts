import { Json } from "@/types/database";

/**
 * Helper to extract localized string from a JSONB field.
 * Falls back to 'en' if the requested locale is missing.
 * Handles legacy string data gracefully.
 */
export function getLocalizedContent(content: Json | null, locale: string): string {
    if (!content) return "";

    // If it's still a plain string (legacy data before migration), return it
    if (typeof content === 'string') return content;

    // If it's a JSON object (new format)
    if (typeof content === 'object' && !Array.isArray(content)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map = content as Record<string, string>;
        return map[locale] || map['en'] || "";
    }

    return "";
}
