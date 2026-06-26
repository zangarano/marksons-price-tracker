import re
import json

with open('/home/claude/index.html', 'r') as f:
    content = f.read()

# All fixes: {sku: {field: new_value}}
fixes = {
    # DRESSER mismatches (scraper matched dresser+mirror price to dresser-only item)
    'B2589-31': {'db': 258},     # BELACHIME DRESSER (was dresser+mirror price 320)
    'B611-31':  {'db': 581},     # DANTENTON DRESSER (was 690)
    'B211-31':  {'db': 319},     # DRYSTAN DRESSER (was 381)
    'PCB779-31':{'db': 859},     # FEDDINGER DRESSER (was 1053)
    'B777-31':  {'db': 793},     # KANWYN DRESSER (was 964)
    'B849-31':  {'db': 832},     # TAFFENBROOK DRESSER (was 957)
    'PCB3380-31':{'db': 334},    # ZURALEUS DRESSER (was 491)
    # Other item-type mismatches
    'B777-46':  {'db': 837},     # KANWYN CHEST (was nightstand price 323)
    'B777B4':   {'db': 647},     # KANWYN QUEEN PANEL BED (was bench price 860)
    # BRINDLEY PIER - all variants had same wrong price (5-PC price)
    '99503S1':  {'db': 1246},    # 2-PC (was 3942)
    '99503S2':  {'db': 1869},    # 3-PC (was 3942)
    '99503S4':  {'db': 2492},    # 4-PC (was 3942)
    '99503S6':  {'db': 2425},    # 4-PC modular (was 3942)
    '99503S3':  {'db': 3319},    # 5-PC (was 3942)
    # EMILIA - wrong piece count
    '30901S1':  {'db': 1968},    # 2-PC (was 5089)
    # CUDDLE PLUSH - all had same wrong price (1-PC price)
    'PC59106S7': {'db': 1163},   # 3-PC (was 830)
    'PC59106S11':{'db': 1973},   # 5-PC (was 830)
    'PC59106S8': {'db': 2699},   # 6-PC (was 830)
    # MODMAX - wrong piece count
    '92121S17': {'db': 1298},    # 3-PC (was 1680)
    '92121S67': {'db': 1680},    # 5-PC (was impossibly low 122)
    # NEXT-GEN DURAPELLA - all had same wrong price (collection-level)
    '61004S1':  {'db': 1203},    # 2-PC (was 2125)
    '61004S2':  {'db': 1504},    # 3-PC (was 2125)
    '61004S3':  {'db': 1504},    # 3-PC alt config (was 2125)
    '61004S4':  {'db': 2148},    # 4-PC (was 2125)
    '61004S5':  {'db': 2333},    # 5-PC (was 2125)
    '61004S6':  {'db': 2610},    # 5-PC larger config (was 2125)
    '61004S7':  {'db': None},    # 6-PC (was 2125; D&B doesn't carry 6-piece Sand)
    # DINING SET mismatches (table-only price assigned to table+chairs sets)
    'D594D8':   {'db': 836},     # RALENE TABLE+2 (was table-only 482)
    'D594D2':   {'db': 1148},    # RALENE TABLE+4 (was table-only 482)
    'D615D15':  {'db': 988},     # LYNCOTT TABLE+4 (was table-only 502)
    # BUNDLE mismatches (bed-only price assigned to bed+dresser bundles)
    'PCB2260B3': {'db': None},   # RUSTICOTT BED+DRESSER+MIRROR (was bed-only 358)
    'PCB2260B10':{'db': None},   # RUSTICOTT BED+DRESSER+NIGHTSTAND (was bed-only 358)
    # Ashley logical impossibility (dresser alone costs more than dresser+mirror)
    'B777B1':   {'ashley': None},# KANWYN DRESSER AND MIRROR (was 299.99; dresser-only is $379.99)
}

# Parse the ITEMS array from the JS
items_match = re.search(r'const ITEMS = (\[.*?\]);', content, re.DOTALL)
if not items_match:
    print("ERROR: Could not find ITEMS array!")
    exit(1)

items_json = items_match.group(1)
items = json.loads(items_json)
print(f"Loaded {len(items)} items")

fixed_count = 0
for item in items:
    sku = item['sku']
    if sku in fixes:
        for field, new_val in fixes[sku].items():
            old_val = item.get(field)
            item[field] = new_val
            print(f"  {sku} ({item['description'][:40]}): {field} {old_val} → {new_val}")
            fixed_count += 1

print(f"\nTotal fixes applied: {fixed_count}")

# Rebuild the ITEMS JS (compact, no extra whitespace)
new_items_json = json.dumps(items, separators=(',', ':'))
new_content = content[:items_match.start(1)] + new_items_json + content[items_match.end(1):]

with open('/home/claude/index.html', 'w') as f:
    f.write(new_content)

print(f"Saved. New size: {len(new_content)} bytes")
