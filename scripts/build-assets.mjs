// Builds the static animated SVGs in /assets (banner, terminal, timeline) for both themes.
// Run: node scripts/build-assets.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { themes, svg, esc, SANS, MONO } from './theme.mjs';

const OUT = new URL('../assets/', import.meta.url);
mkdirSync(OUT, { recursive: true });

// Deterministic pseudo-random so rebuilds produce identical files.
let seed = 31;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/* ------------------------------------------------------------------ banner */
function banner(c) {
  const W = 1200, H = 320;
  const hub = { x: 960, y: 160 };
  const nodes = [
    { x: 850, y: 78, label: 'Claude API' }, { x: 1075, y: 70, label: 'MCP tools' },
    { x: 1125, y: 165, label: 'RAG' }, { x: 1065, y: 255, label: 'Qdrant' },
    { x: 860, y: 245, label: 'Memory' }, { x: 815, y: 160, label: 'Evals' },
  ];
  const edges = nodes.map((n, i) => {
    const len = Math.hypot(hub.x - n.x, hub.y - n.y);
    return `<path class="pk" style="--l:${len.toFixed(0)}px;animation-delay:${(i * 0.45).toFixed(2)}s" d="M${n.x} ${n.y}L${hub.x} ${hub.y}" stroke-dasharray="10 ${len.toFixed(0)}"/>`;
  });
  const roles = ['Senior Full-Stack Developer', 'Angular · .NET · Microservices', 'AI / LLM Engineering · Agents · RAG · MCP'];
  const chips = ['14+ years', '10+ banks · UPI / eNACH', 'UAE · Jordan · Egypt · Angola', '2× performance awards'];
  let cx = 64;
  const chipEls = chips.map((t, i) => {
    const w = Math.round(t.length * 7.4 + 30);
    const el = `<g class="chip" style="animation-delay:${(1.2 + i * 0.15).toFixed(2)}s"><rect x="${cx}" y="244" width="${w}" height="30" rx="15" fill="${c.panel}" fill-opacity="0.7" stroke="${c.border}"/><circle cx="${cx + 15}" cy="259" r="3.5" fill="${[c.a1, c.a2, c.a3, c.ok][i]}"/><text x="${cx + 26}" y="264" font-size="13" fill="${c.muted}">${esc(t)}</text></g>`;
    cx += w + 10;
    return el;
  });
  const stars = Array.from({ length: 28 }, () => {
    const x = (520 + rand() * 660).toFixed(0), y = (20 + rand() * 280).toFixed(0);
    return `<circle class="tw" cx="${x}" cy="${y}" r="${(0.8 + rand() * 1.4).toFixed(1)}" style="animation-delay:${(rand() * 4).toFixed(2)}s"/>`;
  });

  const css = `
text { font-family: ${SANS}; }
.aur { animation: drift 14s ease-in-out infinite alternate; }
.aur.b { animation-duration: 18s; animation-direction: alternate-reverse; }
@keyframes drift { to { transform: translate(-120px, 40px); } }
.bar { transform-box: fill-box; transform-origin: left; animation: grow .9s cubic-bezier(.2,.8,.2,1) both .2s; }
@keyframes grow { from { transform: scaleX(0); } }
.up { animation: up .8s cubic-bezier(.2,.8,.2,1) both; }
@keyframes up { from { opacity: 0; transform: translateY(14px); } }
.role { opacity: 0; animation: role 9s infinite; }
.role.r0 { opacity: 1; }
.r1 { animation-delay: 3s; } .r2 { animation-delay: 6s; }
@keyframes role { 0% { opacity: 0; transform: translateY(10px); } 4%, 30% { opacity: 1; transform: none; } 34%, 100% { opacity: 0; transform: translateY(-10px); } }
.chip { animation: up .6s ease both; }
.edge { stroke: ${c.a1}; stroke-opacity: .28; stroke-width: 1.5; }
.pk { fill: none; stroke: ${c.a1}; stroke-width: 3; stroke-linecap: round; stroke-dashoffset: 10px; animation: flow 2.7s linear infinite; }
@keyframes flow { from { stroke-dashoffset: 10px; } to { stroke-dashoffset: calc(-1 * var(--l)); } }
.ring { fill: none; stroke: ${c.a2}; transform-box: fill-box; transform-origin: center; animation: ping 2.7s ease-out infinite; }
@keyframes ping { from { opacity: .8; transform: scale(1); } to { opacity: 0; transform: scale(2.6); } }
.spin { transform-origin: ${hub.x}px ${hub.y}px; animation: spin 12s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.tw { fill: ${c.a1}; animation: tw 4s ease-in-out infinite; }
@keyframes tw { 50% { opacity: .1; } }
.lbl { font-size: 11px; fill: ${c.muted}; letter-spacing: .5px; }`;

  const body = `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.bg0}"/><stop offset="1" stop-color="${c.bg1}"/></linearGradient>
  <linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.a1}"/><stop offset=".55" stop-color="${c.a2}"/><stop offset="1" stop-color="${c.a3}"/></linearGradient>
  <linearGradient id="name" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.text}"/><stop offset=".7" stop-color="${c.text}"/><stop offset="1" stop-color="${c.a1}"/></linearGradient>
  <pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="${c.grid}"/></pattern>
  <linearGradient id="fade" x1="0" x2="1"><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
  <mask id="m"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
  <clipPath id="clip"><rect width="${W}" height="${H}" rx="18"/></clipPath>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>
</defs>
<g clip-path="url(#clip)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g filter="url(#blur)" opacity=".35">
    <circle class="aur" cx="900" cy="80" r="150" fill="${c.a2}"/>
    <circle class="aur b" cx="1100" cy="280" r="130" fill="${c.a3}"/>
  </g>
  <rect width="${W}" height="${H}" fill="url(#g)" mask="url(#m)"/>
  <g opacity=".7">${stars.join('')}</g>
  <g>${nodes.map((n) => `<line class="edge" x1="${n.x}" y1="${n.y}" x2="${hub.x}" y2="${hub.y}"/>`).join('')}</g>
  <g>${edges.join('')}</g>
  <circle class="spin" cx="${hub.x}" cy="${hub.y}" r="32" fill="none" stroke="url(#ac)" stroke-width="2" stroke-dasharray="6 9"/>
  <circle cx="${hub.x}" cy="${hub.y}" r="20" fill="${c.bg0}" stroke="url(#ac)" stroke-width="3"/>
  <circle cx="${hub.x}" cy="${hub.y}" r="7" fill="${c.a1}"/>
  ${nodes.map((n, i) => `<circle class="ring" style="animation-delay:${(i * 0.45 + 2.2).toFixed(2)}s" cx="${n.x}" cy="${n.y}" r="9"/>
  <circle cx="${n.x}" cy="${n.y}" r="9" fill="${c.bg0}" stroke="${c.a2}" stroke-width="2"/>
  <text class="lbl" x="${n.x}" y="${n.y + (n.y > hub.y ? 26 : -16)}" text-anchor="middle">${n.label}</text>`).join('\n  ')}
  <text class="lbl" x="${hub.x}" y="${hub.y + 52}" text-anchor="middle" fill="${c.a1}" style="fill:${c.a1}">coordinator agent</text>
  <rect class="bar" x="64" y="64" width="64" height="4" rx="2" fill="url(#ac)"/>
  <text class="up" x="64" y="126" font-size="48" font-weight="700" fill="url(#name)" letter-spacing=".5" style="animation-delay:.1s">Sridharan Periyannan</text>
  ${roles.map((r, i) => `<text class="role r${i}" x="64" y="172" font-size="22" font-weight="600" fill="${c.a1}">${esc(r)}</text>`).join('\n  ')}
  <text class="up" x="64" y="212" font-size="16" fill="${c.muted}" style="animation-delay:.5s">Scalable enterprise platforms by day, intelligent software systems by design.</text>
  ${chipEls.join('\n  ')}
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="none" stroke="${c.border}"/>`;

  return svg({
    w: W, h: H,
    title: 'Sridharan Periyannan',
    desc: 'Senior Full-Stack Developer: Angular, .NET, microservices and AI/LLM engineering. Animated diagram of a coordinator agent connected to Claude API, MCP tools, RAG, Qdrant, memory and evals.',
    css, body,
  });
}

/* ---------------------------------------------------------------- terminal */
function terminal(c) {
  const W = 860, LH = 24, FS = 14, CW = FS * 0.62, T = 18; // cycle seconds
  const script = [
    ['cmd', 'whoami'],
    ['out', 'sridharan · senior full-stack developer @ ad ports group · abu dhabi'],
    ['cmd', 'cat experience.json'],
    ['out', '{ "years": "14+", "banks": "10+", "domains": ["banking & payments", "maritime & logistics"] }'],
    ['cmd', 'ls ./stack'],
    ['out', 'angular/  react/  dotnet/  node/  rabbitmq/  keycloak/  k8s/  claude-api/  mcp/  qdrant/'],
    ['cmd', './now --focus'],
    ['ok', '→ multi-agent LLM assistants grounded in real port operations data'],
  ];
  const H = 70 + script.length * LH + 40;
  let t = 0.6;
  const pct = (s) => ((s / T) * 100).toFixed(2);
  let css = `
text { font-family: ${MONO}; font-size: ${FS}px; white-space: pre; }
.cur { animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }`;
  const lines = script.map(([kind, txt], i) => {
    const y = 72 + i * LH;
    const typed = kind === 'cmd';
    const dur = typed ? txt.length * 0.07 : 0.15;
    const start = t;
    t += dur + (typed ? 0.35 : 0.6);
    // A panel-coloured cover slides off each line (stepped for typed commands). Everything clears at the end of the cycle.
    css += `
.l${i} { transform: scaleX(0); transform-box: fill-box; transform-origin: right; animation: k${i} ${T}s infinite; }
@keyframes k${i} { 0%, ${pct(start)}% { transform: scaleX(1); } ${pct(start + dur)}% { transform: scaleX(0); animation-timing-function: steps(1); } 94% { transform: scaleX(0); } 97%, 100% { transform: scaleX(1); } }`;
    const width = ((typed ? txt.length + 2 : txt.length) * CW + 20).toFixed(0);
    const timing = typed ? `steps(${txt.length})` : 'ease-out';
    css += `\n.l${i} { animation-timing-function: ${timing}; }`;
    const fill = kind === 'ok' ? c.ok : typed ? c.text : c.muted;
    const content = typed
      ? `<tspan fill="${c.a1}">❯</tspan> ${esc(txt)}`
      : esc(txt);
    return `<text x="28" y="${y}" fill="${fill}">${content}</text>
<rect class="l${i}" x="24" y="${y - 17}" width="${width}" height="${LH}" fill="${c.panel}"/>`;
  });
  const lastY = 72 + script.length * LH;
  const body = `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="${c.panel}" stroke="${c.border}"/>
<path d="M.5 40V14.5a14 14 0 0 1 14-14h${W - 29}a14 14 0 0 1 14 14V40z" fill="${c.bg1}"/>
<circle cx="24" cy="20" r="6" fill="#FF5F57"/><circle cx="44" cy="20" r="6" fill="#FEBC2E"/><circle cx="64" cy="20" r="6" fill="#28C840"/>
<text x="${W / 2}" y="25" text-anchor="middle" fill="${c.faint}" font-size="12">sridharan@profile: ~</text>
${lines.join('\n')}
<text x="28" y="${lastY}" fill="${c.a1}">❯ <tspan class="cur" fill="${c.text}">█</tspan></text>`;
  return svg({
    w: W, h: H,
    title: 'Terminal introduction',
    desc: script.map(([k, s]) => (k === 'cmd' ? `$ ${s}` : s)).join(' | '),
    css, body,
  });
}

/* ---------------------------------------------------------------- timeline */
function timeline(c) {
  const W = 1200, H = 250, Y = 110;
  const stops = [
    { x: 160, k: 'BINARCH · 2012–16', t: 'Design & e-commerce', s: 'UI/UX · 3D visualisation · Magento', col: c.a2 },
    { x: 453, k: 'FSS · 2016–21', t: 'Payments for 10+ banks', s: 'UPI · BHIM · NPCI eNACH · Ionic', col: c.a1 },
    { x: 747, k: 'AD PORTS GROUP · 2021–', t: 'Multi-country platforms', s: 'PCS · Angola Single Window · K8s', col: c.a3 },
    { x: 1040, k: 'NOW', t: 'AI / LLM engineering', s: 'Multi-agent · MCP · RAG · fine-tuning', col: c.ok },
  ];
  const len = stops.at(-1).x - stops[0].x;
  const css = `
text { font-family: ${SANS}; }
.track { stroke-dasharray: ${len}; animation: draw 2.4s cubic-bezier(.6,0,.2,1) both .2s; }
@keyframes draw { from { stroke-dashoffset: ${len}; } }
.st { animation: pop .6s cubic-bezier(.2,1.4,.4,1) both; transform-box: fill-box; transform-origin: center; }
@keyframes pop { from { opacity: 0; transform: scale(.4); } }
.cap { animation: up .7s ease both; }
@keyframes up { from { opacity: 0; transform: translateY(10px); } }
.halo { transform-box: fill-box; transform-origin: center; animation: halo 2.4s ease-out infinite 3s; }
@keyframes halo { from { opacity: .7; transform: scale(1); } to { opacity: 0; transform: scale(2.4); } }
.run { offset-path: path('M${stops[0].x} ${Y}H${stops.at(-1).x}'); animation: run 6s linear infinite 3s; opacity: 0; }
@keyframes run { 0% { offset-distance: 0%; opacity: 0; } 10%, 90% { opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }`;
  const body = `<defs><linearGradient id="tr" x1="0" x2="1"><stop offset="0" stop-color="${c.a2}"/><stop offset=".5" stop-color="${c.a1}"/><stop offset="1" stop-color="${c.ok}"/></linearGradient></defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="${c.panel}" stroke="${c.border}"/>
<line x1="${stops[0].x}" y1="${Y}" x2="${stops.at(-1).x}" y2="${Y}" stroke="${c.grid}" stroke-width="4" stroke-linecap="round"/>
<line class="track" x1="${stops[0].x}" y1="${Y}" x2="${stops.at(-1).x}" y2="${Y}" stroke="url(#tr)" stroke-width="4" stroke-linecap="round"/>
<circle class="run" r="4" fill="${c.text}"/>
${stops.map((s, i) => {
    const d = (0.3 + (i / (stops.length - 1)) * 2.2).toFixed(2);
    const last = i === stops.length - 1;
    return `${last ? `<circle class="halo" cx="${s.x}" cy="${Y}" r="11" fill="none" stroke="${s.col}" stroke-width="2"/>` : ''}
<g class="st" style="animation-delay:${d}s"><circle cx="${s.x}" cy="${Y}" r="11" fill="${c.panel}" stroke="${s.col}" stroke-width="3"/><circle cx="${s.x}" cy="${Y}" r="4" fill="${s.col}"/></g>
<g class="cap" style="animation-delay:${(+d + 0.15).toFixed(2)}s" text-anchor="middle">
  <text x="${s.x}" y="${Y - 34}" font-size="12" font-weight="700" letter-spacing="1.5" fill="${s.col}">${esc(s.k)}</text>
  <text x="${s.x}" y="${Y + 46}" font-size="17" font-weight="600" fill="${c.text}">${esc(s.t)}</text>
  <text x="${s.x}" y="${Y + 70}" font-size="13" fill="${c.muted}">${esc(s.s)}</text>
</g>`;
  }).join('\n')}`;
  return svg({
    w: W, h: H,
    title: 'Career timeline',
    desc: stops.map((s) => `${s.k}: ${s.t} (${s.s})`).join('; '),
    css, body,
  });
}

for (const [mode, c] of Object.entries(themes)) {
  seed = 31;
  writeFileSync(new URL(`banner-${mode}.svg`, OUT), banner(c));
  writeFileSync(new URL(`terminal-${mode}.svg`, OUT), terminal(c));
  writeFileSync(new URL(`timeline-${mode}.svg`, OUT), timeline(c));
}
console.log('assets built');
