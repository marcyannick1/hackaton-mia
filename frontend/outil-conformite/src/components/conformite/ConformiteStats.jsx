export default function ConformiteStats({ fournisseurs }) {
  const total = fournisseurs.length;
  const conformes = fournisseurs.filter(f => f.statut === "conforme").length;
  const alertes = fournisseurs.filter(f => f.statut === "alerte").length;
  const totalAnomalies = fournisseurs.flatMap(f => f.alertes.filter(a => a.niveau !== "ok")).length;
  return (
    <div className="grid grid-cols-4 gap-4">
      {[
        { label: "Fournisseurs total", value: total, sub: "enregistres", bg: "bg-slate-50", color: "text-slate-800" },
        { label: "Conformes", value: conformes, sub: `${Math.round((conformes / total) * 100)}% du total`, bg: "bg-emerald-50", color: "text-emerald-700" },
        { label: "Avec alertes", value: alertes, sub: "necessitent une action", bg: "bg-amber-50", color: "text-amber-700" },
        { label: "Anomalies detectees", value: totalAnomalies, sub: "sur tous les docs", bg: "bg-red-50", color: "text-red-700" },
      ].map(s => (
        <div key={s.label} className={`${s.bg} rounded-xl px-5 py-4 border border-slate-200`}>
          <p className="text-xs text-slate-500 mb-1">{s.label}</p>
          <p className={`text-3xl font-semibold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
