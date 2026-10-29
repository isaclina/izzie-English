// Stores each student's study record (A–G) in Netlify Blobs.
// GET  /api/progress?student=A  -> that student's record
// GET  /api/progress            -> every student's record (teacher page; needs TEACHER_PIN if one is set)
// POST /api/progress {student, event} -> records one study event
import { getStore } from "@netlify/blobs";

const STUDENTS = ["A", "B", "C", "D", "E", "F", "G"];
const LEVELS = ["root", "hsbasic", "csat", "csatplus", "ebs"];
const UNIT_ID = /^(u[1-9]|d\d{2})$/;
const MAX_LOG = 300;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const empty = student => ({ student, studied: {}, best: {}, log: [], lastActive: null });
const word = w => typeof w === "string" && w.length > 0 && w.length <= 40;
const teacherPin = () => globalThis.Netlify?.env?.get("TEACHER_PIN") || process.env.TEACHER_PIN || "";

export default async req => {
  const store = getStore({ name: "izzie-progress", consistency: "strong" });
  const url = new URL(req.url);
  const load = async s => (await store.get(s, { type: "json" })) || empty(s);

  if (req.method === "GET") {
    const s = url.searchParams.get("student");
    if (s) return STUDENTS.includes(s) ? json(await load(s)) : json({ error: "unknown student" }, 400);
    const pin = teacherPin();
    if (pin && req.headers.get("x-teacher-pin") !== pin) return json({ error: "pin required" }, 401);
    return json({ students: await Promise.all(STUDENTS.map(load)) });
  }

  if (req.method === "POST") {
    const body = await req.json().catch(() => null);
    const e = body?.event;
    if (!body || !STUDENTS.includes(body.student) || !e) return json({ error: "bad request" }, 400);
    const rec = await load(body.student);
    const now = new Date().toISOString();
    let entry;
    if (e.type === "login") entry = { type: "login" };
    else if (e.type === "studied" && LEVELS.includes(e.level) && UNIT_ID.test(e.unit) && word(e.word)) {
      const k = `${e.level}:${e.unit}:${e.word}`;
      rec.studied[k] = rec.studied[k] || now;
      entry = { type: "studied", level: e.level, unit: e.unit, word: e.word };
    } else if (e.type === "review" && LEVELS.includes(e.level) && UNIT_ID.test(e.unit) && ["word", "sentence"].includes(e.mode)
      && Number.isInteger(e.score) && Number.isInteger(e.total) && e.total > 0 && e.total <= 30 && e.score >= 0 && e.score <= e.total) {
      const k = `${e.level}:${e.unit}:${e.mode}`, b = rec.best[k];
      if (!b || e.score / e.total > b.score / b.total || (e.score / e.total === b.score / b.total && e.total > b.total))
        rec.best[k] = { score: e.score, total: e.total, at: now };
      const wrong = Array.isArray(e.wrong) ? e.wrong.filter(word).slice(0, 30) : [];
      entry = { type: "review", level: e.level, unit: e.unit, mode: e.mode, score: e.score, total: e.total, wrong };
    } else return json({ error: "unknown event" }, 400);

    rec.log.unshift({ at: now, ...entry });
    rec.log = rec.log.slice(0, MAX_LOG);
    rec.lastActive = now;
    await store.setJSON(body.student, rec);
    return json({ ok: true });
  }

  return json({ error: "method not allowed" }, 405);
};

export const config = { path: "/api/progress" };
