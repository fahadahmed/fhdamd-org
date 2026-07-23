import { codeToTokens, type BundledLanguage, type ThemedToken } from "shiki";

/**
 * CodeBlock (Threads) deliberately does no highlighting itself — it expects
 * pre-highlighted content from the consuming app (its own doc comment
 * suggests Shiki at build time). Returns raw tokens rather than precomputed
 * React nodes: Astro can't safely hand a precomputed element/array off to a
 * React component as bare children (renders as "[object Object]") — the JSX
 * has to be built literally in the template's own .map(), not precomputed
 * here, so this just does the async highlighting work Astro can't do inline.
 */
export async function highlightCode(
  code: string,
  lang: string,
): Promise<ThemedToken[][]> {
  const { tokens } = await codeToTokens(code, {
    lang: lang as BundledLanguage,
    theme: "github-dark",
  });
  return tokens;
}
