import React, { useState, useEffect, useMemo } from "react";
import {
  Wallet, TrendingDown, PiggyBank, Users, Plus, Trash2, Printer, Clock,
  Pencil, Shuffle, RotateCcw, AlertTriangle, Check, X, Trophy, HandCoins, Receipt,
} from "lucide-react";

/* ---------- helpers ---------- */
const bn = (v) => String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const money = (n) => "৳ " + bn(Number(n).toLocaleString("en-US"));
const pad = (n) => String(n).padStart(2, "0");
const fmtDate = (iso) => {
  const d = new Date(iso);
  return bn(`${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, `) + timeLabel(d.getHours() * 60 + d.getMinutes());
};
function timeLabel(m) {
  const h = Math.floor(m / 60) % 24, mi = m % 60;
  return bn(`${pad(h % 12 || 12)}:${pad(mi)}`) + (h >= 12 ? " পিএম" : " এএম");
}

const START = 19 * 60; // 7 PM
const TOTAL = 360; // until 1 AM
const SLOT = 30;
const SLOTS = Array.from({ length: TOTAL / SLOT }, (_, i) => i * SLOT);
const offLabel = (o) => timeLabel((START + o) % 1440);
const offToInput = (o) => { const m = (START + o) % 1440; return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };
const inputToOff = (v) => {
  if (!v) return NaN;
  const [h, mi] = v.split(":").map(Number);
  let m = h * 60 + mi;
  if (m < START) m += 1440;
  return m - START;
};

const STATUS = {
  upcoming: { label: "আসন্ন", cls: "bg-sky-500/15 text-sky-300 border-sky-500/30", next: "live" },
  live: { label: "চলমান", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30", next: "done" },
  done: { label: "সম্পন্ন", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", next: "upcoming" },
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString();

const SAMPLE = {
  incomes: [
    { id: "i1", name: "রাকিব হাসান", amount: 500, at: ago(30) },
    { id: "i2", name: "সাকিব আহমেদ", amount: 500, at: ago(28) },
    { id: "i3", name: "তানভীর ইসলাম", amount: 300, at: ago(20) },
    { id: "i4", name: "ফারহান করিম", amount: 500, at: ago(10) },
    { id: "i5", name: "নাঈম উদ্দিন", amount: 400, at: ago(5) },
    { id: "i6", name: "ইমরান হোসেন", amount: 500, at: ago(2) },
  ],
  expenses: [
    { id: "e1", name: "শাটল কক (২ ডজন)", amount: 1200, at: ago(26) },
    { id: "e2", name: "লাইটিং ভাড়া", amount: 800, at: ago(12) },
    { id: "e3", name: "নেট ও পোস্ট", amount: 450, at: ago(8) },
  ],
  matches: [
    { id: "m1", title: "ম্যাচ ১", court: 1, p1: "রাকিব হাসান", p2: "সাকিব আহমেদ", start: 0, end: 30, status: "done" },
    { id: "m2", title: "ম্যাচ ২", court: 2, p1: "তানভীর ইসলাম", p2: "ফারহান করিম", start: 30, end: 60, status: "live" },
    { id: "m3", title: "সেমিফাইনাল", court: 1, p1: "নাঈম উদ্দিন", p2: "ইমরান হোসেন", start: 90, end: 120, status: "upcoming" },
  ],
};

function useLS(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } }, [key, v]);
  return [v, setV];
}

const inputCls = "w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";
const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 active:scale-95";
const btnGhost = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-300";

/* ---------- stat card ---------- */
function Stat({ icon: Icon, label, value, tone = "emerald", warn }) {
  const t = {
    emerald: "text-emerald-300 bg-emerald-400/10",
    rose: "text-rose-300 bg-rose-400/10",
    sky: "text-sky-300 bg-sky-400/10",
  }[warn ? "rose" : tone];
  return (
    <div className={`rounded-2xl border p-4 transition ${warn ? "border-rose-500/60 bg-rose-950/30" : "border-slate-800 bg-slate-900/70"}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <span className={`rounded-lg p-2 ${t}`}>{warn ? <AlertTriangle size={18} /> : <Icon size={18} />}</span>
      </div>
      <p className={`mt-3 text-2xl font-bold sm:text-3xl ${warn ? "text-rose-300" : "text-slate-50"}`}>{value}</p>
      {warn && <p className="mt-1 text-xs text-rose-300">সতর্কতা: ফান্ড ঘাটতিতে আছে!</p>}
    </div>
  );
}

/* ---------- income / expense ledger ---------- */
function Ledger({ title, icon: Icon, rose, nameLabel, namePh, items, onAdd, onDel, totalLabel, listId, suggestions }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const accent = rose ? "text-rose-300" : "text-emerald-300";
  const submit = (e) => {
    e.preventDefault();
    const a = Number(amount);
    if (!name.trim() || !(a > 0)) return;
    onAdd({ id: uid(), name: name.trim(), amount: a, at: new Date().toISOString() });
    setName(""); setAmount("");
  };
  const total = items.reduce((s, x) => s + x.amount, 0);
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-50">
        <Icon size={20} className={accent} /> {title}
      </h2>
      <form onSubmit={submit} className="mt-4 grid gap-2 sm:grid-cols-[1fr_130px_auto]">
        <input className={inputCls} placeholder={namePh} aria-label={nameLabel} value={name} list={listId} onChange={(e) => setName(e.target.value)} />
        {suggestions}
        <input className={inputCls} type="number" min="1" placeholder="টাকা" aria-label="টাকা" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className={rose ? btnPrimary.replace("bg-emerald-400", "bg-rose-400").replace("hover:bg-emerald-300", "hover:bg-rose-300") : btnPrimary}>
          <Plus size={16} /> যোগ করুন
        </button>
      </form>
      <div className="mt-4 max-h-80 overflow-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[460px] text-left text-sm">
          <thead className="sticky top-0 bg-slate-900 text-slate-400">
            <tr>
              <th className="px-3 py-2 font-medium">{nameLabel}</th>
              <th className="px-3 py-2 font-medium">টাকা</th>
              <th className="px-3 py-2 font-medium">তারিখ ও সময়</th>
              <th className="px-3 py-2 text-right font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-500">এখনও কোনো তথ্য নেই। উপরের ফর্ম থেকে যোগ করুন।</td></tr>
            )}
            {[...items].reverse().map((x) => (
              <tr key={x.id} className="border-t border-slate-800 transition hover:bg-slate-800/40">
                <td className="px-3 py-2.5 text-slate-100">{x.name}</td>
                <td className={`px-3 py-2.5 font-semibold ${accent}`}>{money(x.amount)}</td>
                <td className="px-3 py-2.5 text-slate-400">{fmtDate(x.at)}</td>
                <td className="px-3 py-2.5 text-right">
                  <button onClick={() => onDel(x.id)} aria-label="মুছুন" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-950/60 px-4 py-3">
        <span className="text-sm text-slate-400">{totalLabel}</span>
        <span className={`text-lg font-bold ${accent}`}>{money(total)}</span>
      </div>
    </section>
  );
}

/* ---------- main app ---------- */
const emptyForm = { title: "", court: 1, p1: "", p2: "", start: 0, end: 30, status: "upcoming" };

export default function App() {
  const [incomes, setIncomes] = useLS("bd_incomes", SAMPLE.incomes);
  const [expenses, setExpenses] = useLS("bd_expenses", SAMPLE.expenses);
  const [matches, setMatches] = useLS("bd_matches", SAMPLE.matches);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState("");

  const totalIn = incomes.reduce((s, x) => s + x.amount, 0);
  const totalOut = expenses.reduce((s, x) => s + x.amount, 0);
  const balance = totalIn - totalOut;
  const players = useMemo(() => [...new Set(incomes.map((x) => x.name))], [incomes]);
  const sorted = useMemo(() => [...matches].sort((a, b) => a.start - b.start), [matches]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const pickSlot = (i) => setForm((f) => ({ ...f, start: SLOTS[i], end: SLOTS[i] + SLOT }));
  const slotIndex = SLOTS.includes(form.start) && form.end - form.start === SLOT ? form.start / SLOT : "";

  const save = (e) => {
    e.preventDefault();
    const { title, p1, p2, start, end, court } = form;
    if (!title.trim() || !p1.trim() || !p2.trim()) return setErr("ম্যাচের নাম ও দুইজন খেলোয়াড় দিন।");
    if (isNaN(start) || isNaN(end) || start < 0 || end > TOTAL || end <= start)
      return setErr("সময় অবশ্যই রাত ০৭:০০ থেকে ভোর ০১:০০ এর মধ্যে এবং শেষ সময় শুরুর পরে হতে হবে।");
    const clash = matches.find((m) => m.id !== editId && Number(m.court) === Number(court) && m.start < end && start < m.end);
    if (clash) return setErr(`কোর্ট ${bn(court)}-এ এই সময়ে "${clash.title}" ইতিমধ্যে আছে।`);
    const rec = { ...form, court: Number(court), title: title.trim(), p1: p1.trim(), p2: p2.trim() };
    setMatches((ms) => (editId ? ms.map((m) => (m.id === editId ? { ...rec, id: editId } : m)) : [...ms, { ...rec, id: uid() }]));
    setForm(emptyForm); setEditId(null); setErr("");
  };

  const edit = (m) => { setForm({ ...m }); setEditId(m.id); setErr(""); window.scrollTo({ top: document.getElementById("match-form").offsetTop - 80, behavior: "smooth" }); };
  const cancel = () => { setForm(emptyForm); setEditId(null); setErr(""); };
  const cycle = (id) => setMatches((ms) => ms.map((m) => (m.id === id ? { ...m, status: STATUS[m.status].next } : m)));

  const autoGen = () => {
    if (players.length < 2) return setErr("অটো রুটিনের জন্য কমপক্ষে ২ জন খেলোয়াড় নিবন্ধিত থাকতে হবে।");
    if (matches.length && !window.confirm("বর্তমান রুটিন মুছে নতুন রুটিন তৈরি হবে। চালিয়ে যাবেন?")) return;
    const sh = [...players].sort(() => Math.random() - 0.5);
    const out = [];
    for (let i = 0; i + 1 < sh.length && out.length < SLOTS.length; i += 2) {
      const k = out.length;
      out.push({ id: uid(), title: `ম্যাচ ${bn(k + 1)}`, court: (k % 2) + 1, p1: sh[i], p2: sh[i + 1], start: SLOTS[k], end: SLOTS[k] + SLOT, status: "upcoming" });
    }
    setMatches(out); setErr("");
  };

  const clearAll = () => {
    if (!window.confirm("সব ডেমো/সংরক্ষিত তথ্য মুছে ফেলা হবে। নিশ্চিত?")) return;
    setIncomes([]); setExpenses([]); setMatches([]);
  };
  const restore = () => { setIncomes(SAMPLE.incomes); setExpenses(SAMPLE.expenses); setMatches(SAMPLE.matches); };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'Hind Siliguri','Noto Sans Bengali',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        .print-only{display:none}
        @media print{
          body,.app-root{background:#fff!important}
          .no-print{display:none!important}
          .print-only{display:block!important}
          .print-area,.print-area *{color:#000!important;background:transparent!important;border-color:#888!important;box-shadow:none!important}
        }
      `}</style>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
        {/* header */}
        <header className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-400 p-3 text-slate-950 shadow-[0_0_30px_-4px_rgba(52,211,153,0.7)]"><Trophy size={26} /></div>
            <div>
              <h1 className="text-2xl font-bold text-slate-50 sm:text-3xl">ব্যাডমিন্টন টুর্নামেন্ট ম্যানেজার</h1>
              <p className="text-sm text-slate-400">চাঁদা, খরচ ও খেলার রুটিন এক জায়গায়</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={restore} className={btnGhost}><RotateCcw size={16} /> ডেমো ডাটা</button>
            <button onClick={clearAll} className={btnGhost}><Trash2 size={16} /> সব মুছুন</button>
          </div>
        </header>

        {/* stats */}
        <div className="no-print grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={Wallet} label="মোট সংগ্রহ" value={money(totalIn)} />
          <Stat icon={TrendingDown} label="মোট খরচ" value={money(totalOut)} tone="rose" />
          <Stat icon={PiggyBank} label="অবশিষ্ট ফান্ড" value={money(balance)} warn={balance < 0} />
          <Stat icon={Users} label="মোট খেলোয়াড়" value={bn(players.length) + " জন"} tone="sky" />
        </div>

        {/* ledgers */}
        <div className="no-print grid gap-5 lg:grid-cols-2">
          <Ledger
            title="চাঁদার হিসাব" icon={HandCoins} nameLabel="খেলোয়াড়ের নাম" namePh="খেলোয়াড়ের নাম"
            items={incomes} onAdd={(x) => setIncomes((l) => [...l, x])} onDel={(id) => setIncomes((l) => l.filter((x) => x.id !== id))}
            totalLabel="মোট চাঁদা"
          />
          <Ledger
            title="খরচের হিসাব" icon={Receipt} rose nameLabel="খাত / বিবরণ" namePh="যেমন: শাটল কক, লাইটিং, নেট"
            items={expenses} onAdd={(x) => setExpenses((l) => [...l, x])} onDel={(id) => setExpenses((l) => l.filter((x) => x.id !== id))}
            totalLabel="মোট খরচ"
          />
        </div>

        {/* schedule form */}
        <section id="match-form" className="no-print rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-50">
              <Clock size={20} className="text-emerald-300" /> {editId ? "ম্যাচ সম্পাদনা" : "নতুন ম্যাচ যোগ করুন"}
              <span className="text-xs font-normal text-slate-400">(রাত ০৭:০০ – ভোর ০১:০০)</span>
            </h2>
            <button onClick={autoGen} className={btnGhost}><Shuffle size={16} /> অটো রুটিন তৈরি করুন</button>
          </div>

          <form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input className={inputCls} placeholder="ম্যাচের নাম (যেমন: ম্যাচ ১, সেমিফাইনাল)" value={form.title} onChange={(e) => set("title", e.target.value)} />
            <select className={inputCls} value={form.court} onChange={(e) => set("court", e.target.value)} aria-label="কোর্ট">
              {[1, 2, 3, 4].map((c) => <option key={c} value={c}>কোর্ট {bn(c)}</option>)}
            </select>
            <input className={inputCls} list="players" placeholder="খেলোয়াড় ১" value={form.p1} onChange={(e) => set("p1", e.target.value)} />
            <input className={inputCls} list="players" placeholder="খেলোয়াড় ২" value={form.p2} onChange={(e) => set("p2", e.target.value)} />
            <datalist id="players">{players.map((p) => <option key={p} value={p} />)}</datalist>

            <select className={inputCls} value={slotIndex} onChange={(e) => e.target.value !== "" && pickSlot(Number(e.target.value))} aria-label="টাইম স্লট">
              <option value="">কাস্টম সময়</option>
              {SLOTS.map((s, i) => <option key={s} value={i}>{offLabel(s)} – {offLabel(s + SLOT)}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-400">শুরু
              <input type="time" className={inputCls} value={offToInput(form.start)} onChange={(e) => set("start", inputToOff(e.target.value))} />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-400">শেষ
              <input type="time" className={inputCls} value={offToInput(Math.min(form.end, TOTAL))} onChange={(e) => set("end", inputToOff(e.target.value))} />
            </label>
            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)} aria-label="অবস্থা">
              {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
            </select>

            <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
              <button className={btnPrimary}>{editId ? <Check size={16} /> : <Plus size={16} />} {editId ? "আপডেট করুন" : "রুটিনে যোগ করুন"}</button>
              {editId && <button type="button" onClick={cancel} className={btnGhost}><X size={16} /> বাতিল</button>}
            </div>
          </form>
          {err && <p role="alert" className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-300"><AlertTriangle size={16} /> {err}</p>}
        </section>

        {/* schedule list */}
        <section className="print-area rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
          <div className="print-only mb-4 text-center">
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>ব্যাডমিন্টন টুর্নামেন্ট – খেলার রুটিন</h1>
            <p>রাত ০৭:০০ থেকে ভোর ০১:০০</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-50">
              <Trophy size={20} className="text-emerald-300" /> খেলার রুটিন
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-xs text-emerald-300">{bn(sorted.length)}টি ম্যাচ</span>
            </h2>
            <button onClick={() => window.print()} className={`no-print ${btnPrimary}`}><Printer size={16} /> রুটিন প্রিন্ট করুন</button>
          </div>

          <ul className="mt-4 space-y-2.5">
            {sorted.length === 0 && <li className="rounded-xl border border-dashed border-slate-700 py-10 text-center text-slate-500">কোনো ম্যাচ নেই। ম্যাচ যোগ করুন অথবা অটো রুটিন তৈরি করুন।</li>}
            {sorted.map((m) => {
              const s = STATUS[m.status];
              return (
                <li key={m.id} className={`flex flex-col gap-3 rounded-xl border p-3.5 transition sm:flex-row sm:items-center ${m.status === "live" ? "border-amber-400/50 bg-amber-400/5" : "border-slate-800 bg-slate-950/50"} ${m.status === "done" ? "opacity-70" : ""}`}>
                  <div className="w-full shrink-0 sm:w-56">
                    <p className="font-semibold text-emerald-300">{offLabel(m.start)} – {offLabel(m.end)}</p>
                    <p className="text-xs text-slate-400">{m.title} • কোর্ট {bn(m.court)}</p>
                  </div>
                  <p className="flex-1 text-base font-medium text-slate-100">
                    {m.p1} <span className="mx-1 text-sm text-slate-500">বনাম</span> {m.p2}
                  </p>
                  <div className="no-print flex items-center gap-2">
                    <button onClick={() => cycle(m.id)} title="অবস্থা পরিবর্তন করুন" className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition active:scale-95 ${s.cls}`}>{s.label}</button>
                    <button onClick={() => edit(m)} aria-label="সম্পাদনা" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-emerald-300"><Pencil size={16} /></button>
                    <button onClick={() => setMatches((l) => l.filter((x) => x.id !== m.id))} aria-label="মুছুন" className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300"><Trash2 size={16} /></button>
                  </div>
                  <span className="print-only">[{s.label}]</span>
                </li>
              );
            })}
          </ul>
        </section>

        <footer className="no-print pb-4 text-center text-xs text-slate-500">সব তথ্য আপনার ব্রাউজারেই সংরক্ষিত থাকে (localStorage)।</footer>
      </div>
    </div>
  );
}
