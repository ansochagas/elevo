# -*- coding: utf-8 -*-
"""
Runner Score v1 — estudo (não é produção).
Correções sobre o v0 + o modelo de duas camadas (identidade estável + forma atual)
e temporadas (sazonalização), rodando no export real.

Correções v1:
  1. Faxina de outliers (glitches de GPS / atividade trocada) antes de calcular.
  2. Ritmo pelos MELHORES esforços sustentados (percentil rápido), não pela média burra.
  3. Runner Score amortecido (EMA) + estado "calibrando" com poucos dados.
  4. Duas camadas: Runner Score (carreira, estável) + Forma atual (90 dias, responsiva).
  5. Temporadas (trimestres) — sazonalização do histórico.
"""
import csv, re, statistics, sys
from datetime import datetime
try: sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception: pass

CSV_PATH = r"C:\Users\ander\Desktop\RunnerProfile\data\export\activities.csv"
MESES={"jan":1,"fev":2,"mar":3,"abr":4,"mai":5,"jun":6,"jul":7,"ago":8,"set":9,"out":10,"nov":11,"dez":12}

def parse_date(s):
    m=re.search(r"(\d+)\s+de\s+(\w+)\.?\s+de\s+(\d+),\s+(\d+):(\d+):(\d+)",s or "")
    if not m: return None
    d,mon,y,hh,mm,ss=m.groups(); mon=MESES.get(mon.lower()[:3])
    return datetime(int(y),mon,int(d),int(hh),int(mm),int(ss)) if mon else None

def fnum(s):
    if s is None: return None
    s=s.strip()
    s=s.replace(".","").replace(",",".") if ("," in s and "." in s) else s.replace(",",".")
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
    pts=sorted(pts)  # robustez: aceita âncoras em qualquer ordem
    if x<=pts[0][0]: return pts[0][1]
    if x>=pts[-1][0]: return pts[-1][1]
    for (x0,y0),(x1,y1) in zip(pts,pts[1:]):
        if x0<=x<=x1: return y0+(x-x0)/(x1-x0)*(y1-y0)
    return pts[-1][1]
def pace_str(p):
    m=int(p); s=int(round((p-m)*60))
    if s==60: m+=1; s=0
    return f"{m}:{s:02d}/km"
def pct(sorted_vals, q):
    if not sorted_vals: return None
    i=q*(len(sorted_vals)-1); lo=int(i); hi=min(lo+1,len(sorted_vals)-1)
    return sorted_vals[lo]+(i-lo)*(sorted_vals[hi]-sorted_vals[lo])

def load():
    rows,enc=read_rows(); h=rows[0]
    idx=dict(dt=ci(h,"Data da atividade"),tipo=ci(h,"Tipo de atividade"),
             dist=ci(h,"Distância",0),elap=ci(h,"Tempo decorrido",0),
             mov=ci(h,"Tempo de movimentação"),elev=ci(h,"Ganho de elevação"))
    runs=[]
    for r in rows[1:]:
        if not r or len(r)<=max(v for v in idx.values() if v is not None): continue
        if "corrida" not in (r[idx["tipo"]] or "").lower(): continue
        dt=parse_date(r[idx["dt"]]); dist=fnum(r[idx["dist"]])
        mov=fnum(r[idx["mov"]]) if idx["mov"] is not None else None
        elap=fnum(r[idx["elap"]]) if idx["elap"] is not None else None
        elev=fnum(r[idx["elev"]]) if idx["elev"] is not None else 0.0
        if not dt or not dist or dist<0.3: continue
        secs=mov or elap
        if not secs or secs<60: continue
        pace=(secs/60.0)/dist
        runs.append(dict(dt=dt,dist=dist,secs=secs,pace=pace,elev=elev or 0.0,flag=None))
    runs.sort(key=lambda x:x["dt"])
    return runs,enc

# ---------- 1. FAXINA DE OUTLIERS ----------
def clean(runs):
    paces=sorted(r["pace"] for r in runs); dists=sorted(r["dist"] for r in runs)
    med_p=statistics.median(paces)
    p95_d=pct(dists,0.95)
    flagged=[]
    for r in runs:
        # glitch de GPS: ritmo implausível de tão rápido (amador não sustenta <3:45/km numa corrida inteira)
        if r["pace"]<3.75:
            r["flag"]="ritmo impossível (glitch GPS)"; flagged.append(r); continue
        # distância isolada muito acima do resto (atividade trocada/ultra improvável no perfil)
        if r["dist"]>max(3*p95_d, p95_d+15):
            r["flag"]="distância fora do padrão (atividade trocada?)"; flagged.append(r); continue
        # ritmo de caminhada: não é corrida, não deve contar para os atributos de corrida
        if r["pace"]>10.5:
            r["flag"]="ritmo de caminhada / run-walk"; flagged.append(r); continue
    clean=[r for r in runs if r["flag"] is None]
    return clean,flagged

# ---------- ATRIBUTOS v1 ----------
def attr_ritmo_v1(clean):
    # melhores esforços sustentados: percentil 15 (rápido) entre corridas >= 2km
    elig=sorted(r["pace"] for r in clean if r["dist"]>=2.0)
    best=pct(elig,0.15) if elig else statistics.median([r["pace"] for r in clean])
    sec=best*60
    return lin(sec,[(8*60,20),(7*60,38),(6*60,55),(5.5*60,66),(5*60,74),(4.5*60,84),(4*60,92),(3.83*60,96)]), best
def attr_res(clean, vol_wk):
    longest=max(r["dist"] for r in clean)
    s_long=lin(longest,[(3,30),(5,42),(8,55),(10,63),(15,76),(21.1,88),(30,96)])
    s_vol=lin(vol_wk,[(5,30),(10,42),(20,58),(30,72),(40,82),(60,92)])
    return 0.6*s_long+0.4*s_vol, longest
def attr_reg(freq_wk,recent):
    s=lin(freq_wk,[(0.5,25),(1,42),(1.5,54),(2,64),(3,77),(4,86),(5,92)])
    if len(recent)>=3:
        gaps=[(recent[i+1]["dt"]-recent[i]["dt"]).days for i in range(len(recent)-1)]
        cv=(statistics.pstdev(gaps)/statistics.mean(gaps)) if statistics.mean(gaps)>0 else 0
        s*=max(0.8,1-0.15*cv)
    return s
def attr_sub(clean):
    g=[r["elev"]/r["dist"] for r in clean if r["dist"]>0.5]
    return lin(statistics.mean(g) if g else 0,[(2,30),(5,42),(8,55),(12,66),(18,78),(25,88)])
def attr_evo(clean):
    if len(clean)<6: return 50
    t0=clean[0]["dt"]; xs=[(r["dt"]-t0).days for r in clean]; ys=[r["pace"] for r in clean]
    mx=statistics.mean(xs); my=statistics.mean(ys); den=sum((x-mx)**2 for x in xs) or 1
    slope=sum((x-mx)*(y-my) for x,y in zip(xs,ys))/den
    return lin(slope*90,[(0.6,25),(0.3,38),(0.1,48),(0,52),(-0.1,60),(-0.3,74),(-0.6,88)])

W={"Ritmo":.22,"Resistência":.22,"Regularidade":.24,"Subida":.10,"Evolução":.22}

def score_from(clean, window_ref=None, freq_days=56):
    if len(clean)<3: return None
    last=window_ref or clean[-1]["dt"]
    recent=[r for r in clean if 0<=(last-r["dt"]).days<=freq_days]
    freq=len(recent)/(freq_days/7.0)
    vol=sum(r["dist"] for r in recent)/(freq_days/7.0)
    rit,best_p=attr_ritmo_v1(clean); res,_=attr_res(clean,vol); reg=attr_reg(freq,recent)
    sub=attr_sub(clean); evo=attr_evo(clean)
    a={"Ritmo":clampi(rit),"Resistência":clampi(res),"Regularidade":clampi(reg),
       "Subida":clampi(sub),"Evolução":clampi(evo)}
    geral=sum(a[k]*W[k] for k in a)
    return dict(attrs=a,geral=clampi(geral),score=round(geral*10),best_pace=best_p)

def main():
    runs,enc=load()
    cl,flagged=clean(runs)
    hr=lambda: print("-"*60)
    print("="*60); print(f"  RUNNER SCORE v1 — estudo (CSV: {enc})"); print("="*60)

    print("\n[1] FAXINA DE OUTLIERS")
    hr()
    if flagged:
        for r in flagged[:9]:
            print(f"  ✗ {r['dt'].strftime('%d/%m/%Y')}  {r['dist']:.1f} km  {pace_str(r['pace'])}  → {r['flag']}")
        if len(flagged)>9: print(f"  ... (+{len(flagged)-9} outras removidas)")
    else: print("  (nada flagrado)")
    print(f"  Corridas usadas: {len(cl)}  (removidas: {len(flagged)})")

    # resumo limpo
    dists=[r['dist'] for r in cl]; paces=[r['pace'] for r in cl]
    last=cl[-1]["dt"]; rr8=[r for r in cl if (last-r['dt']).days<=56]
    freq8=len(rr8)/8.0; vol8=sum(r['dist'] for r in rr8)/8.0
    _,best_sust=attr_ritmo_v1(cl)
    print("\n[2] RESUMO (limpo)")
    hr()
    print(f"  Corridas: {len(cl)} | total {sum(dists):.0f} km | média {statistics.mean(dists):.2f} km | mais longa {max(dists):.1f} km")
    print(f"  Ritmo médio {pace_str(statistics.mean(paces))} | mediana {pace_str(statistics.median(paces))} | melhor esforço {pace_str(best_sust)}")
    print(f"  Frequência 8 sem: {freq8:.1f}/sem | volume {vol8:.1f} km/sem")

    # ---------- 3. DUAS CAMADAS ----------
    career=score_from(cl)                          # carreira inteira
    form=score_from(cl, freq_days=90)              # forma recente (90d) — mesma base, janela recente pra freq/vol
    # forma "responsiva": recalcular atributos só com últimos 90 dias
    rec90=[r for r in cl if (last-r['dt']).days<=90]
    form90=score_from(rec90) if len(rec90)>=3 else None
    print("\n[3] MODELO DE DUAS CAMADAS")
    hr()
    print(f"  RUNNER SCORE (identidade · carreira · estável): {career['score']}   [Geral {career['geral']}]")
    print(f"     (ritmo-base usado no cálculo: {pace_str(career['best_pace'])})")
    if form90:
        print(f"  FORMA ATUAL   (momento · últimos 90 dias):       {form90['score']}   [Geral {form90['geral']}]")
    print("  Atributos (carreira):")
    for k,v in career["attrs"].items():
        print(f"     {k:<13} {v:>3}  {'█'*int(v/5)}")

    # ---------- 4. VOLATILIDADE: cru vs amortecido ----------
    print("\n[4] VOLATILIDADE — v1 cru vs amortecido (EMA) + confiança")
    hr()
    months=sorted({(r['dt'].year,r['dt'].month) for r in cl})
    ema=None; alpha=0.35; raw_series=[]; ema_series=[]
    for (yy,mm) in months:
        nxt=datetime(yy+1,1,1) if mm==12 else datetime(yy,mm+1,1)
        hist=[r for r in cl if r['dt']<nxt]
        s=score_from(hist)
        if not s: continue
        raw=s["score"]; ema=raw if ema is None else round(alpha*raw+(1-alpha)*ema)
        conf = "calibrando" if len(hist)<8 else "         "
        raw_series.append(raw); ema_series.append(ema)
        print(f"  {mm:02d}/{yy}  cru {raw:>3}   amortecido {ema:>3}   {conf}  [{len(hist)} corridas]")
    def maxswing(s): return max(abs(s[i]-s[i-1]) for i in range(1,len(s))) if len(s)>1 else 0
    print(f"\n  Maior salto mês-a-mês:  CRU {maxswing(raw_series)} pts  →  AMORTECIDO {maxswing(ema_series)} pts")

    # ---------- 5. TEMPORADAS ----------
    print("\n[5] TEMPORADAS (trimestres) — sazonalização do histórico")
    hr()
    def q(dt): return (dt.year,(dt.month-1)//3+1)
    seasons={}
    for r in cl: seasons.setdefault(q(r['dt']),[]).append(r)
    for (yy,qq) in sorted(seasons):
        s=seasons[(yy,qq)]; km=sum(r['dist'] for r in s)
        bp=pct(sorted(r['pace'] for r in s if r['dist']>=2.0) or [statistics.median([x['pace'] for x in s])],0.15)
        print(f"  {yy} T{qq}:  {len(s):>2} corridas | {km:>5.0f} km | melhor esforço {pace_str(bp)}")

    print("\n"+"="*60)
    print("  v1 de ESTUDO. Mostra a direção: identidade estável + forma")
    print("  responsiva + temporadas. Âncoras/pesos ainda a calibrar.")
    print("="*60)

if __name__=="__main__": main()
