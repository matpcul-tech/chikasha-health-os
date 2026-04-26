import { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from "react";

/* ==========================================================================
   TABS
   ========================================================================== */

const TABS = [
  { id: "overview", label: "Overview", icon: "◉" },
  { id: "risk", label: "Risk", icon: "⚡" },
  { id: "biomarkers", label: "Biomarkers", icon: "🔬" },
  { id: "wearables", label: "Wearables", icon: "⌚" },
  { id: "coach", label: "AI Coach", icon: "🪶" },
  { id: "care", label: "Care", icon: "✚" },
  { id: "nutrition", label: "Nutrition", icon: "🌽" },
  { id: "wellness", label: "Wellness", icon: "🌿" },
  { id: "telehealth", label: "Telehealth", icon: "📡" },
  { id: "shield", label: "Shield", icon: "🛡" },
];

const C = {
  bg: "#0A0A0F",
  surface: "#0f0f1a",
  surface2: "#111119",
  line: "#1e1e2e",
  line2: "#1a1a2e",
  text: "#E8E4DD",
  textDim: "#aaa",
  textFaint: "#666",
  brand: "#C45A3C",
  brandDeep: "#8B2E1A",
  teal: "#2D7A6F",
  green: "#4ADE80",
  gold: "#8B6914",
  amber: "#E8A84A",
  red: "#E85D4A",
  crit: "#FF3333",
  violet: "#6B4C8A",
  shield: "#5BA3D0",
};

/* ==========================================================================
   ELDER MODE CONTEXT
   Scales font, padding, and touch targets across the entire app.
   Persists to localStorage. Sets data-elder on <html>.
   ========================================================================== */

const ElderCtx = createContext(null);

function ElderProvider({ children }) {
  const [elder, setElder] = useState(() => {
    try { return localStorage.getItem("shos-elder") === "1"; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-elder", elder ? "true" : "false");
    try { localStorage.setItem("shos-elder", elder ? "1" : "0"); } catch {}
  }, [elder]);

  const value = useMemo(() => {
    const factor = elder ? 1.28 : 1;
    const s = (n) => Math.round(n * factor);
    const touch = elder ? 56 : 44;
    return { elder, setElder, s, touch, factor };
  }, [elder]);

  return <ElderCtx.Provider value={value}>{children}</ElderCtx.Provider>;
}

function useElder() {
  const ctx = useContext(ElderCtx);
  if (!ctx) throw new Error("useElder outside provider");
  return ctx;
}

/* ==========================================================================
   UI PRIMITIVES
   ========================================================================== */

function Card({ title, accent, children, padded = true, right = null }) {
  const { s } = useElder();
  return (
    <div className="fade-in" style={{
      background: C.surface,
      border: `1px solid ${C.line}`,
      borderRadius: s(14),
      padding: padded ? s(20) : 0,
      marginBottom: s(14),
    }}>
      {(title || right) && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: s(10),
          marginBottom: s(14),
          flexWrap: "wrap",
        }}>
          {title && (
            <div style={{
              fontSize: s(13),
              fontWeight: 700,
              color: accent || C.brand,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}>{title}</div>
          )}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

function Stat({ value, label, color, sub, flex = "1 1 130px" }) {
  const { s } = useElder();
  return (
    <div style={{
      background: C.surface2,
      border: `1px solid ${C.line}`,
      borderRadius: s(12),
      padding: `${s(16)}px ${s(12)}px`,
      textAlign: "center",
      flex,
      minWidth: s(120),
    }}>
      <div style={{ fontSize: s(26), fontWeight: 800, color, fontFamily: "'Playfair Display',serif", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: s(11), color: C.textDim, marginTop: s(4), fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: s(10), color: C.textFaint, marginTop: s(2) }}>{sub}</div>}
    </div>
  );
}

function Bar({ value, max = 1, color, delay = 0, label, sublabel }) {
  const { s } = useElder();
  const [w, setW] = useState(0);
  const pct = Math.max(0, Math.min(1, value / max));
  useEffect(() => {
    const t = setTimeout(() => setW(pct * 100), 200 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ marginBottom: s(12) }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: s(12), marginBottom: s(4), gap: s(8) }}>
        <span style={{ color: C.textDim }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{sublabel || `${Math.round(pct * 100)}%`}</span>
      </div>
      <div style={{ height: s(8), background: C.line2, borderRadius: s(4), overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${w}%`,
          background: color,
          borderRadius: s(4),
          transition: "width 1s cubic-bezier(.4,0,.2,1)",
        }} />
      </div>
    </div>
  );
}

function Pill({ children, color = C.green, dim = false, dot = true, pulse = false }) {
  const { s } = useElder();
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: s(6),
      padding: `${s(4)}px ${s(10)}px`,
      borderRadius: 999,
      fontSize: s(11),
      fontWeight: 700,
      color: dim ? C.textDim : color,
      background: dim ? C.line2 : `${color}1a`,
      border: `1px solid ${dim ? C.line : color + "40"}`,
      whiteSpace: "nowrap",
    }}>
      {dot && <span className={pulse ? "pulse" : ""} style={{ width: s(6), height: s(6), borderRadius: "50%", background: color, display: "inline-block" }} />}
      {children}
    </span>
  );
}

function Trend({ delta, suffix = "%", invert = false }) {
  const { s } = useElder();
  if (delta === undefined || delta === null) return null;
  const up = delta > 0;
  const flat = delta === 0;
  const goodWhenUp = invert;
  const color = flat ? C.textFaint : ((up && goodWhenUp) || (!up && !goodWhenUp)) ? C.green : C.red;
  const arrow = flat ? "→" : up ? "↑" : "↓";
  return (
    <span style={{ color, fontSize: s(11), fontWeight: 700, display: "inline-flex", alignItems: "center", gap: s(2) }}>
      {arrow} {Math.abs(delta)}{suffix}
    </span>
  );
}

function Sparkline({ data, color = C.teal, w = 80, h = 22 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Btn({ onClick, disabled, children, variant = "primary", full = false, ariaLabel, type = "button" }) {
  const { s, touch } = useElder();
  const styles = {
    primary: { background: disabled ? "#2a2a3a" : `linear-gradient(135deg, ${C.brand}, ${C.brandDeep})`, color: "#fff", border: "none" },
    ghost: { background: "transparent", color: C.text, border: `1px solid ${C.line}` },
    teal: { background: disabled ? "#2a2a3a" : C.teal, color: "#fff", border: "none" },
    danger: { background: C.red, color: "#fff", border: "none" },
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        ...styles,
        borderRadius: s(10),
        padding: `${s(10)}px ${s(18)}px`,
        fontSize: s(14),
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        width: full ? "100%" : "auto",
        minHeight: touch,
        opacity: disabled ? 0.7 : 1,
        transition: "transform 0.15s, opacity 0.2s",
      }}
    >{children}</button>
  );
}

function Row({ children, gap = 12, wrap = true, align = "stretch", justify = "flex-start" }) {
  const { s } = useElder();
  return (
    <div style={{
      display: "flex",
      gap: s(gap),
      flexWrap: wrap ? "wrap" : "nowrap",
      alignItems: align,
      justifyContent: justify,
      marginBottom: s(14),
    }}>{children}</div>
  );
}


/* ==========================================================================
   SOVEREIGN PROMPT SHIELD
   Every AI query passes through shieldIntercept(). PHI is detected by
   pattern matching, hashed to a SHA-256 truncated token, replaced in the
   outgoing prompt, and logged to the live audit. The audit feed is shown
   in the Shield tab and a counter in the header.
   ========================================================================== */

const PHI_PATTERNS = [
  { id: "ssn", label: "SSN", re: () => /\b\d{3}-\d{2}-\d{4}\b/g },
  { id: "ssn9", label: "SSN", re: () => /(?<!\d)\d{9}(?!\d)/g },
  { id: "phone", label: "PHONE", re: () => /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g },
  { id: "email", label: "EMAIL", re: () => /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  { id: "dob", label: "DOB", re: () => /\b(?:0?[1-9]|1[0-2])[\/\-](?:0?[1-9]|[12]\d|3[01])[\/\-](?:19|20)\d{2}\b/g },
  { id: "mrn", label: "MRN", re: () => /\b(?:MRN[:#\s]*|MR[:#\s]*|MED[#\s]*)\d{5,10}\b/gi },
  { id: "addr", label: "ADDRESS", re: () => /\b\d{1,5}\s+[A-Z][A-Za-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl)\b/g },
  { id: "name", label: "NAME", re: () => /\b(?:Mr|Mrs|Ms|Miss|Dr|Mister)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g },
  { id: "card", label: "CARD", re: () => /\b(?:\d{4}[-\s]?){3}\d{4}\b/g },
  { id: "ip", label: "IP", re: () => /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
];

async function hashToken(text) {
  try {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    return hex.slice(0, 12);
  } catch {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = ((h << 5) - h) + text.charCodeAt(i) | 0;
    return Math.abs(h).toString(16).padStart(8, "0").slice(0, 12);
  }
}

function scanForPHI(text) {
  const findings = [];
  const seen = new Set();
  for (const p of PHI_PATTERNS) {
    const re = p.re();
    let m;
    while ((m = re.exec(text)) !== null) {
      const raw = m[0];
      const key = `${p.label}:${raw}`;
      if (seen.has(key)) continue;
      seen.add(key);
      findings.push({ type: p.label, raw });
    }
  }
  return findings;
}

async function shieldScan(prompt) {
  const findings = scanForPHI(prompt);
  let redacted = prompt;
  const tokens = [];
  for (const f of findings) {
    const h = await hashToken(f.raw);
    const tag = `[${f.type}:${h}]`;
    redacted = redacted.split(f.raw).join(tag);
    tokens.push({ type: f.type, hash: h, length: f.raw.length });
  }
  return { redacted, tokens, timestamp: Date.now(), detected: tokens.length };
}

const ShieldCtx = createContext(null);

function ShieldProvider({ children }) {
  const [audit, setAudit] = useState([]);
  const [stats, setStats] = useState({ scanned: 0, redactions: 0 });

  const intercept = useCallback(async (prompt, source = "ai-coach") => {
    const result = await shieldScan(prompt);
    const fingerprint = await hashToken(result.redacted);
    const entry = {
      id: `${result.timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      ts: result.timestamp,
      source,
      length: prompt.length,
      detected: result.detected,
      tokens: result.tokens,
      fingerprint,
    };
    setAudit(prev => [entry, ...prev].slice(0, 250));
    setStats(prev => ({ scanned: prev.scanned + 1, redactions: prev.redactions + result.detected }));
    return result;
  }, []);

  const logSystemEvent = useCallback(async (label, source = "system") => {
    const fingerprint = await hashToken(label + Date.now());
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(),
      source,
      length: label.length,
      detected: 0,
      tokens: [],
      fingerprint,
      label,
    };
    setAudit(prev => [entry, ...prev].slice(0, 250));
  }, []);

  const value = useMemo(() => ({ audit, stats, intercept, logSystemEvent }), [audit, stats, intercept, logSystemEvent]);

  return <ShieldCtx.Provider value={value}>{children}</ShieldCtx.Provider>;
}

function useShield() {
  const ctx = useContext(ShieldCtx);
  if (!ctx) throw new Error("useShield outside provider");
  return ctx;
}

/* ==========================================================================
   HEALTH RING
   Animated SVG ring that fills to a target percent. Animates on mount
   and whenever the score prop changes.
   ========================================================================== */

function HealthRing({ score, label = "Health Score", size = 180, stroke = 12, color }) {
  const { s, elder } = useElder();
  const sz = elder ? size + 28 : size;
  const r = (sz - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const target = Math.max(0, Math.min(100, score));
  const ringColor = color || (target >= 75 ? C.green : target >= 50 ? C.amber : target >= 30 ? C.red : C.crit);

  const [drawn, setDrawn] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = target;
    const duration = 1100;
    const t0 = performance.now();
    let raf;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDrawn(start + (end - start) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
      else prevRef.current = end;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const offset = circ * (1 - drawn / 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: s(8) }}>
      <div style={{ position: "relative", width: sz, height: sz }}>
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ transform: "rotate(-90deg)" }} aria-label={`${label} ${Math.round(target)} of 100`}>
          <circle cx={sz / 2} cy={sz / 2} r={r} stroke={C.line} strokeWidth={stroke} fill="none" />
          <circle
            cx={sz / 2}
            cy={sz / 2}
            r={r}
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 6px ${ringColor}66)` }}
          />
        </svg>
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: s(44), fontWeight: 800, color: ringColor, lineHeight: 1 }}>{Math.round(drawn)}</div>
          <div style={{ fontSize: s(10), color: C.textDim, letterSpacing: 1, textTransform: "uppercase", marginTop: s(4) }}>{label}</div>
        </div>
      </div>
    </div>
  );
}


/* ==========================================================================
   OVERVIEW TAB
   ========================================================================== */

const DOMAIN_TRENDS = [
  { name: "Cardiovascular", score: 72, delta: -3, trend: [78, 76, 75, 75, 73, 72, 72], color: C.amber },
  { name: "Metabolic", score: 64, delta: -5, trend: [72, 70, 69, 68, 66, 65, 64], color: C.amber },
  { name: "Mental", score: 81, delta: 2, trend: [78, 79, 79, 80, 80, 81, 81], color: C.green },
  { name: "Renal", score: 88, delta: 0, trend: [88, 87, 88, 88, 88, 88, 88], color: C.green },
  { name: "Respiratory", score: 92, delta: 1, trend: [90, 91, 91, 91, 92, 92, 92], color: C.green },
  { name: "Oncology Risk", score: 79, delta: -1, trend: [80, 80, 80, 79, 79, 79, 79], color: C.green },
];

function Overview({ goto }) {
  const { s } = useElder();
  const overall = Math.round(DOMAIN_TRENDS.reduce((a, d) => a + d.score, 0) / DOMAIN_TRENDS.length);

  return (
    <div>
      <Card title="Citizen Health Snapshot" accent={C.brand} right={<Pill color={C.green} pulse>Live</Pill>}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: s(20), alignItems: "center", justifyContent: "center" }}>
          <HealthRing score={overall} label="Composite Score" />
          <div style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: s(10) }}>
            <Row gap={10}>
              <Stat value="28,500" label="Enrolled Citizens" color={C.brand} sub="Active in system" />
              <Stat value="156" label="Early Detections" color={C.green} sub="This quarter" />
            </Row>
            <Row gap={10}>
              <Stat value="62.4" label="Avg Longevity" color={C.teal} sub="Population" />
              <Stat value="$4.2M" label="Cost Avoidance" color={C.gold} sub="Year to date" />
            </Row>
          </div>
        </div>
      </Card>

      <Card title="Six Domain Trends" accent={C.teal} right={<span style={{ fontSize: s(11), color: C.textFaint }}>Last 7 days</span>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: s(10) }}>
          {DOMAIN_TRENDS.map((d, i) => (
            <div key={i} style={{
              background: C.surface2,
              border: `1px solid ${C.line}`,
              borderRadius: s(10),
              padding: s(12),
              display: "flex",
              flexDirection: "column",
              gap: s(6),
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: s(8) }}>
                <span style={{ fontSize: s(12), color: C.textDim }}>{d.name}</span>
                <Trend delta={d.delta} suffix="" invert />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: s(10) }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: s(24), fontWeight: 800, color: d.color }}>{d.score}</div>
                <Sparkline data={d.trend} color={d.color} w={90} h={26} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Active Alerts" accent={C.amber}>
        {[
          { sev: "high", color: C.red, label: "HbA1c trending up", detail: "Last 90 days, schedule metabolic panel" },
          { sev: "med", color: C.amber, label: "Vitamin D below 30 ng/mL", detail: "Consider 5000 IU daily supplementation" },
          { sev: "low", color: C.green, label: "Sleep quality improving", detail: "HRV up 12 percent over 30 days" },
        ].map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: s(12), padding: `${s(10)}px 0`, borderBottom: i < 2 ? `1px solid ${C.line2}` : "none" }}>
            <span style={{ width: s(8), height: s(8), borderRadius: "50%", background: a.color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: s(13), color: C.text, fontWeight: 600 }}>{a.label}</div>
              <div style={{ fontSize: s(11), color: C.textFaint }}>{a.detail}</div>
            </div>
          </div>
        ))}
      </Card>

      <Card title="System Status" accent={C.green}>
        {[
          { name: "Sovereign Prompt Shield", status: "Active", color: C.shield },
          { name: "Risk Assessment Engine", status: "Operational", color: C.green },
          { name: "Biomarker Analyzer", status: "Operational", color: C.green },
          { name: "AI Coach", status: "Operational", color: C.green },
          { name: "Wearable Sync Layer", status: "4 of 4 connected", color: C.green },
          { name: "Telehealth Platform", status: "Operational", color: C.green },
          { name: "Trace Fiber Network", status: "100 Gbps", color: C.teal },
        ].map((s_, i, arr) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${s(8)}px 0`, borderBottom: i < arr.length - 1 ? `1px solid ${C.line2}` : "none", gap: s(10) }}>
            <span style={{ fontSize: s(13), color: C.text }}>{s_.name}</span>
            <Pill color={s_.color} pulse={s_.status === "Active"}>{s_.status}</Pill>
          </div>
        ))}
      </Card>

      <Card title="Quick Actions" accent={C.brand}>
        <Row gap={10}>
          <Btn full onClick={() => goto("coach")}>🪶 Talk to AI Coach</Btn>
          <Btn full variant="teal" onClick={() => goto("risk")}>⚡ Run Risk Assessment</Btn>
        </Row>
        <Row gap={10}>
          <Btn full variant="ghost" onClick={() => goto("wearables")}>⌚ Check Wearables</Btn>
          <Btn full variant="ghost" onClick={() => goto("shield")}>🛡 Open Shield Audit</Btn>
        </Row>
      </Card>
    </div>
  );
}

/* ==========================================================================
   RISK ENGINE TAB
   ========================================================================== */

function RiskEngine() {
  const { s } = useElder();
  const { logSystemEvent } = useShield();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!running) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setDone(true);
          setRunning(false);
          logSystemEvent("Risk assessment completed", "risk-engine");
          return 100;
        }
        return p + 4;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [running, logSystemEvent]);

  const domains = [
    { name: "Cardiovascular", score: 0.72, delta: 4, color: C.red, drivers: ["BP 142/91", "LDL 142", "Family history"] },
    { name: "Metabolic", score: 0.81, delta: 6, color: C.red, drivers: ["HbA1c 7.1", "BMI 31.2", "Fasting glucose 126"] },
    { name: "Oncology", score: 0.28, delta: -2, color: C.green, drivers: ["No first degree", "Screenings current"] },
    { name: "Mental Health", score: 0.44, delta: 0, color: C.amber, drivers: ["PHQ-9 mild", "Cultural connection moderate"] },
    { name: "Respiratory", score: 0.15, delta: -1, color: C.green, drivers: ["No smoking history", "FEV1 normal"] },
    { name: "Renal", score: 0.58, delta: 3, color: C.amber, drivers: ["eGFR 82", "CRP 3.8 elevated"] },
  ];

  return (
    <div>
      <Card title="Patient: Citizen Demo 001" accent={C.brand}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: s(10), fontSize: s(13), color: C.textDim, marginBottom: s(16) }}>
          <div>Age <strong style={{ color: C.text }}>52</strong></div>
          <div>Sex <strong style={{ color: C.text }}>Male</strong></div>
          <div>BMI <strong style={{ color: C.amber }}>31.2</strong></div>
          <div>BP <strong style={{ color: C.red }}>142/91</strong></div>
          <div>Conditions <strong style={{ color: C.red }}>T2D, HTN</strong></div>
          <div>Family Hx <strong style={{ color: C.amber }}>CVD, T2D</strong></div>
        </div>
        {!done && (
          <>
            <Btn full onClick={() => setRunning(true)} disabled={running}>
              {running ? `Running AI Risk Assessment ${progress}%` : "⚡ Run Risk Assessment"}
            </Btn>
            {running && (
              <div style={{ marginTop: s(12), height: s(6), background: C.line2, borderRadius: s(3), overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${C.brand}, ${C.amber})`, transition: "width 0.1s linear" }} />
              </div>
            )}
          </>
        )}
        {done && (
          <Btn full variant="ghost" onClick={() => { setDone(false); setProgress(0); }}>Re-run assessment</Btn>
        )}
      </Card>

      {done && (
        <>
          <Row gap={10}>
            <Stat value="67.2%" label="Overall Risk" color={C.red} sub="HIGH" />
            <Stat value="$20,000" label="Projected Cost" color={C.amber} sub="No intervention" />
            <Stat value="$11,300" label="Preventable" color={C.green} sub="With early care" />
          </Row>

          <Card title="Six Domain Risk Scores" accent={C.red}>
            {domains.map((d, i) => (
              <div key={i} style={{ marginBottom: s(14) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: s(6), gap: s(8), flexWrap: "wrap" }}>
                  <span style={{ fontSize: s(13), color: C.text, fontWeight: 600 }}>{d.name}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: s(8) }}>
                    <span style={{ color: d.color, fontWeight: 700, fontSize: s(13) }}>{Math.round(d.score * 100)}%</span>
                    <Trend delta={d.delta} />
                  </span>
                </div>
                <div style={{ height: s(8), background: C.line2, borderRadius: s(4), overflow: "hidden", marginBottom: s(6) }}>
                  <div style={{ height: "100%", width: `${d.score * 100}%`, background: d.color, borderRadius: s(4), transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
                </div>
                <div style={{ fontSize: s(11), color: C.textFaint }}>Drivers: {d.drivers.join(", ")}</div>
              </div>
            ))}
          </Card>

          <Card title="AI Recommendations" accent={C.green}>
            {[
              "Schedule comprehensive metabolic panel within 2 weeks",
              "Enroll in Diabetes Prevention Program",
              "Cardiac screening with AI assisted imaging",
              "Begin home blood pressure monitoring",
              "Nutritionist consult, integrate traditional Chickasaw foods",
              "Kidney function panel: eGFR plus albumin",
              "Annual full body AI health scan",
            ].map((r, i) => (
              <div key={i} style={{ padding: `${s(6)}px 0`, fontSize: s(13), color: C.text, display: "flex", gap: s(8) }}>
                <span style={{ color: C.green, flexShrink: 0 }}>→</span> {r}
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}

/* ==========================================================================
   BIOMARKERS TAB
   ========================================================================== */

const BIOMARKERS = [
  { name: "Glucose (Fasting)", value: 126, unit: "mg/dL", status: "abnormal", optimal: "72 to 90", history: [118, 121, 119, 124, 125, 128, 126], delta: 2 },
  { name: "HbA1c", value: 7.1, unit: "%", status: "abnormal", optimal: "4.0 to 5.4", history: [6.6, 6.7, 6.9, 7.0, 7.0, 7.1, 7.1], delta: 1 },
  { name: "Total Cholesterol", value: 215, unit: "mg/dL", status: "borderline", optimal: "150 to 190", history: [222, 220, 218, 217, 216, 215, 215], delta: -1 },
  { name: "LDL", value: 142, unit: "mg/dL", status: "abnormal", optimal: "40 to 80", history: [148, 146, 145, 144, 143, 142, 142], delta: -1 },
  { name: "HDL", value: 38, unit: "mg/dL", status: "abnormal", optimal: "50 to 90", history: [36, 36, 37, 37, 38, 38, 38], delta: 1 },
  { name: "Triglycerides", value: 188, unit: "mg/dL", status: "abnormal", optimal: "40 to 100", history: [195, 192, 190, 189, 188, 188, 188], delta: -1 },
  { name: "Creatinine", value: 1.1, unit: "mg/dL", status: "normal", optimal: "0.7 to 1.1", history: [1.0, 1.0, 1.1, 1.1, 1.1, 1.1, 1.1], delta: 0 },
  { name: "eGFR", value: 82, unit: "mL/min", status: "borderline", optimal: "90 to 120", history: [85, 84, 84, 83, 82, 82, 82], delta: -1 },
  { name: "CRP (hs)", value: 3.8, unit: "mg/L", status: "abnormal", optimal: "0 to 1.0", history: [4.1, 4.0, 3.9, 3.9, 3.8, 3.8, 3.8], delta: -1 },
  { name: "TSH", value: 2.1, unit: "mIU/L", status: "optimal", optimal: "1.0 to 2.5", history: [2.0, 2.0, 2.1, 2.1, 2.1, 2.1, 2.1], delta: 0 },
  { name: "Vitamin D", value: 22, unit: "ng/mL", status: "abnormal", optimal: "40 to 70", history: [18, 19, 20, 21, 21, 22, 22], delta: 4 },
  { name: "Vitamin B12", value: 380, unit: "pg/mL", status: "borderline", optimal: "400 to 800", history: [360, 365, 370, 375, 378, 380, 380], delta: 2 },
];

const STATUS_COLOR = { optimal: C.green, normal: C.green, borderline: C.amber, abnormal: C.red, critical: C.crit };
const STATUS_ICON = { optimal: "●", normal: "●", borderline: "●", abnormal: "●", critical: "●" };

function Biomarkers() {
  const { s } = useElder();
  const counts = useMemo(() => {
    const out = { optimal: 0, normal: 0, borderline: 0, abnormal: 0, critical: 0 };
    BIOMARKERS.forEach(b => out[b.status]++);
    return out;
  }, []);

  return (
    <div>
      <Row gap={10}>
        <Stat value={`${counts.optimal + counts.normal}`} label="Normal or Optimal" color={C.green} />
        <Stat value={`${counts.borderline}`} label="Borderline" color={C.amber} />
        <Stat value={`${counts.abnormal}`} label="Abnormal" color={C.red} />
        <Stat value="C" label="Panel Grade" color={C.amber} sub="Some abnormalities" />
      </Row>

      <Card title="Comprehensive Panel With Trends" accent={C.teal} right={<span style={{ fontSize: s(11), color: C.textFaint }}>Last 7 readings</span>}>
        {BIOMARKERS.map((b, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            gap: s(10),
            padding: `${s(10)}px 0`,
            borderBottom: i < BIOMARKERS.length - 1 ? `1px solid ${C.line2}` : "none",
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: s(8), flex: "1 1 200px", minWidth: 0 }}>
              <span style={{ color: STATUS_COLOR[b.status], fontSize: s(14), flexShrink: 0 }}>{STATUS_ICON[b.status]}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: s(13), color: C.text, fontWeight: 600 }}>{b.name}</div>
                <div style={{ fontSize: s(10), color: C.textFaint }}>Optimal {b.optimal}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: s(10) }}>
              <Sparkline data={b.history} color={STATUS_COLOR[b.status]} w={70} h={22} />
              <Trend delta={b.delta} suffix="" />
            </div>
            <div style={{ minWidth: s(80), textAlign: "right" }}>
              <div style={{ color: STATUS_COLOR[b.status], fontWeight: 700, fontFamily: "monospace", fontSize: s(13) }}>{b.value}</div>
              <div style={{ color: C.textFaint, fontSize: s(10) }}>{b.unit}</div>
            </div>
          </div>
        ))}
      </Card>

      <Card title="Optimization Potential" accent={C.green}>
        <div style={{ fontSize: s(13), color: C.text, lineHeight: 1.7 }}>
          <Pill color={C.amber}>HIGH POTENTIAL</Pill>
          <div style={{ marginTop: s(10) }}>
            Five biomarkers fall outside the optimal range. The Sovereign Health OS protocol library targets each one with combined nutrition, supplementation, and movement plans drawn from traditional Chickasaw food medicine and modern precision health.
          </div>
        </div>
      </Card>
    </div>
  );
}


/* ==========================================================================
   WEARABLES TAB
   ========================================================================== */

function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

const INITIAL_DEVICES = [
  {
    id: "watch",
    name: "Apple Watch Series 9",
    icon: "⌚",
    color: C.shield,
    status: "synced",
    lastSync: Date.now() - 12 * 1000,
    metrics: [
      { label: "Resting HR", value: "58", unit: "bpm", color: C.green },
      { label: "Steps", value: "8,412", unit: "today", color: C.teal },
      { label: "Active Cal", value: "412", unit: "kcal", color: C.gold },
      { label: "Sleep", value: "7h 12m", unit: "last night", color: C.violet },
    ],
  },
  {
    id: "oura",
    name: "Oura Ring Gen 4",
    icon: "◉",
    color: C.violet,
    status: "synced",
    lastSync: Date.now() - 3 * 60 * 1000,
    metrics: [
      { label: "HRV", value: "62", unit: "ms", color: C.green },
      { label: "Body Temp", value: "+0.2", unit: "°F dev", color: C.teal },
      { label: "Sleep Score", value: "84", unit: "of 100", color: C.green },
      { label: "Readiness", value: "78", unit: "of 100", color: C.amber },
    ],
  },
  {
    id: "dexcom",
    name: "Dexcom G7 CGM",
    icon: "◈",
    color: C.amber,
    status: "synced",
    lastSync: Date.now() - 4 * 60 * 1000,
    metrics: [
      { label: "Glucose", value: "138", unit: "mg/dL", color: C.amber },
      { label: "Trend", value: "↗ Rising", unit: "slow", color: C.amber },
      { label: "Time in Range", value: "62%", unit: "today", color: C.amber },
      { label: "Sensor Age", value: "Day 4", unit: "of 10", color: C.green },
    ],
  },
  {
    id: "bpm",
    name: "Withings BPM Connect",
    icon: "◐",
    color: C.red,
    status: "synced",
    lastSync: Date.now() - 22 * 60 * 60 * 1000,
    metrics: [
      { label: "Systolic", value: "142", unit: "mmHg", color: C.red },
      { label: "Diastolic", value: "91", unit: "mmHg", color: C.red },
      { label: "Pulse", value: "74", unit: "bpm", color: C.green },
      { label: "Last Reading", value: "Yesterday", unit: "8:14 PM", color: C.textDim },
    ],
  },
];

function Wearables() {
  const { s } = useElder();
  const { logSystemEvent } = useShield();
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [, force] = useState(0);

  useEffect(() => {
    const t = setInterval(() => force(x => x + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const resync = (id) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, status: "syncing" } : d));
    logSystemEvent(`Manual resync requested for ${id}`, "wearables");
    setTimeout(() => {
      setDevices(prev => prev.map(d => d.id === id ? { ...d, status: "synced", lastSync: Date.now() } : d));
      logSystemEvent(`Sync complete for ${id}`, "wearables");
    }, 1600);
  };

  const resyncAll = () => {
    devices.forEach(d => resync(d.id));
  };

  const allSynced = devices.every(d => d.status === "synced");
  const totalMetrics = devices.reduce((a, d) => a + d.metrics.length, 0);

  return (
    <div>
      <Row gap={10}>
        <Stat value={`${devices.length}`} label="Connected Devices" color={C.shield} sub="All on Trace Fiber" />
        <Stat value={`${totalMetrics}`} label="Live Metrics" color={C.teal} />
        <Stat value={allSynced ? "All Synced" : "Syncing"} label="Sync Status" color={allSynced ? C.green : C.amber} />
      </Row>

      <Card title="Connected Devices" accent={C.shield} right={<Btn variant="ghost" onClick={resyncAll}>↻ Sync All</Btn>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: s(12) }}>
          {devices.map(d => (
            <div key={d.id} style={{
              background: C.surface2,
              border: `1px solid ${C.line}`,
              borderRadius: s(12),
              padding: s(14),
              display: "flex",
              flexDirection: "column",
              gap: s(10),
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: s(10) }}>
                <div style={{
                  width: s(36),
                  height: s(36),
                  borderRadius: s(10),
                  background: `${d.color}1f`,
                  border: `1px solid ${d.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: s(18),
                  color: d.color,
                  flexShrink: 0,
                }}>{d.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: s(13), color: C.text, fontWeight: 700 }}>{d.name}</div>
                  <div style={{ fontSize: s(10), color: C.textFaint }}>Last sync {timeAgo(d.lastSync)}</div>
                </div>
                {d.status === "syncing" ? (
                  <Pill color={C.amber} pulse>Syncing</Pill>
                ) : d.status === "offline" ? (
                  <Pill color={C.red}>Offline</Pill>
                ) : (
                  <Pill color={C.green}>Synced</Pill>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: s(8) }}>
                {d.metrics.map((m, i) => (
                  <div key={i} style={{ background: C.surface, borderRadius: s(8), padding: s(10) }}>
                    <div style={{ fontSize: s(10), color: C.textFaint, textTransform: "uppercase", letterSpacing: 0.5 }}>{m.label}</div>
                    <div style={{ fontSize: s(16), fontWeight: 700, color: m.color, marginTop: s(2) }}>{m.value}</div>
                    <div style={{ fontSize: s(10), color: C.textFaint }}>{m.unit}</div>
                  </div>
                ))}
              </div>
              <Btn variant="ghost" full onClick={() => resync(d.id)} disabled={d.status === "syncing"}>
                {d.status === "syncing" ? "Syncing..." : "↻ Resync now"}
              </Btn>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Sovereignty Note" accent={C.brand}>
        <div style={{ fontSize: s(13), color: C.text, lineHeight: 1.7 }}>
          Wearable data flows over the Trace Fiber Network and is stored only on Chickasaw Nation infrastructure. No vendor cloud holds raw biometric data. Manufacturer apps see only an aggregated, hashed token via the Sovereign Prompt Shield bridge.
        </div>
      </Card>
    </div>
  );
}

/* ==========================================================================
   AI COACH TAB
   Every user message is intercepted by the Sovereign Prompt Shield before
   being delivered to the (mock) language model. The redacted prompt is
   what the model sees. The original is rendered in the chat to the user
   only. Audit entries are written live.
   ========================================================================== */

const COACH_GREETING = "Halito. I am the Sovereign Health Coach. I can answer questions about your biomarkers, care protocols, nutrition, and wellness. Every message you send is scanned and redacted by the Sovereign Prompt Shield before it ever leaves this device. Try asking about your blood sugar, your blood pressure, or a traditional Chickasaw food.";

function mockReply(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes("diabetes") || p.includes("a1c") || p.includes("glucose") || p.includes("blood sugar")) {
    return "Your most recent HbA1c is 7.1 percent and fasting glucose is 126 mg/dL. Both are above target. The Diabetes Prevention Protocol pairs a Three Sisters meal pattern with daily walking and a metformin discussion with your provider. Berberine 500 mg twice daily is a useful adjunct, talk to your provider first.";
  }
  if (p.includes("blood pressure") || p.includes("bp") || p.includes("hypertension")) {
    return "Your latest reading is 142 over 91, stage 2. The Cardio Protocol focuses on sodium reduction, daily walking, magnesium glycinate at bedtime, and breathwork. Home monitoring with the Withings BPM is recommended every morning before coffee.";
  }
  if (p.includes("cholesterol") || p.includes("ldl") || p.includes("hdl") || p.includes("triglyceride")) {
    return "LDL 142, HDL 38, triglycerides 188. The lipid pattern responds well to omega 3 fish oil, soluble fiber from beans and oats, and removing seed oils. Pecans, a traditional Chickasaw food, lower LDL when eaten daily.";
  }
  if (p.includes("food") || p.includes("eat") || p.includes("nutrition") || p.includes("meal") || p.includes("diet")) {
    return "Today the Sovereign Health OS recommends a Three Sisters Power Bowl for lunch: roasted squash, black beans, hominy, wild rice, avocado. Pashofa for breakfast with pecans. Venison stew for dinner. The plan is diabetes optimized at 1,700 kcal and 85 g protein.";
  }
  if (p.includes("sleep") || p.includes("hrv") || p.includes("oura")) {
    return "Your Oura sleep score is 84 and HRV 62 ms, both improving. Continue magnesium glycinate at bedtime and aim for a 60 minute screen free wind down. Your body temp deviation is +0.2, mild elevation, monitor for two more nights.";
  }
  if (p.includes("mental") || p.includes("anxiety") || p.includes("depression") || p.includes("phq")) {
    return "Your PHQ-9 is 8, mild range, and GAD-7 is 6. The Wellness Protocol pairs cultural connection with cognitive support. Stickball league participation, weekly elder mentorship, and Chikashshanompa language practice are all evidence based for this profile.";
  }
  if (p.includes("kidney") || p.includes("egfr") || p.includes("renal")) {
    return "eGFR 82, borderline. Hydrate well, avoid NSAIDs when possible, and continue blood pressure control. A repeat panel with albumin to creatinine ratio in 90 days is recommended.";
  }
  if (p.includes("shield") || p.includes("phi") || p.includes("privacy")) {
    return "The Sovereign Prompt Shield scans every message you send to me for protected health information. Detected items are hashed with SHA-256 and replaced with redacted tokens before the prompt is delivered. The audit log is visible on the Shield tab.";
  }
  return "I can help with biomarkers, risk domains, care protocols, nutrition, sleep, blood pressure, mental wellness, and Chickasaw cultural health practices. Ask a specific question and the Shield will keep your data on Nation infrastructure.";
}

function AICoach() {
  const { s, touch } = useElder();
  const { intercept } = useShield();
  const [messages, setMessages] = useState([
    { id: "g0", role: "ai", text: COACH_GREETING, ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    const userId = `u-${Date.now()}`;
    const shieldResult = await intercept(text, "ai-coach");
    setMessages(prev => [...prev, {
      id: userId,
      role: "user",
      text,
      redacted: shieldResult.redacted,
      detected: shieldResult.detected,
      ts: Date.now(),
    }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: "ai",
        text: mockReply(shieldResult.redacted),
        ts: Date.now(),
      }]);
      setThinking(false);
    }, 700 + Math.random() * 700);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div>
      <Card title="AI Coach" accent={C.brand} right={<Pill color={C.shield} pulse>Shield Active</Pill>}>
        <div ref={scrollRef} style={{
          background: C.bg,
          border: `1px solid ${C.line}`,
          borderRadius: s(12),
          padding: s(14),
          height: s(440),
          maxHeight: "55vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: s(10),
        }}>
          {messages.map(m => (
            <div key={m.id} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "88%",
              background: m.role === "user" ? `${C.brand}1f` : C.surface2,
              border: `1px solid ${m.role === "user" ? C.brand + "40" : C.line}`,
              borderRadius: s(12),
              padding: `${s(10)}px ${s(14)}px`,
              fontSize: s(14),
              color: C.text,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              <div>{m.text}</div>
              {m.role === "user" && m.detected > 0 && (
                <div style={{ marginTop: s(8), padding: `${s(6)}px ${s(8)}px`, background: `${C.shield}1a`, border: `1px dashed ${C.shield}66`, borderRadius: s(6), fontSize: s(10), color: C.shield, fontFamily: "monospace" }}>
                  Shield redacted {m.detected} item{m.detected === 1 ? "" : "s"}. Sent: {m.redacted}
                </div>
              )}
              {m.role === "user" && m.detected === 0 && (
                <div style={{ marginTop: s(6), fontSize: s(10), color: C.shield, fontFamily: "monospace" }}>Shield scanned, no PHI detected.</div>
              )}
            </div>
          ))}
          {thinking && (
            <div style={{ alignSelf: "flex-start", padding: `${s(8)}px ${s(14)}px`, color: C.textDim, fontSize: s(13), display: "flex", gap: s(6), alignItems: "center" }}>
              <span className="pulse" style={{ width: s(6), height: s(6), borderRadius: "50%", background: C.brand }} />
              Coach is thinking
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: s(8), marginTop: s(12) }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask about your biomarkers, care plan, or nutrition"
            aria-label="Message AI coach"
            style={{
              flex: 1,
              minHeight: touch,
              background: C.bg,
              border: `1px solid ${C.line}`,
              borderRadius: s(10),
              padding: `${s(10)}px ${s(14)}px`,
              fontSize: s(14),
              color: C.text,
              outline: "none",
            }}
          />
          <Btn onClick={send} disabled={!input.trim() || thinking}>Send</Btn>
        </div>

        <div style={{ marginTop: s(10), fontSize: s(11), color: C.textFaint, display: "flex", flexWrap: "wrap", gap: s(6) }}>
          {["What is my A1c trend?", "Recommend a meal for diabetes", "How is my blood pressure?", "What does the Shield do?"].map(q => (
            <button key={q} onClick={() => setInput(q)} style={{
              background: C.surface2,
              border: `1px solid ${C.line}`,
              borderRadius: s(999),
              padding: `${s(6)}px ${s(12)}px`,
              fontSize: s(11),
              color: C.textDim,
              cursor: "pointer",
              minHeight: 0,
            }}>{q}</button>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ==========================================================================
   CARE PROTOCOLS TAB
   ========================================================================== */

const CARE_PROTOCOLS = [
  {
    id: "dpp",
    name: "Diabetes Prevention Protocol",
    color: C.amber,
    progress: 42,
    weeks: "Week 11 of 26",
    adherence: 86,
    nextCheckin: "Tuesday 10:30 AM",
    pillars: [
      { name: "Three Sisters meal pattern", done: true },
      { name: "10,000 steps daily", done: true },
      { name: "Berberine 500 mg twice daily", done: false },
      { name: "Sleep 7+ hours", done: true },
      { name: "Quarterly HbA1c", done: false },
    ],
  },
  {
    id: "cardio",
    name: "Cardiovascular Care Protocol",
    color: C.red,
    progress: 28,
    weeks: "Week 4 of 14",
    adherence: 74,
    nextCheckin: "Friday 2:00 PM",
    pillars: [
      { name: "Home BP monitoring", done: true },
      { name: "Sodium under 1,500 mg", done: false },
      { name: "Magnesium glycinate at bedtime", done: true },
      { name: "Daily 30 min walk", done: true },
      { name: "Lipid panel in 90 days", done: false },
    ],
  },
  {
    id: "wellness",
    name: "Behavioral Wellness Protocol",
    color: C.violet,
    progress: 61,
    weeks: "Week 16 of 26",
    adherence: 92,
    nextCheckin: "Wednesday 6:00 PM",
    pillars: [
      { name: "Weekly tribal community activity", done: true },
      { name: "Monthly elder mentor session", done: true },
      { name: "Chikashshanompa daily 10 min", done: true },
      { name: "Stickball league", done: true },
      { name: "PHQ-9 quarterly", done: false },
    ],
  },
];

function CareProtocols() {
  const { s } = useElder();
  return (
    <div>
      <Row gap={10}>
        <Stat value={`${CARE_PROTOCOLS.length}`} label="Active Protocols" color={C.brand} />
        <Stat value={`${Math.round(CARE_PROTOCOLS.reduce((a, p) => a + p.adherence, 0) / CARE_PROTOCOLS.length)}%`} label="Avg Adherence" color={C.green} />
        <Stat value={`${Math.round(CARE_PROTOCOLS.reduce((a, p) => a + p.progress, 0) / CARE_PROTOCOLS.length)}%`} label="Avg Progress" color={C.teal} />
      </Row>

      {CARE_PROTOCOLS.map(p => (
        <Card key={p.id} title={p.name} accent={p.color} right={<Pill color={p.color}>{p.weeks}</Pill>}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: s(10), marginBottom: s(14) }}>
            <Stat value={`${p.progress}%`} label="Progress" color={p.color} />
            <Stat value={`${p.adherence}%`} label="Adherence" color={C.green} />
            <Stat value={p.nextCheckin} label="Next Check In" color={C.teal} />
          </div>
          <Bar value={p.progress} max={100} color={p.color} label="Protocol completion" sublabel={`${p.progress}%`} />
          <div style={{ marginTop: s(10) }}>
            {p.pillars.map((pl, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: s(10), padding: `${s(8)}px 0`, borderBottom: i < p.pillars.length - 1 ? `1px solid ${C.line2}` : "none" }}>
                <span style={{
                  width: s(20),
                  height: s(20),
                  borderRadius: s(6),
                  background: pl.done ? C.green : C.line2,
                  border: `1px solid ${pl.done ? C.green : C.line}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: s(12),
                  color: "#000",
                  flexShrink: 0,
                  fontWeight: 800,
                }}>{pl.done ? "✓" : ""}</span>
                <span style={{ fontSize: s(13), color: pl.done ? C.text : C.textDim, textDecoration: pl.done ? "none" : "none" }}>{pl.name}</span>
              </div>
            ))}
          </div>
          <Row gap={8}>
            <Btn variant="ghost" full>Open Plan Detail</Btn>
            <Btn variant="teal" full>Log Today</Btn>
          </Row>
        </Card>
      ))}
    </div>
  );
}


/* ==========================================================================
   NUTRITION TAB
   ========================================================================== */

const MEALS = [
  { type: "Breakfast", icon: "🌅", name: "Traditional Pashofa Bowl", desc: "Cracked corn porridge with pecans, wild berries, honey", cal: 420, protein: 12, cultural: "Pashofa is a sacred Chickasaw food" },
  { type: "Snack", icon: "🥣", name: "Bone Broth with Wild Onions", desc: "Warm bison bone broth with herbs", cal: 60, protein: 10, cultural: "Traditional healing food" },
  { type: "Lunch", icon: "☀️", name: "Three Sisters Power Bowl", desc: "Roasted squash, black beans, corn, wild rice, avocado", cal: 520, protein: 18, cultural: "Corn, beans, squash, traditional companion planting" },
  { type: "Snack", icon: "🌰", name: "Trail Mix (Traditional)", desc: "Pecans, hickory nuts, dried persimmons, pumpkin seeds", cal: 220, protein: 7, cultural: "Traditional travel food for Chickasaw journeys" },
  { type: "Dinner", icon: "🌙", name: "Venison Stew with Hominy", desc: "Slow cooked venison, root vegetables, wild greens", cal: 480, protein: 38, cultural: "Traditional Chickasaw stew, nourishing and healing" },
];

function Nutrition() {
  const { s } = useElder();
  return (
    <div>
      <Row gap={10}>
        <Stat value="1,700" label="Daily Calories" color={C.gold} sub="Diabetes optimized" />
        <Stat value="85g" label="Daily Protein" color={C.teal} />
        <Stat value="35g" label="Daily Fiber" color={C.green} />
        <Stat value="$95" label="Weekly Cost" color={C.brand} sub="Estimated" />
      </Row>

      <Card title="Today's Meal Plan: Diabetes and Heart Health" accent={C.gold}>
        {MEALS.map((m, i) => (
          <div key={i} style={{ padding: `${s(14)}px 0`, borderBottom: i < MEALS.length - 1 ? `1px solid ${C.line2}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: s(10), flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 220px" }}>
                <span style={{ fontSize: s(11), color: C.textFaint, textTransform: "uppercase", letterSpacing: 1 }}>{m.icon} {m.type}</span>
                <div style={{ fontSize: s(15), fontWeight: 700, color: C.text, marginTop: s(2) }}>{m.name}</div>
                <div style={{ fontSize: s(12), color: C.textFaint, marginTop: s(4) }}>{m.desc}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: s(15), fontWeight: 700, color: C.gold }}>{m.cal} cal</div>
                <div style={{ fontSize: s(11), color: C.textFaint }}>{m.protein}g protein</div>
              </div>
            </div>
            <div style={{ fontSize: s(11), color: C.brand, marginTop: s(8), display: "flex", alignItems: "center", gap: s(6) }}>
              <span>🪶</span> {m.cultural}
            </div>
          </div>
        ))}
      </Card>

      <Card title="Supplements Recommended" accent={C.teal}>
        {[
          "Vitamin D3 5000 IU daily, current level low at 22",
          "Omega 3 Fish Oil 2000 mg EPA and DHA combined",
          "Magnesium Glycinate 400 mg at bedtime",
          "Probiotic, multi strain, 50 billion CFU",
          "Berberine 500 mg twice daily, discuss with your provider",
        ].map((x, i) => (
          <div key={i} style={{ padding: `${s(6)}px 0`, fontSize: s(13), color: C.text, display: "flex", gap: s(8) }}>
            <span style={{ color: C.teal }}>●</span> {x}
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ==========================================================================
   WELLNESS TAB
   ========================================================================== */

function Wellness() {
  const { s } = useElder();
  const screenings = [
    { name: "Depression (PHQ-9)", score: 8, max: 27, level: "Mild", color: C.amber, isPositive: false },
    { name: "Anxiety (GAD-7)", score: 6, max: 21, level: "Mild", color: C.amber, isPositive: false },
    { name: "Cultural Connection", score: 16, max: 24, level: "Moderate", color: C.gold, isPositive: true },
    { name: "Social Wellness", score: 7, max: 9, level: "Good", color: C.green, isPositive: true },
  ];

  return (
    <div>
      <Row gap={10}>
        <Stat value="68.4" label="Wellness Score" color={C.teal} sub="Out of 100" />
        <Stat value="Mild" label="Overall Risk" color={C.amber} sub="Supportive care" />
        <Stat value="$5,000" label="Est. Savings" color={C.green} sub="Early intervention" />
      </Row>

      <Card title="Domain Assessments" accent={C.violet}>
        {screenings.map((d, i) => {
          const pct = d.isPositive ? d.score / d.max : 1 - d.score / d.max;
          return (
            <Bar key={i} value={pct} color={d.color} delay={i * 150} label={d.name} sublabel={`${d.score} of ${d.max}, ${d.level}`} />
          );
        })}
      </Card>

      <Card title="Cultural Wellness Plan" accent={C.brand}>
        {[
          "Weekly participation in at least one tribal community activity",
          "Monthly connection with an elder or cultural mentor",
          "Chickasaw language practice, even 10 minutes a day strengthens identity",
          "Seasonal participation in traditional food preparation",
          "Stickball, Kapucha Toli, community league for exercise plus belonging",
        ].map((x, i) => (
          <div key={i} style={{ padding: `${s(6)}px 0`, fontSize: s(13), color: C.text, display: "flex", gap: s(8) }}>
            <span style={{ color: C.brand }}>🪶</span> {x}
          </div>
        ))}
      </Card>

      <Card title="Cultural Resources" accent={C.gold}>
        {[
          "Chickasaw Nation Behavioral Health Services",
          "Elder mentorship program, connection to cultural wisdom",
          "Traditional storytelling circles for healing",
          "Chickasaw Cultural Center programs",
          "Language revitalization classes, Chikashshanompa",
        ].map((x, i) => (
          <div key={i} style={{ padding: `${s(6)}px 0`, fontSize: s(13), color: C.textDim, display: "flex", gap: s(8) }}>
            <span>→</span> {x}
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ==========================================================================
   TELEHEALTH TAB
   ========================================================================== */

function Telehealth() {
  const { s } = useElder();
  const { logSystemEvent } = useShield();
  const [booked, setBooked] = useState(null);

  const slots = [
    { id: "s1", time: "Today 3:30 PM", provider: "Dr. Eli Walker", type: "Primary Care", color: C.teal },
    { id: "s2", time: "Today 5:15 PM", provider: "Dr. Maya Tushka", type: "Behavioral Health", color: C.violet },
    { id: "s3", time: "Tomorrow 9:00 AM", provider: "Dr. Sam Pickens", type: "Endocrinology", color: C.amber },
    { id: "s4", time: "Tomorrow 11:45 AM", provider: "Dr. Eli Walker", type: "Primary Care", color: C.teal },
  ];

  const book = (slot) => {
    setBooked(slot);
    logSystemEvent(`Telehealth visit booked with ${slot.provider}`, "telehealth");
  };

  return (
    <div>
      <Row gap={10}>
        <Stat value="63,000" label="Annual Visits" color={C.teal} sub="Projected capacity" />
        <Stat value="8.5 min" label="Avg Wait" color={C.green} sub="vs 45 min traditional" />
        <Stat value="4.6 of 5" label="Satisfaction" color={C.gold} />
        <Stat value="$9.4M" label="Annual Savings" color={C.brand} sub="vs in person" />
      </Row>

      <Card title="Book a Sovereign Visit" accent={C.teal} right={booked ? <Pill color={C.green}>Booked</Pill> : null}>
        {!booked ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: s(10) }}>
            {slots.map(slot => (
              <div key={slot.id} style={{
                background: C.surface2,
                border: `1px solid ${C.line}`,
                borderRadius: s(10),
                padding: s(12),
                display: "flex",
                flexDirection: "column",
                gap: s(8),
              }}>
                <div style={{ fontSize: s(11), color: slot.color, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>{slot.type}</div>
                <div style={{ fontSize: s(15), fontWeight: 700, color: C.text }}>{slot.time}</div>
                <div style={{ fontSize: s(12), color: C.textDim }}>{slot.provider}</div>
                <Btn full variant="ghost" onClick={() => book(slot)}>Book this slot</Btn>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: `${s(20)}px 0` }}>
            <div style={{ fontSize: s(18), fontWeight: 800, color: C.green, marginBottom: s(6) }}>Visit confirmed</div>
            <div style={{ fontSize: s(14), color: C.text, marginBottom: s(2) }}>{booked.time} with {booked.provider}</div>
            <div style={{ fontSize: s(12), color: C.textDim, marginBottom: s(14) }}>{booked.type}, secured on Trace Fiber, end to end encrypted</div>
            <Btn variant="ghost" onClick={() => setBooked(null)}>Cancel and rebook</Btn>
          </div>
        )}
      </Card>

      <Card title="Sovereign Telehealth Advantages" accent={C.teal}>
        {[
          { label: "No travel required", detail: "Average citizen saves 30 plus minutes drive each way" },
          { label: "AI pre screening", detail: "Reduces visit time by 40 percent, AI gathers history before provider connects" },
          { label: "Cultural competency", detail: "Providers certified in Indigenous health, Chickasaw language support" },
          { label: "Data sovereignty", detail: "Video, audio, and records stay on Trace Fiber, zero external networks" },
          { label: "ER diversion", detail: "15 percent of telehealth visits would have been ER visits, 1,455 dollars saved per diversion" },
        ].map((a, i, arr) => (
          <div key={i} style={{ padding: `${s(10)}px 0`, borderBottom: i < arr.length - 1 ? `1px solid ${C.line2}` : "none" }}>
            <div style={{ fontSize: s(14), fontWeight: 700, color: C.text }}>{a.label}</div>
            <div style={{ fontSize: s(12), color: C.textFaint, marginTop: s(2) }}>{a.detail}</div>
          </div>
        ))}
      </Card>

      <Card title="Cost Per Visit" accent={C.brand}>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", fontSize: s(11), color: C.textFaint, padding: `${s(6)}px 0`, borderBottom: `1px solid ${C.line2}`, gap: s(8), minWidth: s(360) }}>
            <span>Type</span>
            <span style={{ textAlign: "right" }}>Tele</span>
            <span style={{ textAlign: "right" }}>In Person</span>
            <span style={{ textAlign: "right" }}>Saved</span>
          </div>
          {[
            { type: "Primary Care", tele: "$45", trad: "$195", saved: "$150" },
            { type: "Specialist", tele: "$85", trad: "$395", saved: "$310" },
            { type: "Behavioral Health", tele: "$55", trad: "$225", saved: "$170" },
            { type: "AI Health Screening", tele: "$15", trad: "$195", saved: "$180" },
          ].map((c, i, arr) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", padding: `${s(8)}px 0`, borderBottom: i < arr.length - 1 ? `1px solid ${C.line2}` : "none", fontSize: s(13), gap: s(8), minWidth: s(360) }}>
              <span style={{ color: C.text }}>{c.type}</span>
              <span style={{ color: C.green, textAlign: "right" }}>{c.tele}</span>
              <span style={{ color: C.red, textAlign: "right" }}>{c.trad}</span>
              <span style={{ color: C.gold, textAlign: "right", fontWeight: 700 }}>{c.saved}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ==========================================================================
   SHIELD TAB
   Live Sovereign Prompt Shield audit log plus governance policies.
   ========================================================================== */

const POLICIES = [
  { id: "GOV-001", name: "Sovereign Data Residency", reqs: 6, status: "Enforced" },
  { id: "GOV-002", name: "Role Based Access Control", reqs: 10, status: "Enforced" },
  { id: "GOV-003", name: "Citizen Consent Management", reqs: 10, status: "Enforced" },
  { id: "GOV-004", name: "Data Retention and Lifecycle", reqs: 7, status: "Enforced" },
  { id: "GOV-005", name: "External Sharing Controls", reqs: 10, status: "Enforced" },
  { id: "GOV-006", name: "Encryption Standards", reqs: 9, status: "Enforced" },
  { id: "GOV-007", name: "Audit Trail", reqs: 9, status: "Enforced" },
  { id: "GOV-008", name: "Breach Response Protocol", reqs: 10, status: "Enforced" },
];

const FRAMEWORKS = [
  { name: "HIPAA", reqs: 8, compliant: 8 },
  { name: "CARE Principles, Indigenous", reqs: 9, compliant: 9 },
  { name: "Tribal Sovereignty", reqs: 6, compliant: 6 },
];

function ShieldTab() {
  const { s } = useElder();
  const { audit, stats } = useShield();
  const [, force] = useState(0);

  useEffect(() => {
    const t = setInterval(() => force(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <Row gap={10}>
        <Stat value={stats.scanned} label="Prompts Scanned" color={C.shield} />
        <Stat value={stats.redactions} label="PHI Redactions" color={C.amber} sub="Hashed and replaced" />
        <Stat value="100%" label="Compliance" color={C.green} />
        <Stat value="AES-256" label="Encryption" color={C.violet} sub="At rest and in transit" />
      </Row>

      <Card title="Sovereign Prompt Shield, Live Audit" accent={C.shield} right={<Pill color={C.shield} pulse>Active</Pill>}>
        <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: s(10), padding: s(12), maxHeight: s(360), overflowY: "auto" }}>
          {audit.length === 0 ? (
            <div style={{ textAlign: "center", padding: `${s(20)}px 0`, color: C.textFaint, fontSize: s(13) }}>
              No events yet. Send a message in the AI Coach tab to see live Shield activity.
            </div>
          ) : (
            audit.map(e => (
              <div key={e.id} style={{ padding: `${s(10)}px 0`, borderBottom: `1px solid ${C.line2}`, fontSize: s(12), fontFamily: "monospace" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: s(8) }}>
                  <span style={{ color: C.shield }}>{new Date(e.ts).toLocaleTimeString()} <span style={{ color: C.textFaint }}>({timeAgo(e.ts)})</span></span>
                  <span style={{ color: e.detected > 0 ? C.amber : C.green }}>{e.detected > 0 ? `${e.detected} redaction${e.detected === 1 ? "" : "s"}` : "no PHI"}</span>
                </div>
                <div style={{ color: C.textDim, marginTop: s(4) }}>
                  source <span style={{ color: C.text }}>{e.source}</span> · length <span style={{ color: C.text }}>{e.length}</span> · fingerprint <span style={{ color: C.shield }}>{e.fingerprint}</span>
                </div>
                {e.tokens && e.tokens.length > 0 && (
                  <div style={{ marginTop: s(4), color: C.textFaint, display: "flex", flexWrap: "wrap", gap: s(6) }}>
                    {e.tokens.map((t, i) => (
                      <span key={i} style={{ background: `${C.shield}1f`, color: C.shield, padding: `${s(2)}px ${s(6)}px`, borderRadius: s(4) }}>
                        {t.type}:{t.hash}
                      </span>
                    ))}
                  </div>
                )}
                {e.label && (
                  <div style={{ marginTop: s(4), color: C.textDim, fontFamily: "inherit" }}>{e.label}</div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      <Card title="Compliance Frameworks" accent={C.green}>
        {FRAMEWORKS.map((f, i, arr) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${s(10)}px 0`, borderBottom: i < arr.length - 1 ? `1px solid ${C.line2}` : "none", gap: s(10), flexWrap: "wrap" }}>
            <span style={{ fontSize: s(14), color: C.text }}>{f.name}</span>
            <Pill color={C.green}>{f.compliant} of {f.reqs} compliant</Pill>
          </div>
        ))}
      </Card>

      <Card title="Data Governance Policies" accent={C.teal}>
        {POLICIES.map((p, i, arr) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${s(8)}px 0`, borderBottom: i < arr.length - 1 ? `1px solid ${C.line2}` : "none", fontSize: s(13), gap: s(10), flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: s(8), flexWrap: "wrap" }}>
              <span style={{ color: C.textFaint, fontFamily: "monospace" }}>{p.id}</span>
              <span style={{ color: C.text }}>{p.name}</span>
            </div>
            <Pill color={C.green}>{p.status}</Pill>
          </div>
        ))}
      </Card>

      <Card title="CARE Principles, Indigenous Data Sovereignty" accent={C.brand}>
        {[
          { letter: "C", name: "Collective Benefit", desc: "All health data and AI outcomes benefit Chickasaw citizens exclusively" },
          { letter: "A", name: "Authority to Control", desc: "The Nation has full governance over data collection, storage, and use" },
          { letter: "R", name: "Responsibility", desc: "Respectful relationships with data, elder advisory board for ethics" },
          { letter: "E", name: "Ethics", desc: "AI bias testing, cultural impact assessments, equal citizen access" },
        ].map((c, i, arr) => (
          <div key={i} style={{ display: "flex", gap: s(14), padding: `${s(12)}px 0`, borderBottom: i < arr.length - 1 ? `1px solid ${C.line2}` : "none" }}>
            <div style={{
              width: s(36),
              height: s(36),
              borderRadius: s(8),
              background: `${C.brand}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.brand,
              fontWeight: 800,
              fontSize: s(18),
              flexShrink: 0,
            }}>{c.letter}</div>
            <div>
              <div style={{ fontSize: s(14), fontWeight: 700, color: C.text }}>{c.name}</div>
              <div style={{ fontSize: s(12), color: C.textFaint, marginTop: s(2) }}>{c.desc}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}


/* ==========================================================================
   APP SHELL
   ========================================================================== */

function ElderToggle() {
  const { elder, setElder, s, touch } = useElder();
  return (
    <button
      onClick={() => setElder(v => !v)}
      aria-pressed={elder}
      aria-label={elder ? "Disable Elder Mode" : "Enable Elder Mode"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: s(8),
        padding: `${s(6)}px ${s(12)}px`,
        borderRadius: 999,
        border: `1px solid ${elder ? C.brand : C.line}`,
        background: elder ? `${C.brand}1f` : "transparent",
        color: elder ? C.brand : C.textDim,
        fontSize: s(11),
        fontWeight: 700,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        minHeight: touch,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{
        width: s(28),
        height: s(16),
        borderRadius: 999,
        background: elder ? C.brand : C.line2,
        position: "relative",
        flexShrink: 0,
        transition: "background 0.2s",
      }}>
        <span style={{
          position: "absolute",
          top: s(2),
          left: elder ? s(14) : s(2),
          width: s(12),
          height: s(12),
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
        }} />
      </span>
      Elder Mode
    </button>
  );
}

function ShieldBadge({ goto }) {
  const { stats } = useShield();
  const { s, touch } = useElder();
  return (
    <button
      onClick={() => goto("shield")}
      aria-label={`Open Shield audit, ${stats.scanned} scans logged`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: s(6),
        padding: `${s(6)}px ${s(10)}px`,
        borderRadius: 999,
        border: `1px solid ${C.shield}40`,
        background: `${C.shield}1a`,
        color: C.shield,
        fontSize: s(11),
        fontWeight: 700,
        cursor: "pointer",
        minHeight: touch,
        whiteSpace: "nowrap",
      }}
    >
      <span className="pulse" style={{ width: s(6), height: s(6), borderRadius: "50%", background: C.shield, display: "inline-block" }} />
      Shield {stats.scanned > 0 ? stats.scanned : "Active"}
    </button>
  );
}

function Header({ goto }) {
  const { s } = useElder();
  return (
    <header style={{
      padding: `${s(12)}px ${s(16)}px`,
      borderBottom: `1px solid ${C.line2}`,
      background: "#0D0D16",
      display: "flex",
      alignItems: "center",
      gap: s(12),
      flexWrap: "wrap",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <div style={{
        width: s(38),
        height: s(38),
        borderRadius: s(10),
        background: `linear-gradient(135deg, ${C.brand}, ${C.brandDeep})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: s(18),
        boxShadow: `0 4px 18px ${C.brand}4d`,
        flexShrink: 0,
      }}>◈</div>
      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: s(17), fontWeight: 700, lineHeight: 1.1 }}>
          SOVEREIGN <span style={{ color: C.brand }}>HEALTH OS</span>
        </div>
        <div style={{ fontSize: s(10), color: C.textFaint, letterSpacing: 1.5, textTransform: "uppercase", marginTop: s(2) }}>
          Sovereign Shield Technologies, Chickasaw Nation
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: s(8), flexWrap: "wrap" }}>
        <ShieldBadge goto={goto} />
        <ElderToggle />
        <Pill color={C.green} pulse>Sovereign</Pill>
      </div>
    </header>
  );
}

function TabBar({ tab, setTab }) {
  const { s, touch } = useElder();
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const active = ref.current.querySelector(`[data-tab-id="${tab}"]`);
    if (active && active.scrollIntoView) {
      try { active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); } catch {}
    }
  }, [tab]);

  return (
    <nav ref={ref} style={{
      display: "flex",
      gap: s(4),
      padding: `${s(8)}px ${s(12)}px`,
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
      borderBottom: `1px solid ${C.line2}`,
      background: "#0D0D16",
      flexShrink: 0,
      scrollbarWidth: "thin",
    }}>
      {TABS.map(t => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            data-tab-id={t.id}
            onClick={() => setTab(t.id)}
            aria-current={active ? "page" : undefined}
            style={{
              background: active ? `${C.brand}1f` : "transparent",
              border: `1px solid ${active ? C.brand + "40" : "transparent"}`,
              borderRadius: s(8),
              padding: `${s(8)}px ${s(14)}px`,
              color: active ? C.brand : C.textDim,
              fontSize: s(12),
              fontWeight: active ? 700 : 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              minHeight: touch,
              transition: "all 0.2s",
              display: "inline-flex",
              alignItems: "center",
              gap: s(6),
            }}
          >
            <span aria-hidden="true">{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

function ErrorBoundary({ children, fallback }) {
  const [err, setErr] = useState(null);
  useEffect(() => {
    const handler = (e) => setErr(e.error || e.message || "Unknown error");
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);
  if (err) {
    return fallback ? fallback(err) : (
      <div style={{ padding: 20, color: C.red }}>
        Something went wrong. {String(err)}
      </div>
    );
  }
  return children;
}

function Content({ tab, goto }) {
  const { s } = useElder();
  let View;
  switch (tab) {
    case "overview": View = <Overview goto={goto} />; break;
    case "risk": View = <RiskEngine />; break;
    case "biomarkers": View = <Biomarkers />; break;
    case "wearables": View = <Wearables />; break;
    case "coach": View = <AICoach />; break;
    case "care": View = <CareProtocols />; break;
    case "nutrition": View = <Nutrition />; break;
    case "wellness": View = <Wellness />; break;
    case "telehealth": View = <Telehealth />; break;
    case "shield": View = <ShieldTab />; break;
    default: View = <Overview goto={goto} />;
  }
  return (
    <main key={tab} className="fade-in" style={{
      flex: 1,
      overflowY: "auto",
      WebkitOverflowScrolling: "touch",
      padding: `${s(16)}px ${s(14)}px ${s(28)}px`,
      maxWidth: 980,
      margin: "0 auto",
      width: "100%",
    }}>
      {View}
    </main>
  );
}

function Footer() {
  const { s } = useElder();
  return (
    <footer style={{
      textAlign: "center",
      padding: `${s(12)}px ${s(16)}px`,
      borderTop: `1px solid ${C.line2}`,
      fontSize: s(10),
      color: C.textFaint,
      letterSpacing: 1.2,
      flexShrink: 0,
    }}>
      SOVEREIGN AI · TRACE FIBER NETWORK · CHICKASAW NATION INFRASTRUCTURE · ALL DATA ON NATION
    </footer>
  );
}

function AppInner() {
  const [tab, setTab] = useState("overview");
  const goto = useCallback((id) => {
    if (TABS.some(t => t.id === id)) {
      setTab(id);
      try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
    }
  }, []);

  return (
    <div style={{
      background: C.bg,
      color: C.text,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      <Header goto={goto} />
      <TabBar tab={tab} setTab={setTab} />
      <ErrorBoundary>
        <Content tab={tab} goto={goto} />
      </ErrorBoundary>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ElderProvider>
      <ShieldProvider>
        <AppInner />
      </ShieldProvider>
    </ElderProvider>
  );
}
