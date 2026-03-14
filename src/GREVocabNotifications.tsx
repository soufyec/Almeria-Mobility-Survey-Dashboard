import React, { useState, useEffect, useCallback } from "react";
import { GRE_VOCAB_SETS, VocabWord } from "./greVocabData";

// ─── helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  startDate: "gre_start_date",
  notifTime: "gre_notif_time",
  notifEnabled: "gre_notif_enabled",
  quizScores: "gre_quiz_scores",
};

function getDayIndex(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.startDate);
  if (!stored) return 0;
  const start = new Date(stored);
  const now = new Date();
  const diff = Math.floor(
    (now.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );
  return Math.min(Math.max(diff, 0), GRE_VOCAB_SETS.length - 1);
}

function msUntilTime(hhmm: string): number {
  const [hh, mm] = hhmm.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hh, mm, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

async function requestNotifPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function sendNotif(words: VocabWord[], day: number) {
  if (Notification.permission !== "granted") return;
  const preview = words
    .slice(0, 3)
    .map((w) => w.word)
    .join(" · ");
  new Notification(`GRE Vocab — Día ${day + 1}`, {
    body: `Hoy: ${preview} y ${words.length - 3} más. ¡Abre la app para practicar!`,
    icon: "/favicon.ico",
    tag: "gre-daily",
  });
}

// ─── sub-components ──────────────────────────────────────────────────────────

interface WordCardProps {
  word: VocabWord;
  revealed: boolean;
  onReveal: () => void;
}

function WordCard({ word, revealed, onReveal }: WordCardProps) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.wordText}>{word.word}</span>
        <span style={styles.pos}>{word.partOfSpeech}</span>
      </div>
      {revealed ? (
        <>
          <p style={styles.definition}>{word.definition}</p>
          <p style={styles.example}>
            <em>"{word.example}"</em>
          </p>
        </>
      ) : (
        <button style={styles.revealBtn} onClick={onReveal}>
          Revelar definición
        </button>
      )}
    </div>
  );
}

interface QuizProps {
  words: VocabWord[];
  onDone: (score: number) => void;
}

function Quiz({ words, onDone }: QuizProps) {
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [allWords] = useState<VocabWord[]>(() => {
    // grab extra words from other days for distractors
    const pool = GRE_VOCAB_SETS.flatMap((s) => s.words);
    return pool;
  });

  const current = words[qIdx];

  const getOptions = useCallback(
    (correct: VocabWord): string[] => {
      const wrong = allWords
        .filter((w) => w.word !== correct.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.definition);
      return [...wrong, correct.definition].sort(() => Math.random() - 0.5);
    },
    [allWords]
  );

  const [options] = useState<string[][]>(() =>
    words.map((w) => getOptions(w))
  );

  const handleAnswer = (opt: string) => {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === current.definition) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (qIdx + 1 >= words.length) {
      onDone(score + (selected === current.definition ? 1 : 0));
    } else {
      setQIdx((i) => i + 1);
      setSelected(null);
    }
  };

  return (
    <div style={styles.quizContainer}>
      <p style={styles.quizProgress}>
        Pregunta {qIdx + 1} / {words.length}
      </p>
      <h3 style={styles.quizWord}>{current.word}</h3>
      <p style={styles.quizInstruction}>¿Cuál es la definición correcta?</p>
      <div style={styles.optionsGrid}>
        {options[qIdx].map((opt) => {
          let bg = "#f4f6ff";
          if (selected) {
            if (opt === current.definition) bg = "#c8f7c5";
            else if (opt === selected) bg = "#ffd3d3";
          }
          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              style={{ ...styles.optionBtn, background: bg }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selected && (
        <button style={styles.nextBtn} onClick={handleNext}>
          {qIdx + 1 >= words.length ? "Ver resultado" : "Siguiente →"}
        </button>
      )}
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

type View = "words" | "quiz" | "result" | "settings";

export default function GREVocabNotifications() {
  const [startDate] = useState<string>(() => {
    let d = localStorage.getItem(STORAGE_KEYS.startDate);
    if (!d) {
      d = new Date().toISOString().split("T")[0];
      localStorage.setItem(STORAGE_KEYS.startDate, d);
    }
    return d;
  });

  const [dayIdx, setDayIdx] = useState<number>(getDayIndex);
  const [notifTime, setNotifTime] = useState<string>(
    () => localStorage.getItem(STORAGE_KEYS.notifTime) || "08:00"
  );
  const [notifEnabled, setNotifEnabled] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEYS.notifEnabled) === "true"
  );
  const [notifPermission, setNotifPermission] = useState<string>(
    () => ("Notification" in window ? Notification.permission : "unsupported")
  );
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [view, setView] = useState<View>("words");
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<number, number>>(() => {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEYS.quizScores) || "{}"
      );
    } catch {
      return {};
    }
  });

  const todaySet = GRE_VOCAB_SETS[dayIdx];

  // schedule daily notification
  useEffect(() => {
    if (!notifEnabled || notifPermission !== "granted") return;
    const ms = msUntilTime(notifTime);
    const tid = setTimeout(() => {
      sendNotif(todaySet.words, dayIdx);
    }, ms);
    return () => clearTimeout(tid);
  }, [notifEnabled, notifPermission, notifTime, todaySet, dayIdx]);

  const handleEnableNotifs = async () => {
    const granted = await requestNotifPermission();
    setNotifPermission(granted ? "granted" : "denied");
    if (granted) {
      setNotifEnabled(true);
      localStorage.setItem(STORAGE_KEYS.notifEnabled, "true");
    }
  };

  const handleTimeChange = (t: string) => {
    setNotifTime(t);
    localStorage.setItem(STORAGE_KEYS.notifTime, t);
  };

  const handleReveal = (idx: number) =>
    setRevealed((prev) => new Set(Array.from(prev).concat(idx)));

  const handleRevealAll = () =>
    setRevealed(new Set(todaySet.words.map((_, i) => i)));

  const handleQuizDone = (score: number) => {
    const updated = { ...scores, [dayIdx]: score };
    setScores(updated);
    localStorage.setItem(STORAGE_KEYS.quizScores, JSON.stringify(updated));
    setQuizScore(score);
    setView("result");
  };

  const totalWords = GRE_VOCAB_SETS.length * 7;
  const wordsLearned = (dayIdx + 1) * 7;
  const daysLeft = 21 - dayIdx - 1;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div style={styles.container}>
      {/* ── header ── */}
      <div style={styles.header}>
        <h2 style={styles.title}>📚 GRE Vocab — Preparación 3 Semanas</h2>
        <div style={styles.progress}>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${(wordsLearned / totalWords) * 100}%`,
              }}
            />
          </div>
          <span style={styles.progressText}>
            {wordsLearned}/{totalWords} palabras · {daysLeft} días restantes
          </span>
        </div>
      </div>

      {/* ── day selector ── */}
      <div style={styles.dayNav}>
        <button
          style={styles.navBtn}
          disabled={dayIdx === 0}
          onClick={() => {
            setDayIdx((d) => d - 1);
            setRevealed(new Set());
            setView("words");
          }}
        >
          ‹ Día anterior
        </button>
        <span style={styles.dayLabel}>Día {dayIdx + 1} de 21</span>
        <button
          style={styles.navBtn}
          disabled={dayIdx === GRE_VOCAB_SETS.length - 1}
          onClick={() => {
            setDayIdx((d) => d + 1);
            setRevealed(new Set());
            setView("words");
          }}
        >
          Día siguiente ›
        </button>
      </div>

      {/* ── tab bar ── */}
      <div style={styles.tabBar}>
        {(["words", "quiz", "settings"] as View[]).map((v) => (
          <button
            key={v}
            style={{
              ...styles.tab,
              ...(view === v ? styles.tabActive : {}),
            }}
            onClick={() => {
              setView(v);
              setQuizScore(null);
            }}
          >
            {v === "words" ? "📖 Vocabulario" : v === "quiz" ? "🧠 Quiz" : "⚙️ Config"}
          </button>
        ))}
      </div>

      {/* ── vocab view ── */}
      {view === "words" && (
        <div>
          <div style={styles.revealAllRow}>
            <button style={styles.revealAllBtn} onClick={handleRevealAll}>
              Mostrar todo
            </button>
            {scores[dayIdx] !== undefined && (
              <span style={styles.scoreBadge}>
                Quiz: {scores[dayIdx]}/7
              </span>
            )}
          </div>
          {todaySet.words.map((w, i) => (
            <WordCard
              key={w.word}
              word={w}
              revealed={revealed.has(i)}
              onReveal={() => handleReveal(i)}
            />
          ))}
        </div>
      )}

      {/* ── quiz view ── */}
      {view === "quiz" && quizScore === null && (
        <Quiz words={todaySet.words} onDone={handleQuizDone} />
      )}

      {/* ── result view ── */}
      {view === "result" && quizScore !== null && (
        <div style={styles.resultContainer}>
          <div style={styles.resultEmoji}>
            {quizScore === 7 ? "🏆" : quizScore >= 5 ? "🌟" : quizScore >= 3 ? "💪" : "📖"}
          </div>
          <h3 style={styles.resultTitle}>
            {quizScore}/7 correctas
          </h3>
          <p style={styles.resultMsg}>
            {quizScore === 7
              ? "¡Perfecto! Dominas estas palabras."
              : quizScore >= 5
              ? "¡Muy bien! Repasa las que fallaste."
              : quizScore >= 3
              ? "Bien empezado. ¡Revisa el vocabulario y vuelve a intentarlo!"
              : "Repasa las definiciones antes de hacer el quiz otra vez."}
          </p>
          <button
            style={styles.retryBtn}
            onClick={() => {
              setQuizScore(null);
              setView("quiz");
            }}
          >
            Intentar de nuevo
          </button>
          <button
            style={{ ...styles.retryBtn, background: "#6c63ff" }}
            onClick={() => setView("words")}
          >
            Ver vocabulario
          </button>
        </div>
      )}

      {/* ── settings view ── */}
      {view === "settings" && (
        <div style={styles.settingsContainer}>
          <h3 style={styles.settingsTitle}>Notificaciones diarias</h3>

          {/* iOS PWA tip */}
          <div style={styles.iosTip}>
            <strong>📱 iPhone:</strong> Para recibir notificaciones, primero{" "}
            <strong>guarda esta app en tu pantalla de inicio</strong>:
            <ol style={styles.iosList}>
              <li>Abre esta página en Safari</li>
              <li>Toca el botón Compartir ↑</li>
              <li>Selecciona "Añadir a pantalla de inicio"</li>
              <li>Abre la app desde el icono creado</li>
              <li>Activa las notificaciones aquí abajo</li>
            </ol>
            <em style={{ fontSize: 12, color: "#888" }}>
              Requiere iOS 16.4 o superior.
            </em>
          </div>

          <div style={styles.settingsRow}>
            <label style={styles.settingsLabel}>Hora de la notificación</label>
            <input
              type="time"
              value={notifTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              style={styles.timeInput}
            />
          </div>

          <div style={styles.settingsRow}>
            <label style={styles.settingsLabel}>Estado</label>
            <span
              style={{
                ...styles.statusBadge,
                background:
                  notifPermission === "granted"
                    ? "#c8f7c5"
                    : notifPermission === "denied"
                    ? "#ffd3d3"
                    : "#fff3cd",
              }}
            >
              {notifPermission === "granted"
                ? "✅ Activadas"
                : notifPermission === "denied"
                ? "❌ Bloqueadas"
                : notifPermission === "unsupported"
                ? "⚠️ No soportado"
                : "⏳ Sin respuesta"}
            </span>
          </div>

          {notifPermission !== "granted" && notifPermission !== "denied" && notifPermission !== "unsupported" && (
            <button style={styles.enableBtn} onClick={handleEnableNotifs}>
              Activar notificaciones
            </button>
          )}

          {notifPermission === "denied" && (
            <p style={styles.deniedMsg}>
              Has bloqueado las notificaciones. Para habilitarlas, ve a{" "}
              <strong>Ajustes del navegador → Notificaciones</strong> y permite
              este sitio.
            </p>
          )}

          {notifPermission === "granted" && (
            <div>
              <div style={styles.settingsRow}>
                <label style={styles.settingsLabel}>Notificaciones</label>
                <label style={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={notifEnabled}
                    onChange={(e) => {
                      setNotifEnabled(e.target.checked);
                      localStorage.setItem(
                        STORAGE_KEYS.notifEnabled,
                        String(e.target.checked)
                      );
                    }}
                  />
                  <span style={styles.toggleSlider} />
                </label>
              </div>
              <button
                style={styles.testBtn}
                onClick={() => sendNotif(todaySet.words, dayIdx)}
              >
                Enviar notificación de prueba ahora
              </button>
            </div>
          )}

          {/* summary */}
          <div style={styles.summaryGrid}>
            {GRE_VOCAB_SETS.map((set) => (
              <div
                key={set.day}
                style={{
                  ...styles.summaryCell,
                  background:
                    scores[set.day - 1] !== undefined
                      ? scores[set.day - 1] >= 5
                        ? "#c8f7c5"
                        : "#fff3cd"
                      : set.day - 1 <= dayIdx
                      ? "#e8e0ff"
                      : "#f0f0f0",
                }}
                title={
                  scores[set.day - 1] !== undefined
                    ? `Día ${set.day}: ${scores[set.day - 1]}/7`
                    : `Día ${set.day}`
                }
              >
                {set.day}
              </div>
            ))}
          </div>
          <p style={styles.legendText}>
            🟣 Visto · 🟡 Quiz &lt; 5 · 🟢 Quiz ≥ 5 · ⬜ Pendiente
          </p>
        </div>
      )}

      <p style={styles.startDateNote}>
        Inicio: {startDate} · GRE en{" "}
        {Math.max(0, 21 - getDayIndex())} días
      </p>
    </div>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "16px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#1a1a2e",
  },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 700, margin: "0 0 10px 0" },
  progress: { display: "flex", flexDirection: "column", gap: 4 },
  progressBar: {
    height: 8,
    background: "#e0e0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg,#6c63ff,#48c774)",
    borderRadius: 4,
    transition: "width .4s",
  },
  progressText: { fontSize: 12, color: "#666" },
  dayNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  navBtn: {
    background: "#f0eeff",
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: 13,
    color: "#6c63ff",
    fontWeight: 600,
  },
  dayLabel: { fontWeight: 700, fontSize: 15 },
  tabBar: { display: "flex", gap: 8, marginBottom: 16 },
  tab: {
    flex: 1,
    padding: "8px 0",
    border: "none",
    borderRadius: 8,
    background: "#f0eeff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: "#6c63ff",
  },
  tabActive: { background: "#6c63ff", color: "#fff" },
  revealAllRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  revealAllBtn: {
    background: "none",
    border: "1px solid #6c63ff",
    borderRadius: 8,
    padding: "4px 12px",
    cursor: "pointer",
    fontSize: 13,
    color: "#6c63ff",
  },
  scoreBadge: {
    background: "#e8e0ff",
    borderRadius: 8,
    padding: "4px 10px",
    fontSize: 13,
    fontWeight: 600,
    color: "#6c63ff",
  },
  card: {
    background: "#fff",
    border: "1px solid #e8e0ff",
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: 10,
    boxShadow: "0 1px 4px rgba(108,99,255,.08)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  wordText: { fontSize: 18, fontWeight: 700, color: "#3d35a8" },
  pos: {
    fontSize: 11,
    background: "#e8e0ff",
    borderRadius: 6,
    padding: "2px 7px",
    color: "#6c63ff",
    fontWeight: 600,
  },
  definition: { margin: "4px 0", fontSize: 14, color: "#333" },
  example: { margin: 0, fontSize: 13, color: "#666" },
  revealBtn: {
    background: "#6c63ff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "6px 16px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    marginTop: 4,
  },
  quizContainer: { padding: "8px 0" },
  quizProgress: { fontSize: 12, color: "#888", margin: "0 0 8px 0" },
  quizWord: { fontSize: 26, fontWeight: 800, color: "#3d35a8", margin: "0 0 4px 0" },
  quizInstruction: { fontSize: 13, color: "#666", margin: "0 0 14px 0" },
  optionsGrid: { display: "flex", flexDirection: "column", gap: 8 },
  optionBtn: {
    border: "1px solid #e0d8ff",
    borderRadius: 10,
    padding: "12px 14px",
    cursor: "pointer",
    fontSize: 14,
    textAlign: "left",
    transition: "background .2s",
  },
  nextBtn: {
    marginTop: 14,
    background: "#6c63ff",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 24px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  resultContainer: {
    textAlign: "center",
    padding: "24px 0",
  },
  resultEmoji: { fontSize: 56, marginBottom: 8 },
  resultTitle: { fontSize: 24, fontWeight: 800, margin: "0 0 8px 0" },
  resultMsg: { color: "#555", marginBottom: 20 },
  retryBtn: {
    display: "block",
    width: "100%",
    background: "#48c774",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 10,
  },
  settingsContainer: { padding: "4px 0" },
  settingsTitle: { fontSize: 17, fontWeight: 700, margin: "0 0 12px 0" },
  iosTip: {
    background: "#fff8e1",
    border: "1px solid #ffe082",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 1.6,
  },
  iosList: { paddingLeft: 18, margin: "8px 0" },
  settingsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  settingsLabel: { fontSize: 14, fontWeight: 600 },
  timeInput: {
    border: "1px solid #d0c8ff",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 15,
    color: "#3d35a8",
  },
  statusBadge: {
    borderRadius: 8,
    padding: "4px 10px",
    fontSize: 13,
    fontWeight: 600,
  },
  enableBtn: {
    width: "100%",
    background: "#6c63ff",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 14,
  },
  deniedMsg: {
    background: "#fff0f0",
    border: "1px solid #ffcdd2",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13,
    color: "#c62828",
  },
  testBtn: {
    width: "100%",
    background: "#00b4d8",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 4,
    marginBottom: 14,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
    marginTop: 16,
    marginBottom: 6,
  },
  summaryCell: {
    borderRadius: 6,
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#444",
  },
  legendText: { fontSize: 11, color: "#888", margin: 0 },
  startDateNote: {
    fontSize: 11,
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
  toggle: {
    position: "relative",
    display: "inline-block",
    width: 44,
    height: 24,
  },
  toggleSlider: {
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "#ccc",
    borderRadius: 24,
    transition: ".3s",
  },
};
