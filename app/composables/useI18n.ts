import {
  LOCALES,
  RTL_LOCALES,
  messages,
  type Locale,
  type MessageKey,
} from "~/i18n/messages";

const DEFAULT_LOCALE: Locale = "en";

function isLocale(tag: unknown): tag is Locale {
  return (
    typeof tag === "string" && (LOCALES as readonly string[]).includes(tag)
  );
}

/**
 * Match a language tag against supported locales by its primary subtag, so any
 * region/script extension resolves to the base language:
 * "en", "en-US", "en_us", "en-Latn-US", " EN " all -> "en".
 */
function matchLocale(tag: string | undefined | null): Locale | null {
  if (!tag) return null;
  // Primary subtag only: lowercase, then take everything before the first
  // separator ("-" or "_").
  const primary = tag.trim().toLowerCase().split(/[-_]/)[0];
  return isLocale(primary) ? primary : null;
}

/**
 * Resolve the active locale: URL query (`?lang=`) -> browser languages ->
 * English. The query lets an embedding app force a language; otherwise we
 * honor the user's browser preference, falling back to English.
 */
export function useI18n() {
  const route = useRoute();

  const locale = computed<Locale>(() => {
    const q = route.query.lang;
    const fromQuery = matchLocale(Array.isArray(q) ? q[0] : q);
    if (fromQuery) return fromQuery;

    if (import.meta.client) {
      for (const lang of navigator.languages ?? [navigator.language]) {
        const matched = matchLocale(lang);
        if (matched) return matched;
      }
    }

    return DEFAULT_LOCALE;
  });

  const dir = computed<"rtl" | "ltr">(() =>
    RTL_LOCALES.has(locale.value) ? "rtl" : "ltr",
  );

  function t(key: MessageKey): string {
    return messages[locale.value][key] ?? messages[DEFAULT_LOCALE][key];
  }

  return { locale, dir, t };
}
