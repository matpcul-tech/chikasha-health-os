import { useState, useEffect, useRef } from "react";

const TABS = [
  { id: "overview", label: "Overview", icon: "◉" },
  { id: "risk", label: "Risk Engine", icon: "⚡" },
  { id: "blood", label: "Blood Panel", icon: "🔬" },
  { id: "nutrition", label: "Nutrition", icon: "🌽" },
  { id: "mental", label: "Wellness", icon: "🪶" },
  { id: "telehealth", label: "Telehealth", icon: "📡" },
  { id: "governance", label: "Sovereignty", icon: "🛡" },
];

/* ══════════ ANIMATED BAR ══════════ */
function Bar({ value, max = 1, color, delay = 0, label, sublabel }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW((value / max) * 100), 200 + delay); return () => clearTimeout(t); }, [value, max, delay]);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: "#ccc" }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{sublabel || `${(value * 100).toFixed(0)}%`}</span>
      </div>
      <div style={{ height: 8, background: "#1a1a2e", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 4, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

/* ══════════ STAT CARD ══════════ */
function Stat({ value, label, color, sub }) {
  return (
    <div style={{ background: "#111119", border: "1px solid #1e1e2e", borderRadius: 12, padding: "18px 16px", textAlign: "center", flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'Playfair Display',serif" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* ══════════ SECTION CARD ══════════ */
function Card({ title, children, accent }) {
  return (
    <div style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 14, padding: 24, marginBottom: 16 }}>
      {title && <div style={{ fontSize: 15, fontWeight: 700, color: accent || "#C45A3C", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>{title}</div>}
      {children}
    </div>
  );
}

/* ══════════ OVERVIEW TAB ══════════ */
function Overview() {
  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <Stat value="28,500" label="Enrolled Citizens" color="#C45A3C" sub="Active in system" />
        <Stat value="156" label="Early Detections" color="#4ADE80" sub="This quarter" />
        <Stat value="62.4" label="Avg Longevity Score" color="#2D7A6F" sub="Out of 100" />
        <Stat value="$4.2M" label="Cost Avoidance" color="#8B6914" sub="Year to date" />
      </div>
      <Card title="System Status" accent="#4ADE80">
        {[
          { name: "Risk Assessment Engine", status: "Operational", color: "#4ADE80" },
          { name: "Blood Panel Analyzer", status: "Operational", color: "#4ADE80" },
          { name: "Nutrition Planning AI", status: "Operational", color: "#4ADE80" },
          { name: "Mental Health Screening", status: "Operational", color: "#4ADE80" },
          { name: "Telehealth Platform", status: "Operational", color: "#4ADE80" },
          { name: "Data Sovereignty Layer", status: "Enforced", color: "#4ADE80" },
          { name: "Trace Fiber Connection", status: "100 Gbps", color: "#2D7A6F" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 6 ? "1px solid #1a1a2e" : "none" }}>
            <span style={{ fontSize: 13, color: "#ccc" }}>{s.name}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: s.color, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
              {s.status}
            </span>
          </div>
        ))}
      </Card>
      <Card title="Community Health Trends" accent="#2D7A6F">
        {[
          { condition: "Type 2 Diabetes", prevalence: "18.2%", trend: "↓ 2.1%", color: "#4ADE80" },
          { condition: "Cardiovascular Disease", prevalence: "12.8%", trend: "↓ 1.4%", color: "#4ADE80" },
          { condition: "Obesity (BMI > 30)", prevalence: "38.5%", trend: "↓ 3.2%", color: "#4ADE80" },
          { condition: "Depression/Anxiety", prevalence: "15.1%", trend: "↓ 0.8%", color: "#8B6914" },
          { condition: "Pre-Diabetes (identified early)", prevalence: "22.4%", trend: "↑ 8.6%", color: "#C45A3C" },
        ].map((c, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? "1px solid #1a1a2e" : "none", fontSize: 13 }}>
            <span style={{ color: "#ccc" }}>{c.condition}</span>
            <span><span style={{ color: "#888", marginRight: 12 }}>{c.prevalence}</span><span style={{ color: c.color, fontWeight: 600 }}>{c.trend}</span></span>
          </div>
        ))}
        <div style={{ fontSize: 11, color: "#555", marginTop: 12, fontStyle: "italic" }}>↑ Pre-diabetes identification increase is positive — reflects improved AI-assisted early detection, not worsening health.</div>
      </Card>
    </div>
  );
}

/* ══════════ RISK ENGINE TAB ══════════ */
function RiskEngine() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { if (running) { const t = setTimeout(() => { setDone(true); setRunning(false); }, 2000); return () => clearTimeout(t); } }, [running]);

  const domains = [
    { name: "Cardiovascular", score: 0.72, color: "#E85D4A" },
    { name: "Metabolic", score: 0.81, color: "#E85D4A" },
    { name: "Oncology", score: 0.28, color: "#4ADE80" },
    { name: "Mental Health", score: 0.44, color: "#8B6914" },
    { name: "Respiratory", score: 0.15, color: "#4ADE80" },
    { name: "Renal", score: 0.58, color: "#E8A84A" },
  ];

  return (
    <div>
      <Card title="Patient: Citizen-Demo-001" accent="#C45A3C">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13, color: "#aaa", marginBottom: 16 }}>
          <div>Age: <strong style={{ color: "#ddd" }}>52</strong></div>
          <div>Sex: <strong style={{ color: "#ddd" }}>Male</strong></div>
          <div>BMI: <strong style={{ color: "#E8A84A" }}>31.2</strong></div>
          <div>BP: <strong style={{ color: "#E85D4A" }}>142/91</strong></div>
          <div>Conditions: <strong style={{ color: "#E85D4A" }}>Type 2 Diabetes, Hypertension</strong></div>
          <div>Family Hx: <strong style={{ color: "#E8A84A" }}>Heart Disease, Diabetes</strong></div>
        </div>
        {!done && (
          <button onClick={() => setRunning(true)} disabled={running} style={{
            background: running ? "#333" : "linear-gradient(135deg, #C45A3C, #8B2E1A)", border: "none", borderRadius: 10,
            padding: "12px 28px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: running ? "default" : "pointer", width: "100%",
          }}>
            {running ? "⏳ Running AI Risk Assessment..." : "⚡ Run Risk Assessment"}
          </button>
        )}
      </Card>
      {done && (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <Stat value="67.2%" label="Overall Risk Score" color="#E85D4A" sub="HIGH" />
            <Stat value="$20,000" label="Projected Annual Cost" color="#E8A84A" sub="Without intervention" />
            <Stat value="$11,300" label="Preventable Savings" color="#4ADE80" sub="With early intervention" />
          </div>
          <Card title="Domain Risk Scores" accent="#E85D4A">
            {domains.map((d, i) => (
              <Bar key={i} value={d.score} color={d.color} delay={i * 150} label={d.name} sublabel={`${(d.score * 100).toFixed(0)}%`} />
            ))}
          </Card>
          <Card title="AI Recommendations" accent="#4ADE80">
            {[
              "Schedule comprehensive metabolic panel within 2 weeks",
              "Enroll in Chikasha Diabetes Prevention Program",
              "Cardiac screening with AI-assisted imaging recommended",
              "Begin blood pressure monitoring program",
              "Nutritionist consultation — Chickasaw traditional diet integration",
              "Kidney function panel (eGFR, albumin) recommended",
              "Annual full-body AI health scan recommended",
            ].map((r, i) => (
              <div key={i} style={{ padding: "6px 0", fontSize: 13, color: "#ccc", display: "flex", gap: 8 }}>
                <span style={{ color: "#4ADE80" }}>→</span> {r}
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}

/* ══════════ BLOOD PANEL TAB ══════════ */
function BloodPanel() {
  const results = [
    { name: "Glucose (Fasting)", value: 126, unit: "mg/dL", status: "abnormal", optimal: "72-90", ref: "65-100" },
    { name: "HbA1c", value: 7.1, unit: "%", status: "abnormal", optimal: "4.0-5.4", ref: "4.0-5.7" },
    { name: "Total Cholesterol", value: 215, unit: "mg/dL", status: "borderline", optimal: "150-190", ref: "125-200" },
    { name: "LDL", value: 142, unit: "mg/dL", status: "abnormal", optimal: "40-80", ref: "40-100" },
    { name: "HDL", value: 38, unit: "mg/dL", status: "abnormal", optimal: "50-90", ref: "40-100" },
    { name: "Triglycerides", value: 188, unit: "mg/dL", status: "abnormal", optimal: "40-100", ref: "30-150" },
    { name: "Creatinine", value: 1.1, unit: "mg/dL", status: "normal", optimal: "0.7-1.1", ref: "0.6-1.2" },
    { name: "eGFR", value: 82, unit: "mL/min", status: "borderline", optimal: "90-120", ref: "60-130" },
    { name: "CRP (hs)", value: 3.8, unit: "mg/L", status: "abnormal", optimal: "0-1.0", ref: "0-3.0" },
    { name: "TSH", value: 2.1, unit: "mIU/L", status: "optimal", optimal: "1.0-2.5", ref: "0.45-4.5" },
    { name: "Vitamin D", value: 22, unit: "ng/mL", status: "abnormal", optimal: "40-70", ref: "20-100" },
    { name: "Vitamin B12", value: 380, unit: "pg/mL", status: "borderline", optimal: "400-800", ref: "200-1100" },
  ];

  const icons = { optimal: "✅", normal: "🟢", borderline: "🟡", abnormal: "🟠", critical: "🔴" };
  const colors = { optimal: "#4ADE80", normal: "#4ADE80", borderline: "#E8A84A", abnormal: "#E85D4A", critical: "#FF3333" };
  const optCount = results.filter(r => r.status === "optimal").length;
  const normCount = results.filter(r => r.status === "normal").length;
  const bordCount = results.filter(r => r.status === "borderline").length;
  const abnCount = results.filter(r => r.status === "abnormal").length;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <Stat value={`${optCount + normCount}`} label="Normal/Optimal" color="#4ADE80" />
        <Stat value={`${bordCount}`} label="Borderline" color="#E8A84A" />
        <Stat value={`${abnCount}`} label="Abnormal" color="#E85D4A" />
        <Stat value="C" label="Panel Grade" color="#E8A84A" sub="Some abnormalities" />
      </div>
      <Card title="Comprehensive Panel Results" accent="#2D7A6F">
        <div style={{ overflowX: "auto" }}>
          {results.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < results.length - 1 ? "1px solid #1a1a2e" : "none", fontSize: 13, gap: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 180 }}>
                <span>{icons[r.status]}</span>
                <span style={{ color: "#ddd" }}>{r.name}</span>
              </div>
              <span style={{ color: colors[r.status], fontWeight: 700, fontFamily: "monospace", minWidth: 80 }}>{r.value} {r.unit}</span>
              <span style={{ color: "#555", fontSize: 11, minWidth: 100 }}>Optimal: {r.optimal}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Optimization Potential" accent="#4ADE80">
        <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.8 }}>
          <strong style={{ color: "#E8A84A" }}>HIGH</strong> — Significant optimization opportunity through lifestyle changes and targeted interventions. 5 biomarkers outside optimal range can be improved with the Chikasha-AI nutrition and fitness protocols.
        </div>
      </Card>
    </div>
  );
}

/* ══════════ NUTRITION TAB ══════════ */
function Nutrition() {
  const meals = [
    { type: "🌅 Breakfast", name: "Traditional Pashofa Bowl", desc: "Cracked corn porridge with pecans, wild berries, honey", cal: 420, protein: 12, cultural: "Pashofa is a sacred Chickasaw food" },
    { type: "🍎 Snack", name: "Bone Broth with Wild Onions", desc: "Warm bison bone broth with herbs", cal: 60, protein: 10, cultural: "Traditional healing food" },
    { type: "☀️ Lunch", name: "Three Sisters Power Bowl", desc: "Roasted squash, black beans, corn, wild rice, avocado", cal: 520, protein: 18, cultural: "Corn, beans, squash — traditional companion planting" },
    { type: "🍎 Snack", name: "Trail Mix (Traditional)", desc: "Pecans, hickory nuts, dried persimmons, pumpkin seeds", cal: 220, protein: 7, cultural: "Traditional travel food for Chickasaw journeys" },
    { type: "🌙 Dinner", name: "Venison Stew with Hominy", desc: "Slow-cooked venison, root vegetables, wild greens", cal: 480, protein: 38, cultural: "Traditional Chickasaw stew, nourishing and healing" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <Stat value="1,700" label="Daily Calories" color="#8B6914" sub="Diabetes-optimized" />
        <Stat value="85g" label="Daily Protein" color="#2D7A6F" />
        <Stat value="35g" label="Daily Fiber" color="#4ADE80" />
        <Stat value="$95" label="Weekly Cost" color="#C45A3C" sub="Estimated" />
      </div>
      <Card title="Today's Meal Plan — Diabetes + Heart Health" accent="#8B6914">
        {meals.map((m, i) => (
          <div key={i} style={{ padding: "14px 0", borderBottom: i < meals.length - 1 ? "1px solid #1a1a2e" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <span style={{ fontSize: 12, color: "#888" }}>{m.type}</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ddd", marginTop: 2 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{m.desc}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#8B6914" }}>{m.cal} cal</div>
                <div style={{ fontSize: 11, color: "#888" }}>{m.protein}g protein</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#C45A3C", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
              🪶 {m.cultural}
            </div>
          </div>
        ))}
      </Card>
      <Card title="Supplements Recommended" accent="#2D7A6F">
        {["Vitamin D3 (5000 IU daily — current level low)", "Omega-3 Fish Oil (2000mg EPA/DHA)", "Magnesium Glycinate (400mg at bedtime)", "Probiotic (multi-strain, 50B CFU)", "Berberine (500mg 2x daily — discuss with provider)"].map((s, i) => (
          <div key={i} style={{ padding: "4px 0", fontSize: 13, color: "#ccc" }}>💊 {s}</div>
        ))}
      </Card>
    </div>
  );
}

/* ══════════ MENTAL HEALTH TAB ══════════ */
function MentalHealth() {
  const domains = [
    { name: "Depression (PHQ-9)", score: 8, max: 27, level: "Mild", color: "#E8A84A" },
    { name: "Anxiety (GAD-7)", score: 6, max: 21, level: "Mild", color: "#E8A84A" },
    { name: "Cultural Connection", score: 16, max: 24, level: "Moderate", color: "#8B6914" },
    { name: "Social Wellness", score: 7, max: 9, level: "Good", color: "#4ADE80" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <Stat value="68.4" label="Wellness Score" color="#2D7A6F" sub="Out of 100" />
        <Stat value="Mild" label="Overall Risk" color="#E8A84A" sub="Supportive care" />
        <Stat value="$5,000" label="Est. Savings" color="#4ADE80" sub="Early intervention" />
      </div>
      <Card title="Domain Assessments" accent="#6B4C8A">
        {domains.map((d, i) => (
          <Bar key={i} value={d.name.includes("Cultural") || d.name.includes("Social") ? d.score / d.max : 1 - (d.score / d.max)} color={d.color} delay={i * 150} label={d.name} sublabel={`${d.score}/${d.max} — ${d.level}`} />
        ))}
      </Card>
      <Card title="Cultural Wellness Plan" accent="#C45A3C">
        {[
          "Weekly participation in at least one tribal community activity",
          "Monthly connection with an elder or cultural mentor",
          "Chickasaw language practice — even 10 min/day strengthens identity",
          "Seasonal participation in traditional food preparation",
          "Stickball (Kapucha Toli) community league — exercise + belonging",
        ].map((r, i) => (
          <div key={i} style={{ padding: "5px 0", fontSize: 13, color: "#ccc" }}>🪶 {r}</div>
        ))}
      </Card>
      <Card title="Cultural Resources" accent="#8B6914">
        {[
          "Chickasaw Nation Behavioral Health Services",
          "Elder mentorship program — connection to cultural wisdom",
          "Traditional storytelling circles for healing",
          "Chickasaw Cultural Center programs",
          "Language revitalization classes (Chikashshanompa')",
        ].map((r, i) => (
          <div key={i} style={{ padding: "4px 0", fontSize: 13, color: "#aaa" }}>→ {r}</div>
        ))}
      </Card>
    </div>
  );
}

/* ══════════ TELEHEALTH TAB ══════════ */
function Telehealth() {
  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <Stat value="63,000" label="Annual Visits" color="#2D7A6F" sub="Projected capacity" />
        <Stat value="8.5 min" label="Avg Wait" color="#4ADE80" sub="vs. 45 min traditional" />
        <Stat value="4.6/5" label="Satisfaction" color="#8B6914" />
        <Stat value="$9.4M" label="Annual Savings" color="#C45A3C" sub="vs. traditional care" />
      </div>
      <Card title="Sovereign Telehealth Advantages" accent="#2D7A6F">
        {[
          { label: "No travel required", detail: "Avg citizen saves 30+ min drive each way" },
          { label: "AI pre-screening", detail: "Reduces visit time by 40% — AI gathers history before provider connects" },
          { label: "Cultural competency", detail: "Providers certified in Indigenous health; Chickasaw language support" },
          { label: "Data sovereignty", detail: "All video, audio, and records stay on Trace Fiber — zero external networks" },
          { label: "ER diversion", detail: "15% of telehealth visits would have been ER visits — $1,455 saved per diversion" },
        ].map((a, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: i < 4 ? "1px solid #1a1a2e" : "none" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#ddd" }}>{a.label}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{a.detail}</div>
          </div>
        ))}
      </Card>
      <Card title="Cost Comparison Per Visit" accent="#C45A3C">
        {[
          { type: "Primary Care", tele: "$45", trad: "$195", saved: "$150" },
          { type: "Specialist", tele: "$85", trad: "$395", saved: "$310" },
          { type: "Behavioral Health", tele: "$55", trad: "$225", saved: "$170" },
          { type: "AI Health Screening", tele: "$15", trad: "$195", saved: "$180" },
        ].map((c, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? "1px solid #1a1a2e" : "none", fontSize: 13 }}>
            <span style={{ color: "#ccc", flex: 1 }}>{c.type}</span>
            <span style={{ color: "#4ADE80", width: 60, textAlign: "right" }}>{c.tele}</span>
            <span style={{ color: "#E85D4A", width: 60, textAlign: "right" }}>{c.trad}</span>
            <span style={{ color: "#8B6914", width: 70, textAlign: "right", fontWeight: 700 }}>{c.saved}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555", marginTop: 8 }}>
          <span style={{ flex: 1 }} /><span style={{ width: 60, textAlign: "right" }}>Telehealth</span><span style={{ width: 60, textAlign: "right" }}>Traditional</span><span style={{ width: 70, textAlign: "right" }}>Savings</span>
        </div>
      </Card>
    </div>
  );
}

/* ══════════ GOVERNANCE TAB ══════════ */
function Governance() {
  const policies = [
    { id: "GOV-001", name: "Sovereign Data Residency", reqs: 6, status: "Enforced" },
    { id: "GOV-002", name: "Role-Based Access Control", reqs: 10, status: "Enforced" },
    { id: "GOV-003", name: "Citizen Consent Management", reqs: 10, status: "Enforced" },
    { id: "GOV-004", name: "Data Retention & Lifecycle", reqs: 7, status: "Enforced" },
    { id: "GOV-005", name: "External Sharing Controls", reqs: 10, status: "Enforced" },
    { id: "GOV-006", name: "Encryption Standards", reqs: 9, status: "Enforced" },
    { id: "GOV-007", name: "Audit Trail", reqs: 9, status: "Enforced" },
    { id: "GOV-008", name: "Breach Response Protocol", reqs: 10, status: "Enforced" },
  ];

  const frameworks = [
    { name: "HIPAA", reqs: 8, compliant: 8 },
    { name: "CARE Principles (Indigenous)", reqs: 9, compliant: 9 },
    { name: "Tribal Sovereignty", reqs: 6, compliant: 6 },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <Stat value="100%" label="Compliance Score" color="#4ADE80" />
        <Stat value="8" label="Active Policies" color="#2D7A6F" />
        <Stat value="71" label="Requirements Met" color="#8B6914" sub="Out of 71" />
        <Stat value="AES-256" label="Encryption" color="#6B4C8A" sub="At rest & in transit" />
      </div>
      <Card title="Compliance Frameworks" accent="#4ADE80">
        {frameworks.map((f, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? "1px solid #1a1a2e" : "none" }}>
            <span style={{ fontSize: 14, color: "#ddd" }}>✅ {f.name}</span>
            <span style={{ fontSize: 13, color: "#4ADE80", fontWeight: 700 }}>{f.compliant}/{f.reqs} — COMPLIANT</span>
          </div>
        ))}
      </Card>
      <Card title="Data Governance Policies" accent="#2D7A6F">
        {policies.map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < policies.length - 1 ? "1px solid #1a1a2e" : "none", fontSize: 13 }}>
            <div>
              <span style={{ color: "#888", marginRight: 8 }}>{p.id}</span>
              <span style={{ color: "#ccc" }}>{p.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#888", fontSize: 11 }}>{p.reqs} requirements</span>
              <span style={{ color: "#4ADE80", fontWeight: 700, fontSize: 11 }}>🛡 {p.status}</span>
            </div>
          </div>
        ))}
      </Card>
      <Card title="CARE Principles — Indigenous Data Sovereignty" accent="#C45A3C">
        {[
          { letter: "C", name: "Collective Benefit", desc: "All health data and AI outcomes benefit Chickasaw citizens exclusively" },
          { letter: "A", name: "Authority to Control", desc: "The Nation has full governance over data collection, storage, and use" },
          { letter: "R", name: "Responsibility", desc: "Respectful relationships with data; elder advisory board for ethics" },
          { letter: "E", name: "Ethics", desc: "AI bias testing, cultural impact assessments, equal citizen access" },
        ].map((c, i) => (
          <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < 3 ? "1px solid #1a1a2e" : "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#C45A3C20", display: "flex", alignItems: "center", justifyContent: "center", color: "#C45A3C", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{c.letter}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#ddd" }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{c.desc}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ══════════ MAIN APP ══════════ */
export default function ChikashaHealthOS() {
  const [tab, setTab] = useState("overview");

  const views = { overview: Overview, risk: RiskEngine, blood: BloodPanel, nutrition: Nutrition, mental: MentalHealth, telehealth: Telehealth, governance: Governance };
  const View = views[tab];

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { width:5px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:#2a2835; border-radius:10px }
      `}</style>
      <div style={{ fontFamily: "'Source Sans 3',sans-serif", background: "#0A0A0F", color: "#E8E4DD", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #1a1a2e", background: "#0D0D16", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #C45A3C, #8B2E1A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 18px rgba(196,90,60,0.3)" }}>◈</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700 }}>CHIKASHA <span style={{ color: "#C45A3C" }}>HEALTH OS</span></div>
            <div style={{ fontSize: 10, color: "#666", letterSpacing: 2, textTransform: "uppercase" }}>Sovereign Precision Health Platform — Demo</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 6px rgba(74,222,128,0.4)" }} />
            <span style={{ fontSize: 10, color: "#4ADE80", fontWeight: 600, letterSpacing: 1 }}>SOVEREIGN</span>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{ display: "flex", gap: 4, padding: "10px 16px", overflowX: "auto", borderBottom: "1px solid #1a1a2e", background: "#0D0D16", flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? "#C45A3C18" : "transparent",
              border: `1px solid ${tab === t.id ? "#C45A3C40" : "transparent"}`,
              borderRadius: 8, padding: "6px 14px", color: tab === t.id ? "#C45A3C" : "#888",
              fontSize: 12, fontWeight: tab === t.id ? 700 : 400, cursor: "pointer",
              whiteSpace: "nowrap", transition: "all .2s", fontFamily: "inherit",
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 16px", maxWidth: 900, margin: "0 auto", width: "100%" }}>
          <View />
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "12px 16px", borderTop: "1px solid #1a1a2e", fontSize: 9, color: "#444", letterSpacing: 1.5, flexShrink: 0 }}>
          SOVEREIGN AI · TRACE FIBER NETWORK · CHICKASAW NATION INFRASTRUCTURE · ALL DATA ON-NATION
        </div>
      </div>
    </>
  );

                           }
