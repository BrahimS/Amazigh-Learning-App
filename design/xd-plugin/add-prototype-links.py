import json, sys, zipfile, uuid, re
src, flows_path, out = sys.argv[1:4]
zin = zipfile.ZipFile(src)
man = json.loads(zin.read('manifest'))
flows = json.load(open(flows_path))
folder_name = {}
def walk_man(n):
    for c in n.get('children', []):
        if c.get('path', '').startswith('artboard-'): folder_name[c['path']] = c['name']
        walk_man(c)
walk_man(man)
boards = {}  # (variant, key) -> (artboard id, root node)
for name in zin.namelist():
    m = re.match(r'artwork/(artboard-[^/]+)/graphics/graphicContent.agc$', name)
    if not m: continue
    title = folder_name[m.group(1)]
    mm = re.match(r'^([AB]) / ([^ ]+) / ([^ ]+) — ', title)
    if not mm: print('skip', title); continue
    ab = json.loads(zin.read(name))['children'][0]
    boards[(mm.group(1), mm.group(2) + '/' + mm.group(3))] = (ab['id'], ab)
def nodes(n):
    for c in (n.get('artboard') or n.get('group') or {}).get('children', []):
        yield c
        yield from nodes(c)
def find(ab, layer):
    for c in nodes(ab):
        nm = c.get('name', '')
        if nm == layer or any(nm.startswith(layer + sep) for sep in (' / ', ' — ', ',')) or (c.get('type') == 'text' and nm.strip() == layer): return c
inter, missing, count = {}, [], 0
def link(n, dest):
    global count
    inter.setdefault(n['id'], []).append({"triggerEvent": "tap", "action": "artboard-transition", "properties": {"transition": "dissolve", "duration": 0.3, "easing": "ease-out", "preserveScrollPosition": False, "destination": dest}, "id": str(uuid.uuid4())})
    count += 1
for v in 'AB':
    for s, layer, d in flows['links']:
        if (v, s) not in boards or (v, d) not in boards: missing.append((v, s, layer, d, 'board')); continue
        n = find(boards[(v, s)][1], layer)
        if not n: missing.append((v, s, layer, d, 'layer')); continue
        if n['id'] in inter: continue
        link(n, boards[(v, d)][0])
    for (vv, key), (aid, ab) in boards.items():
        if vv != v: continue
        for tab, d in flows['tabs'].items():
            n = find(ab, tab)
            if n and d != key and n['id'] not in inter: link(n, boards[(v, d)][0])
home = boards[('A', '2-onboarding-and-auth/01-splash')][0]
data = {"version": "0.24", "homeArtboard": home, "interactions": inter}
zout = zipfile.ZipFile(out, 'w')
for info in zin.infolist():
    body = json.dumps(data, separators=(',', ':')).encode() if info.filename == 'interactions/interactions.json' else zin.read(info.filename)
    zout.writestr(info, body, compress_type=info.compress_type)
zout.close()
print('boards', len(boards), 'links', count)
for m in missing: print('MISSING', m)
