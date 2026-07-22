# -*- coding: utf-8 -*-
"""
Runner Score v0 — script de ESTUDO (não é produção).
Lê o activities.csv do export do Strava e:
  1. Resumo exploratório do histórico.
  2. Atributos v0 (0-99) determinísticos e explicáveis.
  3. Runner Score geral.
  4. Teste de volatilidade: como o score se move mês a mês (medo da "semana boa, nota ruim").
Sem dependências externas (só stdlib).
"""
import csv, re, statistics, sys
from datetime import datetime, date
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

CSV_PATH = r"C:\Users\ander\Desktop\RunnerProfile\data\export\activities.csv"

MESES = {"jan":1,"fev":2,"mar":3,"abr":4,"mai":5,"jun":6,"jul":7,"ago":8,"set":9,"out":10,"nov":11,"dez":12}

def parse_date(s):
    m = re.search(r"(\d+)\s+de\s+(\w+)\.?\s+de\s+(\d+),\s+(\d+):(\d+):(\d+)", s)
    if not m: return None
    d, mon, y, hh, mm, ss = m.groups()
    mon = MESES.get(mon.lower()[:3])
    if not mon: return None
    return datetime(int(y), mon, int(d), int(hh), int(mm), int(ss))

def fnum(s):
    if s is None: return None
    s = s.strip().replace(".", "").replace(",", ".") if ("," in s and "." in s) else s.strip().replace(",", ".")
    try: return float(s)
    except: return None

def read_rows():
    for enc in ("utf-8-sig","cp1252","latin-1"):
        try:
            with open(CSV_PATH, encoding=enc, newline="") as f:
                rows = list(csv.reader(f))
            return rows, enc
        except Exception:
            continue
    raise SystemExit("Não consegui ler o CSV")

def col_index(header, name, occurrence=0):
    hits = [i for i,h in enumerate(header) if h.strip()==name]
    return hits[occurrence] if len(hits)>occurrence else None

def clampi(x, lo=1, hi=99): return int(max(lo, min(hi, round(x))))

def lin(x, pts):
    """Interpolação linear por pontos [(x,score),...] ordenados por x."""
    if x <= pts[0][0]: return pts[0][1]
    if x >= pts[-1][0]: return pts[-1][1]
    for (x0,y0),(x1,y1) in zip(pts, pts[1:]):
        if x0 <= x <= x1:
            t = (x-x0)/(x1-x0)
            return y0 + t*(y1-y0)
    return pts[-1][1]

def main():
    rows, enc = read_rows()
    header = rows[0]
    i_id   = col_index(header,"ID da atividade")
    i_data = col_index(header,"Data da atividade")
    i_tipo = col_index(header,"Tipo de atividade")
    i_dist = col_index(header,"Distância",0)          # km (vírgula) — 1ª ocorrência
    i_elap = col_index(header,"Tempo decorrido",0)    # s — 1ª ocorrência
    i_mov  = col_index(header,"Tempo de movimentação")# s
    i_elev = col_index(header,"Ganho de elevação")    # m

    runs=[]
    for r in rows[1:]:
        if not r or len(r)<=max(x for x in [i_id,i_data,i_tipo,i_dist] if x is not None): continue
        tipo=(r[i_tipo] or "").strip().lower()
        if "corrida" not in tipo: continue
        dt=parse_date(r[i_data] or "")
        dist=fnum(r[i_dist])
        mov=fnum(r[i_mov]) if i_mov is not None else None
        elap=fnum(r[i_elap]) if i_elap is not None else None
        elev=fnum(r[i_elev]) if i_elev is not None else None
        if not dt or not dist or dist<0.3: continue
        secs = mov or elap
        if not secs or secs<60: continue
        pace = (secs/60.0)/dist  # min/km
        if pace<2.5 or pace>12: continue  # descarta lixo
        runs.append(dict(dt=dt, dist=dist, secs=secs, pace=pace, elev=elev or 0.0))
    runs.sort(key=lambda x:x["dt"])
    if not runs: raise SystemExit("Nenhuma corrida válida encontrada.")

    def hr(): print("-"*58)
    print("="*58)
    print(f"  RUNNER SCORE v0 — estudo  (encoding CSV: {enc})")
    print("="*58)

    # -------- 1. Resumo exploratório --------
    n=len(runs)
    d0,d1=runs[0]["dt"].date(), runs[-1]["dt"].date()
    span_days=max(1,(d1-d0).days)
    total_km=sum(r["dist"] for r in runs)
    paces=[r["pace"] for r in runs]
    dists=[r["dist"] for r in runs]
    best_pace=min(paces); avg_pace=statistics.mean(paces)
    longest=max(dists)
    def fmt_pace(p):
        m=int(p); s=int(round((p-m)*60));
        if s==60: m+=1; s=0
        return f"{m}:{s:02d}/km"
    print(f"\n[1] RESUMO DO HISTÓRICO")
    hr()
    print(f"  Corridas:            {n}")
    print(f"  Período:             {d0.strftime('%d/%m/%Y')}  →  {d1.strftime('%d/%m/%Y')}  ({span_days} dias)")
    print(f"  Distância total:     {total_km:.1f} km")
    print(f"  Corrida média:       {statistics.mean(dists):.2f} km")
    print(f"  Corrida mais longa:  {longest:.2f} km")
    print(f"  Ritmo médio:         {fmt_pace(avg_pace)}")
    print(f"  Melhor ritmo (corrida):  {fmt_pace(best_pace)}")
    # frequência recente (últimas 8 semanas do próprio histórico)
    last=runs[-1]["dt"]
    def runs_in_days(days): return [r for r in runs if (last-r["dt"]).days<=days]
    wk8=runs_in_days(56); freq8=len(wk8)/8.0
    wk4=runs_in_days(28);
    print(f"  Frequência (8 sem.): {freq8:.1f} corridas/semana")
    km_wk8=sum(r['dist'] for r in wk8)/8.0
    print(f"  Volume semanal (8 sem.): {km_wk8:.1f} km/semana")

    # -------- 2. Atributos v0 --------
    # âncoras de referência (amador) — v0, a refinar
    def attr_ritmo(pace_min):  # menor pace = melhor
        sec=pace_min*60
        return lin(sec, [(8*60,20),(7*60,38),(6*60,55),(5.5*60,66),(5*60,74),(4.5*60,84),(4*60,92),(3.75*60,96)])
    def attr_resistencia(longest_km, vol_km_wk):
        s_long=lin(longest_km,[(3,30),(5,42),(8,55),(10,63),(15,76),(21.1,88),(30,96)])
        s_vol =lin(vol_km_wk,[(5,30),(10,42),(20,58),(30,72),(40,82),(60,92)])
        return 0.6*s_long+0.4*s_vol
    def attr_regularidade(freq_wk, runs_recent):
        s_freq=lin(freq_wk,[(0.5,25),(1,42),(1.5,54),(2,64),(3,77),(4,86),(5,92)])
        # penaliza irregularidade de espaçamento (gaps) nas últimas 8 semanas
        if len(runs_recent)>=3:
            gaps=[(runs_recent[i+1]["dt"]-runs_recent[i]["dt"]).days for i in range(len(runs_recent)-1)]
            cv=(statistics.pstdev(gaps)/statistics.mean(gaps)) if statistics.mean(gaps)>0 else 0
            reg_factor=max(0.8, 1-0.15*cv)  # até -20%
        else:
            reg_factor=0.9
        return s_freq*reg_factor
    def attr_subida(runs_all):
        gains=[ (r["elev"]/r["dist"]) for r in runs_all if r["dist"]>0.5]
        epk=statistics.mean(gains) if gains else 0
        return lin(epk,[(2,30),(5,42),(8,55),(12,66),(18,78),(25,88)])
    def attr_evolucao(runs_all):
        # tendência de melhora de ritmo ao longo do tempo (regressão simples pace ~ dias)
        if len(runs_all)<6: return 50
        t0=runs_all[0]["dt"]
        xs=[(r["dt"]-t0).days for r in runs_all]; ys=[r["pace"] for r in runs_all]
        n_=len(xs); mx=statistics.mean(xs); my=statistics.mean(ys)
        den=sum((x-mx)**2 for x in xs) or 1
        slope=sum((x-mx)*(y-my) for x,y in zip(xs,ys))/den  # min/km por dia
        # slope negativo = ritmo caindo (melhorando). Converte para score.
        per90=slope*90  # variação de pace em 90 dias
        return lin(per90,[(0.6,25),(0.3,38),(0.1,48),(0,52),(-0.1,60),(-0.3,74),(-0.6,88)])

    a_rit=attr_ritmo(best_pace*0.5+avg_pace*0.5)
    a_res=attr_resistencia(longest, km_wk8)
    a_reg=attr_regularidade(freq8, wk8)
    a_sub=attr_subida(runs)
    a_evo=attr_evolucao(runs)
    attrs={"Ritmo":a_rit,"Resistência":a_res,"Regularidade":a_reg,"Subida":a_sub,"Evolução":a_evo}
    attrs={k:clampi(v) for k,v in attrs.items()}

    print(f"\n[2] ATRIBUTOS v0 (0-99)")
    hr()
    for k,v in attrs.items():
        bar="█"*int(v/5)
        print(f"  {k:<13} {v:>3}  {bar}")

    # Score geral: média ponderada (v0)
    w={"Ritmo":.22,"Resistência":.22,"Regularidade":.24,"Subida":.10,"Evolução":.22}
    geral=sum(attrs[k]*w[k] for k in attrs)
    runner_score=round(geral*10)
    print(f"\n  GERAL (0-99):     {clampi(geral)}")
    print(f"  RUNNER SCORE:     {runner_score}")

    # -------- 3. Teste de volatilidade mês a mês --------
    print(f"\n[3] TESTE DE VOLATILIDADE — Runner Score ao fim de cada mês")
    hr()
    print("  (recalcula o score usando só os dados até aquele mês)")
    # meses do histórico
    def month_key(dt): return (dt.year, dt.month)
    months=sorted({month_key(r["dt"]) for r in runs})
    prev=None
    for (yy,mm) in months:
        cutoff=datetime(yy,mm,28,23,59)  # aprox fim do mês
        # usa fim real do mês
        if mm==12: nxt=datetime(yy+1,1,1)
        else: nxt=datetime(yy,mm+1,1)
        hist=[r for r in runs if r["dt"]<nxt]
        if len(hist)<3: continue
        last_h=hist[-1]["dt"]
        rr8=[r for r in hist if (last_h-r["dt"]).days<=56]
        fr=len(rr8)/8.0; vol=sum(r['dist'] for r in rr8)/8.0
        lg=max(r['dist'] for r in hist); bp=min(r['pace'] for r in hist); ap=statistics.mean([r['pace'] for r in hist])
        aa={"Ritmo":attr_ritmo(bp*0.5+ap*0.5),"Resistência":attr_resistencia(lg,vol),
            "Regularidade":attr_regularidade(fr,rr8),"Subida":attr_subida(hist),"Evolução":attr_evolucao(hist)}
        aa={k:clampi(v) for k,v in aa.items()}
        g=sum(aa[k]*w[k] for k in aa); sc=round(g*10)
        delta = f"{sc-prev:+d}" if prev is not None else "  —"
        arrow = "" if prev is None else ("↑" if sc>prev else ("↓" if sc<prev else "="))
        print(f"  {mm:02d}/{yy}   score {sc:>3}   ({delta}) {arrow}   [{len(hist)} corridas, {fr:.1f}/sem]")
        prev=sc

    print("\n" + "="*58)
    print("  Observação: v0 de ESTUDO. Âncoras e pesos são provisórios,")
    print("  a serem calibrados na spec do Runner Score.")
    print("="*58)

if __name__=="__main__":
    main()
