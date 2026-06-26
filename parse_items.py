import csv, json, re

INFILE = '/root/.claude/uploads/ccc7fd2c-8576-56f3-93ed-0ce9b63f42e4/54f5ecda-ash.csv'

# Rules for what to include and how to categorize
# Based on Product Group field and description patterns

def categorize(row):
    desc = row['Description'].upper()
    pg   = row['Product Group'].upper()   # e.g. SOFA, LOVE, RSECT, QBED, etc.
    pc   = row['Product Category'].upper() # STATIO, MOTION, BEDRM, DR, LR, NA
    sku  = row['Vendor Model']

    # ── EXCLUDE ────────────────────────────────────────────────
    # Accessories / non-furniture
    if pc in ('ACC', 'NA') and pg in ('ACC', 'TABTOP', 'LAMP', 'RUG', 'WALL', 'NA'):
        return None
    # Home office, entertainment, occasional tables, ottomans
    if pc in ('HOFF', 'ENT'):
        return None
    if pg in ('OCC', 'OTTO', 'HOFF', 'ENT', 'MIRROR', 'LAMP', 'RUG', 'WALL', 'TABTOP', 'ACC'):
        return None
    # Individual dining chairs/stools
    if pg == 'DINING' and any(x in desc for x in ['CHAIR', 'STOOL', 'BARSTOOL', 'BENCH']):
        return None
    # Bed COMPONENTS (headboard, footboard, rails, mirror, under bed, platform, roll slats)
    if pg == 'QBED' and any(x in desc for x in [
        'HEADBOARD', 'FOOTBOARD', 'RAILS', 'PLATFORM', 'UNDER BED', 'ROLL SLAT',
        'BOOKCASE HEAD', 'UPHOLSTERED HEAD'  # standalone headboard only
    ]):
        # But if it's part of a complete bed bundle (B2, B4, B7 etc), keep it
        # These standalone components end in -57, -54, -96, -95, -65, -60
        return None
    # Standalone bedroom mirrors (not dresser+mirror sets)
    if pg == 'MIRROR':
        return None
    # Individual sectional components (stationary) — these have LR/SECTIO or MOTION/RSECT
    # but are NOT complete sets
    if pg == 'SECTIO' and not any(x in desc for x in ['SECTIONAL', 'SOFA AND', 'LOVESEAT AND']):
        return None

    # ── CATEGORIZE ─────────────────────────────────────────────

    # RECLINING SECTIONAL — complete sets only
    if 'SECTIONAL' in desc and any(x in desc for x in ['DURAPELLA', 'NEXT-GEN']):
        return 'Reclining Sectional'
    if pg == 'RSECT' and 'SECTIONAL' in desc:
        return 'Reclining Sectional'
    # Modmax II reclining sectional sets
    if 'RECLINING' in desc and 'SECTIONAL' in desc:
        return 'Reclining Sectional'
    if 'RECLINING' in desc and 'PIECE' in desc:
        return 'Reclining Sectional'

    # STATIONARY SECTIONAL — complete sets
    if 'SECTIONAL' in desc and 'PIECE' in desc:
        return 'Sectional'
    if 'SOFA AND CHAISE' in desc or 'SOFA CHAISE' in desc:
        return 'Sectional'
    if pg == 'SECTIO':
        # Complete sofa+loveseat bundles
        if 'SOFA AND LOVESEAT' in desc or 'SOFA AND' in desc:
            return 'Sofa & Loveseat'
        return None  # other individual components

    # RECLINING SOFA & LOVESEAT
    if pg in ('RSOFA', 'RLOVE'):
        return 'Reclining Sofa & Loveseat'
    if pc == 'MOTION' and pg in ('RSOFA', 'RLOVE'):
        return 'Reclining Sofa & Loveseat'
    # Reclining sofa+loveseat bundles (e.g. "FROHN RECLINING SOFA AND LOVESEAT")
    if 'RECLINING SOFA AND' in desc or 'RECLINING LOVESEAT' in desc:
        return 'Reclining Sofa & Loveseat'
    if 'POWER RECLINING SOFA AND' in desc or 'POWER RECLINING LOVESEAT' in desc:
        return 'Reclining Sofa & Loveseat'
    # Reclining sofa+loveseat sets (like LEESWORTH POWER RECLINING SOFA AND LOVESEAT)
    if 'RECLINING' in desc and ('SOFA AND LOVESEAT' in desc or ('SOFA' in desc and 'RECLINER' in desc)):
        return 'Reclining Sofa & Loveseat'

    # RECLINER (single)
    if pg in ('RECLIN', 'LIFT'):
        return 'Recliner'
    if 'RECLINER' in desc and pg not in ('RSOFA', 'RLOVE', 'RSECT'):
        return 'Recliner'

    # SOFA & LOVESEAT (stationary)
    if pg in ('SOFA', 'LOVE'):
        return 'Sofa & Loveseat'
    # Sofa+loveseat bundles
    if 'SOFA AND LOVESEAT' in desc:
        return 'Sofa & Loveseat'

    # CHAIR (accent/oversized/swivel)
    if pg == 'CHAIR' or ('CHAIR' in pg):
        return 'Chair'
    if any(x in desc for x in ['SWIVEL ACCENT CHAIR', 'SWIVEL GLIDER', 'OVERSIZED ACCENT', 'OVERSIZED CHAIR', 'ACCENT CHAIR']):
        return 'Chair'

    # NIGHTSTAND
    if pg == 'NS' or 'NIGHTSTAND' in desc:
        return 'Nightstand'

    # CHEST
    if pg == 'CHEST' or 'CHEST OF DRAWERS' in desc:
        return 'Chest'

    # DRESSER & MIRROR (dresser+mirror combos and standalone dressers)
    if pg == 'DRSSR' or 'DRESSER' in desc:
        if 'AND MIRROR' in desc:
            return 'Dresser & Mirror'
        return 'Dresser & Mirror'

    # BED (complete beds) — QBED with actual bed assembly
    if pg == 'QBED':
        if any(x in desc for x in ['BED', 'PANEL BED', 'SLEIGH BED', 'BOOKCASE BED', 'STORAGE BED', 'UPHOLSTERED BED', 'PLATFORM BED']):
            return 'Bed'
        return None

    # BUNDLE — bedroom sets with bed + dresser/mirror (category NA with "BED" and "DRESSER")
    if 'BED' in desc and 'DRESSER' in desc:
        return 'Bundle'
    # Also things like "KANWYN QUEEN BED WITH" something
    if pc == 'NA' and 'BED' in desc:
        return 'Bundle'

    # DINING ROOM SETS — tables and complete sets
    if pg == 'DINING':
        if any(x in desc for x in ['TABLE', 'DINING SET', 'COUNTER HEIGHT TABLE']):
            return 'Dining Room Sets'
        # Drop leaf, extension tables
        if 'DROP LEAF' in desc:
            return 'Dining Room Sets'
        return None
    # Complete dining sets with chairs (Description has TABLE AND)
    if 'DINING TABLE AND' in desc or 'TABLE AND' in desc and pc in ('DR', 'NA'):
        return 'Dining Room Sets'
    if 'COUNTER HEIGHT' in desc and 'TABLE' in desc and pc in ('DR', 'NA'):
        return 'Dining Room Sets'
    if pc == 'DR' and 'TABLE' in desc:
        return 'Dining Room Sets'

    return None

items = []
skipped = []

with open(INFILE, newline='', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Skip zero-price items with no description info
        vendor_model = row['Vendor Model'].strip()
        description = row['Description'].strip()
        
        if not vendor_model or not description:
            continue
        # Skip items with ** (unlabeled/unknown)
        if '**' in vendor_model:
            continue

        cat = categorize(row)
        if cat:
            items.append({
                'sku': vendor_model,
                'description': description,
                'second_desc': row.get('Second Description', '').strip(),
                'category': cat,
                'product_category': row['Product Category'],
                'product_group': row['Product Group'],
                'cost': float(row['Sales Margin Cost']) if row['Sales Margin Cost'] else 0
            })
        else:
            skipped.append(f"{vendor_model}: {description} [{row['Product Category']}/{row['Product Group']}]")

# Summary by category
from collections import Counter
counts = Counter(i['category'] for i in items)

print(f"INCLUDED: {len(items)} items")
print()
for cat, n in sorted(counts.items()):
    print(f"  {cat}: {n}")
print()
print(f"SKIPPED: {len(skipped)} items")

# Save full list
with open('/home/claude/items_filtered.json', 'w') as f:
    json.dump(items, f, indent=2)

# Also save a readable list
with open('/home/claude/items_by_category.txt', 'w') as f:
    for cat in sorted(set(i['category'] for i in items)):
        f.write(f"\n{'='*60}\n{cat}\n{'='*60}\n")
        cat_items = [i for i in items if i['category'] == cat]
        for i in sorted(cat_items, key=lambda x: x['description']):
            f.write(f"  {i['sku']:<20} {i['description']}\n")
