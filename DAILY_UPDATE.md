# Markson's Price Intelligence — Daily Update Instructions

## Overview
This runs automatically twice daily (7am and 3pm EDT) to refresh competitor prices and push the updated dashboard to GitHub Pages at zangarano.github.io/marksons-price-tracker/

## Files
- `/home/claude/items_filtered.json` — 224 showroom items (sku, description, category)
- `/home/claude/price_scraper_v2.js` — Workflow script: Markson's + Dunk & Bright prices
- `/home/claude/prices_markson_db.json` — last Markson's + D&B scrape results
- `/home/claude/prices_old_brick.json` — last Old Brick scrape results
- `/home/claude/prices_ashley.json` — last Ashley scrape results (manual/browser only)
- `/home/claude/push_redesign.js` — current dashboard HTML + GitHub push logic

## GitHub
- Repo: zangarano/marksons-price-tracker
- Token: ghp_REDACTED
- Push via Chrome browser JavaScript (GitHub Contents API)
- File: index.html

## Step 1: Markson's + Dunk & Bright (Workflow)
Run: `Workflow({scriptPath: "/home/claude/price_scraper_v2.js"})`
Returns array of `{sku, markson, ob, db}` — save to `/home/claude/prices_markson_db.json`
Note: ob (Old Brick) will be null in this workflow — those come from Step 2

## Step 2: Old Brick (Sequential WebFetch with delays)
For each item in items_filtered.json:
- Search term: first 2 words of description (e.g. "ALTARI SOFA" for "ALTARI SOFA Slate")
  - Exception: if description starts with digit, use SKU
- URL: `https://www.oldbrickfurniture.com/search?q={searchTerm}`
- CSS: look for product names and prices in the search results
- Wait 1.5 seconds between each request to avoid rate limiting
- Save results to `/home/claude/prices_old_brick.json` as array of `{sku, price}`
- Run in batches of 20 items max per agent to avoid timeouts

## Step 3: Ashley (Browser required — attempt, fall back with alert)
Ashley requires JavaScript rendering. ALWAYS attempt this step via Chrome browser.

### How to scrape:
1. Use mcp__claude-in-chrome__tabs_context_mcp to check if browser is connected
2. If connected, navigate to https://www.ashleyfurniture.com/search-results?q=altari (or any Ashley page)
3. Run the scraper function via javascript_tool for all 224 items using batched parallel fetch() calls within the Ashley tab
4. If successful, save results to `/home/claude/prices_ashley.json` as `[{sku, price}]`
   - IMPORTANT: Only update the `ashley_updated` timestamp in scrape_timestamps.json when this live browser scrape succeeds. If using cached prices from a prior run, preserve the existing timestamp as-is.

### If browser is NOT available or scrape fails:
- Load last known prices from `/home/claude/prices_ashley.json` (use existing data, do NOT update timestamp)
- Use the PushNotification tool to send this alert to the user:
  "⚠️ Ashley prices not updated — browser wasn't available during scheduled scrape. Please open the app and trigger a manual Ashley scrape at zangarano.github.io/marksons-price-tracker/"
- Also send an email alert to zangarano@gmail.com if any email tool is available

### Ashley scrape function (run from within ashleyfurniture.com tab):
```javascript
async function getAshleyPrice(searchTerm, itemType) {
  const url = `https://www.ashleyfurniture.com/search-results?q=${encodeURIComponent(searchTerm)}`;
  const resp = await fetch(url);
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const priceEls = [...doc.querySelectorAll('div.price')].filter(el => el.textContent.includes('$'));
  const results = priceEls.map(priceEl => {
    const card = priceEl.closest('li, article, [class*="flex flex-col"]');
    const name = card?.querySelector('h3')?.textContent?.trim() || '';
    const price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ''));
    return { name, price };
  }).filter(r => r.name && r.price > 0);
  const type = itemType.toLowerCase();
  const keywords = type.split(' ').filter(w => w.length > 3);
  const match = results.find(r => keywords.some(kw => r.name.toLowerCase().includes(kw)));
  return match || results[0] || null;
}
```

## Step 4: Build Dashboard
Merge all price sources with items_filtered.json.

### Dashboard specs
- 4 price columns: Markson's, Old Brick, Dunk & Bright, Ashley
- 12 categories: Sofa & Loveseat, Sectional, Reclining Sofa & Loveseat, Reclining Sectional, Bed, Dresser & Mirror, Chest, Nightstand, Dining Room Sets, Recliner, Chair, Bundle
- Dark theme, fonts: Orbitron (title), Inter (body), JetBrains Mono (prices/SKUs)
- Sorting by any column, filter by category and search box
- Color coding: Markson's green if lowest price, red if not lowest

### Header layout (left side):
```
Markson's Price Intelligence    [search box]    [category dropdown]
224 items tracked
Old Brick: updated Jun 25 at 11:42pm
Dunk & Bright: updated Jun 25 at 11:42pm
Ashley: updated Jun 24 at 10:15am
```
Note: NO timestamp shown for Markson's prices.

### Price display
- Show null/missing prices as "—" (em dash)
- Highlight Markson's price green if it's the lowest among all 4 sources
- Highlight Markson's price red if any competitor is lower
- Show SKU in monospace below item description

## Step 5: Price Gap Alerts (private — run after all prices are merged)
After merging all price sources, compare Markson's price to each competitor's price and flag large gaps.

### Comparison logic:
- For each item where `markson != null`:
  - For each competitor source (ob, db, ashley) where that price is also not null:
    - `gap = abs(markson - competitor) / markson`
    - If `gap >= 0.20` (20% difference in either direction) → flag it
- A competitor being HIGHER than Markson's is just as flagworthy as being lower — both could mean a real pricing opportunity or a bad scrape

### Alert HTML file:
Generate `/home/claude/price_alerts.html` — a private, standalone HTML file with:
- Header: "Price Gap Report — [date] [time]" and count of flagged rows
- Dark theme matching the main dashboard (Orbitron/Inter/JetBrains Mono fonts)
- Table columns: Item, SKU, Markson's, Competitor, Their Price, Gap %
- Sort by gap % descending (biggest differences first)
- Row color: green if competitor is higher than Markson's (we're the better deal), red if competitor is lower (they undercut us)
- Only show items with 20%+ gap — if none meet the threshold, note "No significant price gaps this run"

### Delivery:
1. Use `SendUserFile` to send `/home/claude/price_alerts.html` in the conversation (private — cever pushed to GitHub)
2. Use `PushNotification` to send a summary to the user's phone:
   - If alerts exist: "📊 [N] price gaps: [top 3 items with gap %]. Full report in Claude app."
   - If no alerts: no push notification needed — skip it

## Step 6: Push to GitHub
Use Chrome browser JavaScript to push index.html via GitHub Contents API:
1. GET current file SHA: `https://api.github.com/repos/zangarano/marksons-price-tracker/contents/index.html`
2. Base64 encode the HTML content (use chunked TextEncoder approach)
3. PUT updated file with SHA

Token: ghp_REDACTED

## Timestamps
Record timestamps when each scrape finishes. Store in `/home/claude/scrape_timestamps.json`.
- `markson_db_updated`: ISO string when Step 1 completes (update every run)
- `ob_updated`: ISO string when Step 2 completes (update every run)
- `ashley_updated`: ONLY update when a live browser scrape of Ashley succeeds in Step 3. If Step 3 falls back to cached prices, preserve the existing timestamp unchanged. This ensures the dashboard always shows when Ashley prices were last genuinely refreshed.

The dashboard shows `ashley_updated` as the "Ashley: updated" line in the header. If it hasn't been updated today, staff will know to trigger a manual refresh.
