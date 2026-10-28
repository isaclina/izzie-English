const path = require('path');
const pptxgen = require(path.resolve(__dirname, '../node_modules/pptxgenjs'));
const { applyTheme } = require('/root/.claude/skills/synced/0d90f428-33fd-4d01-befa-df0250f72632_253c88ea-0998-4d18-a93a-9693501cebc5/pptx/scripts/apply_theme.js');
const D = require('/home/user/izzie-English/output/isabel-cohorts/data.json');
const OUT = process.argv[2];

const THEME = { name: 'Isabel Grades', headFontFace: 'Malgun Gothic', bodyFontFace: 'Malgun Gothic',
  colors: { dk1: '1F2A30', lt1: 'FFFFFF', dk2: '17403D', lt2: 'EEF4F2', accent1: '1E7A72', accent2: 'E0A33B',
    accent3: 'C8553D', accent4: '4F7CAC', accent5: '8A6FA8', accent6: '7A9E7E', hlink: '1E7A72', folHlink: '8A6FA8' } };
const SERIES = ['1E7A72', 'E0A33B', 'C8553D', '4F7CAC', '8A6FA8'];
const GRID = 'D9E3E0', MUTED = '5C6B70';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = '이사벨 반 영어 성적 분석';
pres.author = 'Isabel';
const C = pres.SchemeColor;

pres.defineSlideMaster({ title: 'Title', background: { color: C.text2 }, objects: [
  { placeholder: { options: { name: 'title', type: 'title', x: 0.8, y: 2.2, w: 11.7, h: 1.5, fontSize: 44, bold: true, color: C.background1, valign: 'bottom', align: 'left' }, text: '' } },
  { placeholder: { options: { name: 'body', type: 'body', x: 0.8, y: 3.9, w: 11.7, h: 1.2, fontSize: 18, color: C.background2, valign: 'top' }, text: '' } } ] });
pres.defineSlideMaster({ title: 'Section', background: { color: C.text2 }, slideNumber: { x: 12.3, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: C.background2 }, objects: [
  { placeholder: { options: { name: 'title', type: 'title', x: 0.8, y: 2.3, w: 11.7, h: 1.2, fontSize: 40, bold: true, color: C.background1, valign: 'bottom', align: 'left' }, text: '' } },
  { placeholder: { options: { name: 'body', type: 'body', x: 0.8, y: 3.7, w: 11.7, h: 1.4, fontSize: 18, color: C.background2, valign: 'top' }, text: '' } } ] });
pres.defineSlideMaster({ title: 'Content', background: { color: C.background1 }, margin: [0.5, 0.6, 0.6, 0.6],
  slideNumber: { x: 12.3, y: 6.95, w: 0.6, h: 0.3, fontSize: 10, color: C.text1 },
  objects: [
    { text: { text: 'Metta 영어 전문학원 · 이사벨 반', options: { x: 0.6, y: 6.95, w: 6, h: 0.3, fontSize: 10, color: C.text1, isTextBox: true } } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.35, w: 12.1, h: 0.9, fontSize: 32, bold: true, color: C.text2, valign: 'middle', align: 'left' }, text: '' } } ] });

const chartBase = () => ({ catAxisLabelColor: MUTED, valAxisLabelColor: MUTED, catAxisLabelFontSize: 11, valAxisLabelFontSize: 11,
  catAxisLabelFontFace: '+mn-lt', valAxisLabelFontFace: '+mn-lt', legendFontFace: '+mn-lt', titleFontFace: '+mn-lt', dataLabelFontFace: '+mn-lt',
  valGridLine: { color: GRID, size: 1 }, catGridLine: { style: 'none' }, legendFontSize: 12, legendColor: '1F2A30', showLegend: true, legendPos: 't' });

const GO = ['중1', '중2', '중3'];
const short = lv => lv.replace('모의고사', '').replace('2023학년도 ', '').trim();
function cohort(co) {
  const rows = D.mock.filter(r => r.cohort === co);
  const studs = [...new Set(rows.map(r => r.student))];
  const exams = [...new Map(rows.map(r => [r.grade + r.seq, r])).values()].sort((a, b) => GO.indexOf(a.grade) - GO.indexOf(b.grade) || a.seq - b.seq);
  const val = (s, e, k) => { const r = rows.find(x => x.student === s && x.grade === e.grade && x.seq === e.seq); return r ? r[k] : null; };
  return { rows, studs, exams, val };
}
const avg = a => { const v = a.filter(x => x !== null && x !== undefined); return v.length ? v.reduce((p, q) => p + q, 0) / v.length : null; };
const f1 = x => (Math.round(x * 10) / 10).toFixed(1);

function addTitle(s, t) { s.addText(t, { placeholder: 'title' }); }
function bulletBox(s, items, o) {
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1, paraSpaceAfter: 8 } })),
    { x: o.x, y: o.y, w: o.w, h: o.h, fontSize: o.fontSize || 15, color: C.text1, valign: 'top', isTextBox: true, objectName: o.name || 'notes', margin: 0.05 });
}
function totalSlide(co, sec, title, notes, bullets) {
  const { studs, exams, val } = cohort(co);
  const s = pres.addSlide({ masterName: 'Content', sectionTitle: sec }); addTitle(s, title);
  const labels = exams.map(e => `${e.grade} ${e.seq}차`);
  s.addChart(pres.charts.LINE, studs.map(st => ({ name: st, labels, values: exams.map(e => val(st, e, 'total')) })),
    { x: 0.6, y: 1.35, w: 8.4, h: 5.4, objectName: 'total-chart', ...chartBase(), chartColors: SERIES.slice(0, studs.length), lineSize: 2, lineDataSymbolSize: 6,
      valAxisMinVal: 40, valAxisMaxVal: 100, valAxisMajorUnit: 10, showTitle: true, title: '총점 (100점 만점)', titleFontSize: 13, titleColor: MUTED, displayBlanksAs: 'gap' });
  bulletBox(s, bullets, { x: 9.3, y: 1.5, w: 3.4, h: 5.2, name: 'total-notes', fontSize: 14 });
  s.addNotes(notes);
}
function lrSlide(co, sec, title, notes, bullets) {
  const { rows, exams } = cohort(co);
  const ex = exams.filter(e => rows.some(r => r.grade === e.grade && r.seq === e.seq && r.listening !== null));
  const at = (e, k) => avg(rows.filter(r => r.grade === e.grade && r.seq === e.seq).map(r => r[k]));
  const labels = ex.map(e => `${e.grade} ${e.seq}차 ${short(e.level)}`.trim());
  const s = pres.addSlide({ masterName: 'Content', sectionTitle: sec }); addTitle(s, title);
  s.addChart(pres.charts.BAR, [
    { name: '듣기 평균 (17문항)', labels, values: ex.map(e => Math.round(at(e, 'listening') * 10) / 10) },
    { name: '독해 평균 (28문항)', labels, values: ex.map(e => Math.round(at(e, 'reading') * 10) / 10) }],
    { x: 0.6, y: 1.35, w: 8.4, h: 5.4, barDir: 'col', barGrouping: 'clustered', barGapWidthPct: 60, objectName: 'lr-chart', ...chartBase(), chartColors: [SERIES[3], SERIES[0]],
      valAxisMinVal: 0, valAxisMaxVal: 28, valAxisMajorUnit: 4, showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 10, dataLabelColor: '1F2A30', dataLabelFormatCode: '0.0',
      catAxisLabelFontSize: 10, showTitle: true, title: '맞은 개수 평균', titleFontSize: 13, titleColor: MUTED });
  bulletBox(s, bullets, { x: 9.3, y: 1.5, w: 3.4, h: 5.2, name: 'lr-notes', fontSize: 14 });
  s.addNotes(notes);
}
function tableSlide(co, sec, title, notes, bullets, naesinLabel) {
  const { studs, exams, val } = cohort(co);
  const nae = D.naesin.filter(r => r.cohort === co);
  const s = pres.addSlide({ masterName: 'Content', sectionTitle: sec }); addTitle(s, title);
  const H = o => ({ text: o, options: { bold: true, color: C.background1, fill: { color: C.text2 }, align: 'center', valign: 'middle' } });
  const rows = [[H('학생'), H('중1 첫 시험'), H('가장 최근 시험'), H('변화'), H('최고 점수'), H(naesinLabel)]];
  studs.forEach(st => {
    const t = exams.map(e => ({ e, v: val(st, e, 'total') })).filter(x => x.v !== null);
    const first = t[0], last = t[t.length - 1], best = Math.max(...t.map(x => x.v));
    const n = avg(nae.filter(r => r.student === st).map(r => r.score));
    const d = last.v - first.v;
    const cell = (v, o = {}) => ({ text: String(v), options: { align: 'center', valign: 'middle', ...o } });
    rows.push([cell(st, { bold: true }), cell(`${first.v}점`), cell(`${last.v}점 (${last.e.grade} ${last.e.seq}차)`), cell(`${d > 0 ? '+' : ''}${d}점`, { bold: true, color: C.accent1 }),
      cell(`${best}점`), cell(n === null ? '—' : f1(n))]);
  });
  s.addTable(rows, { x: 0.6, y: 1.5, w: 8.4, colW: [1.3, 1.25, 2.35, 1.1, 1.2, 1.2], fontSize: 14, color: C.text1, border: { type: 'solid', pt: 0.75, color: 'C9D6D2' },
    rowH: 0.8, fill: { color: C.background1 }, objectName: 'student-table' });
  bulletBox(s, bullets, { x: 9.3, y: 1.5, w: 3.4, h: 5.2, name: 'table-notes', fontSize: 14 });
  s.addNotes(notes);
}
function section(sec, title, body, notes) {
  pres.addSection({ title: sec });
  const s = pres.addSlide({ masterName: 'Section', sectionTitle: sec });
  s.addText(title, { placeholder: 'title' }); s.addText(body, { placeholder: 'body' }); s.addNotes(notes);
}

// ---- 1. Title
pres.addSection({ title: '개요' });
let s = pres.addSlide({ masterName: 'Title', sectionTitle: '개요' });
s.addText('이사벨 반 영어 성적 분석', { placeholder: 'title' });
s.addText('세 반의 중1 → 중3 고등 모의고사·내신 변화 (2020–2026)\nMetta 영어 전문학원', { placeholder: 'body' });
s.addNotes('2020년, 2023년, 2025년에 중1로 시작한 이사벨 반 세 반의 고1·고2·고3 모의고사와 수능, 학교 내신 성적을 정리했습니다.');

// ---- 2. Summary cards
s = pres.addSlide({ masterName: 'Content', sectionTitle: '개요' }); addTitle(s, '세 반 모두 중2에 고2 모의고사 2등급권 도달');
const cards = [
  ['A', '+20.5점', '62.8 → 83.3점', ['4명 모두 중1 4~5등급에서 시작', '중3 수능 평균 87.7점 (2등급)', '중3 내신 평균 95~99점']],
  ['B', '+19.0점', '67.0 → 86.0점', ['중2 1차 고1 모의고사 4명 모두 1등급', '구성관 중2 4차 고2 100점', '내신 중1·중2 95~100점']],
  ['C', '+16.4점', '65.6 → 82.0점', ['5명 중 4명이 중2에 2등급 이상 경험', '서예준 51 → 80점 (+29)', '중2 내신 평균 88~100점']]];
cards.forEach(([co, big, sub, pts], i) => {
  const x = 0.6 + i * 4.1, w = 3.8;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.45, w, h: 5.2, fill: { color: C.background2 }, line: { color: C.background2 }, rectRadius: 0.12, objectName: `card-${co}` });
  s.addText(D.cohorts[co].short, { x: x + 0.3, y: 1.65, w: w - 0.6, h: 0.45, fontSize: 18, bold: true, color: C.text2, margin: 0, isTextBox: true, objectName: `card-${co}-name` });
  s.addText(D.cohorts[co].years + ' · ' + D.cohorts[co].classes, { x: x + 0.3, y: 2.1, w: w - 0.6, h: 0.35, fontSize: 11, color: C.text1, margin: 0, isTextBox: true, objectName: `card-${co}-years` });
  s.addText(big, { x: x + 0.3, y: 2.55, w: w - 0.6, h: 1.0, fontSize: 48, bold: true, color: C.accent1, margin: 0, isTextBox: true, objectName: `card-${co}-big` });
  s.addText('반 평균: 중1 첫 시험 → 첫 고2 모의고사\n' + sub, { x: x + 0.3, y: 3.55, w: w - 0.6, h: 0.75, fontSize: 12, color: C.text1, margin: 0, isTextBox: true, objectName: `card-${co}-sub` });
  bulletBox(s, pts, { x: x + 0.3, y: 4.45, w: w - 0.6, h: 2.0, name: `card-${co}-pts`, fontSize: 14 });
});
s.addNotes('세 반을 같은 단계로 비교했습니다. 중1 첫 고1 모의고사 평균은 63~67점(4등급권)으로 비슷했고, 중2 3차에 처음 본 고2 모의고사에서는 82~86점(2등급권)이었습니다. 반 평균 기준 상승폭은 16~21점입니다.');

// ---- 3. Cohort comparison chart
s = pres.addSlide({ masterName: 'Content', sectionTitle: '개요' }); addTitle(s, '같은 단계에서 본 세 반의 평균 총점');
const stages = [['중1 첫 시험', c => c.exams.findIndex(e => e.grade === '중1')], ['중1 마지막', c => c.exams.map(e => e.grade).lastIndexOf('중1')],
  ['중2 첫 시험', c => c.exams.findIndex(e => e.grade === '중2')], ['첫 고2 모의고사\n(중2 3차)', c => c.exams.findIndex(e => e.grade === '중2' && e.seq === 3)], ['가장 최근', c => c.exams.length - 1]];
const stageAvg = (co, fn) => { const c = cohort(co); const e = c.exams[fn(c)]; return Math.round(avg(c.studs.map(st => c.val(st, e, 'total'))) * 10) / 10; };
s.addChart(pres.charts.BAR, ['A', 'B', 'C'].map((co, i) => ({ name: D.cohorts[co].short, labels: stages.map(x => x[0]), values: stages.map(x => stageAvg(co, x[1])) })),
  { x: 0.6, y: 1.35, w: 8.4, h: 5.4, barDir: 'col', barGapWidthPct: 50, objectName: 'compare-chart', ...chartBase(), chartColors: SERIES.slice(0, 3),
    valAxisMinVal: 0, valAxisMaxVal: 100, valAxisMajorUnit: 20, showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 10, dataLabelColor: '1F2A30', dataLabelFormatCode: '0' });
bulletBox(s, ['세 반 모두 중1 첫 시험은 4등급권(63~67점)에서 출발', '중2 3차, 처음 본 고2 모의고사에서 세 반 모두 82~86점', '구성관 반은 중2 1차 고1 모의고사 평균 94.5점으로 가장 높음', '이서연 반 중1은 1차만 기록이 있어 중1 마지막 = 중1 첫 시험'],
  { x: 9.3, y: 1.5, w: 3.4, h: 5.2, name: 'compare-notes', fontSize: 14 });
s.addNotes('가장 최근 시험: 김건희 반은 2023학년도 수능(나민하 미응시로 3명 평균), 구성관 반은 중3 2차 고2 모의고사, 이서연 반은 중2 3차 고2 모의고사입니다.');

// ---- A
section('김건희 반', '2020 중1 반 · 김건희 반', '김건희 · 안도후 · 안동휘 · 나민하\n2020 1M-A → 2021 2M-A → 2022 3M-A · 고1 모의고사부터 수능까지', '2020년 1M-A 1차 모의고사 상위 4명입니다.');
totalSlide('A', '김건희 반', '3년 동안 4~5등급에서 2등급권으로', '중1은 고1 모의고사 5회, 중2는 4회(3·4차 고2), 중3은 고2 2회, 고3 1회, 2023학년도 수능입니다. 나민하는 수능 날이 기말고사 기간이라 응시하지 않았습니다. 중2 1·2차는 성적표에 시험 수준 표기가 없습니다.',
  ['중1 첫 시험 평균 62.8점 → 중3 수능 87.7점', '중2 2차에 4명 모두 87점 이상, 3명 1등급', '안동휘 58 → 87점(+29)으로 상승폭 최대', '나민하는 중3에서 74 → 86 → 74점으로 기복']);
lrSlide('A', '김건희 반', '듣기는 처음부터 만점권, 차이는 독해', '중1 1차는 듣기·독해 개수가 기록되지 않았습니다.',
  ['듣기 평균은 3년 내내 16~17개', '독해 평균 17.5개(중1 2차) → 23.0개(수능)', '중2 2차 독해 평균 24.5개로 최고', '시험이 고2·고3으로 어려워져도 독해 21~23개 유지']);
tableSlide('A', '김건희 반', '학생별 변화와 중3 내신', '내신은 중3 1·2학기 중간·기말 평균입니다. 나민하 2학기 기말은 성적표 작성 시점에 시험 기간이라 빠졌습니다.',
  ['4명 모두 중3 내신 평균 95점 이상', '안도후 2학기 중간·기말 모두 100점', '안동휘 1학기 중간 87 → 이후 98~100점', '모의고사와 내신을 함께 끌어올린 반'], '중3 내신 평균');

// ---- B
section('구성관 반', '2023 중1 반 · 구성관 반', '구성관 · 송지효 · 신준섭 · 박주연\n2023 1M-S → 2024 2M-S → 2025 3M-S · 고1·고2 모의고사', '2023년 1M-S부터 3년 동안 계속 다닌 4명입니다. 김의현·최리원(2023 1차만 응시), 백시우·신상훈(2025 합류)은 제외했습니다.');
totalSlide('B', '구성관 반', '중2 1차, 4명 모두 고1 모의고사 1등급', '2023년 중1 5회는 모두 고1 모의고사, 2024년 1·2차 고1, 3·4차 고2, 2025년 1·2차 고2 모의고사입니다. 2025년 3·4차(고3)는 받은 사진에 없습니다.',
  ['중1 첫 시험 평균 67.0점 → 중2 1차 94.5점', '송지효 58점(5등급) → 중2 1차 100점', '구성관 중2 4차 고2 100점, 중3 92~95점', '고2 시험부터 신준섭·박주연은 기복이 커짐']);
lrSlide('B', '구성관 반', '독해 평균 14.8개 → 25.8개', '네 번째 시험(중1 4차)부터 듣기는 거의 전원 만점입니다.',
  ['듣기 평균 16~17개로 안정', '독해는 중1 1차 14.8개에서 중2 1차 25.8개로 증가', '고2 모의고사에서는 독해 21.8~24.8개', '중3 2차 신준섭 독해 17개 → 집중 관리 필요']);
tableSlide('B', '구성관 반', '학생별 변화와 내신', '내신은 2023 중1 중간·기말, 2024 중2 기말 점수의 평균입니다. 성적표에 학기 표기가 없습니다.',
  ['송지효 +37점으로 상승폭 최대', '구성관·송지효는 중3에서도 1등급 유지', '박주연은 중2 고2 시험 69~70점 → 중3 85~89점으로 회복', '내신은 4명 모두 95~100점'], '내신 평균');

// ---- C
section('이서연 반', '2025 중1 반 · 이서연 반', '김지수 · 김채율 · 이서연 · 황재성 · 서예준\n2025 1M-A → 2026 2M-A · 고1·고2 모의고사', '2025년 1M-A에서 2026년 2M-A까지 다닌 5명입니다. 2025년 중1은 1차 성적만 받았습니다. 이시원·한재승(2026 합류)과 김은혜·구승준·김가민(2026 미등록)은 제외했습니다.');
totalSlide('C', '이서연 반', '중1 첫 시험 65.6점 → 중2 고2 모의고사 82.0점', '2025년 중1 1차(고1), 2026년 중2 1·2차(고1), 3차(고2) 모의고사입니다. 중2 4차는 아직 기록이 없습니다.',
  ['서예준 51 → 80점(+29), 5등급에서 2등급', '이서연 중2 2차 100점, 고2 시험 95점 1등급', '김지수 63 → 66 → 75 → 77점 꾸준히 상승', '김채율·황재성은 중2 1차 87·88점 후 70점대']);
lrSlide('C', '이서연 반', '독해 평균 15.0개 → 21.0개', '이서연 반은 중1 기록이 1차뿐이라 중1 → 중2 변화가 크게 보입니다.',
  ['듣기 평균 15.8개 → 16.8개', '독해는 중1 1차 15.0개에서 중2 21개 안팎', '서예준 독해 8개 → 20개, 김채율 11개 → 19~23개', '중2 2차부터 독해 개수 차이가 학생별로 벌어짐']);
tableSlide('C', '이서연 반', '학생별 변화와 중2 내신', '내신은 2026 중2 1학기 중간·기말, 2학기 중간 평균입니다.',
  ['이서연·김지수 내신 평균 99점 이상', '황재성 1학기 기말 100점', '서예준은 모의고사 상승폭 최대(+29), 내신 88점대', '김채율은 내신 89 → 100 → 94점'], '중2 내신 평균');

// ---- Conclusion
pres.addSection({ title: '정리' });
s = pres.addSlide({ masterName: 'Section', sectionTitle: '정리' });
s.addText('정리와 앞으로의 지도 방향', { placeholder: 'title' });
s.addText([
  { text: '듣기는 중1부터 16~17개로 안정 → 수업 시간은 독해 구문·어휘에 집중', options: { bullet: true, breakLine: true } },
  { text: '고2·고3 시험으로 넘어갈 때 기복이 생기는 학생은 독해 유형별 오답 관리', options: { bullet: true, breakLine: true } },
  { text: '내신 95점 이상과 모의고사 2등급권을 함께 달성할 수 있음을 세 반이 보여줌', options: { bullet: true, breakLine: true } },
  { text: '다음 업데이트: 구성관 반 고3 모의고사, 이서연 반 중2 4차·중3 결과', options: { bullet: true } }], { placeholder: 'body' });
s.addNotes('세 반 모두 같은 흐름을 보였습니다. 중1에서는 고1 모의고사 4등급권에서 시작하고, 중2에 고2 모의고사 2등급권에 도달합니다. 점수 차이는 대부분 독해에서 나옵니다.');

pres.writeFile({ fileName: OUT }).then(() => applyTheme(OUT, THEME)).then(() => console.log('done'));
