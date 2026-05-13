import { useState, useEffect, useRef } from "react";

// ─── INFOS ATELIER ─────────────────────────────────────────────────────────────
const ATELIER = {
  nom: "Bijouterie L'Atelier",
  gerants: "Guedj Philippe & Kévin",
  adresse: "152 Avenue Paul Valéry",
  ville: "83160 La Valette Du Var",
  tel: "04 94 61 28 93",
  tva: "FR27495337198",
  siret: "495 337 198 R.C.S TOULON",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #0f0e0c; color: #f0ead8; font-family: 'Jost', sans-serif; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0f0e0c; } ::-webkit-scrollbar-thumb { background: #7a6228; border-radius: 2px; }
  input, select, textarea { background: #141210; color: #f0ead8; border: 1px solid #2e2a22; border-radius: 6px; padding: 10px 12px; font-family: 'Jost', sans-serif; font-size: 14px; width: 100%; outline: none; transition: border 0.2s; }
  input:focus, select:focus, textarea:focus { border-color: #c9a84c; }
  textarea { resize: vertical; min-height: 70px; }
  select option { background: #1a1814; }
  label { font-size: 12px; color: #8a7e68; letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-bottom: 5px; }
  button { cursor: pointer; font-family: 'Jost', sans-serif; }
  input[type=checkbox] { width: 18px; height: 18px; accent-color: #c9a84c; cursor: pointer; }
  input[type=file] { display: none; }
  @media print {
    body * { visibility: hidden !important; }
    #print-zone, #print-zone * { visibility: visible !important; }
    #print-zone { position: fixed; inset: 0; z-index: 9999; background: white; padding: 0; margin: 0; }
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9).toUpperCase();
const repNum = (arr) => `REP-${String((arr.length + 1)).padStart(4, "0")}`;
const facNum = (arr) => `FAC-${String((arr.length + 1)).padStart(4, "0")}`;
const estNum = (arr) => `EST-${String((arr.length + 1)).padStart(4, "0")}`;
const orNum  = (arr) => `OR-${String((arr.length + 1)).padStart(4, "0")}`;
const dateStr = () => new Date().toLocaleDateString("fr-FR");
const todayISO = () => new Date().toISOString().split("T")[0];

const emptyClient  = () => ({ id: uid(), nom: "", prenom: "", adresse: "", ville: "", codePostal: "", telephone: "", email: "" });
const emptyRep     = (arr = [], clientId = "") => ({ id: uid(), numero: repNum(arr), numeroPolice: "", clientId, nom: "", prenom: "", adresse: "", ville: "", codePostal: "", telephone: "", description: "", article: "", matiere: "", poids: "", reparateur: "", prix: "", acompte: "", solde: "", livre: false, dateLivraison: "", photos: [] });
const emptyFab     = (arr = [], clientId = "") => ({ id: uid(), clientId, nom: "", prenom: "", adresse: "", ville: "", codePostal: "", telephone: "", description: "", matiere: "", orFourni: "", orUtilise: "", poidsBijou: "", prix: "", livre: false, dateLivraison: "", photos: [] });
const emptyFac     = (arr = [], clientId = "") => ({ id: uid(), numero: facNum(arr), clientId, nom: "", prenom: "", adresse: "", ville: "", codePostal: "", telephone: "", email: "", date: todayISO(), description: "", article: "", matiere: "", poids: "", estimationBijou: "", photos: [], lignes: [{ id: uid(), designation: "", quantite: "1", prixUnit: "", tva: "20" }], notes: "" });
const emptyEst     = (arr = [], clientId = "") => ({ id: uid(), numero: estNum(arr), clientId, nom: "", prenom: "", adresse: "", ville: "", codePostal: "", telephone: "", email: "", date: todayISO(), description: "", article: "", matiere: "", poids: "", estimationBijou: "", photos: [], lignes: [{ id: uid(), designation: "", quantite: "1", prixUnit: "", tva: "20" }], notes: "" });
const emptyAchat   = (arr = [], clientId = "") => ({ id: uid(), numero: orNum(arr), clientId, nom: "", prenom: "", adresse: "", ville: "", codePostal: "", telephone: "", email: "", numeroCNI: "", typeMetal: "or", description: "", poids: "", prix: "", reglement: "cheque", date: todayISO() });

// ─── PHOTO PICKER ─────────────────────────────────────────────────────────────
function PhotoPicker({ photos = [], onChange }) {
  const inputRef = useRef();
  const handleFile = (e) => { Array.from(e.target.files).forEach(file => { const r = new FileReader(); r.onload = ev => onChange(p => [...p, { id: uid(), data: ev.target.result }]); r.readAsDataURL(file); }); e.target.value = ""; };
  const remove = (id) => onChange(photos.filter(p => p.id !== id));
  return (
    <div style={{ marginBottom: 16 }}>
      <label>Photos du bijou</label>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
        {photos.map(p => (
          <div key={p.id} style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
            <img src={p.data} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #2e2a22" }} />
            <button onClick={() => remove(p.id)} style={{ position: "absolute", top: -7, right: -7, width: 22, height: 22, borderRadius: "50%", background: "#c0392b", border: "2px solid #0f0e0c", color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        ))}
        <button onClick={() => inputRef.current?.click()} style={{ width: 80, height: 80, borderRadius: 8, background: "#141210", border: "2px dashed #7a6228", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, color: "#c9a84c", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          Photo
        </button>
        <input ref={inputRef} type="file" accept="image/*" capture="environment" multiple onChange={handleFile} />
      </div>
    </div>
  );
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const GoldLine = () => <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#c9a84c,transparent)", margin: "16px 0" }} />;
const Btn = ({ onClick, children, variant = "primary", small, style: s = {} }) => {
  const base = { border: "none", borderRadius: 6, padding: small ? "7px 14px" : "11px 22px", fontSize: small ? 12 : 14, fontWeight: 500, letterSpacing: "0.06em", transition: "all 0.2s", ...s };
  const v = { primary: { background: "linear-gradient(135deg,#c9a84c,#7a6228)", color: "#0f0e0c" }, ghost: { background: "transparent", color: "#c9a84c", border: "1px solid #7a6228" }, danger: { background: "transparent", color: "#c0392b", border: "1px solid #c0392b" } };
  return <button onClick={onClick} style={{ ...base, ...v[variant] }}>{children}</button>;
};
const Badge = ({ color, children }) => <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 500 }}>{children}</span>;
const Field = ({ label, value, onChange, type = "text", options, rows }) => (
  <div style={{ marginBottom: 12 }}>
    <label>{label}</label>
    {options ? <select value={value} onChange={e => onChange(e.target.value)}><option value="">— Sélectionner —</option>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      : rows ? <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} />
      : <input type={type} value={value} onChange={e => onChange(e.target.value)} />}
  </div>
);
const Card = ({ children, style: s = {} }) => <div style={{ background: "#1a1814", border: "1px solid #2e2a22", borderRadius: 12, padding: 20, ...s }}>{children}</div>;
const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
    <div style={{ background: "#1a1814", border: "1px solid #c9a84c44", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "92vh", overflowY: "auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 22, color: "#c9a84c" }}>{title}</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#8a7e68", fontSize: 22 }}>✕</button>
      </div>
      <GoldLine />{children}
    </div>
  </div>
);

// ─── PRINT HELPERS ────────────────────────────────────────────────────────────
// En-tête A4 avec toutes les infos de l'atelier
const HeaderA4 = ({ type, numero, date }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, paddingBottom: 18, borderBottom: "2.5px solid #c9a84c" }}>
    {/* Logo + infos atelier */}
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{ width: 56, height: 56, background: "#f5f0e8", borderRadius: "50%", border: "2px solid #c9a84c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="30" height="30" viewBox="0 0 100 100" fill="none">
          <polygon points="50,10 80,40 50,90 20,40" fill="none" stroke="#c9a84c" strokeWidth="5"/>
          <polygon points="50,10 80,40 20,40" fill="none" stroke="#c9a84c" strokeWidth="4"/>
          <line x1="50" y1="10" x2="50" y2="2" stroke="#c9a84c" strokeWidth="3"/>
          <line x1="43" y1="5" x2="50" y2="2" stroke="#c9a84c" strokeWidth="2.5"/>
          <line x1="57" y1="5" x2="50" y2="2" stroke="#c9a84c" strokeWidth="2.5"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 8, color: "#aaa", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 1 }}>Artisan Bijoutier · Joaillier</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444" }}>Bijouterie L'Atelier</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontStyle: "italic", fontWeight: 700, color: "#c9a84c", lineHeight: 1 }}>Guedj</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, fontStyle: "italic", color: "#777", marginTop: 1 }}>Philippe &amp; Kévin</div>
        <div style={{ height: "0.5px", background: "#e0d8c8", margin: "6px 0 5px" }} />
        <div style={{ fontSize: 9, color: "#666", lineHeight: 1.7 }}>
          <div>152 Avenue Paul Valéry — 83160 La Valette Du Var</div>
          <div>Tél : <strong style={{ color: "#444" }}>04 94 61 28 93</strong></div>
          <div>N° TVA : <strong style={{ color: "#444" }}>FR27495337198</strong></div>
          <div>SIRET : 495 337 198 R.C.S TOULON</div>
        </div>
      </div>
    </div>
    {/* Type doc + numéro + date */}
    <div style={{ textAlign: "right" }}>
      <div style={{ background: type === "ESTIMATION" ? "#7a6228" : type === "ACHAT MÉTAL" ? "#5a4a1a" : "#c9a84c", color: "white", borderRadius: 5, padding: "5px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 8, display: "inline-block" }}>{type}</div>
      {numero && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#c9a84c", lineHeight: 1 }}>{numero}</div>}
      <div style={{ fontSize: 10, color: "#888", marginTop: 5 }}>La Valette Du Var, le <strong style={{ color: "#444" }}>{date || dateStr()}</strong></div>
    </div>
  </div>
);

const Sect = ({ title, children }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a84c", fontWeight: 700, borderBottom: "1px solid #e8dfd0", paddingBottom: 3, marginBottom: 8 }}>{title}</div>
    {children}
  </div>
);
const G2 = ({ children }) => <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 20px", fontSize: 12 }}>{children}</div>;
const G3 = ({ children }) => <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "7px 14px", fontSize: 12, marginBottom: 8 }}>{children}</div>;
const G4 = ({ children }) => <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "7px 12px", fontSize: 12, marginBottom: 8 }}>{children}</div>;
const Inf = ({ label, val, color, span }) => (
  <div style={span ? { gridColumn: "1/-1" } : {}}>
    <div style={{ fontSize: 8.5, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 1 }}>{label}</div>
    <strong style={{ color: color || "#1a1a1a", fontSize: 12 }}>{val || "—"}</strong>
  </div>
);
const Desc = ({ children }) => <div style={{ background: "#faf8f4", border: "1px solid #e8dfd0", borderRadius: 5, padding: "9px 12px", fontSize: 12, color: "#555", marginTop: 6, lineHeight: 1.5 }}><div style={{ fontSize: 8.5, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Description</div>{children}</div>;
const Tarif3 = ({ items }) => (
  <div style={{ display: "flex", border: "1px solid #e8dfd0", borderRadius: 7, overflow: "hidden" }}>
    {items.map(([lbl, val], i) => (
      <div key={lbl} style={{ flex: 1, padding: "11px 8px", textAlign: "center", borderRight: i < items.length - 1 ? "1px solid #e8dfd0" : "none", background: i === items.length - 1 ? "#faf8f4" : "white" }}>
        <div style={{ fontSize: 8.5, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{lbl}</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: i === items.length - 1 ? "#c9a84c" : "#1a1a1a" }}>{val ? `${val} €` : "—"}</div>
      </div>
    ))}
  </div>
);
const Signs = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14, marginBottom: 14 }}>
    {["Signature client", "Signature L'Atelier Guedj"].map(lbl => (
      <div key={lbl} style={{ border: "1px solid #e8dfd0", borderRadius: 6, padding: "10px 14px" }}>
        <div style={{ fontSize: 8.5, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 28 }}>{lbl}</div>
        <div style={{ borderTop: "1px dashed #ccc" }} />
      </div>
    ))}
  </div>
);
const FooterA4 = () => (
  <div style={{ textAlign: "center", paddingTop: 10, borderTop: "1px solid #e8dfd0" }}>
    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, fontStyle: "italic", color: "#c9a84c" }}>Bijouterie L'Atelier Guedj — Philippe &amp; Kévin</div>
    <div style={{ fontSize: 8.5, color: "#bbb", marginTop: 2, letterSpacing: "0.12em", textTransform: "uppercase" }}>152 Avenue Paul Valéry · 83160 La Valette Du Var · Tél. 04 94 61 28 93</div>
  </div>
);

// En-tête ticket 7×12 (réparation / fabrication)
const HeaderTicket = ({ type }) => (
  <div style={{ textAlign: "center", paddingBottom: 10, borderBottom: "2px solid #c9a84c", marginBottom: 10 }}>
    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic", fontWeight: 700, color: "#c9a84c", lineHeight: 1 }}>L'Atelier Guedj</div>
    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, fontStyle: "italic", color: "#888", marginTop: 1 }}>Philippe &amp; Kévin</div>
    <div style={{ fontSize: 8, color: "#aaa", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 1 }}>Artisan Bijoutier Joaillier</div>
    <div style={{ fontSize: 8, color: "#999", marginTop: 1 }}>04 94 61 28 93 — La Valette Du Var</div>
    <div style={{ height: 1, background: "linear-gradient(to right,transparent,#c9a84c,transparent)", margin: "7px 0 5px" }} />
    <div style={{ fontSize: 9, fontWeight: 700, color: "#c9a84c", letterSpacing: "0.1em", textTransform: "uppercase", background: "#c9a84c11", padding: "3px 10px", borderRadius: 3, display: "inline-block" }}>{type}</div>
  </div>
);
const TkRow = ({ label, val }) => (
  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 2 }}>
    <span style={{ color: "#888" }}>{label}</span>
    <span style={{ color: "#1a1a1a", fontWeight: 500, textAlign: "right", maxWidth: "58%" }}>{val || "—"}</span>
  </div>
);
const TkSect = ({ title, children }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ fontSize: 7.5, color: "#c9a84c", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, borderBottom: "1px solid #e8dfd0", paddingBottom: 2, marginBottom: 5 }}>{title}</div>
    {children}
  </div>
);
const FooterTicket = () => (
  <div style={{ textAlign: "center", borderTop: "1px solid #e8dfd0", paddingTop: 6, marginTop: 8, fontSize: 8, color: "#c9a84c", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", lineHeight: 1.4 }}>
    Bijouterie L'Atelier Guedj<br/>Philippe &amp; Kévin — Depuis 1998
  </div>
);

// ─── MAIL HELPERS ─────────────────────────────────────────────────────────────
const sendMail = (email, sujet, corps) => {
  window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
};

function MailModal({ label, defaultEmail, onSend, onClose }) {
  const [email, setEmail] = useState(defaultEmail || "");
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000ee", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#1a1814", border: "1px solid #c9a84c44", borderRadius: 14, width: "100%", maxWidth: 400, padding: 24 }}>
        <div style={{ fontFamily: "'Cormorant Garamond'", color: "#c9a84c", fontSize: 20, marginBottom: 14 }}>✉️ Envoyer par mail</div>
        <label>Adresse email du client</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="client@email.com" type="email" style={{ marginBottom: 14 }} />
        <div style={{ fontSize: 11, color: "#8a7e68", marginBottom: 16, lineHeight: 1.5 }}>Votre application mail s'ouvrira avec le résumé de {label} pré-rempli.</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn onClick={() => { if (email) { onSend(email); onClose(); } }}>✉️ Envoyer</Btn>
        </div>
      </div>
    </div>
  );
}

function PrintBar({ title, onPrint, onMail, onClose }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", borderBottom: "1px solid #2e2a22", flexWrap: "wrap", gap: 8 }}>
      <span style={{ fontFamily: "'Cormorant Garamond'", color: "#c9a84c", fontSize: 17 }}>{title}</span>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onMail} style={{ background: "transparent", border: "1px solid #7a6228", borderRadius: 6, padding: "7px 13px", color: "#c9a84c", fontSize: 12, cursor: "pointer" }}>✉️ Mail</button>
        <button onClick={onPrint} style={{ background: "linear-gradient(135deg,#c9a84c,#7a6228)", border: "none", borderRadius: 6, padding: "7px 16px", color: "#0f0e0c", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>🖨️ Imprimer</button>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #7a6228", borderRadius: 6, padding: "7px 11px", color: "#c9a84c", fontSize: 13, cursor: "pointer" }}>✕</button>
      </div>
    </div>
  );
}

// ─── PRINT RÉPARATION (ticket 7×12) ──────────────────────────────────────────
function PrintRep({ rep, onClose }) {
  const [mail, setMail] = useState(false);
  const body = `Bonjour ${rep.prenom} ${rep.nom},\n\nRécapitulatif de votre réparation :\n\nN° : ${rep.numero}\nArticle : ${rep.article || "—"}\nMatière : ${rep.matiere || "—"} — Poids : ${rep.poids || "—"} g\nDescription : ${rep.description || "—"}\n\nPrix total : ${rep.prix || "—"} €\nAcompte versé : ${rep.acompte || "—"} €\nSolde restant : ${rep.solde || "—"} €\nDate de livraison : ${rep.dateLivraison || "—"}\n\nCordialement,\nBijouterie L'Atelier Guedj — Philippe & Kévin\n152 Avenue Paul Valéry, 83160 La Valette Du Var\nTél. 04 94 61 28 93`;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000dd", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      {mail && <MailModal label="la fiche réparation" defaultEmail={rep.email || ""} onSend={e => sendMail(e, `Réparation ${rep.numero} — L'Atelier Guedj`, body)} onClose={() => setMail(false)} />}
      <div style={{ background: "#1a1814", border: "1px solid #c9a84c44", borderRadius: 16, width: "100%", maxWidth: 700, maxHeight: "92vh", overflowY: "auto" }}>
        <PrintBar title="🖨️ Fiche réparation — Ticket 7×12 cm" onPrint={() => window.print()} onMail={() => setMail(true)} onClose={onClose} />
        <div style={{ padding: "14px", display: "flex", justifyContent: "center" }}>
          <div id="print-zone" style={{ background: "white", fontFamily: "Arial,sans-serif", width: 264, padding: "14px 13px", border: "1px solid #ddd", borderRadius: 4 }}>
            <HeaderTicket type="Fiche de Réparation" />
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Cormorant Garamond',serif", color: "#c9a84c", textAlign: "center", marginBottom: 2 }}>{rep.numero}</div>
            {rep.numeroPolice && <div style={{ fontSize: 8.5, color: "#888", textAlign: "center", marginBottom: 6 }}>N° Police : {rep.numeroPolice}</div>}
            <div style={{ fontSize: 8, color: "#999", textAlign: "center", marginBottom: 8 }}>La Valette Du Var, le {dateStr()}</div>
            <TkSect title="Client">
              <TkRow label="Nom" val={`${rep.prenom} ${rep.nom}`} />
              <TkRow label="Tél." val={rep.telephone} />
              <TkRow label="Adresse" val={[rep.adresse, rep.codePostal, rep.ville].filter(Boolean).join(", ")} />
            </TkSect>
            <TkSect title="Travail">
              <TkRow label="Article" val={rep.article} />
              <TkRow label="Matière" val={rep.matiere} />
              <TkRow label="Poids" val={rep.poids ? `${rep.poids} g` : null} />
              <TkRow label="Réparateur" val={rep.reparateur} />
              <TkRow label="Livraison" val={rep.dateLivraison} />
              {rep.description && <div style={{ background: "#faf8f4", border: "1px solid #e8dfd0", borderRadius: 3, padding: "5px 7px", fontSize: 9, color: "#555", marginTop: 4, lineHeight: 1.4 }}>{rep.description}</div>}
            </TkSect>
            {rep.photos?.length > 0 && (
              <TkSect title="Photo">
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {rep.photos.map(p => <img key={p.id} src={p.data} alt="" style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 4, border: "1px solid #e8dfd0" }} />)}
                </div>
              </TkSect>
            )}
            <TkSect title="Tarif">
              <div style={{ display: "flex", border: "1px solid #e8dfd0", borderRadius: 4, overflow: "hidden" }}>
                {[["Prix", rep.prix], ["Acompte", rep.acompte], ["Solde", rep.solde]].map(([l, v], i) => (
                  <div key={l} style={{ flex: 1, padding: "5px 3px", textAlign: "center", borderRight: i < 2 ? "1px solid #e8dfd0" : "none", background: i === 2 ? "#faf8f4" : "white" }}>
                    <div style={{ fontSize: 7, color: "#aaa", textTransform: "uppercase" }}>{l}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: i === 2 ? "#c9a84c" : "#1a1a1a" }}>{v ? `${v}€` : "—"}</div>
                  </div>
                ))}
              </div>
            </TkSect>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
              {["Signature client", "Signature Atelier"].map(l => (
                <div key={l} style={{ border: "1px solid #e8dfd0", borderRadius: 3, padding: "6px" }}>
                  <div style={{ fontSize: 7, color: "#aaa", textTransform: "uppercase", marginBottom: 16 }}>{l}</div>
                  <div style={{ borderTop: "1px dashed #ccc" }} />
                </div>
              ))}
            </div>
            <FooterTicket />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PRINT FABRICATION (ticket 7×12) ─────────────────────────────────────────
function PrintFab({ fab, onClose }) {
  const [mail, setMail] = useState(false);
  const body = `Bonjour ${fab.prenom} ${fab.nom},\n\nRécapitulatif de votre fabrication :\n\nMatière : ${fab.matiere || "—"}\nOr fourni : ${fab.orFourni || "—"} g\nOr utilisé : ${fab.orUtilise || "—"} g\nPoids bijou : ${fab.poidsBijou || "—"} g\nDescription : ${fab.description || "—"}\nPrix : ${fab.prix || "—"} €\nDate de livraison : ${fab.dateLivraison || "—"}\n\nCordialement,\nBijouterie L'Atelier Guedj — Philippe & Kévin\n152 Avenue Paul Valéry, 83160 La Valette Du Var\nTél. 04 94 61 28 93`;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000dd", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      {mail && <MailModal label="la fiche fabrication" defaultEmail={fab.email || ""} onSend={e => sendMail(e, `Fabrication — L'Atelier Guedj`, body)} onClose={() => setMail(false)} />}
      <div style={{ background: "#1a1814", border: "1px solid #c9a84c44", borderRadius: 16, width: "100%", maxWidth: 700, maxHeight: "92vh", overflowY: "auto" }}>
        <PrintBar title="🖨️ Fiche fabrication — Ticket 7×12 cm" onPrint={() => window.print()} onMail={() => setMail(true)} onClose={onClose} />
        <div style={{ padding: "14px", display: "flex", justifyContent: "center" }}>
          <div id="print-zone" style={{ background: "white", fontFamily: "Arial,sans-serif", width: 264, padding: "14px 13px", border: "1px solid #ddd", borderRadius: 4 }}>
            <HeaderTicket type="Fiche de Fabrication" />
            <div style={{ fontSize: 8, color: "#999", textAlign: "center", marginBottom: 8 }}>La Valette Du Var, le {dateStr()}</div>
            <TkSect title="Client">
              <TkRow label="Nom" val={`${fab.prenom} ${fab.nom}`} />
              <TkRow label="Tél." val={fab.telephone} />
            </TkSect>
            <TkSect title="Fabrication">
              <TkRow label="Matière" val={fab.matiere} />
              <TkRow label="Or fourni" val={fab.orFourni ? `${fab.orFourni} g` : null} />
              <TkRow label="Or utilisé" val={fab.orUtilise ? `${fab.orUtilise} g` : null} />
              <TkRow label="Poids bijou" val={fab.poidsBijou ? `${fab.poidsBijou} g` : null} />
              <TkRow label="Prix" val={fab.prix ? `${fab.prix} €` : null} />
              <TkRow label="Livraison" val={fab.dateLivraison} />
              {fab.description && <div style={{ background: "#faf8f4", border: "1px solid #e8dfd0", borderRadius: 3, padding: "5px 7px", fontSize: 9, color: "#555", marginTop: 4, lineHeight: 1.4 }}>{fab.description}</div>}
            </TkSect>
            {fab.photos?.length > 0 && (
              <TkSect title="Photo">
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {fab.photos.map(p => <img key={p.id} src={p.data} alt="" style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 4, border: "1px solid #e8dfd0" }} />)}
                </div>
              </TkSect>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
              {["Signature client", "Signature Atelier"].map(l => (
                <div key={l} style={{ border: "1px solid #e8dfd0", borderRadius: 3, padding: "6px" }}>
                  <div style={{ fontSize: 7, color: "#aaa", textTransform: "uppercase", marginBottom: 16 }}>{l}</div>
                  <div style={{ borderTop: "1px dashed #ccc" }} />
                </div>
              ))}
            </div>
            <FooterTicket />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PRINT FACTURE A4 ─────────────────────────────────────────────────────────
function PrintFacture({ fac, onClose }) {
  const [mail, setMail] = useState(false);
  const lignes = fac.lignes || [];
  const totalHT = lignes.reduce((s, l) => s + parseFloat(l.prixUnit || 0) * parseFloat(l.quantite || 1), 0);
  const totalTTC = lignes.reduce((s, l) => { const ht = parseFloat(l.prixUnit || 0) * parseFloat(l.quantite || 1); return s + ht * (1 + parseFloat(l.tva || 0) / 100); }, 0);
  const totalTVA = totalTTC - totalHT;
  const lignesText = lignes.map(l => `- ${l.designation || "—"} : ${l.prixUnit || "0"} € HT x${l.quantite}`).join("\n");
  const body = `Bonjour ${fac.prenom} ${fac.nom},\n\nVeuillez trouver ci-dessous votre facture :\n\nN° : ${fac.numero}\nDate : ${fac.date ? new Date(fac.date).toLocaleDateString("fr-FR") : dateStr()}\n${fac.article ? `Article : ${fac.article}\n` : ""}${fac.estimationBijou ? `Valeur estimée : ${fac.estimationBijou} €\n` : ""}\nPrestations :\n${lignesText}\n\nTotal HT : ${totalHT.toFixed(2)} €\nTVA : ${totalTVA.toFixed(2)} €\nTotal TTC : ${totalTTC.toFixed(2)} €\n\nCordialement,\nBijouterie L'Atelier Guedj — Philippe & Kévin\n152 Avenue Paul Valéry, 83160 La Valette Du Var\nTél. 04 94 61 28 93`;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000dd", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      {mail && <MailModal label="la facture" defaultEmail={fac.email || ""} onSend={e => sendMail(e, `Facture ${fac.numero} — L'Atelier Guedj`, body)} onClose={() => setMail(false)} />}
      <div style={{ background: "#1a1814", border: "1px solid #c9a84c44", borderRadius: 16, width: "100%", maxWidth: 720, maxHeight: "92vh", overflowY: "auto" }}>
        <PrintBar title="🖨️ Facture — Format A4" onPrint={() => window.print()} onMail={() => setMail(true)} onClose={onClose} />
        <div id="print-zone" style={{ background: "white", color: "#1a1a1a", fontFamily: "Arial,sans-serif", padding: "28px 32px" }}>
          <HeaderA4 type="FACTURE" numero={fac.numero} date={fac.date ? new Date(fac.date).toLocaleDateString("fr-FR") : dateStr()} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
            <div style={{ border: "1px solid #e8dfd0", borderRadius: 6, padding: "11px 16px", minWidth: 210, background: "#faf8f4" }}>
              <div style={{ fontSize: 8.5, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5, fontWeight: 700 }}>Facturé à</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{fac.prenom} {fac.nom}</div>
              {fac.adresse && <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{fac.adresse}</div>}
              {(fac.codePostal || fac.ville) && <div style={{ fontSize: 11, color: "#666" }}>{fac.codePostal} {fac.ville}</div>}
              {fac.telephone && <div style={{ fontSize: 11, color: "#666" }}>Tél : {fac.telephone}</div>}
            </div>
          </div>
          {(fac.article || fac.estimationBijou) && (
            <Sect title="Bijou concerné">
              <G4>
                {fac.article && <Inf label="Article" val={fac.article} />}
                {fac.matiere && <Inf label="Matière" val={fac.matiere} />}
                {fac.poids && <Inf label="Poids" val={`${fac.poids} g`} />}
                {fac.estimationBijou && <Inf label="Valeur estimée" val={`${fac.estimationBijou} €`} color="#c9a84c" />}
              </G4>
              {fac.description && <Desc>{fac.description}</Desc>}
            </Sect>
          )}
          {fac.photos?.length > 0 && (
            <Sect title="Photos">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {fac.photos.map(p => <img key={p.id} src={p.data} alt="" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 6, border: "1px solid #e8dfd0" }} />)}
              </div>
            </Sect>
          )}
          <Sect title="Détail des prestations">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: "#f5f0e8", borderBottom: "2px solid #c9a84c" }}>
                {["Désignation","Qté","Prix HT","TVA","Total TTC"].map((h,i) => <th key={h} style={{ padding: "8px 10px", fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", color: "#7a6228", textAlign: i === 0 ? "left" : "right", fontWeight: 700 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {lignes.map((l, i) => { const ht = parseFloat(l.prixUnit || 0) * parseFloat(l.quantite || 1); const ttc = ht * (1 + parseFloat(l.tva || 0) / 100); return (
                  <tr key={l.id} style={{ borderBottom: "1px solid #f0ece4", background: i % 2 === 0 ? "white" : "#faf8f4" }}>
                    <td style={{ padding: "8px 10px" }}>{l.designation || "—"}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right" }}>{l.quantite}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right" }}>{l.prixUnit ? `${parseFloat(l.prixUnit).toFixed(2)} €` : "—"}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right" }}>{l.tva} %</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700 }}>{ttc ? `${ttc.toFixed(2)} €` : "—"}</td>
                  </tr>
                ); })}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <div style={{ minWidth: 210, border: "1px solid #e8dfd0", borderRadius: 6, overflow: "hidden" }}>
                {[["Total HT", `${totalHT.toFixed(2)} €`], ["Total TVA", `${totalTVA.toFixed(2)} €`]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 12px", fontSize: 12, color: "#666", borderBottom: "1px solid #f0ece4" }}><span>{l}</span><span>{v}</span></div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", fontSize: 15, fontWeight: 700, color: "#c9a84c", background: "#faf8f4", borderTop: "2px solid #c9a84c" }}><span>TOTAL TTC</span><span>{totalTTC.toFixed(2)} €</span></div>
              </div>
            </div>
          </Sect>
          <Signs />
          <FooterA4 />
        </div>
      </div>
    </div>
  );
}

// ─── PRINT ESTIMATION A4 ─────────────────────────────────────────────────────
function PrintEstimation({ est, onClose }) {
  const [mail, setMail] = useState(false);
  const lignes = est.lignes || [];
  const totalHT = lignes.reduce((s, l) => s + parseFloat(l.prixUnit || 0) * parseFloat(l.quantite || 1), 0);
  const totalTTC = lignes.reduce((s, l) => { const ht = parseFloat(l.prixUnit || 0) * parseFloat(l.quantite || 1); return s + ht * (1 + parseFloat(l.tva || 0) / 100); }, 0);
  const totalTVA = totalTTC - totalHT;
  const lignesText = lignes.map(l => `- ${l.designation || "—"} : ${l.prixUnit || "0"} € HT x${l.quantite}`).join("\n");
  const body = `Bonjour ${est.prenom} ${est.nom},\n\nVeuillez trouver ci-dessous votre estimation :\n\nN° : ${est.numero}\nDate : ${est.date ? new Date(est.date).toLocaleDateString("fr-FR") : dateStr()}\n${est.article ? `Article : ${est.article}\n` : ""}${est.estimationBijou ? `Valeur estimée du bijou : ${est.estimationBijou} €\n` : ""}\nTravaux estimés :\n${lignesText}\n\nTotal HT : ${totalHT.toFixed(2)} €\nTVA : ${totalTVA.toFixed(2)} €\nTotal TTC : ${totalTTC.toFixed(2)} €\n\nCordialement,\nBijouterie L'Atelier Guedj — Philippe & Kévin\n152 Avenue Paul Valéry, 83160 La Valette Du Var\nTél. 04 94 61 28 93`;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000dd", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      {mail && <MailModal label="l'estimation" defaultEmail={est.email || ""} onSend={e => sendMail(e, `Estimation ${est.numero} — L'Atelier Guedj`, body)} onClose={() => setMail(false)} />}
      <div style={{ background: "#1a1814", border: "1px solid #c9a84c44", borderRadius: 16, width: "100%", maxWidth: 720, maxHeight: "92vh", overflowY: "auto" }}>
        <PrintBar title="🖨️ Estimation — Format A4" onPrint={() => window.print()} onMail={() => setMail(true)} onClose={onClose} />
        <div id="print-zone" style={{ background: "white", color: "#1a1a1a", fontFamily: "Arial,sans-serif", padding: "28px 32px" }}>
          <HeaderA4 type="ESTIMATION" numero={est.numero} date={est.date ? new Date(est.date).toLocaleDateString("fr-FR") : dateStr()} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
            <div style={{ border: "1px solid #e8dfd0", borderRadius: 6, padding: "11px 16px", minWidth: 210, background: "#faf8f4" }}>
              <div style={{ fontSize: 8.5, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5, fontWeight: 700 }}>Client</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{est.prenom} {est.nom}</div>
              {est.adresse && <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{est.adresse}</div>}
              {(est.codePostal || est.ville) && <div style={{ fontSize: 11, color: "#666" }}>{est.codePostal} {est.ville}</div>}
              {est.telephone && <div style={{ fontSize: 11, color: "#666" }}>Tél : {est.telephone}</div>}
            </div>
          </div>
          {est.estimationBijou && (
            <div style={{ background: "linear-gradient(to right,#fdf9f0,#faf8f4)", border: "1.5px solid #c9a84c44", borderRadius: 8, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 9, color: "#aaa", textTransform: "uppercase", letterSpacing: ".1em" }}>Estimation de la valeur du bijou</div>
                {est.article && <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{est.article}{est.matiere ? ` — ${est.matiere}` : ""}{est.poids ? ` — ${est.poids} g` : ""}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: "#c9a84c" }}>{est.estimationBijou} €</div>
                <div style={{ fontSize: 9, color: "#aaa" }}>estimation</div>
              </div>
            </div>
          )}
          {est.description && <Sect title="Description"><Desc>{est.description}</Desc></Sect>}
          {est.photos?.length > 0 && (
            <Sect title="Photos">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {est.photos.map(p => <img key={p.id} src={p.data} alt="" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 6, border: "1px solid #e8dfd0" }} />)}
              </div>
            </Sect>
          )}
          <Sect title="Travaux estimés">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: "#f5f0e8", borderBottom: "2px solid #c9a84c" }}>
                {["Désignation","Qté","Prix HT","TVA","Total TTC"].map((h,i) => <th key={h} style={{ padding: "8px 10px", fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", color: "#7a6228", textAlign: i === 0 ? "left" : "right", fontWeight: 700 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {lignes.map((l, i) => { const ht = parseFloat(l.prixUnit || 0) * parseFloat(l.quantite || 1); const ttc = ht * (1 + parseFloat(l.tva || 0) / 100); return (
                  <tr key={l.id} style={{ borderBottom: "1px solid #f0ece4", background: i % 2 === 0 ? "white" : "#faf8f4" }}>
                    <td style={{ padding: "8px 10px" }}>{l.designation || "—"}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right" }}>{l.quantite}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right" }}>{l.prixUnit ? `${parseFloat(l.prixUnit).toFixed(2)} €` : "—"}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right" }}>{l.tva} %</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700 }}>{ttc ? `${ttc.toFixed(2)} €` : "—"}</td>
                  </tr>
                ); })}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <div style={{ minWidth: 210, border: "1px solid #e8dfd0", borderRadius: 6, overflow: "hidden" }}>
                {[["Total HT", `${totalHT.toFixed(2)} €`], ["Total TVA", `${totalTVA.toFixed(2)} €`]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 12px", fontSize: 12, color: "#666", borderBottom: "1px solid #f0ece4" }}><span>{l}</span><span>{v}</span></div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", fontSize: 15, fontWeight: 700, color: "#c9a84c", background: "#faf8f4", borderTop: "2px solid #c9a84c" }}><span>TOTAL TTC</span><span>{totalTTC.toFixed(2)} €</span></div>
              </div>
            </div>
          </Sect>
          <FooterA4 />
        </div>
      </div>
    </div>
  );
}

// ─── PRINT ACHAT OR A4 ────────────────────────────────────────────────────────
function PrintAchat({ achat, onClose }) {
  const [mail, setMail] = useState(false);
  const body = `Bonjour ${achat.prenom} ${achat.nom},\n\nRécapitulatif de votre vente de métal :\n\nN° : ${achat.numero}\nType : ${achat.typeMetal === "or" ? "Or" : "Argent"}\nPoids : ${achat.poids || "—"} g\nPrix : ${achat.prix || "—"} €\nRèglement : ${achat.reglement === "cheque" ? "Chèque" : "Virement"}\nDate : ${achat.date ? new Date(achat.date).toLocaleDateString("fr-FR") : dateStr()}\n\nCordialement,\nBijouterie L'Atelier Guedj — Philippe & Kévin\n152 Avenue Paul Valéry, 83160 La Valette Du Var\nTél. 04 94 61 28 93`;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000dd", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      {mail && <MailModal label="la facture achat métal" defaultEmail={achat.email || ""} onSend={e => sendMail(e, `Achat métal ${achat.numero} — L'Atelier Guedj`, body)} onClose={() => setMail(false)} />}
      <div style={{ background: "#1a1814", border: "1px solid #c9a84c44", borderRadius: 16, width: "100%", maxWidth: 720, maxHeight: "92vh", overflowY: "auto" }}>
        <PrintBar title="🖨️ Achat métal — Format A4" onPrint={() => window.print()} onMail={() => setMail(true)} onClose={onClose} />
        <div id="print-zone" style={{ background: "white", color: "#1a1a1a", fontFamily: "Arial,sans-serif", padding: "28px 32px" }}>
          <HeaderA4 type="ACHAT MÉTAL" numero={achat.numero} date={achat.date ? new Date(achat.date).toLocaleDateString("fr-FR") : dateStr()} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
            <div style={{ border: "1px solid #e8dfd0", borderRadius: 6, padding: "11px 16px", minWidth: 220, background: "#faf8f4" }}>
              <div style={{ fontSize: 8.5, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5, fontWeight: 700 }}>Vendeur</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{achat.prenom} {achat.nom}</div>
              {achat.adresse && <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{achat.adresse}</div>}
              {(achat.codePostal || achat.ville) && <div style={{ fontSize: 11, color: "#666" }}>{achat.codePostal} {achat.ville}</div>}
              {achat.telephone && <div style={{ fontSize: 11, color: "#666" }}>Tél : {achat.telephone}</div>}
              {achat.numeroCNI && <div style={{ fontSize: 11, color: "#666", marginTop: 4, padding: "4px 8px", background: "#f0ece4", borderRadius: 4 }}>CNI : <strong style={{ color: "#444" }}>{achat.numeroCNI}</strong></div>}
            </div>
          </div>
          <Sect title="Métal acheté">
            <G4>
              <Inf label="Type de métal" val={achat.typeMetal === "or" ? "Or" : "Argent"} color="#c9a84c" />
              <Inf label="Poids" val={achat.poids ? `${achat.poids} g` : null} />
              <Inf label="Prix payé" val={achat.prix ? `${achat.prix} €` : null} color="#c9a84c" />
              <Inf label="Date" val={achat.date ? new Date(achat.date).toLocaleDateString("fr-FR") : dateStr()} />
            </G4>
            {achat.description && <Desc>{achat.description}</Desc>}
          </Sect>
          <Sect title="Règlement">
            <div style={{ display: "flex", gap: 24, fontSize: 13, marginTop: 4 }}>
              {["cheque", "virement"].map(r => (
                <div key={r} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: achat.reglement === r ? "#c9a84c" : "white", border: `2px solid ${achat.reglement === r ? "#c9a84c" : "#ddd"}`, flexShrink: 0 }} />
                  <span style={{ color: achat.reglement === r ? "#1a1a1a" : "#aaa", fontWeight: achat.reglement === r ? 700 : 400 }}>{r === "cheque" ? "Chèque" : "Virement"}{achat.reglement === r ? " ✓" : ""}</span>
                </div>
              ))}
            </div>
          </Sect>
          <Signs />
          <FooterA4 />
        </div>
      </div>
    </div>
  );
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
function ClientSection({ clients, setClients, setActiveTab, setSelectedClientId }) {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyClient());
  const filtered = clients.filter(c => `${c.nom} ${c.prenom} ${c.telephone} ${c.ville}`.toLowerCase().includes(search.toLowerCase()));
  const open = (c = null) => { setForm(c ? { ...c } : emptyClient()); setModal(c || "new"); };
  const save = () => { if (!form.nom || !form.prenom) return alert("Nom et prénom requis"); if (modal === "new") setClients(p => [...p, form]); else setClients(p => p.map(c => c.id === form.id ? form : c)); setModal(null); };
  const del = (id) => { if (confirm("Supprimer ce client ?")) setClients(p => p.filter(c => c.id !== id)); };
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input style={{ flex: 1, minWidth: 200 }} placeholder="🔍  Rechercher un client…" value={search} onChange={e => setSearch(e.target.value)} />
        <Btn onClick={() => open()}>+ Nouveau client</Btn>
      </div>
      {filtered.length === 0 && <p style={{ color: "#8a7e68", textAlign: "center", marginTop: 40 }}>Aucun client trouvé</p>}
      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(c => (
          <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 20, fontWeight: 600, color: "#e8c96a" }}>{c.prenom} {c.nom}</div>
              <div style={{ color: "#8a7e68", fontSize: 13, marginTop: 2 }}>{c.adresse}{c.ville ? `, ${c.ville}` : ""}{c.codePostal ? ` ${c.codePostal}` : ""}</div>
              <div style={{ color: "#8a7e68", fontSize: 13 }}>{c.telephone}</div>
              {c.email && <div style={{ color: "#8a7e68", fontSize: 13 }}>{c.email}</div>}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn small variant="ghost" onClick={() => { setSelectedClientId(c.id); setActiveTab("reparations"); }}>Réparations</Btn>
              <Btn small variant="ghost" onClick={() => { setSelectedClientId(c.id); setActiveTab("fabrications"); }}>Fabrications</Btn>
              <Btn small variant="ghost" onClick={() => { setSelectedClientId(c.id); setActiveTab("factures"); }}>Factures</Btn>
              <Btn small variant="ghost" onClick={() => open(c)}>Modifier</Btn>
              <Btn small variant="danger" onClick={() => del(c.id)}>Suppr.</Btn>
            </div>
          </Card>
        ))}
      </div>
      {modal && (
        <Modal title={modal === "new" ? "Nouveau client" : "Modifier le client"} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Nom" value={form.nom} onChange={f("nom")} /><Field label="Prénom" value={form.prenom} onChange={f("prenom")} /></div>
          <Field label="Adresse" value={form.adresse} onChange={f("adresse")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Code postal" value={form.codePostal} onChange={f("codePostal")} /><Field label="Ville" value={form.ville} onChange={f("ville")} /></div>
          <Field label="Téléphone" value={form.telephone} onChange={f("telephone")} type="tel" />
          <Field label="Email" value={form.email || ""} onChange={f("email")} type="email" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}><Btn variant="ghost" onClick={() => setModal(null)}>Annuler</Btn><Btn onClick={save}>Enregistrer</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ─── RÉPARATIONS ──────────────────────────────────────────────────────────────
function RepSection({ clients, reps, setReps, selectedClientId, setSelectedClientId }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(null);
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState(selectedClientId || "");
  const [printR, setPrintR] = useState(null);
  useEffect(() => { setFilterClient(selectedClientId || ""); }, [selectedClientId]);
  const filtered = reps.filter(r => `${r.nom} ${r.prenom} ${r.numero} ${r.numeroPolice} ${r.article}`.toLowerCase().includes(search.toLowerCase()) && (filterClient ? r.clientId === filterClient : true));
  const open = (r = null) => {
    if (r) { setForm({ ...r }); setModal(r); }
    else {
      const nf = emptyRep(reps, filterClient);
      if (filterClient) { const c = clients.find(x => x.id === filterClient); if (c) Object.assign(nf, { clientId: c.id, nom: c.nom, prenom: c.prenom, adresse: c.adresse, ville: c.ville, codePostal: c.codePostal, telephone: c.telephone, email: c.email || "" }); }
      setForm(nf); setModal("new");
    }
  };
  const onCC = cid => { const c = clients.find(x => x.id === cid); setForm(p => ({ ...p, clientId: cid, nom: c?.nom || "", prenom: c?.prenom || "", adresse: c?.adresse || "", ville: c?.ville || "", codePostal: c?.codePostal || "", telephone: c?.telephone || "", email: c?.email || "" })); };
  const save = () => { if (!form.nom) return alert("Nom requis"); if (modal === "new") setReps(p => [...p, form]); else setReps(p => p.map(r => r.id === form.id ? form : r)); setModal(null); };
  const del = id => { if (confirm("Supprimer ?")) setReps(p => p.filter(r => r.id !== id)); };
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={{ padding: "0 16px" }}>
      {printR && <PrintRep rep={printR} onClose={() => setPrintR(null)} />}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input style={{ flex: 1, minWidth: 180 }} placeholder="🔍  Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ flex: 1, minWidth: 160 }} value={filterClient} onChange={e => { setFilterClient(e.target.value); setSelectedClientId(e.target.value); }}>
          <option value="">Tous les clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
        </select>
        <Btn onClick={() => open()}>+ Nouvelle</Btn>
      </div>
      {filtered.length === 0 && <p style={{ color: "#8a7e68", textAlign: "center", marginTop: 40 }}>Aucune réparation</p>}
      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(r => (
          <Card key={r.id}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 17, color: "#c9a84c", fontWeight: 600 }}>{r.numero}</span>
                  {r.numeroPolice && <Badge color="#7a6228">Police: {r.numeroPolice}</Badge>}
                  <Badge color={r.livre ? "#27ae60" : "#7a6228"}>{r.livre ? "✓ Livré" : "En cours"}</Badge>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 16 }}>{r.prenom} {r.nom}</div>
                <div style={{ color: "#8a7e68", fontSize: 13, marginTop: 2 }}>{r.article}{r.matiere ? ` — ${r.matiere}` : ""}{r.poids ? ` (${r.poids}g)` : ""}</div>
                {r.description && <div style={{ color: "#8a7e68", fontSize: 13, fontStyle: "italic", marginTop: 2 }}>{r.description.slice(0, 80)}{r.description.length > 80 ? "…" : ""}</div>}
                <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                  {r.prix && <span style={{ color: "#e8c96a", fontSize: 13 }}>{r.prix} €</span>}
                  {r.acompte && <span style={{ color: "#8a7e68", fontSize: 12 }}>Acompte: {r.acompte} €</span>}
                  {r.solde && <span style={{ color: "#8a7e68", fontSize: 12 }}>Solde: {r.solde} €</span>}
                  {r.dateLivraison && <span style={{ color: "#8a7e68", fontSize: 12 }}>Livraison: {r.dateLivraison}</span>}
                </div>
                {r.photos?.length > 0 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {r.photos.slice(0, 4).map(p => <img key={p.id} src={p.data} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid #2e2a22" }} />)}
                    {r.photos.length > 4 && <div style={{ width: 48, height: 48, borderRadius: 6, background: "#141210", border: "1px solid #2e2a22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#8a7e68" }}>+{r.photos.length - 4}</div>}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 6 }}><Btn small variant="ghost" onClick={() => open(r)}>Modifier</Btn><Btn small variant="danger" onClick={() => del(r.id)}>Suppr.</Btn></div>
                <button onClick={() => setPrintR(r)} style={{ background: "transparent", border: "1px solid #7a6228", borderRadius: 6, padding: "5px 10px", color: "#c9a84c", fontSize: 11, cursor: "pointer" }}>🖨️ Imprimer / Mail</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {modal && form && (
        <Modal title={modal === "new" ? `Nouvelle réparation — ${form.numero}` : `Réparation ${form.numero}`} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="N° Réparation" value={form.numero} onChange={f("numero")} /><Field label="N° Police" value={form.numeroPolice} onChange={f("numeroPolice")} /></div>
          <Field label="Client (liaison)" value={form.clientId} onChange={onCC} options={clients.map(c => ({ value: c.id, label: `${c.prenom} ${c.nom}` }))} />
          <GoldLine />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Nom" value={form.nom} onChange={f("nom")} /><Field label="Prénom" value={form.prenom} onChange={f("prenom")} /></div>
          <Field label="Adresse" value={form.adresse} onChange={f("adresse")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Code postal" value={form.codePostal} onChange={f("codePostal")} /><Field label="Ville" value={form.ville} onChange={f("ville")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Téléphone" value={form.telephone} onChange={f("telephone")} type="tel" /><Field label="Email" value={form.email || ""} onChange={f("email")} type="email" /></div>
          <GoldLine />
          <Field label="Description du travail" value={form.description} onChange={f("description")} rows={3} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Article" value={form.article} onChange={f("article")} /><Field label="Matière" value={form.matiere} onChange={f("matiere")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Poids (g)" value={form.poids} onChange={f("poids")} /><Field label="Réparateur" value={form.reparateur} onChange={f("reparateur")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 12px" }}><Field label="Prix (€)" value={form.prix} onChange={f("prix")} /><Field label="Acompte (€)" value={form.acompte} onChange={f("acompte")} /><Field label="Solde (€)" value={form.solde} onChange={f("solde")} /></div>
          <GoldLine />
          <PhotoPicker photos={form.photos || []} onChange={val => setForm(p => ({ ...p, photos: typeof val === "function" ? val(p.photos || []) : val }))} />
          <GoldLine />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <input type="checkbox" id="livreRep" checked={form.livre} onChange={e => setForm(p => ({ ...p, livre: e.target.checked }))} />
            <label htmlFor="livreRep" style={{ margin: 0, textTransform: "none", fontSize: 14, color: form.livre ? "#27ae60" : "#f0ead8", cursor: "pointer" }}>{form.livre ? "✓ Livraison confirmée" : "Marquer comme livré"}</label>
          </div>
          <Field label="Date de livraison" value={form.dateLivraison} onChange={f("dateLivraison")} type="date" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}><Btn variant="ghost" onClick={() => setModal(null)}>Annuler</Btn><Btn onClick={save}>Enregistrer</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ─── FABRICATIONS ─────────────────────────────────────────────────────────────
function FabSection({ clients, fabs, setFabs, selectedClientId, setSelectedClientId }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(null);
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState(selectedClientId || "");
  const [printF, setPrintF] = useState(null);
  useEffect(() => { setFilterClient(selectedClientId || ""); }, [selectedClientId]);
  const filtered = fabs.filter(r => `${r.nom} ${r.prenom} ${r.matiere}`.toLowerCase().includes(search.toLowerCase()) && (filterClient ? r.clientId === filterClient : true));
  const open = (r = null) => {
    if (r) { setForm({ ...r }); setModal(r); }
    else { const nf = emptyFab(fabs, filterClient); if (filterClient) { const c = clients.find(x => x.id === filterClient); if (c) Object.assign(nf, { clientId: c.id, nom: c.nom, prenom: c.prenom, adresse: c.adresse, ville: c.ville, codePostal: c.codePostal, telephone: c.telephone, email: c.email || "" }); } setForm(nf); setModal("new"); }
  };
  const onCC = cid => { const c = clients.find(x => x.id === cid); setForm(p => ({ ...p, clientId: cid, nom: c?.nom || "", prenom: c?.prenom || "", adresse: c?.adresse || "", ville: c?.ville || "", codePostal: c?.codePostal || "", telephone: c?.telephone || "", email: c?.email || "" })); };
  const save = () => { if (!form.nom) return alert("Nom requis"); if (modal === "new") setFabs(p => [...p, form]); else setFabs(p => p.map(r => r.id === form.id ? form : r)); setModal(null); };
  const del = id => { if (confirm("Supprimer ?")) setFabs(p => p.filter(r => r.id !== id)); };
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={{ padding: "0 16px" }}>
      {printF && <PrintFab fab={printF} onClose={() => setPrintF(null)} />}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input style={{ flex: 1, minWidth: 180 }} placeholder="🔍  Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ flex: 1, minWidth: 160 }} value={filterClient} onChange={e => { setFilterClient(e.target.value); setSelectedClientId(e.target.value); }}>
          <option value="">Tous les clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
        </select>
        <Btn onClick={() => open()}>+ Nouvelle</Btn>
      </div>
      {filtered.length === 0 && <p style={{ color: "#8a7e68", textAlign: "center", marginTop: 40 }}>Aucune fabrication</p>}
      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(r => (
          <Card key={r.id}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Badge color={r.livre ? "#27ae60" : "#7a6228"} style={{ marginBottom: 6 }}>{r.livre ? "✓ Livré" : "En cours"}</Badge>
                <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 16, marginTop: 4 }}>{r.prenom} {r.nom}</div>
                <div style={{ color: "#8a7e68", fontSize: 13 }}>{r.matiere}{r.poidsBijou ? ` — ${r.poidsBijou}g` : ""}</div>
                {r.description && <div style={{ color: "#8a7e68", fontSize: 13, fontStyle: "italic" }}>{r.description.slice(0, 80)}</div>}
                <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                  {r.prix && <span style={{ color: "#e8c96a", fontSize: 13 }}>{r.prix} €</span>}
                  {r.orFourni && <span style={{ color: "#8a7e68", fontSize: 12 }}>Or fourni: {r.orFourni}g</span>}
                  {r.orUtilise && <span style={{ color: "#8a7e68", fontSize: 12 }}>Or utilisé: {r.orUtilise}g</span>}
                </div>
                {r.photos?.length > 0 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {r.photos.slice(0, 4).map(p => <img key={p.id} src={p.data} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, border: "1px solid #2e2a22" }} />)}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 6 }}><Btn small variant="ghost" onClick={() => open(r)}>Modifier</Btn><Btn small variant="danger" onClick={() => del(r.id)}>Suppr.</Btn></div>
                <button onClick={() => setPrintF(r)} style={{ background: "transparent", border: "1px solid #7a6228", borderRadius: 6, padding: "5px 10px", color: "#c9a84c", fontSize: 11, cursor: "pointer" }}>🖨️ Imprimer / Mail</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {modal && form && (
        <Modal title={modal === "new" ? "Nouvelle fabrication" : "Modifier la fabrication"} onClose={() => setModal(null)}>
          <Field label="Client" value={form.clientId} onChange={onCC} options={clients.map(c => ({ value: c.id, label: `${c.prenom} ${c.nom}` }))} />
          <GoldLine />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Nom" value={form.nom} onChange={f("nom")} /><Field label="Prénom" value={form.prenom} onChange={f("prenom")} /></div>
          <Field label="Adresse" value={form.adresse} onChange={f("adresse")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Code postal" value={form.codePostal} onChange={f("codePostal")} /><Field label="Ville" value={form.ville} onChange={f("ville")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Téléphone" value={form.telephone} onChange={f("telephone")} type="tel" /><Field label="Email" value={form.email || ""} onChange={f("email")} type="email" /></div>
          <GoldLine />
          <Field label="Description" value={form.description} onChange={f("description")} rows={3} />
          <Field label="Matière" value={form.matiere} onChange={f("matiere")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 12px" }}><Field label="Or fourni (g)" value={form.orFourni} onChange={f("orFourni")} /><Field label="Or utilisé (g)" value={form.orUtilise} onChange={f("orUtilise")} /><Field label="Poids bijou (g)" value={form.poidsBijou} onChange={f("poidsBijou")} /></div>
          <Field label="Prix (€)" value={form.prix} onChange={f("prix")} />
          <GoldLine />
          <PhotoPicker photos={form.photos || []} onChange={val => setForm(p => ({ ...p, photos: typeof val === "function" ? val(p.photos || []) : val }))} />
          <GoldLine />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <input type="checkbox" id="livreFab" checked={form.livre} onChange={e => setForm(p => ({ ...p, livre: e.target.checked }))} />
            <label htmlFor="livreFab" style={{ margin: 0, textTransform: "none", fontSize: 14, color: form.livre ? "#27ae60" : "#f0ead8", cursor: "pointer" }}>{form.livre ? "✓ Livraison confirmée" : "Marquer comme livré"}</label>
          </div>
          <Field label="Date de livraison" value={form.dateLivraison} onChange={f("dateLivraison")} type="date" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}><Btn variant="ghost" onClick={() => setModal(null)}>Annuler</Btn><Btn onClick={save}>Enregistrer</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ─── SECTION GÉNÉRIQUE FACTURES / ESTIMATIONS ─────────────────────────────────
function DocSection({ label, emptyFn, docs, setDocs, clients, selectedClientId, setSelectedClientId, PrintComp }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(null);
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState(selectedClientId || "");
  const [printDoc, setPrintDoc] = useState(null);
  useEffect(() => { setFilterClient(selectedClientId || ""); }, [selectedClientId]);
  const filtered = docs.filter(r => `${r.nom} ${r.prenom} ${r.numero} ${r.article}`.toLowerCase().includes(search.toLowerCase()) && (filterClient ? r.clientId === filterClient : true));
  const open = (r = null) => {
    if (r) { setForm({ ...r }); setModal(r); }
    else { const nf = emptyFn(docs, filterClient); if (filterClient) { const c = clients.find(x => x.id === filterClient); if (c) Object.assign(nf, { clientId: c.id, nom: c.nom, prenom: c.prenom, adresse: c.adresse, ville: c.ville, codePostal: c.codePostal, telephone: c.telephone, email: c.email || "" }); } setForm(nf); setModal("new"); }
  };
  const onCC = cid => { const c = clients.find(x => x.id === cid); setForm(p => ({ ...p, clientId: cid, nom: c?.nom || "", prenom: c?.prenom || "", adresse: c?.adresse || "", ville: c?.ville || "", codePostal: c?.codePostal || "", telephone: c?.telephone || "", email: c?.email || "" })); };
  const save = () => { if (!form.nom) return alert("Nom requis"); if (modal === "new") setDocs(p => [...p, form]); else setDocs(p => p.map(r => r.id === form.id ? form : r)); setModal(null); };
  const del = id => { if (confirm("Supprimer ?")) setDocs(p => p.filter(r => r.id !== id)); };
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  const addLigne = () => setForm(p => ({ ...p, lignes: [...(p.lignes || []), { id: uid(), designation: "", quantite: "1", prixUnit: "", tva: "20" }] }));
  const updLigne = (id, key, val) => setForm(p => ({ ...p, lignes: p.lignes.map(l => l.id === id ? { ...l, [key]: val } : l) }));
  const delLigne = id => setForm(p => ({ ...p, lignes: p.lignes.filter(l => l.id !== id) }));
  const totalTTC = (form?.lignes || []).reduce((s, l) => s + parseFloat(l.prixUnit || 0) * parseFloat(l.quantite || 1) * (1 + parseFloat(l.tva || 0) / 100), 0);
  return (
    <div style={{ padding: "0 16px" }}>
      {printDoc && <PrintComp doc={printDoc} onClose={() => setPrintDoc(null)} />}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input style={{ flex: 1, minWidth: 180 }} placeholder="🔍  Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ flex: 1, minWidth: 160 }} value={filterClient} onChange={e => { setFilterClient(e.target.value); setSelectedClientId(e.target.value); }}>
          <option value="">Tous les clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
        </select>
        <Btn onClick={() => open()}>+ Nouveau</Btn>
      </div>
      {filtered.length === 0 && <p style={{ color: "#8a7e68", textAlign: "center", marginTop: 40 }}>Aucun document</p>}
      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(r => {
          const ttc = (r.lignes || []).reduce((s, l) => s + parseFloat(l.prixUnit || 0) * parseFloat(l.quantite || 1) * (1 + parseFloat(l.tva || 0) / 100), 0);
          return (
            <Card key={r.id}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 17, color: "#c9a84c", fontWeight: 600, marginBottom: 2 }}>{r.numero}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 16 }}>{r.prenom} {r.nom}</div>
                  {r.article && <div style={{ color: "#8a7e68", fontSize: 13, marginTop: 2 }}>{r.article}{r.matiere ? ` — ${r.matiere}` : ""}</div>}
                  <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                    {ttc > 0 && <span style={{ color: "#e8c96a", fontSize: 13 }}>TTC: {ttc.toFixed(2)} €</span>}
                    {r.estimationBijou && <span style={{ color: "#8a7e68", fontSize: 12 }}>Bijou: {r.estimationBijou} €</span>}
                    {r.date && <span style={{ color: "#8a7e68", fontSize: 12 }}>{new Date(r.date).toLocaleDateString("fr-FR")}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: 6 }}><Btn small variant="ghost" onClick={() => open(r)}>Modifier</Btn><Btn small variant="danger" onClick={() => del(r.id)}>Suppr.</Btn></div>
                  <button onClick={() => setPrintDoc(r)} style={{ background: "transparent", border: "1px solid #7a6228", borderRadius: 6, padding: "5px 10px", color: "#c9a84c", fontSize: 11, cursor: "pointer" }}>🖨️ Imprimer / Mail</button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {modal && form && (
        <Modal title={modal === "new" ? `Nouveau — ${form.numero}` : form.numero} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="N° Document" value={form.numero} onChange={f("numero")} /><Field label="Date" value={form.date} onChange={f("date")} type="date" /></div>
          <Field label="Client" value={form.clientId} onChange={onCC} options={clients.map(c => ({ value: c.id, label: `${c.prenom} ${c.nom}` }))} />
          <GoldLine />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Nom" value={form.nom} onChange={f("nom")} /><Field label="Prénom" value={form.prenom} onChange={f("prenom")} /></div>
          <Field label="Adresse" value={form.adresse} onChange={f("adresse")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Code postal" value={form.codePostal} onChange={f("codePostal")} /><Field label="Ville" value={form.ville} onChange={f("ville")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Téléphone" value={form.telephone} onChange={f("telephone")} type="tel" /><Field label="Email" value={form.email || ""} onChange={f("email")} type="email" /></div>
          <GoldLine />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Article" value={form.article || ""} onChange={f("article")} /><Field label="Matière" value={form.matiere || ""} onChange={f("matiere")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Poids (g)" value={form.poids || ""} onChange={f("poids")} /><Field label="Estimation bijou (€)" value={form.estimationBijou || ""} onChange={f("estimationBijou")} /></div>
          <Field label="Description" value={form.description || ""} onChange={f("description")} rows={2} />
          <GoldLine />
          <PhotoPicker photos={form.photos || []} onChange={val => setForm(p => ({ ...p, photos: typeof val === "function" ? val(p.photos || []) : val }))} />
          <GoldLine />
          <label style={{ marginBottom: 8, display: "block" }}>Lignes de prestation</label>
          {(form.lignes || []).map((l, i) => (
            <div key={l.id} style={{ background: "#141210", border: "1px solid #2e2a22", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12, color: "#8a7e68" }}>Ligne {i + 1}</span><button onClick={() => delLigne(l.id)} style={{ background: "none", border: "none", color: "#c0392b", fontSize: 16, cursor: "pointer" }}>✕</button></div>
              <input placeholder="Désignation" value={l.designation} onChange={e => updLigne(l.id, "designation", e.target.value)} style={{ marginBottom: 8 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 10px" }}>
                <div><label>Qté</label><input type="number" value={l.quantite} onChange={e => updLigne(l.id, "quantite", e.target.value)} /></div>
                <div><label>Prix HT (€)</label><input type="number" value={l.prixUnit} onChange={e => updLigne(l.id, "prixUnit", e.target.value)} /></div>
                <div><label>TVA (%)</label><input type="number" value={l.tva} onChange={e => updLigne(l.id, "tva", e.target.value)} /></div>
              </div>
            </div>
          ))}
          <button onClick={addLigne} style={{ width: "100%", padding: "10px", background: "#c9a84c0a", border: "1px dashed #7a6228", borderRadius: 8, color: "#c9a84c", fontSize: 13, marginBottom: 12, cursor: "pointer" }}>+ Ajouter une ligne</button>
          {form.lignes?.length > 0 && (
            <div style={{ background: "#141210", border: "1px solid #c9a84c33", borderRadius: 8, padding: "10px 14px", textAlign: "right", marginBottom: 12 }}>
              <span style={{ color: "#8a7e68", fontSize: 13 }}>Total TTC : </span>
              <span style={{ color: "#c9a84c", fontFamily: "'Cormorant Garamond'", fontSize: 22, fontWeight: 700 }}>{totalTTC.toFixed(2)} €</span>
            </div>
          )}
          <Field label="Notes" value={form.notes || ""} onChange={f("notes")} rows={2} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}><Btn variant="ghost" onClick={() => setModal(null)}>Annuler</Btn><Btn onClick={save}>Enregistrer</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// Wrappers pour PrintComp (nécessite prop doc -> fac / est / achat)
const PrintFactureWrap = ({ doc, onClose }) => <PrintFacture fac={doc} onClose={onClose} />;
const PrintEstimationWrap = ({ doc, onClose }) => <PrintEstimation est={doc} onClose={onClose} />;

// ─── ACHAT OR ─────────────────────────────────────────────────────────────────
function AchatOrSection({ clients, achats, setAchats, selectedClientId, setSelectedClientId }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(null);
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState(selectedClientId || "");
  const [printA, setPrintA] = useState(null);
  useEffect(() => { setFilterClient(selectedClientId || ""); }, [selectedClientId]);
  const filtered = achats.filter(a => `${a.nom} ${a.prenom} ${a.numero}`.toLowerCase().includes(search.toLowerCase()) && (filterClient ? a.clientId === filterClient : true));
  const open = (a = null) => {
    if (a) { setForm({ ...a }); setModal(a); }
    else { const nf = emptyAchat(achats, filterClient); if (filterClient) { const c = clients.find(x => x.id === filterClient); if (c) Object.assign(nf, { clientId: c.id, nom: c.nom, prenom: c.prenom, adresse: c.adresse, ville: c.ville, codePostal: c.codePostal, telephone: c.telephone, email: c.email || "" }); } setForm(nf); setModal("new"); }
  };
  const onCC = cid => { const c = clients.find(x => x.id === cid); setForm(p => ({ ...p, clientId: cid, nom: c?.nom || "", prenom: c?.prenom || "", adresse: c?.adresse || "", ville: c?.ville || "", codePostal: c?.codePostal || "", telephone: c?.telephone || "", email: c?.email || "" })); };
  const save = () => { if (!form.nom) return alert("Nom requis"); if (modal === "new") setAchats(p => [...p, form]); else setAchats(p => p.map(a => a.id === form.id ? form : a)); setModal(null); };
  const del = id => { if (confirm("Supprimer ?")) setAchats(p => p.filter(a => a.id !== id)); };
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={{ padding: "0 16px" }}>
      {printA && <PrintAchat achat={printA} onClose={() => setPrintA(null)} />}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input style={{ flex: 1, minWidth: 180 }} placeholder="🔍  Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ flex: 1, minWidth: 160 }} value={filterClient} onChange={e => { setFilterClient(e.target.value); setSelectedClientId(e.target.value); }}>
          <option value="">Tous les clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
        </select>
        <Btn onClick={() => open()}>+ Nouvel achat</Btn>
      </div>
      {filtered.length === 0 && <p style={{ color: "#8a7e68", textAlign: "center", marginTop: 40 }}>Aucun achat enregistré</p>}
      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(a => (
          <Card key={a.id}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 17, color: "#c9a84c", fontWeight: 600 }}>{a.numero}</span>
                  <Badge color={a.typeMetal === "or" ? "#e8c96a" : "#8a7e68"}>{a.typeMetal === "or" ? "Or" : "Argent"}</Badge>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 16 }}>{a.prenom} {a.nom}</div>
                {a.numeroCNI && <div style={{ color: "#8a7e68", fontSize: 12 }}>CNI : {a.numeroCNI}</div>}
                {a.description && <div style={{ color: "#8a7e68", fontSize: 13, fontStyle: "italic" }}>{a.description.slice(0, 70)}</div>}
                <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                  {a.prix && <span style={{ color: "#e8c96a", fontSize: 13 }}>{a.prix} €</span>}
                  {a.poids && <span style={{ color: "#8a7e68", fontSize: 12 }}>{a.poids} g</span>}
                  <span style={{ color: "#8a7e68", fontSize: 12 }}>{a.reglement === "cheque" ? "Chèque" : "Virement"}</span>
                  {a.date && <span style={{ color: "#8a7e68", fontSize: 12 }}>{new Date(a.date).toLocaleDateString("fr-FR")}</span>}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 6 }}><Btn small variant="ghost" onClick={() => open(a)}>Modifier</Btn><Btn small variant="danger" onClick={() => del(a.id)}>Suppr.</Btn></div>
                <button onClick={() => setPrintA(a)} style={{ background: "transparent", border: "1px solid #7a6228", borderRadius: 6, padding: "5px 10px", color: "#c9a84c", fontSize: 11, cursor: "pointer" }}>🖨️ Imprimer / Mail</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {modal && form && (
        <Modal title={modal === "new" ? `Nouvel achat — ${form.numero}` : `Achat ${form.numero}`} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="N° Document" value={form.numero} onChange={f("numero")} /><Field label="Date" value={form.date} onChange={f("date")} type="date" /></div>
          <Field label="Client" value={form.clientId} onChange={onCC} options={clients.map(c => ({ value: c.id, label: `${c.prenom} ${c.nom}` }))} />
          <GoldLine />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Nom" value={form.nom} onChange={f("nom")} /><Field label="Prénom" value={form.prenom} onChange={f("prenom")} /></div>
          <Field label="Adresse" value={form.adresse} onChange={f("adresse")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Code postal" value={form.codePostal} onChange={f("codePostal")} /><Field label="Ville" value={form.ville} onChange={f("ville")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Téléphone" value={form.telephone} onChange={f("telephone")} type="tel" /><Field label="Email" value={form.email || ""} onChange={f("email")} type="email" /></div>
          <Field label="N° Carte d'identité" value={form.numeroCNI} onChange={f("numeroCNI")} />
          <GoldLine />
          <div style={{ marginBottom: 12 }}>
            <label>Type de métal</label>
            <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
              {["or", "argent"].map(t => (
                <label key={t} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 14, color: "#f0ead8", textTransform: "capitalize" }}>
                  <input type="radio" name="metal" checked={form.typeMetal === t} onChange={() => setForm(p => ({ ...p, typeMetal: t }))} style={{ accentColor: "#c9a84c", width: 16, height: 16 }} />
                  {t === "or" ? "Or" : "Argent"}
                </label>
              ))}
            </div>
          </div>
          <Field label="Description" value={form.description} onChange={f("description")} rows={2} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}><Field label="Poids (g)" value={form.poids} onChange={f("poids")} /><Field label="Prix (€)" value={form.prix} onChange={f("prix")} /></div>
          <div style={{ marginBottom: 12 }}>
            <label>Règlement</label>
            <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
              {["cheque", "virement"].map(t => (
                <label key={t} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 14, color: "#f0ead8" }}>
                  <input type="radio" name="reglement" checked={form.reglement === t} onChange={() => setForm(p => ({ ...p, reglement: t }))} style={{ accentColor: "#c9a84c", width: 16, height: 16 }} />
                  {t === "cheque" ? "Chèque" : "Virement"}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}><Btn variant="ghost" onClick={() => setModal(null)}>Annuler</Btn><Btn onClick={save}>Enregistrer</Btn></div>
        </Modal>
      )}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ setActiveTab, setOpenNew }) {
  const rows = [
    { label: "Client",      icon: "👤", tab: "clients"      },
    { label: "Réparation",  icon: "⚙️", tab: "reparations"  },
    { label: "Fabrication", icon: "✦",  tab: "fabrications" },
    { label: "Facture",     icon: "🧾", tab: "factures"     },
    { label: "Estimation",  icon: "📋", tab: "estimations"  },
    { label: "Achat or",    icon: "⬡",  tab: "achat-or"     },
  ];
  return (
    <div style={{ paddingBottom: 8 }}>
      <div style={{ textAlign: "center", padding: "28px 16px 20px" }}>
        <div style={{ fontSize: 9, color: "#8a7e68", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>Bijoutier · Joaillier</div>
        <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 13, color: "#f0ead8", letterSpacing: "0.2em", textTransform: "uppercase", lineHeight: 1 }}>L'Atelier</div>
        <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 46, color: "#c9a84c", fontStyle: "italic", fontWeight: 600, lineHeight: 1.05 }}>Guedj</div>
        <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 19, color: "#e8c96a", fontStyle: "italic", letterSpacing: "0.04em", marginTop: 3 }}>Philippe &amp; Kévin</div>
        <div style={{ height: 1, background: "linear-gradient(to right,transparent,#c9a84c,transparent)", margin: "14px 20px 0" }} />
      </div>
      <div style={{ padding: "0 16px" }}>
        <div style={{ border: "1px solid #c9a84c33", borderRadius: 10, overflow: "hidden" }}>
          {rows.map((r, i) => (
            <div key={r.tab}>
              {i > 0 && <div style={{ height: 1, background: "#2e2a22" }} />}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 64px" }}>
                <button onClick={() => setActiveTab(r.tab)} style={{ background: "#1a1814", border: "none", padding: "16px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 19, lineHeight: 1, flexShrink: 0 }}>{r.icon}</span>
                  <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 18, color: "#e8c96a", fontStyle: "italic", fontWeight: 600 }}>{r.label}</span>
                </button>
                <button onClick={() => { setActiveTab(r.tab); if (setOpenNew) setOpenNew(r.tab); }} style={{ background: "#141210", border: "none", borderLeft: "1px solid #2e2a22", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#c9a84c18", border: "1.5px solid #c9a84c66", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a84c", fontSize: 24, fontWeight: 300, fontFamily: "sans-serif" }}>+</div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard",    label: "Accueil",  icon: "◈" },
  { id: "clients",      label: "Clients",  icon: "♟" },
  { id: "reparations",  label: "Répar.",    icon: "⚙" },
  { id: "fabrications", label: "Fabric.",   icon: "✦" },
  { id: "factures",     label: "Factures", icon: "🧾" },
  { id: "estimations",  label: "Estim.",    icon: "📋" },
  { id: "achat-or",     label: "Achat or", icon: "⬡" },
];

// ─── ÉCRAN DE VERROUILLAGE ────────────────────────────────────────────────────
const CODE_SECRET = "5560";

function LockScreen({ onUnlock }) {
  const [input, setInput] = useState("");
  const [erreur, setErreur] = useState(false);

  const handleKey = (k) => {
    if (input.length >= 4) return;
    const next = input + k;
    setInput(next);
    setErreur(false);
    if (next.length === 4) {
      if (next === CODE_SECRET) {
        onUnlock();
      } else {
        setTimeout(() => { setInput(""); setErreur(true); }, 400);
      }
    }
  };

  const del = () => { setInput(p => p.slice(0, -1)); setErreur(false); };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0e0c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{css}</style>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 72, height: 72, background: "#f5f0e8", borderRadius: "50%", border: "2px solid #c9a84c", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
            <polygon points="50,10 80,40 50,90 20,40" fill="none" stroke="#c9a84c" strokeWidth="5"/>
            <polygon points="50,10 80,40 20,40" fill="none" stroke="#c9a84c" strokeWidth="4"/>
            <line x1="50" y1="10" x2="50" y2="2" stroke="#c9a84c" strokeWidth="3"/>
            <line x1="43" y1="5" x2="50" y2="2" stroke="#c9a84c" strokeWidth="2.5"/>
            <line x1="57" y1="5" x2="50" y2="2" stroke="#c9a84c" strokeWidth="2.5"/>
          </svg>
        </div>
        <div style={{ fontSize: 10, color: "#8a7e68", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 3 }}>Bijoutier · Joaillier</div>
        <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 14, color: "#f0ead8", letterSpacing: "0.18em", textTransform: "uppercase" }}>L'Atelier</div>
        <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 42, color: "#c9a84c", fontStyle: "italic", fontWeight: 600, lineHeight: 1 }}>Guedj</div>
        <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 17, color: "#e8c96a", fontStyle: "italic", marginTop: 2 }}>Philippe &amp; Kévin</div>
      </div>

      {/* Points code */}
      <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: input.length > i ? (erreur ? "#c0392b" : "#c9a84c") : "transparent", border: `2px solid ${erreur ? "#c0392b" : input.length > i ? "#c9a84c" : "#2e2a22"}`, transition: "all 0.15s" }} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: erreur ? "#c0392b" : "#8a7e68", marginBottom: 32, height: 18, letterSpacing: "0.08em" }}>
        {erreur ? "Code incorrect — réessayez" : "Entrez votre code"}
      </div>

      {/* Pavé numérique */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 72px)", gap: 12 }}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
          <button key={i} onClick={() => k === "⌫" ? del() : k !== "" ? handleKey(String(k)) : null}
            style={{ width: 72, height: 72, borderRadius: "50%", background: k === "" ? "transparent" : "#1a1814", border: k === "" ? "none" : "1px solid #2e2a22", color: k === "⌫" ? "#c9a84c" : "#f0ead8", fontSize: k === "⌫" ? 22 : 24, fontFamily: "'Jost', sans-serif", fontWeight: 400, cursor: k === "" ? "default" : "pointer", transition: "all 0.15s" }}
          >{k}</button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("ag_auth") === "1");
  const [clients,    setClients]    = useState([]);
  const [reps,       setReps]       = useState([]);
  const [fabs,       setFabs]       = useState([]);
  const [factures,   setFactures]   = useState([]);
  const [estimations,setEstimations]= useState([]);
  const [achats,     setAchats]     = useState([]);
  const [activeTab,  setActiveTab]  = useState("dashboard");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [openNew, setOpenNew] = useState(null);

  const handleUnlock = () => { sessionStorage.setItem("ag_auth", "1"); setUnlocked(true); };
  if (!unlocked) return <LockScreen onUnlock={handleUnlock} />;

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem("bijou_data") || "{}");
      if (d.clients)     setClients(d.clients);
      if (d.reps)        setReps(d.reps);
      if (d.fabs)        setFabs(d.fabs);
      if (d.factures)    setFactures(d.factures);
      if (d.estimations) setEstimations(d.estimations);
      if (d.achats)      setAchats(d.achats);
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("bijou_data", JSON.stringify({ clients, reps, fabs, factures, estimations, achats }));
  }, [clients, reps, fabs, factures, estimations, achats]);

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, padding: "0 0 90px", maxWidth: 800, margin: "0 auto", width: "100%" }}>
          {activeTab === "dashboard"    && <Dashboard setActiveTab={setActiveTab} setOpenNew={setOpenNew} />}
          {activeTab === "clients"      && <ClientSection clients={clients} setClients={setClients} setActiveTab={setActiveTab} setSelectedClientId={setSelectedClientId} />}
          {activeTab === "reparations"  && <RepSection clients={clients} reps={reps} setReps={setReps} selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId} />}
          {activeTab === "fabrications" && <FabSection clients={clients} fabs={fabs} setFabs={setFabs} selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId} />}
          {activeTab === "factures"     && <DocSection label="Facture" emptyFn={emptyFac} docs={factures} setDocs={setFactures} clients={clients} selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId} PrintComp={PrintFactureWrap} />}
          {activeTab === "estimations"  && <DocSection label="Estimation" emptyFn={emptyEst} docs={estimations} setDocs={setEstimations} clients={clients} selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId} PrintComp={PrintEstimationWrap} />}
          {activeTab === "achat-or"     && <AchatOrSection clients={clients} achats={achats} setAchats={setAchats} selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId} />}
        </div>
        <div style={{ background: "#12100e", borderTop: "1px solid #2e2a22", display: "flex", position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: "9px 1px 7px", background: "none", border: "none", color: activeTab === t.id ? "#c9a84c" : "#8a7e68", borderTop: `2px solid ${activeTab === t.id ? "#c9a84c" : "transparent"}`, fontSize: 7, letterSpacing: "0.03em", textTransform: "uppercase", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, transition: "all 0.2s" }}>
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
