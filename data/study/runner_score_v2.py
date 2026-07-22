# -*- coding: utf-8 -*-
"""
Runner Score v2 — estudo. Adiciona ao v1 o atributo FINALIZAÇÃO, parseando
os GPX corrida a corrida (o CSV não traz pacing interno).
Finalização = tendência de terminar forte (negative split): compara o ritmo
da 2ª metade com o da 1ª metade de cada corrida.
"""
import csv, re, statistics, sys, os, math
from datetime import datetime
try: sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception: pass

BASE = r"C:\Users\ander\Desktop\RunnerProfile\data\export"
CSV_PATH = os.path.join(BASE, "activities.csv")
MESES={"jan":1,"fev":2,"mar":3,"abr":4,"mai":5,"jun":6,"jul":7,"ago":8,"set":9,"out":10,"nov":11,"dez":12}

def parse_date(s):
    m=re.search(r"(\d+)\s+de\s+(\w+)\.?\s+de\s+(\d+),\s+(\d+):(\d+):(\d+)",s or "")
    if not m: return None
    d,mon,y,hh,mm,ss=m.groups(); mon=MESES.get(mon.lower()[:3])
    return datetime(int(y),mon,int(d),int(hh),int(mm),int(ss)) if mon else None
def fnum(s):
    if s is None: return None
    s=s.strip(); s=s.replace(".","").replace(",",".") if ("," in s and "." in s) else s.replace(",",".")
    try: return float(s)
    except: return None
def read_rows():
    for enc in ("utf-8-sig","cp1252","latin-1"):
        try:
            with open(CSV_PATH,encoding=enc,newline="") as f: return list(csv.reader(f)),enc
        except Exception: continue
    raise SystemExit("CSV ilegível")
def ci(h,name,occ=0):
    hits=[i for i,x in enumerate(h) if x.strip()==name]; return hits[occ] if len(hits)>occ else None
def clampi(x,lo=1,hi=99): return int(max(lo,min(hi,round(x))))
def lin(x,pts):
    pts=sorted(pts)
    if x<=pts[0][0]: return pts[0][1]
    if x>=pts[-1][0]: return pts[-1][1]
    for (x0,y0),(x1,y1) in zip(pts,pts[1:]):
        if x0<=x<=x1: return y0+(x-x0)/(x1-x0)*(y1-y0)
    return pts[-1][1]
def pace_str(p):
    m=int(p); s=int(round((p-m)*60))
    if s==60: m+=1; s=0
    return f"{m}:{s:02d}/km"
def pctl(vals,q):
    if not vals: return None
    v=sorted(vals); i=q*(len(v)-1); lo=int(i); hi=min(lo+1,len(v)-1)
    return v[lo]+(i-lo)*(v[hi]-v[lo])

# ---------- GPX ----------
def hav(a,b):
    R=6371000.0; la1,lo1,la2,lo2=map(math.radians,[a[0],a[1],b[0],b[1]])
    dla=la2-la1; dlo=lo2-lo1
    x=math.sin(dla/2)**2+math.cos(la1)*math.cos(la2)*math.sin(dlo/2)**2
    return 2*R*math.asin(math.sqrt(x))
def parse_gpx(path):
    """Retorna lista de (dist_acumulada_m, tempo_s) ou None."""
    try:
        import xml.etree.ElementTree as ET
        pts=[]
        for _,el in ET.iterparse(path):
            tag=el.tag.split('}')[-1]
            if tag=='trkpt':
                lat=el.get('lat'); lon=el.get('lon')
                t=None
                for c in el:
                    if c.tag.split('}')[-1]=='time': t=c.text
                if lat and lon and t:
                    pts.append((float(lat),float(lon),t))
                el.clear()
        if len(pts)<10: return None
        def ptime(s):
            s=s.strip().replace('Z','+00:00')
            return datetime.fromisoformat(s)
        t0=ptime(pts[0][2]); series=[]; cum=0.0
        prev=None
        for lat,lon,t in pts:
            if prev is not None: cum+=hav(prev,(lat,lon))
            prev=(lat,lon)
            series.append((cum,(ptime(t)-t0).total_seconds()))
        return series
    except Exception:
        return None
def finish_metric(series):
    """(pace1-pace2)/pace1 : positivo = terminou mais rápido (negative split)."""
    if not series: return None
    total_d=series[-1][0]; total_t=series[-1][1]
    if total_d<2000 or total_t<300: return None
    half=total_d/2.0
    # tempo no ponto de meia-distância (interpola)
    tm=None
    for (d0,t0),(d1,t1) in zip(series,series[1:]):
        if d0<=half<=d1:
            tm=t0+((half-d0)/(d1-d0))*(t1-t0) if d1>d0 else t0; break
    if tm is None or tm<=0 or tm>=total_t: return None
    d_half=half/1000.0
    pace1=(tm/60.0)/d_half; pace2=((total_t-tm)/60.0)/d_half
    if pace1<=0: return None
    return (pace1-pace2)/pace1

def load():
    rows,enc=read_rows(); h=rows[0]
    idx=dict(dt=ci(h,"Data da atividade"),tipo=ci(h,"Tipo de atividade"),
             dist=ci(h,"Distância",0),elap=ci(h,"Tempo decorrido",0),
             mov=ci(h,"Tempo de movimentação"),elev=ci(h,"Ganho de elevação"),
             fn=ci(h,"Nome do arquivo"))
    runs=[]
    for r in rows[1:]:
        if not r or len(r)<=max(v for v in idx.values() if v is not None): continue
        if "corrida" not in (r[idx["tipo"]] or "").lower(): continue
        dt=parse_date(r[idx["dt"]]); dist=fnum(r[idx["dist"]])
        mov=fnum(r[idx["mov"]]) if idx["mov"] is not None else None
        elap=fnum(r[idx["elap"]]) if idx["elap"] is not None else None
        elev=fnum(r[idx["elev"]]) if idx["elev"] is not None else 0.0
        fn=r[idx["fn"]] if idx["fn"] is not None else None
        if not dt or not dist or dist<0.3: continue
        secs=mov or elap
        if not secs or secs<60: continue
        pace=(secs/60.0)/dist
        runs.append(dict(dt=dt,dist=dist,secs=secs,pace=pace,elev=elev or 0.0,fn=fn,flag=None,finish=None))
    runs.sort(key=lambda x:x["dt"])
    return runs,enc

def clean(runs):
    p95_d=pctl([r["dist"] for r in runs],0.95)
    flagged=[]
    for r in runs:
        if r["pace"]<3.75: r["flag"]="glitch GPS (rápido)"; flagged.append(r); continue
        if r["dist"]>max(3*p95_d,p95_d+15): r["flag"]="distância fora do padrão"; flagged.append(r); continue
        if r["pace"]>10.5: r["flag"]="caminhada/run-walk"; flagged.append(r); continue
    return [r for r in runs if r["flag"] is None],flagged

# atributos
def a_ritmo(cl):
    elig=[r["pace"] for r in cl if r["dist"]>=2.0]
    best=pctl(elig,0.15) if elig else statistics.median([r["pace"] for r in cl])
    return lin(best*60,[(480,20),(420,38),(360,55),(330,66),(300,74),(270,84),(240,92),(229.8,96)]),best
def a_res(cl,vol):
    lg=max(r["dist"] for r in cl)
    return 0.6*lin(lg,[(3,30),(5,42),(8,55),(10,63),(15,76),(21.1,88),(30,96)])+0.4*lin(vol,[(5,30),(10,42),(20,58),(30,72),(40,82),(60,92)])
def a_reg(freq,recent):
    s=lin(freq,[(0.5,25),(1,42),(1.5,54),(2,64),(3,77),(4,86),(5,92)])
    if len(recent)>=3:
        gaps=[(recent[i+1]["dt"]-recent[i]["dt"]).days for i in range(len(recent)-1)]
        cv=(statistics.pstdev(gaps)/statistics.mean(gaps)) if statistics.mean(gaps)>0 else 0
        s*=max(0.8,1-0.15*cv)
    return s
def a_sub(cl):
    g=[r["elev"]/r["dist"] for r in cl if r["dist"]>0.5]
    return lin(statistics.mean(g) if g else 0,[(2,30),(5,42),(8,55),(12,66),(18,78),(25,88)])
def a_evo(cl):
    if len(cl)<6: return 50
    t0=cl[0]["dt"]; xs=[(r["dt"]-t0).days for r in cl]; ys=[r["pace"] for r in cl]
    mx=statistics.mean(xs); my=statistics.mean(ys); den=sum((x-mx)**2 for x in xs) or 1
    slope=sum((x-mx)*(y-my) for x,y in zip(xs,ys))/den
    return lin(slope*90,[(0.6,25),(0.3,38),(0.1,48),(0,52),(-0.1,60),(-0.3,74),(-0.6,88)])
def a_fin(cl):
    fs=[r["finish"] for r in cl if r["finish"] is not None]
    if not fs: return None,0
    med=statistics.median(fs)
    return lin(med,[(-0.15,30),(-0.08,42),(-0.03,50),(0,56),(0.05,70),(0.10,82),(0.15,90)]),len(fs)

W={"Ritmo":.20,"Resistência":.20,"Regularidade":.22,"Finalização":.10,"Subida":.08,"Evolução":.20}

def build(cl,freq_days=56):
    last=cl[-1]["dt"]; recent=[r for r in cl if 0<=(last-r["dt"]).days<=freq_days]
    freq=len(recent)/(freq_days/7.0); vol=sum(r["dist"] for r in recent)/(freq_days/7.0)
    rit,best=a_ritmo(cl); fin,ncov=a_fin(cl)
    a={"Ritmo":clampi(rit),"Resistência":clampi(a_res(cl,vol)),"Regularidade":clampi(a_reg(freq,recent)),
       "Finalização":(clampi(fin) if fin is not None else None),"Subida":clampi(a_sub(cl)),"Evolução":clampi(a_evo(cl))}
    ww={k:v for k,v in W.items() if a[k] is not None}; s=sum(ww.values())
    geral=sum(a[k]*ww[k] for k in ww)/s
    return dict(attrs=a,geral=clampi(geral),score=round(geral*10),best=best,fin_cov=ncov)

def main():
    runs,enc=load(); cl,flagged=clean(runs)
    print("="*60); print(f"  RUNNER SCORE v2 — + Finalização via GPX (CSV: {enc})"); print("="*60)

    # parse GPX das corridas limpas
    print("\n[1] LENDO OS GPX corrida a corrida...")
    ok=0
    for r in cl:
        if not r["fn"]: continue
        path=os.path.join(BASE, r["fn"].replace("/", os.sep))
        series=parse_gpx(path)
        if series: r["finish"]=finish_metric(series); ok+= (r["finish"] is not None)
    print(f"  GPX lidos com métrica de finalização: {ok}/{len(cl)}")

    fins=[r["finish"] for r in cl if r["finish"] is not None]
    if fins:
        neg=sum(1 for f in fins if f>0); pos=sum(1 for f in fins if f<0)
        print(f"  Terminou mais RÁPIDO (negative split): {neg}   |   mais LENTO: {pos}")
        print(f"  Mediana: {statistics.median(fins)*100:+.1f}%  (positivo = termina forte)")

    full=build(cl)
    rec90=[r for r in cl if (cl[-1]['dt']-r['dt']).days<=90]
    form=build(rec90) if len(rec90)>=3 else None

    print("\n[2] RUNNER PROFILE v2 (dado real, limpo)")
    print("-"*60)
    print(f"  RUNNER SCORE (identidade/carreira): {full['score']}   [Geral {full['geral']}]")
    if form: print(f"  FORMA ATUAL (90 dias):              {form['score']}   [Geral {form['geral']}]")
    print(f"  Ritmo-base: {pace_str(full['best'])} | Finalização cobre {full['fin_cov']} corridas")
    print("  Atributos:")
    order=["Ritmo","Resistência","Regularidade","Finalização","Subida","Evolução"]
    for k in order:
        v=full["attrs"][k]
        if v is None: print(f"     {k:<13}  —   (sem dado)")
        else: print(f"     {k:<13} {v:>3}  {'█'*int(v/5)}")
    print("\n"+"="*60)
    print("  v2 de ESTUDO. Finalização agora vem do interior de cada corrida.")
    print("="*60)

if __name__=="__main__": main()
