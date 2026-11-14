"""Import reviewed insert-only extraction. Usage: python scripts/import-insert-catalog.py EXTRACT_DIR SOURCE_PDF

Does not run OCR, build, git, or deploy. Existing non-insert records are retained.
Reviewed input is checked-NN.json plus alpha-composited photos and clean drawings.
"""
from pathlib import Path
import sys,json,re,hashlib,shutil,collections
root=Path(__file__).resolve().parents[1]
extraction=Path(sys.argv[1]); source=Path(sys.argv[2])
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def category(n):
    if 12<=n<=24:return 'Turning inserts'
    if n in (25,26):return 'Aluminum inserts'
    if 31<=n<=33:return 'Threading inserts'
    if n==35:return 'Parting and grooving inserts'
    if 48<=n<=56:return 'Milling inserts'
    if n==60:return 'U drill inserts'
    if n in (61,62):return 'Deep-hole drilling inserts'
    raise ValueError(n)
categories=json.loads((root/'data/categories.json').read_text(encoding='utf8'))
children=next(c for c in categories if c['id']=='cnc-inserts')['children']
ids={c['name']:c['id'] for c in children}
old=json.loads((root/'data/products.json').read_text(encoding='utf8'))
retained=[r for r in old if not r['id'].startswith('mwd-insert-')]
assert len(retained)==1326
products=[];evidence=[];assets={};counts=collections.Counter();groups=collections.Counter()
output=root/'public/images/inserts';output.mkdir(exist_ok=True)
for path in sorted(extraction.glob('checked-*.json')):
    d=json.loads(path.read_text(encoding='utf8'));n=d['pdfPage'];cat=category(n)
    for ti,t in enumerate(d['tables'],1):
        page=2*n-3+int(t['bounds'][0]>d['size'][0]/2)
        drawing=f'p{n:02d}-t{ti}-diagram.png'
        names={g['key']:next(r['model'] for r in t['rows'] if r['group']==g['key']) for g in t['groups']}
        for g in t['groups']:
            groups[cat]+=1
            photo=g['key']+'.png'
            for name in (photo,drawing):
                assert (extraction/name).exists(),name
                shutil.copyfile(extraction/name,output/name)
                assets[name]={'sha256':digest(output/name),'pdfPage':n,'printedPage':page}
        for r in t['rows']:
            model=r['model'];key=r['group'];assert key in names
            recommendations=[{'grade':g['grade'],'recommendation':g['recommendation']} for g in r['grades'] if g['pixels']>=25]
            assert len({v['grade'] for v in recommendations})==len(recommendations)
            specs=[]
            for s in r['specs']:
                label=s['label']
                if label in ('\u03a61.C','\u03a6l.C'):label='I.C.'
                if label=='\u03a6d':label='d'
                if label=='\u87ba\u8ddd':label='Pitch'
                if label=='1':label='t' # Grooving table thickness t, verified against the drawing.
                if label=='I.W':label='I.W.'
                unit='TPI' if label=='Pitch' and 'WS' in model else 'mm'
                if s['value']=='/':unit=None
                specs.append({'label_en':label,'value':s['value'],**({'unit':unit} if unit else {})})
            familyrows=[a for a in t['rows'] if a['group']==key]
            representative=names[key]
            stem=re.match(r'[A-Z]+',representative)
            stem=stem.group() if stem else representative.split('-')[0]
            suffix=representative.rsplit('-',1)[1] if '-' in representative else ''
            series=representative if len(familyrows)==1 else stem+((' / '+suffix) if suffix else '')
            pid='mwd-insert-'+re.sub(r'[^a-z0-9]+','-',model.lower()).strip('-')
            row={'id':pid,'model':model,'category_en':cat,'category_parent_en':'CNC Inserts','category_id':ids[cat],
                 'name_en':series+' insert','insert_family':key,'insert_series':series,
                 'description_en':f'{cat.rstrip("s")} from the 2025-2026 catalog. Select a model and its listed grade; confirm workpiece, holder compatibility and cutting conditions before ordering.',
                 'application_en':cat,'specs':specs,'grades':[v['grade'] for v in recommendations],
                 'grade_recommendations':recommendations,'image':'/images/inserts/'+key+'.png',
                 'drawing':'/images/inserts/'+drawing,'source_printed_page':page,'status':'needs_manual_review'}
            products.append(row);counts[cat]+=1
            evidence.append({'id':pid,'model':model,'pdfPage':n,'printedPage':page,'table':ti,'rowBounds':r['row'],
                             'family':key,'photoBounds':next(g['imageBounds'] for g in t['groups'] if g['key']==key),
                             'modelConfidence':r['confidence'],'specs':r['specs'],
                             'gradeEvidence':[g for g in r['grades'] if g['pixels']>=25]})
assert len(products)==537 and len({r['model'] for r in products})==537
assert sum(groups.values())==182
assert len({r['id'] for r in products})==len(products)
(root/'data/products.json').write_text(json.dumps(retained+products,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
manifest={'schemaVersion':1,'sourceFile':source.name,'sourceSha256':digest(source),'scope':'Insert product tables only; blank model cells excluded; technical comparisons are separate reference data.',
          'originalRecordsPreserved':len(retained),'modelCount':len(products),'photoGroups':sum(groups.values()),
          'categories':[{'name':c['name'],'models':counts[c['name']],'photoGroups':groups[c['name']]} for c in children if counts[c['name']]],
          'reviewNotes':['Source alpha composited onto white; native isolated product images, not whole-page screenshots.',
                         'Model-specific grade symbols retained; tiny grid fragments under 25 pixels rejected.',
                         'Blank source grades retained, not copied from adjacent models.','Source dimensions retained including slash for non-applicable radius.',
                         'No supplier PDF or contact information published.','Catalog references do not certify stock or guaranteed interchangeability.'],
          'assets':assets,'records':evidence}
(root/'data/insert-catalog-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(manifest['categories'],indent=2));print('Preserved',len(retained),'Imported',len(products),'Photos',sum(groups.values()))
