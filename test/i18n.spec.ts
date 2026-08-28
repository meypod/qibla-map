import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALES, messages, type Locale } from "@/i18n/messages";

const APP_DIR = join(process.cwd(), "app");

function sourceFiles(dir = APP_DIR, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) sourceFiles(path, acc);
    else if (/\.(vue|ts)$/.test(path) && !path.endsWith("messages.ts")) {
      acc.push(path);
    }
  }
  return acc;
}

const englishKeys = Object.keys(messages.en);

describe("message tables", () => {
  // vue-tsc does not check t() keys inside templates, so a typo there compiles
  // clean and renders as nothing. These tests are that missing safety net.
  it.each(LOCALES)("%s defines exactly the English keys", (locale: Locale) => {
    expect(Object.keys(messages[locale]).sort()).toEqual(
      [...englishKeys].sort(),
    );
  });

  it.each(LOCALES)("%s leaves no message blank", (locale: Locale) => {
    for (const key of englishKeys) {
      expect(messages[locale][key as keyof typeof messages.en]).not.toBe("");
    }
  });
});

describe("message usage", () => {
  const used = new Set<string>();
  const referenced = new Set<string>();
  for (const file of sourceFiles()) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/\bt\(\s*["'](\w+)["']\s*\)/g))
      used.add(m[1]!);
    // Keys also reach t() through variables, e.g. a stored failure reason.
    for (const m of text.matchAll(/["'](\w+)["']/g)) {
      if (englishKeys.includes(m[1]!)) referenced.add(m[1]!);
    }
  }

  it("uses no key that is not defined", () => {
    expect([...used].filter((k) => !englishKeys.includes(k))).toEqual([]);
  });

  it("defines no key that is never referenced", () => {
    expect(englishKeys.filter((k) => !referenced.has(k))).toEqual([]);
  });
});
