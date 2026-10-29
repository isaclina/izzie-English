# Izzie 영단어 (Netlify 사이트)

5단계 × 3유닛 × 30단어 = 450단어에 교재 Day 유닛(고등 어원 Day 01: 16단어)을 더한 학습 앱입니다.

| 단계 | 이름 | 유닛 |
|---|---|---|
| 1 | 고등 어원 | Day 01 (pro- pre- fore- post- in¹) / 보다·말하다·쓰다·듣다 / 가다·오다·나르다·보내다 / 만들다·놓다·잡다·세우다 |
| 2 | 고등 기본 | 학교와 배움 / 생활과 관계 / 사회와 환경 |
| 3 | 수능 기본 | 사고와 판단 / 과학과 건강 / 경제와 문화 |
| 4 | 수능 실력 | 인지와 심리 / 사회와 윤리 / 과학과 환경 |
| 5 | EBS | 논리와 글의 흐름 / 인문과 예술 / 사회와 과학 지문 |

- 학생 화면 `index.html`: A–G 중 이름을 고르고 공부합니다. 단어마다 ① 단어 ② 따라하기 ③ 동의어 ④ 문장 듣기 ⑤ 문장 쓰기, 유닛마다 Review(단어 쓰기·문장 쓰기)가 있습니다.
- 선생님 화면 `teacher.html`: 학생별 마지막 학습 시간, 단계별 완료 단어 수, 리뷰 점수와 틀린 단어, 최근 활동을 봅니다.
- 학습 기록은 Netlify Functions(`netlify/functions/progress.mjs`)가 Netlify Blobs에 저장합니다.
- 소리: `audio/<단계>/<유닛>-<단어>-{word,syn,sent}.mp3`

## Netlify 연결 (처음 한 번)

1. Netlify에서 `monumental-stroopwafel-94440f` 사이트 → **Site configuration → Build & deploy → Continuous deployment → Link repository**
2. GitHub의 `isaclina/izzie-English` 저장소와 브랜치를 고릅니다. 빌드 설정은 저장소의 `netlify.toml`이 알아서 채웁니다 (publish: `site`).
3. (선택) **Site configuration → Environment variables** 에 `TEACHER_PIN` 을 만들면 선생님 화면에 비밀번호가 걸립니다.

이후에는 GitHub에 올릴 때마다 사이트가 자동으로 바뀝니다.

## 단어 바꾸기

`words.js` 의 `[단어, 품사, 뜻, 동의어, 예문, 해석, 어원]` 줄을 고치면 됩니다. 새 단어는 녹음 파일이 없으면 브라우저 음성으로 읽습니다.
