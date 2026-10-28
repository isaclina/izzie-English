"""반별 총점 성장 엑셀: 고1 / 고2 / 고3+수능 그룹. 사용법: python3 build_total_xlsx.py A|B|C"""
import json, sys
from collections import Counter
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as L
from openpyxl.chart import LineChart, BarChart, Reference
from openpyxl.chart.label import DataLabelList
from openpyxl.comments import Comment
def DL(fmt=None, pos=None):
    d = DataLabelList(); d.showVal = True; d.showSerName = False; d.showCatName = False; d.showLegendKey = False; d.showPercent = False
    if fmt: d.numFmt = fmt
    if pos: d.position = pos
    return d

CO = sys.argv[1]
d = json.load(open('data.json'))
NAME = {'A': '김건희 반', 'B': '구성관 반', 'C': '이서연 반'}[CO]
rows = [r for r in d['mock'] if r['cohort'] == CO]
STUDS = list(dict.fromkeys(r['student'] for r in rows))
get = {(r['student'], r['grade'], r['seq']): r for r in rows}
GO = ['중1', '중2', '중3']
GN = ['고1 모의고사', '고2 모의고사', '고3 모의고사+수능']
def lvl(r):
    if '고2' in r['level']: return GN[1]
    if '고3' in r['level'] or '수능' in r['level']: return GN[2]
    return GN[0]
allex = sorted({(r['grade'], r['seq'], lvl(r)) for r in rows}, key=lambda e: (GO.index(e[0]), e[1]))
GROUPS = [(g, [(e[0], e[1]) for e in allex if e[2] == g]) for g in GN if any(e[2] == g for e in allex)]
HAS_CSAT = any('수능' in r['level'] for r in rows)
if not HAS_CSAT: GROUPS = [('고3 모의고사' if g == GN[2] else g, ex) for g, ex in GROUPS]

F = 'Arial'
BLUE = Font(name=F, color='0000FF'); BLK = Font(name=F); GRN = Font(name=F, color='008000')
BOLD = Font(name=F, bold=True); TITLE = Font(name=F, bold=True, size=14); MUTED = Font(name=F, color='666666', size=9)
H2 = Font(name=F, bold=True, size=12); TXT = Font(name=F, size=11)
HDR = PatternFill('solid', fgColor='DDE7E4'); AVG = PatternFill('solid', fgColor='FFF2CC')
thin = Side(style='thin', color='BFBFBF'); BOX = Border(top=thin, bottom=thin, left=thin, right=thin)
CEN = Alignment(horizontal='center', vertical='center', wrap_text=True)
LEFT = Alignment(horizontal='left', vertical='top', wrap_text=True)
def cell(ws, r, c, v, font=BLK, fill=None, fmt=None):
    x = ws.cell(r, c, v); x.font = font; x.border = BOX; x.alignment = CEN
    if fill: x.fill = fill
    if fmt: x.number_format = fmt
    return x
def text(ws, r, t, font=TXT, width_cols=10):
    ws.cell(r, 1, t).font = font; ws.cell(r, 1).alignment = LEFT
    ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=width_cols)
    ws.row_dimensions[r].height = 18 * max(1, len(t) // 95 + 1)
def tot(s, e): return get.get((s, *e), {}).get('total')
def tier(s, e): return get.get((s, *e), {}).get('tier')
def mean(v): v = [x for x in v if x is not None]; return sum(v) / len(v) + 1e-9 if v else None
def dist(ts): c = Counter(t for t in ts if t is not None); return ', '.join(f'{k}등급 {c[k]}명' for k in sorted(c))
def lab(e):
    r = next(x for x in rows if x['grade'] == e[0] and x['seq'] == e[1])
    lv = '수능' if '수능' in r['level'] else r['level'].replace(' 모의고사', '')
    if lv == '모의고사': lv = '수준 표기 없음'
    return f'{e[0]} {e[1]}차 ({r["year"]})\n{lv}'

wb = Workbook(); sm = wb.active; sm.title = '총점 성장 요약'
gref = {}
# ---------- group sheets ----------
for gi, (g, ex) in enumerate(GROUPS):
    ws = wb.create_sheet(g.replace('+', '·'))
    n = len(ex); c0 = 2; cl = c0 + n - 1
    ws['A1'] = f'{NAME} · {g} 총점 변화'; ws['A1'].font = TITLE
    # explanation
    fa = mean([tot(s, ex[0]) for s in STUDS]); la = mean([tot(s, ex[-1]) for s in STUDS])
    ft = [tier(s, ex[0]) for s in STUDS]; lt_ = [tier(s, ex[-1]) for s in STUDS]
    ch_ = []
    for s in STUDS:
        v = [(e, tot(s, e)) for e in ex if tot(s, e) is not None]
        ch_.append((s, v[0][1], v[-1][1], v[-1][1] - v[0][1], max(x[1] for x in v), mean([x[1] for x in v])))
    best = max(ch_, key=lambda x: x[3])
    lines = [f'■ 시험 {n}회: ' + ', '.join(lab(e).replace('\n', ' ') for e in ex)]
    if n > 1:
        lines.append(f'■ 반 평균 총점: 첫 시험 {fa:.1f}점 → 마지막 시험 {la:.1f}점 ({la - fa:+.1f}점)')
        lines.append(f'■ 등급: 첫 시험 {dist(ft)} → 마지막 시험 {dist(lt_)}')
        lines.append(f'■ 가장 많이 오른 학생: {best[0]} {best[1]}점 → {best[2]}점 ({best[3]:+d}점)')
    else:
        lines.append(f'■ 반 평균 총점 {fa:.1f}점 · 등급: {dist(ft)}')
    extra = {('A', 0): '중2 1·2차는 성적표에 시험 수준 표기가 없어 고1 모의고사로 분류했습니다 (3차부터 "고2 모의고사" 표기).',
             ('A', 1): '고2 모의고사는 고1보다 어렵지만 첫 시험부터 4명 모두 2등급이었고, 4번 내내 반 평균 81점 이상을 유지했습니다.',
             ('A', 2): '고3 모의고사와 실제 수능 문제에서도 반 평균이 올랐습니다. 나민하는 수능 날이 기말고사 기간이라 응시하지 않았습니다.',
             ('B', 1): '고2 모의고사로 바뀐 첫 시험부터 반 평균 86점(2등급)이었고, 중3 1차에는 92점으로 4명 모두 1~2등급이었습니다.',
             ('B', 2): '고3 모의고사는 중3 3차 1회입니다. 구성관·송지효 100점 만점(1등급), 신준섭 87점·박주연 82점(2등급)으로 4명 모두 2등급 이상입니다. 4차(2026학년도 수능)는 난이도가 매우 높았던 "불수능"이라 비교에서 제외했습니다.',
             ('C', 1): '고2 모의고사는 아직 1회(중2 3차)뿐입니다. 이서연 반은 현재 중2라 고3 모의고사는 아직 보지 않았습니다.'}.get((CO, gi))
    if extra: lines.append('■ ' + extra)
    r = 3
    for t in lines: text(ws, r, t, width_cols=max(8, cl + 5)); r += 1
    r += 1; hr = r
    cell(ws, r, 1, '학생', BOLD, HDR)
    for j, e in enumerate(ex): cell(ws, r, c0 + j, lab(e), BOLD, HDR)
    heads = ['첫 시험', '마지막 시험', '변화', '평균', '최고'] if n > 1 else ['평균']
    for k, h in enumerate(heads): cell(ws, r, cl + 1 + k, h, BOLD, HDR)
    ws.row_dimensions[r].height = 34; r += 1; first = r
    for s in STUDS:
        cell(ws, r, 1, s, BOLD)
        fc = None
        for j, e in enumerate(ex):
            v = tot(s, e); c = cell(ws, r, c0 + j, v, BLUE)
            if v is None:
                note = get.get((s, *e), {}).get('note')
                if note: c.comment = Comment(note, 'Isabel')
            elif fc is None: fc = c0 + j
        rng = f'{L(c0)}{r}:{L(cl)}{r}'
        if n > 1:
            cell(ws, r, cl + 1, f'={L(fc)}{r}')
            cell(ws, r, cl + 2, f'=LOOKUP(9.99E+307,{rng})')
            cell(ws, r, cl + 3, f'={L(cl+2)}{r}-{L(cl+1)}{r}', fmt='+0;-0;0')
            cell(ws, r, cl + 4, f'=AVERAGE({rng})', fmt='0.0')
            cell(ws, r, cl + 5, f'=MAX({rng})')
        else:
            cell(ws, r, cl + 1, f'=AVERAGE({rng})', fmt='0.0')
        r += 1
    last = r - 1
    cell(ws, r, 1, '반 평균', BOLD, AVG)
    for j in range(n):
        col = L(c0 + j); cell(ws, r, c0 + j, f'=AVERAGE({col}{first}:{col}{last})', BOLD, AVG, '0.0')
    rng = f'{L(c0)}{r}:{L(cl)}{r}'
    if n > 1:
        cell(ws, r, cl + 1, f'={L(c0)}{r}', BOLD, AVG, '0.0')
        cell(ws, r, cl + 2, f'={L(cl)}{r}', BOLD, AVG, '0.0')
        cell(ws, r, cl + 3, f'={L(cl+2)}{r}-{L(cl+1)}{r}', BOLD, AVG, '+0.0;-0.0;0.0')
        cell(ws, r, cl + 4, f'=AVERAGE({L(c0)}{first}:{L(cl)}{last})', BOLD, AVG, '0.0')
        cell(ws, r, cl + 5, f'=MAX({rng})', BOLD, AVG, '0.0')
    else:
        cell(ws, r, cl + 1, f'=AVERAGE({L(c0)}{first}:{L(cl)}{last})', BOLD, AVG, '0.0')
    avr = r; r += 1
    ws.cell(r, 1, '등급 기준: 90점 이상 1등급, 80~89점 2등급, 70~79점 3등급, 60~69점 4등급 (절대평가)').font = MUTED
    gref[g] = dict(ws=ws.title, first=first, last=last, avr=avr, c0=c0, cl=cl, avgcol=cl + (4 if n > 1 else 1), n=n)
    # chart 1: line, students + 반 평균
    ch = LineChart(); ch.title = f'{g} · 총점 (반 평균 = 굵은 선)'; ch.y_axis.title = '총점'
    ch.y_axis.scaling.min = 50; ch.y_axis.scaling.max = 100; ch.y_axis.majorUnit = 10
    ch.y_axis.delete = False; ch.x_axis.delete = False; ch.display_blanks = 'gap'; ch.height = 9; ch.width = max(16, 2.6 * n)
    ch.add_data(Reference(ws, min_col=1, max_col=cl, min_row=first, max_row=avr), from_rows=True, titles_from_data=True)
    ch.set_categories(Reference(ws, min_col=c0, max_col=cl, min_row=hr, max_row=hr))
    for sr in ch.series: sr.marker.symbol = 'circle'; sr.marker.size = 6; sr.smooth = False; sr.graphicalProperties.line.width = 19050
    avg_s = ch.series[-1]; avg_s.graphicalProperties.line.width = 57150; avg_s.graphicalProperties.line.solidFill = '000000'
    avg_s.marker.size = 9; avg_s.marker.graphicalProperties.solidFill = '000000'; avg_s.marker.graphicalProperties.line.solidFill = '000000'
    avg_s.dLbls = DL('0.0', 't')
    ws.add_chart(ch, f'A{r + 2}')
    # chart 2: 첫 vs 마지막 막대
    if n > 1:
        bc = BarChart(); bc.type = 'col'; bc.title = f'{g} · 첫 시험 vs 마지막 시험'; bc.y_axis.scaling.min = 0; bc.y_axis.scaling.max = 100
        bc.y_axis.delete = False; bc.x_axis.delete = False; bc.height = 9; bc.width = 16
        bc.add_data(Reference(ws, min_col=cl + 1, max_col=cl + 2, min_row=hr, max_row=avr), titles_from_data=True)
        bc.set_categories(Reference(ws, min_col=1, min_row=first, max_row=avr))
        bc.dataLabels = DL()
        bc.series[0].graphicalProperties.solidFill = 'A6B8B4'; bc.series[1].graphicalProperties.solidFill = '1E7A72'
        ws.add_chart(bc, f'A{r + 22}')
    ws.column_dimensions['A'].width = 12
    for j in range(n + 5): ws.column_dimensions[L(c0 + j)].width = 13

# ---------- summary sheet ----------
sm['A1'] = f'{NAME} · 시험 수준별 총점 성장'; sm['A1'].font = TITLE
gm = {g: mean([tot(s, e) for e in ex for s in STUDS]) for g, ex in GROUPS}
first_all = mean([tot(s, GROUPS[0][1][0]) for s in STUDS])
seq = ' → '.join(f'{g.replace(" 모의고사", "")} {gm[g]:.1f}점' for g, _ in GROUPS)
lvls = ' → '.join(g.replace(' 모의고사', '').replace('+', '·') for g, _ in GROUPS)
lines = [f'■ 시험이 {lvls}(으)로 어려워지는데도, 그룹별 반 평균 총점은 {seq}으로 계속 올랐습니다.',
         f'■ 중1 첫 고1 모의고사 반 평균은 {first_all:.1f}점이었습니다. 마지막 그룹 평균은 그보다 {gm[GROUPS[-1][0]] - first_all:+.1f}점 높습니다.']
up = [s for s in STUDS if all((a or 0) <= (b or 0) for a, b in zip([mean([tot(s, e) for e in ex]) for _, ex in GROUPS][:-1], [mean([tot(s, e) for e in ex]) for _, ex in GROUPS][1:]))]
if len(GROUPS) > 1:
    lines.append(f'■ 학생 {len(STUDS)}명 중 {len(up)}명({", ".join(up)})은 그룹이 올라갈 때마다 평균 점수도 올랐습니다.')
    rest = [s for s in STUDS if s not in up]
    if rest:
        det = []
        for s in rest:
            v = [mean([tot(s, e) for e in ex]) for _, ex in GROUPS]
            det.append(f'{s}(' + ' → '.join(f'{x:.1f}' for x in v) + ')')
        lines.append('■ 나머지: ' + ', '.join(det) + ' — 그룹 안에서 시험마다 점수 차이가 큰 학생입니다.')
lines.append('■ 그룹 평균 = 그 수준 시험을 본 모든 회차 점수의 평균. 각 그룹 시트에 시험별 점수와 첫 시험 → 마지막 시험 변화가 있습니다.')
r = 3
for t in lines: text(sm, r, t, width_cols=9); r += 1
r += 1; hr = r
cell(sm, r, 1, '학생', BOLD, HDR); cell(sm, r, 2, '중1 첫 시험', BOLD, HDR)
for k, (g, _) in enumerate(GROUPS): cell(sm, r, 3 + k, f'{g}\n평균', BOLD, HDR)
cell(sm, r, 3 + len(GROUPS), f'첫 시험 →\n마지막 그룹 평균', BOLD, HDR)
sm.row_dimensions[r].height = 34; r += 1; first = r
g0 = gref[GROUPS[0][0]]
for i, s in enumerate(STUDS + ['반 평균']):
    isavg = s == '반 평균'; fill = AVG if isavg else None; fnt = BOLD if isavg else BLK
    cell(sm, r, 1, s, BOLD, fill)
    src = g0['avr'] if isavg else g0['first'] + i
    cell(sm, r, 2, f"='{g0['ws']}'!{L(g0['c0'])}{src}", GRN if not isavg else Font(name=F, bold=True, color='008000'), fill, '0.0' if isavg else '0')
    for k, (g, _) in enumerate(GROUPS):
        R = gref[g]; src = R['avr'] if isavg else R['first'] + i
        cell(sm, r, 3 + k, f"='{R['ws']}'!{L(R['avgcol'])}{src}", Font(name=F, color='008000', bold=isavg), fill, '0.0')
    cell(sm, r, 3 + len(GROUPS), f'={L(2 + len(GROUPS))}{r}-B{r}', fnt, fill, '+0.0;-0.0;0.0')
    r += 1
last = r - 1
for c, w in zip(range(1, 8), [12, 13, 16, 16, 18, 18, 10]): sm.column_dimensions[L(c)].width = w
# chart: 반 평균 계단 (막대)
bc = BarChart(); bc.type = 'col'; bc.title = '시험 수준별 반 평균 총점'; bc.y_axis.scaling.min = 0; bc.y_axis.scaling.max = 100
bc.y_axis.delete = False; bc.x_axis.delete = False; bc.height = 9; bc.width = 14; bc.legend = None
bc.add_data(Reference(sm, min_col=2, max_col=2 + len(GROUPS), min_row=last, max_row=last), from_rows=True, titles_from_data=False)
bc.set_categories(Reference(sm, min_col=2, max_col=2 + len(GROUPS), min_row=hr, max_row=hr))
bc.dataLabels = DL('0.0')
bc.series[0].graphicalProperties.solidFill = '1E7A72'
sm.add_chart(bc, f'A{r + 2}')
# chart: 학생별 그룹 평균
sc = BarChart(); sc.type = 'col'; sc.title = '학생별 시험 수준 평균 총점'; sc.y_axis.scaling.min = 50; sc.y_axis.scaling.max = 100
sc.y_axis.delete = False; sc.x_axis.delete = False; sc.height = 9; sc.width = 18
sc.add_data(Reference(sm, min_col=2, max_col=2 + len(GROUPS), min_row=hr, max_row=last - 1), titles_from_data=True)
sc.set_categories(Reference(sm, min_col=1, min_row=first, max_row=last - 1))
sc.dataLabels = DL('0')
for sr, col in zip(sc.series, ['C9D6D2', '8FBFB8', '3E9A90', '17403D']): sr.graphicalProperties.solidFill = col
sm.add_chart(sc, f'A{r + 22}')
sm.cell(r + 1, 1, '등급 기준: 90점 이상 1등급, 80~89점 2등급, 70~79점 3등급, 60~69점 4등급 · 파란 글씨 = 성적표 입력값, 초록 = 다른 시트 값, 검은 = 계산식').font = MUTED
out = f"{NAME.replace(' ', '')}_총점_성장.xlsx"; wb.save(out); print(out)
