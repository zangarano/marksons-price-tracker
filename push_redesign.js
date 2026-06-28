
// ============================================================
// MARKSON'S DASHBOARD — DARK SPACE-AGE REDESIGN
// Runs inside the user's Chrome browser (has GitHub API access)
// ============================================================

const SHA = window._fileSHA;

// ─── CSS ────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg:         #080b14;
  --bg-alt:     #0d1220;
  --surface:    rgba(13,18,32,0.9);
  --glass:      rgba(255,255,255,0.04);
  --glass-hi:   rgba(255,255,255,0.07);
  --border:     rgba(255,255,255,0.08);
  --border-hi:  rgba(0,212,255,0.25);
  --cyan:       #00d4ff;
  --cyan-dim:   rgba(0,212,255,0.1);
  --cyan-glow:  0 0 18px rgba(0,212,255,0.35);
  --green:      #00ff9d;
  --green-dim:  rgba(0,255,157,0.08);
  --green-glow: 0 0 18px rgba(0,255,157,0.3);
  --red:        #ff3b6b;
  --red-dim:    rgba(255,59,107,0.1);
  --red-glow:   0 0 18px rgba(255,59,107,0.35);
  --amber:      #ffb800;
  --text:       #cdd6f4;
  --text-mid:   #7d8ba3;
  --text-dim:   #3a4260;
  --mono:       'JetBrains Mono', monospace;
  --ui:         'Inter', system-ui, sans-serif;
  --display:    'Orbitron', sans-serif;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--ui);
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  min-height: 100vh;
  background-image:
    radial-gradient(ellipse at 15% 15%, rgba(0,120,200,0.07) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 85%, rgba(0,80,160,0.05) 0%, transparent 55%),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 60px),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 60px);
}

/* ── HEADER ── */
.header {
  background: linear-gradient(135deg,
    rgba(0,212,255,0.07) 0%,
    rgba(8,11,20,0.98) 40%,
    rgba(0,100,255,0.05) 100%);
  border-bottom: 1px solid rgba(0,212,255,0.18);
  padding: 20px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  position: relative;
}
.header::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--cyan) 50%, transparent 100%);
  opacity: 0.5;
}
.header h1 {
  font-family: var(--display);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #fff;
  text-shadow: 0 0 24px rgba(0,212,255,0.55), 0 0 60px rgba(0,212,255,0.2);
}
.header .subtitle {
  font-size: 10px;
  color: var(--text-mid);
  letter-spacing: 1.2px;
  margin-top: 5px;
  text-transform: uppercase;
  font-family: var(--display);
}
.updated-badge {
  background: rgba(0,212,255,0.07);
  border: 1px solid rgba(0,212,255,0.22);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 11px;
  color: var(--cyan);
  font-family: var(--mono);
  letter-spacing: 0.3px;
}

/* ── STATS ── */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  padding: 22px 28px 0;
}
.stat-card {
  background: var(--glass);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px 22px;
  position: relative;
  overflow: hidden;
  transition: border-color .2s, box-shadow .2s, transform .2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent, var(--cyan));
  box-shadow: 0 4px 24px rgba(0,212,255,0.08), inset 0 0 20px rgba(0,212,255,0.03);
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--accent, var(--cyan));
  box-shadow: 0 0 8px var(--accent, var(--cyan));
}
.stat-card .label {
  font-family: var(--display);
  font-size: 8.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.8px;
  color: var(--text-mid);
  margin-bottom: 10px;
}
.stat-card .value {
  font-family: var(--mono);
  font-size: 34px;
  font-weight: 500;
  line-height: 1;
  color: var(--accent, var(--cyan));
  text-shadow: 0 0 20px var(--accent, var(--cyan));
}
.stat-card .sub {
  font-size: 11px;
  color: var(--text-dim);
  margin-top: 7px;
  letter-spacing: 0.3px;
}
.stat-card.red  { --accent: var(--red); }
.stat-card.blue { --accent: var(--cyan); }

/* ── FILTERS (Frosted Glass) ── */
.filters {
  margin: 20px 28px 0;
  padding: 16px 20px;
  background: rgba(10,14,24,0.75);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(0,212,255,0.12);
  border-radius: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.3);
}
.filters label {
  font-family: var(--display);
  font-size: 8.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  color: var(--text-mid);
}
.filters select, .filters input {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 13px;
  font-family: var(--ui);
  color: var(--text);
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  appearance: none;
  -webkit-appearance: none;
}
.filters select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7'%3E%3Cpath d='M0 0l5 7 5-7z' fill='%2300d4ff' opacity='.6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 26px;
  cursor: pointer;
}
.filters select option { background: #0d1220; }
.filters select:focus, .filters input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 0 3px rgba(0,212,255,0.1), 0 0 12px rgba(0,212,255,0.12);
}
.filter-group { display: flex; align-items: center; gap: 8px; }
.badge-count {
  background: linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,100,255,0.12));
  border: 1px solid rgba(0,212,255,0.28);
  color: var(--cyan);
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 11px;
  font-family: var(--mono);
  font-weight: 500;
  letter-spacing: 0.5px;
  box-shadow: 0 0 10px rgba(0,212,255,0.12);
}

/* ── LEGEND ── */
.legend {
  display: flex;
  gap: 18px;
  padding: 14px 28px 8px;
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  color: var(--text-mid);
  letter-spacing: 0.4px;
  text-transform: uppercase;
  font-family: var(--display);
}
.legend-dot { width: 12px; height: 12px; border-radius: 3px; }
.dot-cheaper { background: var(--red-dim); border: 1px solid rgba(255,59,107,0.4); box-shadow: 0 0 6px rgba(255,59,107,0.2); }
.dot-same    { background: var(--green-dim); border: 1px solid rgba(0,255,157,0.3); box-shadow: 0 0 6px rgba(0,255,157,0.15); }
.dot-higher  { background: var(--glass); border: 1px solid var(--border); }

/* ── TABLE ── */
.table-wrap {
  padding: 0 28px 48px;
  overflow-x: auto;
  margin-top: 16px;
}
table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(8,11,20,0.6);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: 0 4px 32px rgba(0,0,0,0.4);
}
thead {
  background: rgba(0,212,255,0.05);
  border-bottom: 1px solid rgba(0,212,255,0.15);
}
thead th {
  padding: 12px 14px;
  text-align: left;
  font-family: var(--display);
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: var(--cyan);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: background .15s, color .15s;
}
thead th:hover { background: rgba(0,212,255,0.09); color: #fff; }
thead th .sort-icon { margin-left: 4px; opacity: 0.35; font-size: 9px; }
thead th.sorted { color: #fff; }
thead th.sorted .sort-icon { opacity: 0.8; color: var(--cyan); }

tbody tr { border-bottom: 1px solid rgba(255,255,255,0.035); transition: background .12s; }
tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: rgba(255,255,255,0.025); }
td { padding: 11px 14px; vertical-align: middle; }

.item-name { font-weight: 500; font-size: 13px; color: var(--text); }
.item-cat  { font-family: var(--display); font-size: 8.5px; color: rgba(255,255,255,0.52); margin-top: 3px; letter-spacing: 1px; text-transform: uppercase; }
.price { font-family: var(--mono); font-weight: 500; font-size: 13px; white-space: nowrap; }
.price-null { color: var(--text-dim); font-style: italic; font-size: 11px; font-family: var(--ui); font-weight: 400; }
.price-note { font-family: var(--display); font-size: 8.5px; color: var(--amber); font-weight: 600; display: block; margin-top: 2px; letter-spacing: 1px; }

.savings-pos { color: var(--red); font-family: var(--mono); font-weight: 600; font-size: 13px; text-shadow: 0 0 8px rgba(255,59,107,0.4); }
.savings-neg { color: var(--green); font-family: var(--mono); font-size: 12px; }
.savings-na  { color: var(--text-dim); font-size: 12px; }

td.cheaper { background: rgba(255,59,107,0.07); }
td.cheaper .price { color: var(--red); text-shadow: 0 0 10px rgba(255,59,107,0.45); }
td.same    { background: rgba(0,255,157,0.06); }
td.same .price { color: var(--green); text-shadow: 0 0 10px rgba(0,255,157,0.4); }
td.higher .price { color: var(--text-mid); }

/* ── CATEGORY PILLS ── */
.cat-pill {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 10px;
  font-family: var(--display);
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.cat-Upholstery    { background: rgba(0,150,255,0.1);  color: #60aaff; border: 1px solid rgba(0,150,255,0.22); }
.cat-Bedroom       { background: rgba(180,0,255,0.1);  color: #c080ff; border: 1px solid rgba(180,0,255,0.22); }
.cat-Dining        { background: rgba(0,220,140,0.08); color: #40d890; border: 1px solid rgba(0,220,140,0.2); }
.cat-Entertainment { background: rgba(255,120,0,0.09); color: #ff9040; border: 1px solid rgba(255,120,0,0.22); }
.cat-Home-Office  { background: rgba(255,184,0,0.08); color: #e0a800; border: 1px solid rgba(255,184,0,0.2); }

/* ── NO RESULTS ── */
.no-results { text-align: center; padding: 72px 20px; color: var(--text-dim); }
.no-results .icon { font-size: 44px; margin-bottom: 14px; opacity: 0.4; }
.no-results div { font-family: var(--display); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; }

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.2); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0,212,255,0.4); }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .header { padding: 14px 16px; }
  .header h1 { font-size: 13px; }
  .stats { padding: 14px 16px 0; }
  .filters { margin: 14px 16px 0; padding: 12px 14px; }
  .table-wrap { padding: 0 16px 32px; }
  .legend { padding: 12px 16px 6px; }
}
`;

// ─── HTML TEMPLATE ──────────────────────────────────────────
const htmlBody = `
<div class="header">
  <div>
    <h1>Markson's Furniture — Price Intelligence</h1>
    </div>
  <div class="updated-badge">⬡ Last updated: <span id="last-updated">2026-06-24</span></div>
</div>

<div class="stats">
  <div class="stat-card red">
    <div class="label">Old Brick Cheaper</div>
    <div class="value" id="ob-count">—</div>
    <div class="sub">items</div>
  </div>
  <div class="stat-card red">
    <div class="label">Dunk &amp; Bright Cheaper</div>
    <div class="value" id="db-count">—</div>
    <div class="sub">items · <span id="db-savings">$0</span> total exposure</div>
  </div>
  <div class="stat-card red">
    <div class="label">Ashley.com Cheaper</div>
    <div class="value" id="ash-count">—</div>
    <div class="sub">items · <span id="ash-savings">$0</span> total exposure</div>
  </div>
  <div class="stat-card blue">
    <div class="label">Total Items Tracked</div>
    <div class="value">309</div>
    <div class="sub">Ashley showroom SKUs</div>
  </div>
</div>

<div class="filters">
  <div class="filter-group">
    <label>Category</label>
    <select id="filter-cat" onchange="applyFilters()">
      <option value="">All Categories</option>
      <option value="Upholstery">Upholstery</option>
      <option value="Bedroom">Bedroom</option>
      <option value="Dining">Dining</option>
      <option value="Entertainment">Entertainment</option>
      <option value="Home Office">Home Office</option>
    </select>
  </div>
  <div class="filter-group">
    <label>Show</label>
    <select id="filter-savings" onchange="applyFilters()">
      <option value="">All items</option>
      <option value="any_cheaper">Any competitor cheaper</option>
      <option value="ob_cheaper">Old Brick cheaper</option>
      <option value="db_cheaper">Dunk &amp; Bright cheaper</option>
      <option value="ash_cheaper">Ashley.com cheaper</option>
    </select>
  </div>
  <div class="filter-group">
    <label>Min savings</label>
    <input type="number" id="filter-min" placeholder="$0" style="width:80px" onchange="applyFilters()" oninput="applyFilters()">
  </div>
  <div class="filter-group">
    <label>Search</label>
    <input type="text" id="filter-search" placeholder="item name or SKU..." style="width:180px" oninput="applyFilters()">
  </div>
  <span class="badge-count" id="result-count">—</span>
</div>

<div class="legend">
  <div class="legend-item"><div class="legend-dot dot-cheaper"></div>Competitor cheaper</div>
  <div class="legend-item"><div class="legend-dot dot-same"></div>Same or we're cheaper</div>
  <div class="legend-item"><div class="legend-dot dot-higher"></div>Not yet checked</div>
</div>

<div class="table-wrap">
  <table id="main-table">
    <thead>
      <tr>
        <th onclick="sortTable('description')">Item <span class="sort-icon">↕</span></th>
        <th onclick="sortTable('category')">Category <span class="sort-icon">↕</span></th>
        <th onclick="sortTable('markson_price')" style="text-align:right">Markson's <span class="sort-icon">↕</span></th>
        <th onclick="sortTable('ob')" style="text-align:right">Old Brick <span class="sort-icon">↕</span></th>
        <th onclick="sortTable('db')" style="text-align:right">Dunk &amp; Bright <span class="sort-icon">↕</span></th>
        <th onclick="sortTable('ashley')" style="text-align:right">Ashley.com <span class="sort-icon">↕</span></th>
        <th onclick="sortTable('max_savings')" style="text-align:right">Best Savings <span class="sort-icon">↕</span></th>
      </tr>
    </thead>
    <tbody id="table-body"></tbody>
  </table>
  <div class="no-results" id="no-results" style="display:none">
    <div class="icon">◈</div>
    <div>No items match your filters</div>
  </div>
</div>
`;

// ─── JS LOGIC ───────────────────────────────────────────────
const jsLogic = `
let _sortKey = 'max_savings', _sortDir = -1, _filtered = [];

function fmtPrice(p, note, url) {
  if (p == null) return '<span class="price-null">—</span>';
  const inner = '$' + p.toFixed(2) + (note ? '<span class="price-note">' + note + '</span>' : '');
  return url ? '<a class="price" href="' + url + '" target="_blank" style="text-decoration:none">' + inner + '</a>'
             : '<span class="price">' + inner + '</span>';
}

function cellClass(mp, cp) {
  if (cp == null) return 'higher';
  if (cp < mp)  return 'cheaper';
  return 'same';
}

function computeStats() {
  let obC=0, dbC=0, ashC=0;
  ALL_ITEMS.forEach(it => {
    const mp = it.markson_price;
    const ob = it.competitors.old_brick.price;
    const db = it.competitors.dunk_bright.price;
    const ash = it.competitors.ashley.price;
    if (ob != null && ob < mp) { obC++; }
    if (db != null && db < mp) { dbC++; }
    if (ash != null && ash < mp) { ashC++; }
  });
  document.getElementById('ob-count').textContent  = obC;
  document.getElementById('db-count').textContent  = dbC;
  document.getElementById('ash-count').textContent = ashC;
}

function applyFilters() {
  const cat    = document.getElementById('filter-cat').value;
  const sav    = document.getElementById('filter-savings').value;
  const minAmt = parseFloat(document.getElementById('filter-min').value) || 0;
  const q      = document.getElementById('filter-search').value.toLowerCase().trim();

  _filtered = ALL_ITEMS.filter(it => {
    if (cat && it.category !== cat) return false;
    if (q && !it.description.toLowerCase().includes(q) && !it.sku.toLowerCase().includes(q)) return false;
    const mp = it.markson_price;
    const ob = it.competitors.old_brick.price;
    const db = it.competitors.dunk_bright.price;
    const ash = it.competitors.ashley.price;
    const savings = Math.max(
      ob != null && ob < mp ? mp - ob : 0,
      db != null && db < mp ? mp - db : 0,
      ash != null && ash < mp ? mp - ash : 0
    );
    if (minAmt && savings < minAmt) return false;
    if (sav === 'any_cheaper')  return (ob!=null&&ob<mp)||(db!=null&&db<mp)||(ash!=null&&ash<mp);
    if (sav === 'ob_cheaper')   return ob!=null && ob<mp;
    if (sav === 'db_cheaper')   return db!=null && db<mp;
    if (sav === 'ash_cheaper')  return ash!=null && ash<mp;
    return true;
  });

  _filtered.sort((a, b) => {
    let av, bv;
    const getV = (it) => {
      if (_sortKey === 'description') return it.description;
      if (_sortKey === 'category')    return it.category;
      if (_sortKey === 'markson_price') return it.markson_price;
      if (_sortKey === 'ob')  return it.competitors.old_brick.price ?? 99999;
      if (_sortKey === 'db')  return it.competitors.dunk_bright.price ?? 99999;
      if (_sortKey === 'ashley') return it.competitors.ashley.price ?? 99999;
      if (_sortKey === 'max_savings') {
        const mp = it.markson_price;
        const ob = it.competitors.old_brick.price;
        const db = it.competitors.dunk_bright.price;
        const ash = it.competitors.ashley.price;
        return Math.max(
          ob!=null&&ob<mp ? mp-ob : 0,
          db!=null&&db<mp ? mp-db : 0,
          ash!=null&&ash<mp ? mp-ash : 0
        );
      }
      return 0;
    };
    av = getV(a); bv = getV(b);
    if (av < bv) return _sortDir;
    if (av > bv) return -_sortDir;
    return 0;
  });

  renderTable();
  document.getElementById('result-count').textContent = _filtered.length + ' items';
}

function renderTable() {
  const tbody = document.getElementById('table-body');
  const noRes = document.getElementById('no-results');
  if (_filtered.length === 0) {
    tbody.innerHTML = '';
    noRes.style.display = '';
    return;
  }
  noRes.style.display = 'none';
  tbody.innerHTML = _filtered.map(it => {
    const mp  = it.markson_price;
    const ob  = it.competitors.old_brick;
    const db  = it.competitors.dunk_bright;
    const ash = it.competitors.ashley;
    const savings = Math.max(
      ob.price!=null&&ob.price<mp ? mp-ob.price : 0,
      db.price!=null&&db.price<mp ? mp-db.price : 0,
      ash.price!=null&&ash.price<mp ? mp-ash.price : 0
    );
    const savHtml = savings > 0
      ? '<span class="savings-pos">▲$' + savings.toFixed(2) + '</span>'
      : savings < 0 ? '<span class="savings-neg">▼$' + Math.abs(savings).toFixed(2) + '</span>'
      : '<span class="savings-na">—</span>';
    return \`<tr>
      <td><div class="item-name">\${it.description}</div><div class="item-cat">\${it.sku}</div></td>
      <td><span class="cat-pill cat-\${it.category.replace(/ /g,'-')}">\${it.category}</span></td>
      <td style="text-align:right"><span class="price">$\${mp.toFixed(2)}</span></td>
      <td class="\${cellClass(mp,ob.price)}" style="text-align:right">\${fmtPrice(ob.price,ob.note,ob.search_url)}</td>
      <td class="\${cellClass(mp,db.price)}" style="text-align:right">\${fmtPrice(db.price,db.note,db.search_url)}</td>
      <td class="\${cellClass(mp,ash.price)}" style="text-align:right">\${fmtPrice(ash.price,ash.note,ash.search_url)}</td>
      <td style="text-align:right">\${savHtml}</td>
    </tr>\`;
  }).join('');
}

function sortTable(key) {
  if (_sortKey === key) { _sortDir *= -1; }
  else { _sortKey = key; _sortDir = key === 'max_savings' ? -1 : 1; }
  document.querySelectorAll('thead th').forEach(th => th.classList.remove('sorted'));
  const headers = { description:0, category:1, markson_price:2, ob:3, db:4, ashley:5, max_savings:6 };
  const idx = headers[key];
  if (idx !== undefined) document.querySelectorAll('thead th')[idx]?.classList.add('sorted');
  applyFilters();
}

computeStats();
applyFilters();
`;

// ─── SERIALIZE DATA ──────────────────────────────────────────
const itemsJson = JSON.stringify(ALL_ITEMS);

// ─── ASSEMBLE FULL HTML ──────────────────────────────────────
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markson's — Price Intelligence Dashboard</title>
<style>
${css}
</style>
</head>
<body>
${htmlBody}
<script>
const ALL_ITEMS = ${itemsJson};
${jsLogic}
<\/script>
</body>
</html>`;

// ─── BASE64 ENCODE (chunked for performance) ────────────────
function toBase64(str) {
  const bytes = new Uint8Array(new TextEncoder().encode(str));
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

// ─── PUSH TO GITHUB ──────────────────────────────────────────
const resp = await fetch('https://api.github.com/repos/zangarano/marksons-price-tracker/contents/index.html', {
  method: 'PUT',
  headers: {
    'Authorization': 'token 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',
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Redesign: dark space-age aesthetic with frosted glass and neon glows',
    content: toBase64(fullHtml),
    sha: SHA
  })
});

const result = await resp.json();
'✓ Status: ' + resp.status + ' | ' + (result.content?.name || result.message || JSON.stringify(result).slice(0,200));
