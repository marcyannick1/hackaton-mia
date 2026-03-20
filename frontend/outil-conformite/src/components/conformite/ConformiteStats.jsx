export default function ConformiteStats({ anomalies }) {
    const total = anomalies.length;
    const erreurs = anomalies.filter((a) => a.status === "rejected").length;
    const suspicious = anomalies.filter((a) => a.status === "suspicious").length;
    const mlAnomalies = anomalies.filter((a) => a.mlResult?.is_anomaly).length;

    const fournisseursUniques = new Set(
        anomalies.map((a) => a.rawDocument?.company?._id).filter(Boolean)
    ).size;

    return (
        <div className="grid grid-cols-5 gap-4">
            {[
                {
                    label: "Anomalies totales",
                    value: total,
                    sub: "détectées",
                    bg: "bg-slate-50",
                    color: "text-slate-800",
                },
                {
                    label: "Documents rejetés",
                    value: erreurs,
                    sub: "status rejected",
                    bg: "bg-red-50",
                    color: "text-red-700",
                },
                {
                    label: "Suspicious",
                    value: suspicious,
                    sub: "en attente de décision",
                    bg: "bg-orange-50",
                    color: "text-orange-700",
                },
                {
                    label: "Anomalies ML",
                    value: mlAnomalies,
                    sub: "détectées par le modèle",
                    bg: "bg-amber-50",
                    color: "text-amber-700",
                },
                {
                    label: "Fournisseurs concernés",
                    value: fournisseursUniques,
                    sub: "nécessitent une action",
                    bg: "bg-blue-50",
                    color: "text-blue-700",
                },
            ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl px-5 py-4 border border-slate-200`}>
                    <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                    <p className={`text-3xl font-semibold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
                </div>
            ))}
        </div>
    );
}