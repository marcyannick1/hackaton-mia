import { useState } from "react";
import Badge from "../shared/Badge.jsx";

const DOCS_EN_ATTENTE = [
  { id: 1, fichier: "FAC-2025-042.pdf", type: "Facture", fournisseur: "Batiment Tech SAS", fournisseurId: 1, date: "15/03/2025", montant: "12 400 TTC", confiance: 94, anomalies: 1, statut: "attente" },
  { id: 2, fichier: "URSSAF-LogiSoft-2025.pdf", type: "Attestation URSSAF", fournisseur: "LogiSoft EURL", fournisseurId: 2, date: "10/01/2025", montant: null, confiance: 88, anomalies: 2, statut: "attente" },
  { id: 3, fichier: "KBIS-Paulet-2024.pdf", type: "Extrait Kbis", fournisseur: "Menuiserie Paulet", fournisseurId: 3, date: "01/06/2024", montant: null, confiance: 97, anomalies: 0, statut: "attente" },
];

export default function AdminDashboard() {
  const [docs, setDocs] = useState(DOCS_EN_ATTENTE);
  const [selected, setSelected] = useState(null);
  const [showRejetModal, setShowRejetModal] = useState(false);
  const [docARejet, setDocARejet] = useState(null);
  const [motifRejet, setMotifRejet] = useState("");

  const approuver = id => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, statut: "approuve" } : d));
    if (selected?.id === id) setSelected(prev => ({ ...prev, statut: "approuve" }));
  };

  const ouvrirRejet = doc => { setDocARejet(doc); setMotifRejet(""); setShowRejetModal(true); };

  const confirmerRejet = () => {
    setDocs(prev => prev.map(d => d.id === docARejet.id ? { ...d, statut: "rejete", motif: motifRejet } : d));
    if (selected?.id === docARejet.id) setSelected(prev => ({ ...prev, statut: "rejete", motif: motifRejet }));
    setShowRejetModal(false); setDocARejet(null);
  };

  const enAttente = docs.filter(d => d.statut === "attente").length;
  const approuves = docs.filter(d => d.statut === "approuve").length;
  const rejetes = docs.filter(d => d.statut === "rejete").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "En attente", value: enAttente, bg: "bg-amber-50", color: "text-amber-700" },
          { label: "Approuves", value: approuves, bg: "bg-emerald-50", color: "text-emerald-700" },
          { label: "Rejetes", value: rejetes, bg: "bg-red-50", color: "text-red-700" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl px-5 py-4 border border-slate-200`}>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-5">
        <div className="w-96 flex-shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Documents a traiter</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {docs.map(doc => (
              <button key={doc.id} onClick={() => setSelected(doc)} className={`w-full text-left px-5 py-4 transition-all hover:bg-slate-50 ${selected?.id === doc.id ? "bg-emerald-50 border-l-2 border-l-emerald-500" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{doc.fichier}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{doc.fournisseur}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{doc.type}</span>
                      {doc.anomalies > 0 && <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">{doc.anomalies} anomalie{doc.anomalies > 1 ? "s" : ""}</span>}
                    </div>
                  </div>
                  <Badge statut={doc.statut} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="h-full flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
              Selectionnez un document pour le traiter
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">{selected.fichier}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selected.fournisseur} · {selected.date}</p>
                </div>
                <Badge statut={selected.statut} />
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[{ label: "Type", value: selected.type }, { label: "Fournisseur", value: selected.fournisseur }, { label: "Date", value: selected.date }, { label: "Montant", value: selected.montant ?? "—" }].map(row => (
                    <div key={row.label} className="bg-slate-50 rounded-lg px-4 py-3">
                      <p className="text-xs text-slate-400 mb-1">{row.label}</p>
                      <p className="text-sm font-medium text-slate-800">{row.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-400">Confiance OCR</p>
                    <span className="text-sm font-semibold text-emerald-600">{selected.confiance}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${selected.confiance >= 90 ? "bg-emerald-500" : selected.confiance >= 75 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${selected.confiance}%` }} />
                  </div>
                </div>
                {selected.anomalies > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <p className="text-xs font-medium text-amber-700">{selected.anomalies} anomalie{selected.anomalies > 1 ? "s" : ""} detectee{selected.anomalies > 1 ? "s" : ""}</p>
                    <p className="text-xs text-amber-600 mt-0.5">Verifiez les donnees avant de valider</p>
                  </div>
                )}
                {selected.statut === "rejete" && selected.motif && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-xs font-medium text-red-700 mb-1">Motif de rejet</p>
                    <p className="text-xs text-red-600">{selected.motif}</p>
                  </div>
                )}
                {selected.statut === "attente" && (
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => ouvrirRejet(selected)} className="flex-1 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all">Rejeter</button>
                    <button onClick={() => approuver(selected.id)} className="flex-1 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all active:scale-[0.98]">Approuver</button>
                  </div>
                )}
                {selected.statut === "approuve" && (
                  <div className="flex items-center gap-2 justify-center py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
                    <p className="text-sm font-medium text-emerald-700">Document approuve</p>
                  </div>
                )}
                {selected.statut === "rejete" && (
                  <div className="flex items-center gap-2 justify-center py-3 bg-red-50 border border-red-200 rounded-lg">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="text-red-500"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    <p className="text-sm font-medium text-red-700">Document rejete</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showRejetModal && (
        <div style={{ minHeight: "400px", background: "rgba(0,0,0,0.45)" }} className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={e => { if (e.target === e.currentTarget) setShowRejetModal(false); }}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 w-full max-w-md">
            <h3 className="text-base font-semibold text-slate-800 mb-1">Rejeter le document</h3>
            <p className="text-sm text-slate-400 mb-4">Indiquez le motif de rejet pour notifier le fournisseur.</p>
            <textarea value={motifRejet} onChange={e => setMotifRejet(e.target.value)} placeholder="Ex : SIRET incorrect, attestation expiree..." rows={4} className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowRejetModal(false)} className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all">Annuler</button>
              <button onClick={confirmerRejet} disabled={!motifRejet.trim()} className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-lg transition-all">Confirmer le rejet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
