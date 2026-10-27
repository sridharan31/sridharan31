// Generates live, animated stat cards from the GitHub GraphQL API into dist/ (published to the `output` branch).
// Run: GITHUB_TOKEN=... node scripts/generate-stats.mjs [username]
// Without a token it renders sample data, which is handy for previewing the design locally.
import { writeFileSync, mkdirSync } from 'node:fs';
import { themes, svg, esc, fmt, SANS } from './theme.mjs';

const USER = process.argv[2] || process.env.GITHUB_USER || 'sridharan31';
const OUT = new URL('../dist/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const QUERY = `query($login: String!) {
  user(login: $login) {
    followers { totalCount }
    pullRequests { totalCount }
    repositories(ownerAffiliations: OWNER, isFork: false, first: 100, privacy: PUBLIC) {
      totalCount
      nodes { stargazerCount languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name color } } } }
    }
    contributionsCollection {
      totalCommitContributions
      contributionCalendar { totalContributions weeks { contributionDays { contributionCount date } } }
    }
  }
}`;

async function load() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('GITHUB_TOKEN not set: rendering sample data');
    return sample();
  }
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { login: USER } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors ?? json));
  return shape(json.data.user);
}

function shape(u) {
  const langs = new Map();
  let stars = 0;
  for (const r of u.repositories.nodes) {
    stars += r.stargazerCount;
    for (const e of r.languages.edges) {
      const cur = langs.get(e.node.name) ?? { size: 0, color: e.node.color ?? '#8B949E' };
      cur.size += e.size;
      langs.set(e.node.name, cur);
    }
  }
  const days = u.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  return {
    stars,
    repos: u.repositories.totalCount,
    followers: u.followers.totalCount,
    prs: u.pullRequests.totalCount,
    commits: u.contributionsCollection.totalCommitContributions,
    total: u.contributionsCollection.contributionCalendar.totalContributions,
    langs: [...langs].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.size - a.size),
    days: days.map((d) => ({ date: d.date, n: d.contributionCount })),
  };
}

function sample() {
  const days = Array.from({ length: 364 }, (_, i) => ({
    date: new Date(Date.now() - (363 - i) * 864e5).toISOString().slice(0, 10),
    n: Math.max(0, Math.round(4 * Math.sin(i / 9) + 3 * Math.sin(i / 23) + (i % 7 > 4 ? -3 : 2))),
  }));
  return {
    stars: 12, repos: 18, followers: 25, prs: 9, commits: 410, total: days.reduce((a, d) => a + d.n, 0),
    langs: [['TypeScript', 42, '#3178c6'], ['Python', 25, '#3572A5'], ['C#', 14, '#178600'], ['JavaScript', 9, '#f1e05a'], ['HTML', 6, '#e34c26'], ['SCSS', 4, '#c6538c']]
      .map(([name, size, color]) => ({ name, size, color })),
    days,
  };
}

// Longest and current streak of days with at least one contribution.
function streaks(days) {
  let best = 0, run = 0;
  for (const d of days) { run = d.n > 0 ? run + 1 : 0; best = Math.max(best, run); }
  let cur = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].n > 0) cur++;
    else if (i === days.length - 1) continue; // today may not have activity yet
    else break;
  }
  return { best, cur };
}

const card = (c, W, H, title, inner, extraCss = '') => ({
  css: `text { font-family: ${SANS}; }
.fade { animation: fade .7s ease both; }
@keyframes fade { from { opacity: 0; transform: translateY(8px); } }
${extraCss}`,
  body: `<defs><linearGradient id="ac" x1="0" x2="1"><stop offset="0" stop-color="${c.a1}"/><stop offset="1" stop-color="${c.a2}"/></linearGradient></defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="${c.panel}" stroke="${c.border}"/>
<rect x="24" y="24" width="28" height="3" rx="1.5" fill="url(#ac)"/>
<text x="24" y="50" font-size="16" font-weight="700" fill="${c.text}">${esc(title)}</text>
${inner}`,
});

/* ------------------------------------------------------------------ stats */
function statsCard(c, d) {
  const W = 495, H = 210;
  const s = streaks(d.days);
  const rows = [
    ['Contributions (last year)', d.total, c.a1], ['Commits (last year)', d.commits, c.a2],
    ['Pull requests', d.prs, c.a3], ['Public repositories', d.repos, c.ok],
    ['Stars earned', d.stars, c.a1], ['Longest streak', `${s.best} days`, c.a2],
  ];
  const inner = rows.map(([k, v, col], i) => {
    const x = i % 2 ? 260 : 24, y = 86 + Math.floor(i / 2) * 40;
    return `<g class="fade" style="animation-delay:${(0.1 + i * 0.1).toFixed(1)}s">
  <circle cx="${x + 5}" cy="${y - 5}" r="4" fill="${col}"/>
  <text x="${x + 18}" y="${y}" font-size="13" fill="${c.muted}">${esc(k)}</text>
  <text x="${x + 18}" y="${y + 20}" font-size="17" font-weight="700" fill="${c.text}">${esc(typeof v === 'number' ? fmt(v) : v)}</text>
</g>`;
  }).join('\n');
  const { css, body } = card(c, W, H, 'GitHub at a glance', inner + `
<text x="${W - 24}" y="50" text-anchor="end" font-size="12" fill="${c.faint}">current streak · <tspan fill="${c.ok}" font-weight="700">${s.cur}d</tspan></text>`);
  return svg({ w: W, h: H, title: 'GitHub stats', desc: rows.map(([k, v]) => `${k}: ${v}`).join(', '), css, body });
}

/* -------------------------------------------------------------- languages */
function langCard(c, d) {
  const W = 495, H = 210, top = d.langs.slice(0, 6);
  const sum = top.reduce((a, l) => a + l.size, 0) || 1;
  const BW = W - 48;
  let x = 24;
  const segs = top.map((l, i) => {
    const w = (l.size / sum) * BW;
    const el = `<rect class="seg" style="animation-delay:${(0.15 + i * 0.12).toFixed(2)}s" x="${x.toFixed(1)}" y="70" width="${Math.max(w - 2, 1).toFixed(1)}" height="12" fill="${l.color}"/>`;
    x += w;
    return el;
  });
  const legend = top.map((l, i) => {
    const lx = i % 2 ? 260 : 24, ly = 118 + Math.floor(i / 2) * 28;
    return `<g class="fade" style="animation-delay:${(0.5 + i * 0.08).toFixed(2)}s"><circle cx="${lx + 5}" cy="${ly - 4}" r="5" fill="${l.color}"/><text x="${lx + 18}" y="${ly}" font-size="13" fill="${c.text}">${esc(l.name)} <tspan fill="${c.muted}">${((l.size / sum) * 100).toFixed(1)}%</tspan></text></g>`;
  });
  const { css, body } = card(c, W, H, 'Most used languages',
    `<clipPath id="bar"><rect x="24" y="70" width="${BW}" height="12" rx="6"/></clipPath>
<rect x="24" y="70" width="${BW}" height="12" rx="6" fill="${c.grid}"/>
<g clip-path="url(#bar)">${segs.join('')}</g>
${legend.join('\n')}`,
    `.seg { transform-box: fill-box; transform-origin: left; animation: grow .8s cubic-bezier(.2,.8,.2,1) both; }
@keyframes grow { from { transform: scaleX(0); } }`);
  return svg({ w: W, h: H, title: 'Most used languages', desc: top.map((l) => `${l.name} ${((l.size / sum) * 100).toFixed(1)}%`).join(', '), css, body });
}

/* --------------------------------------------------------------- skyline */
// Isometric "city" of weekly contribution totals; towers rise one after another.
function skyline(c, d) {
  const W = 1000, H = 300;
  const weeks = [];
  for (let i = 0; i < d.days.length; i += 7) weeks.push(d.days.slice(i, i + 7).reduce((a, x) => a + x.n, 0));
  const max = Math.max(1, ...weeks);
  const n = weeks.length, step = 15.5, w = 11, dz = 5;
  const baseY = 262, x0 = (W - n * step) / 2;
  const towers = weeks.map((v, i) => {
    const h = 4 + (v / max) * 170, x = x0 + i * step, y = baseY - h;
    const col = v === 0 ? c.grid : i > n - 5 ? c.ok : c.a1;
    const op = v === 0 ? 1 : (0.45 + 0.55 * (v / max)).toFixed(2);
    return `<g class="tw" style="animation-delay:${(i * 0.025).toFixed(3)}s" fill-opacity="${op}">
<path d="M${x} ${y}h${w}v${h}h-${w}z" fill="${col}"/>
<path d="M${x + w} ${y}l${dz} -${dz}v${h}l-${dz} ${dz}z" fill="${c.a2}"/>
<path d="M${x} ${y}l${dz} -${dz}h${w}l-${dz} ${dz}z" fill="${c.text}" fill-opacity=".35"/>
</g>`;
  });
  const busiest = weeks.indexOf(max);
  const avg = (weeks.reduce((a, b) => a + b, 0) / n).toFixed(1);
  const { css, body } = card(c, W, H, 'Contribution skyline · last 12 months',
    `<text x="${W - 24}" y="50" text-anchor="end" font-size="12" fill="${c.muted}">${fmt(d.total)} contributions · avg ${avg}/week · peak ${max} (week ${busiest + 1})</text>
<line x1="${x0 - 6}" y1="${baseY + 1}" x2="${x0 + n * step + 4}" y2="${baseY + 1}" stroke="${c.border}"/>
${towers.join('\n')}
<text x="${x0}" y="${baseY + 24}" font-size="11" fill="${c.faint}">${d.days[0]?.date ?? ''}</text>
<text x="${x0 + n * step}" y="${baseY + 24}" text-anchor="end" font-size="11" fill="${c.faint}">${d.days.at(-1)?.date ?? ''}</text>`,
    `.tw { transform-box: fill-box; transform-origin: bottom; animation: rise .9s cubic-bezier(.2,.9,.3,1.2) both; }
@keyframes rise { from { transform: scaleY(0); } }`);
  return svg({ w: W, h: H, title: 'Contribution skyline', desc: `Weekly contributions for the last year: ${d.total} total, peak ${max} in one week.`, css, body });
}

const data = await load();
for (const [mode, c] of Object.entries(themes)) {
  writeFileSync(new URL(`stats-${mode}.svg`, OUT), statsCard(c, data));
  writeFileSync(new URL(`languages-${mode}.svg`, OUT), langCard(c, data));
  writeFileSync(new URL(`skyline-${mode}.svg`, OUT), skyline(c, data));
}
console.log(`stats generated for ${USER}: ${data.total} contributions, ${data.langs.length} languages`);
