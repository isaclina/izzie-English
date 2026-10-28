const path = require('path');
const pptxgen = require(path.resolve(__dirname, '../node_modules/pptxgenjs'));
const { applyTheme } = require('/root/.claude/skills/synced/0d90f428-33fd-4d01-befa-df0250f72632_253c88ea-0998-4d18-a93a-9693501cebc5/pptx/scripts/apply_theme.js');
const D = require('/home/user/izzie-English/output/isabel-cohorts/data.json');
const OUT = process.argv[2];
const THEME = { name: 'Isabel Grades', headFontFace: 'Malgun Gothic', bodyFontFace: 'Malgun Gothic',
  colors: { dk1: '1F2A30', lt1: 'FFFFFF', dk2: '17403D', lt2: 'EEF4F2', accent1: '1E7A72', accent2: 'E0A33B',
    accent3: 'C8553D', accent4: '4F7CAC', accent5: '8A6FA8', accent6: '7A9E7E', hlink: '1E7A72', folHlink: '8A6FA8' } };
const pres = new pptxgen(); pres.layout = 'LAYOUT_WIDE';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = '2023 중1 반 시험 수준별 총점 성장'; pres.author = 'Isabel';
const C = pres.SchemeColor;
pres.defineSlideMaster({ title: 'Content', background: { color: C.background1 },
  objects: [
    { text: { text: 'Metta 영어 전문학원 · 이사벨 반', options: { x: 0.6, y: 6.95, w: 6, h: 0.3, fontSize: 10, color: C.text1, isTextBox: true } } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.35, w: 12.1, h: 0.8, fontSize: 32, bold: true, color: C.text2, valign: 'middle', align: 'left' }, text: '' } } ] });

const rows = D.mock.filter(r => r.cohort === 'B' && r.total !== null);
const studs = [...new Set(rows.map(r => r.student))];
const grp = r => r.level.includes('고3') ? 3 : r.level.includes('고2') ? 2 : 1;
const avg = a => a.reduce((p, q) => p + q, 0) / a.length;
const r1 = x => (Math.floor(x * 10 + 0.5 + 1e-6) / 10).toFixed(1);
const first = s => rows.find(r => r.student === s && r.grade === '중1' && r.seq === 1).total;
const gavg = (s, g) => avg(rows.filter(r => r.student === s && grp(r) === g).map(r => r.total));
const allg = g => avg(rows.filter(r => grp(r) === g).map(r => r.total));
const AN = {}; studs.forEach((st, i) => AN[st] = `학생 ${String.fromCharCode(65 + i)}`);

pres.addSection({ title: '2023 중1 반' });
const s = pres.addSlide({ masterName: 'Content', sectionTitle: '2023 중1 반' });
s.addText('2023 중1 반 시험 수준별 총점 성장 (2023–2025)', { placeholder: 'title' });
const H = t => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 }, align: 'center', valign: 'middle' } });
const c = (t, o = {}) => ({ text: String(t), options: { align: 'center', valign: 'middle', ...o } });
const tbl = [[H('학생'), H('중1 첫 시험'), H('고1 모의고사\n평균'), H('고2 모의고사\n평균'), H('고3 모의고사\n평균'), H('첫 시험 →\n고3 평균')]];
studs.forEach(st => {
  const g3 = gavg(st, 3), d = g3 - first(st);
  tbl.push([c(AN[st], { bold: true }), c(first(st)), c(r1(gavg(st, 1))), c(r1(gavg(st, 2))), c(r1(g3), { bold: true }),
    c('+' + r1(d), { bold: true, color: C.accent1 })]);
});
const F = { fill: { color: C.background2 }, bold: true };
const fa = avg(studs.map(first));
tbl.push([c('반 평균', F), c(r1(fa), F), c(r1(allg(1)), F), c(r1(allg(2)), F), c(r1(allg(3)), F),
  c('+' + r1(Number(r1(allg(3))) - Number(r1(fa))), { ...F, color: C.accent1 })]);
s.addTable(tbl, { x: 0.6, y: 1.35, w: 12.1, colW: [1.9, 1.9, 2.1, 2.1, 2.1, 2.0], rowH: [0.75, 0.6, 0.6, 0.6, 0.6, 0.6],
  fontSize: 16, color: C.text1, border: { type: 'solid', pt: 0.75, color: 'C9D6D2' }, fill: { color: C.background1 }, objectName: 'growth-table' });
s.addText([
  { text: `시험이 고1 → 고2 → 고3으로 어려워지는데도 반 평균은 ${r1(fa)} → ${r1(allg(1))} → ${r1(allg(2))} → ${r1(allg(3))}점으로 계속 올랐습니다`, options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } },
  { text: '4명 모두 시험 수준이 올라갈 때마다 평균 점수도 올랐고, 첫 고3 모의고사에서 학생 A·B는 100점 만점입니다', options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } },
  { text: '그룹 평균 = 그 수준 시험을 본 모든 회차의 평균 · 4차(2026학년도 수능)는 불수능이라 제외', options: { bullet: true, fontSize: 12, color: C.text1 } }],
  { x: 0.6, y: 5.5, w: 12.1, h: 1.3, fontSize: 15, color: C.text1, valign: 'top', isTextBox: true, objectName: 'notes', margin: 0.05 });
s.addNotes('2023 중1 반(2023 1M-S → 2025 3M-S) 4명의 시험 수준별 평균 총점입니다. 고1 모의고사 7회, 고2 모의고사 4회, 고3 모의고사 1회(중3 3차)입니다.');
// ---- slide 2: charts
const s2 = pres.addSlide({ masterName: 'Content', sectionTitle: '2023 중1 반' });
s2.addText('시험이 어려워져도 평균 점수는 계속 올랐습니다', { placeholder: 'title' });
const STG = ['중1 첫 시험', '고1 평균', '고2 평균', '고3 평균'];
const vals = st => [first(st), gavg(st, 1), gavg(st, 2), gavg(st, 3)].map(x => Number(r1(x)));
const base = { catAxisLabelColor: '5C6B70', valAxisLabelColor: '5C6B70', catAxisLabelFontSize: 12, valAxisLabelFontSize: 11,
  catAxisLabelFontFace: '+mn-lt', valAxisLabelFontFace: '+mn-lt', legendFontFace: '+mn-lt', titleFontFace: '+mn-lt', dataLabelFontFace: '+mn-lt',
  valGridLine: { color: 'D9E3E0', size: 1 }, catGridLine: { style: 'none' }, showTitle: true, titleFontSize: 14, titleColor: '17403D',
  showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: '1F2A30', valAxisMaxVal: 100, valAxisMajorUnit: 20 };
s2.addChart(pres.charts.BAR, [{ name: '반 평균', labels: STG, values: [fa, allg(1), allg(2), allg(3)].map(x => Number(r1(x))) }],
  { x: 0.6, y: 1.3, w: 4.6, h: 5.4, barDir: 'col', barGapWidthPct: 45, ...base, title: '반 평균 총점', showLegend: false, valAxisMinVal: 0,
    chartColors: ['1E7A72'], dataLabelFontSize: 14, dataLabelFormatCode: '0.0', objectName: 'class-avg-chart' });
s2.addChart(pres.charts.BAR, STG.map((g, i) => ({ name: g, labels: studs.map(st => AN[st]), values: studs.map(st => vals(st)[i]) })),
  { x: 5.5, y: 1.3, w: 7.2, h: 5.4, barDir: 'col', barGapWidthPct: 40, ...base, title: '학생별 총점 변화', showLegend: true, legendPos: 'b', legendFontSize: 12,
    valAxisMinVal: 40, chartColors: ['C9D6D2', '8FBFB8', '3E9A90', '17403D'], dataLabelFontSize: 10, dataLabelFormatCode: '0', objectName: 'student-chart' });
s2.addNotes('왼쪽은 반 평균, 오른쪽은 학생별 중1 첫 시험과 고1·고2·고3 모의고사 평균입니다. 고3 평균은 중3 3차 1회이며 4차(2026학년도 수능)는 제외했습니다.');
pres.writeFile({ fileName: OUT }).then(() => applyTheme(OUT, THEME)).then(() => console.log('done'));
