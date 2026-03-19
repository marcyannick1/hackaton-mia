import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../shared/Badge.jsx";

const MOCK_EXTRACTION = {
  type: "Facture", confiance: 94,
  champs: [
    { label: "SIRET", valeur: "834 120 576 00023", statut: "valide" },
    { label: "N TVA", valeur: "FR 12 834120576", statut: "valide" },
    { label: "Raison sociale", valeur: "Batiment Tech SAS", statut: "valide" },
    { label: "Montant HT", valeur: "10 333,33 €", statut: "valide" },
    { label: "Montant TTC", valeur: "12 400,00 €", statut: "valide" },
    { label: "Taux TVA", valeur: "20 %", statut: "valide" },
    { label: "Date d emission", valeur: "15/03/2025", statut: "valide" },
    { label: "Date d echeance", valeur: "15/04/2025", statut: "attention" },
    { label: "IBAN", valeur: "FR76 3000 4028 37XX XXXX", statut: "valide" },
    { label: "Reference facture", valeur: "FAC-2025-042", statut: "valide" },
  ],
  anomalies: [{ niveau: "warn", titre: "Date d echeance proche", detail: "La date d echeance est dans moins de 30 jours" }],
  textebrut: "FACTURE N FAC-2025-042\nBatiment Tech SAS\nSIRET : 834 120 576 00023\nTotal HT : 10 333,33\nTVA 20% : 2 066,67\nTotal TTC : 12 400,00",
};

const ONGLETS = ["Donnees extraites", "Anomalies", "Texte brut"];

export default function ResultatsOCR({ fichier }) {
  const navigate = useNavigate();
  const [onglet, setOnglet] = useState("Donnees extraites");
  const [champs, setChamps] = useState(MOCK_EXTRACTION.champs);
  const [valide, setValide] = useState(false);
  const [rejete, setRejete] = useState(false);

  const handleCorrection = (index, val) => setChamps(prev => prev.map((c, i) => i === index ? { ...c, valeur: val, corrige: true } : c));

  if (valide) return (
    <div className="bg-white rounded-xl border border-slate-200 px-8 py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <p className="text-base font-semibold text-slate-800">Document valide</p>
      <p className="text-sm text-slate-400 mt-1">Redirection vers le CRM...</p>
    </div>
  );

  if (rejete) return (
    <div className="bg-white rounded-xl border border-slate-200 px-8 py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-red-500"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </div>
      <p className="text-base font-semibold text-slate-800">Document rejete</p>
      <p className="text-sm text-slate-400 mt-1">Retour a l upload...</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" className="text-slate-500"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{fichier.nom}</p>
              <p className="text-xs text-slate-400 mt-0.5">Type detecte : <span className="font-medium text-slate-600">{MOCK_EXTRACTION.type}</span></p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">Confiance OCR</p>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: MOCK_EXTRACTION.confiance + "%" }} />
              </div>
              <span className="text-sm font-semibold text-emerald-600">{MOCK_EXTRACTION.confiance}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100">
          {ONGLETS.map(o => (
            <button key={o} onClick={() => setOnglet(o)}
              className={"px-5 py-3 text-sm font-medium transition-all border-b-2 " + (onglet === o ? "text-blue-600 border-blue-500" : "text-slate-500 border-transparent hover:text-slate-700")}>
              {o}{o === "Anomalies" && MOCK_EXTRACTION.anomalies.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-md">{MOCK_EXTRACTION.anomalies.length}</span>
              )}
            </button>
          ))}
        </div>
        {onglet === "Donnees extraites" && (
          <div className="divide-y divide-slate-100">
            {champs.map((champ, i) => (
              <div key={champ.label} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs text-slate-500 w-36 flex-shrink-0">{champ.label}</span>
                  <input type="text" value={champ.valeur} onChange={e => handleCorrection(i, e.target.value)}
                    className={"flex-1 text-sm font-medium px-2.5 py-1.5 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 " + (champ.corrige ? "bg-blue-50 border-blue-200 text-blue-800" : "bg-transparent border-transparent hover:border-slate-200 text-slate-800")} />
                  {champ.corrige && <span className="text-xs text-blue-500 flex-shrink-0">modifie</span>}
                </div>
                <div className="ml-3 flex-shrink-0"><Badge statut={champ.statut} /></div>
              </div>
            ))}
          </div>
        )}
        {onglet === "Anomalies" && (
          <div className="divide-y divide-slate-100">
            {MOCK_EXTRACTION.anomalies.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-400">Aucune anomalie detectee</div>
            ) : MOCK_EXTRACTION.anomalies.map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <span className={"w-2 h-2 rounded-full flex-shrink-0 mt-1.5 " + (a.niveau === "error" ? "bg-red-500" : "bg-amber-400")}/>
                <div><p className="text-sm font-medium text-slate-800">{a.titre}</p><p className="text-xs text-slate-400 mt-0.5">{a.detail}</p></div>
              </div>
            ))}
          </div>
        )}
        {onglet === "Texte brut" && (
          <div className="px-5 py-4">
            <pre className="text-xs text-slate-600 font-mono bg-slate-50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">{MOCK_EXTRACTION.textebrut}</pre>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-5 py-4">
        <p className="text-xs text-slate-400">Vous pouvez corriger les champs directement avant de valider</p>
        <div className="flex items-center gap-3">
          <button onClick={() => { setRejete(true); setTimeout(() => navigate("/upload"), 1500); }}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all">Rejeter</button>
          <button onClick={() => { setValide(true); setTimeout(() => navigate("/crm"), 1500); }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all active:scale-[0.98]">Valider et envoyer au CRM</button>
        </div>
      </div>
    </div>
  );
}
