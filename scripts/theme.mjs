// Shared palette and helpers for every generated SVG.
// Each asset is rendered twice (dark + light) so the README can swap them with <picture>.

export const themes = {
  dark: {
    bg0: '#0B1220', bg1: '#111C33', panel: '#0F1A2E', border: '#1E2A44', grid: '#1E2A44',
    text: '#F1F5F9', muted: '#94A3B8', faint: '#475569',
    a1: '#22D3EE', a2: '#3B82F6', a3: '#A78BFA', ok: '#34D399',
  },
  light: {
    bg0: '#FFFFFF', bg1: '#EEF4FB', panel: '#FFFFFF', border: '#D9E2EC', grid: '#E2E8F0',
    text: '#0F172A', muted: '#475569', faint: '#94A3B8',
    a1: '#0891B2', a2: '#2563EB', a3: '#7C3AED', ok: '#059669',
  },
};

export const SANS = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'JetBrains Mono', 'Cascadia Code', Consolas, Menlo, monospace";

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Wraps an SVG body with title/desc and a reduced-motion guard.
export function svg({ w, h, title, desc, css = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<style>
${css}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
</style>
${body}
</svg>
`;
}

export const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));
