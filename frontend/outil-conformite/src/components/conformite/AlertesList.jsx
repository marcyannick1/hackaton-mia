import { useState } from "react";

const NIVEAU_CONFIG = {
  error: { dot: "bg-red-500", badge: "bg-red-50 text-red-700 border border-red-200", label: "Erreur" },
  warn: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border border-amber-200", label: "Attention" },
};
const FILTRES = ["Tous", "Erreur", "Attention"];

export default function AlertesList({ alertes }) {
  const [filtre, setFiltre] = useState("Tous");
  const alertesFiltrees = alertes.filter(a => {
    if (filtre === "Tous") return true;
    if (filtre === "Erreur") return a.niveau === "error";
    if (filtre === "Attention") return a.niveau === "warn";
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Anomalies detectees</h2>
          <p className="text-xs text-slate-400 mt-0.5">{alertesFiltrees.length} anomalie{alertesFiltrees.length > 1 ? "s" : ""} affichee{alertesFiltrees.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {FILTRES.map(f => (
            <button key={f} onClick={() => setFiltre(f)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filtre === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{f}</button>
          ))}
        </div>
      </div>
      {alertesFiltrees.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-slate-400">Aucune anomalie pour ce filtre</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {alertesFiltrees.map((alerte, i) => {
            const config = NIVEAU_CONFIG[alerte.niveau];
            return (
              <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${config.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-800">{alerte.titre}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.badge}`}>{config.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{alerte.detail}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-slate-700">{alerte.fournisseur}</p>
                  <p className="text-xs text-slate-400 mt-0.5">ID #{alerte.fournisseurId}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
