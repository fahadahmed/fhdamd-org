import { useEffect, useRef } from "react";

interface MermaidDiagramProps {
  id: string;
  source: string;
}

/**
 * MermaidDiagramCard (Threads) only provides the chrome — this renders the
 * actual SVG client-side and re-renders on theme toggle, since Header's
 * theme toggle just flips document.documentElement's data-theme attribute
 * rather than dispatching an event.
 */
export function MermaidDiagram({ id, source }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const { default: mermaid } = await import("mermaid");
      const theme =
        document.documentElement.dataset.theme === "dark" ? "dark" : "base";
      mermaid.initialize({
        startOnLoad: false,
        theme,
        fontFamily: "JetBrains Mono, monospace",
      });
      const { svg } = await mermaid.render(id, source);
      if (!cancelled && containerRef.current) {
        containerRef.current.innerHTML = svg;
        // Mermaid sets a fixed width/height matching its own small intrinsic
        // layout size — scale the (viewBox-based, so proportional) SVG up to
        // fill the available card width instead of rendering it tiny.
        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.removeAttribute("height");
          svgEl.style.width = "100%";
          svgEl.style.height = "auto";
        }
      }
    }

    render();

    const observer = new MutationObserver(render);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [id, source]);

  // A plain block, not flex: a flex container with justify-content:center
  // sizes its item to content instead of letting width:100% (set on the
  // rendered SVG above) actually fill the available width.
  return <div ref={containerRef} style={{ width: "100%" }} />;
}
