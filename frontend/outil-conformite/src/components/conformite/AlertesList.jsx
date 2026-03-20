import { useState } from "react";
import { useNavigate } from "react-router-dom";

const NIVEAU_CONFIG = {
    rejected:   { dot: "bg-red-500",    badge: "bg-red-50 text-red-700 border border-red-200",       label: "Rejeté"      },
    suspicious: { dot: "bg-orange-400", badge: "bg-orange-50 text-orange-700 border border-orange-200", label: "Suspicious"  },
    anomaly:    { dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 border border-amber-200",  label: "Anomalie ML" },
};

const FILTRES = ["Tous", "Rejeté", "Suspicious", "Anomalie ML"];

export default function AlertesList({ anomalies }) {
    const navigate = useNavigate();
    const [filtre, setFiltre] = useState("Tous");
    const [fournisseurFiltre, setFournisseurFiltre] = useState("Tous");

    const fournisseurs = [
        "Tous",
        ...new Set(
            anomalies
                .map((a) => a.rawDocument?.company?.raisonSociale)
                .filter(Boolean)
        ),
    ];

    const anomaliesFiltrees = anomalies.filter((a) => {
        const matchNiveau =
            filtre === "Tous" ||
            (filtre === "Rejeté"      && a.status === "rejected")      ||
            (filtre === "Suspicious"  && a.status === "suspicious")    ||
            (filtre === "Anomalie ML" && a.mlResult?.is_anomaly);

        const matchFournisseur =
            fournisseurFiltre === "Tous" ||
            a.rawDocument?.company?.raisonSociale === fournisseurFiltre;

        return matchNiveau && matchFournisseur;
    });

    const getNiveau = (a) => {
        if (a.status === "rejected")   return "rejected";
        if (a.status === "suspicious") return "suspicious";
        return "anomaly";
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-wrap gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-slate-800">Anomalies détectées</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {anomaliesFiltrees.length} anomalie{anomaliesFiltrees.length > 1 ? "s" : ""} affichée{anomaliesFiltrees.length > 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={fournisseurFiltre}
                        onChange={(e) => setFournisseurFiltre(e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {fournisseurs.map((f) => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                        {FILTRES.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFiltre(f)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                    filtre === f
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {anomaliesFiltrees.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-slate-400">
                    Aucune anomalie pour ce filtre
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {anomaliesFiltrees.map((a) => {
                        const niveau = getNiveau(a);
                        const config = NIVEAU_CONFIG[niveau];
                        const company = a.rawDocument?.company;

                        return (
                            <div
                                key={a._id}
                                className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                            >
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${config.dot}`} />

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-medium text-slate-800">
                                            {a.documentType || "Document"} —{" "}
                                            {a.validation?.anomalies?.[0]?.description || "Anomalie détectée"}
                                        </p>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.badge}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Score fraude : {((a.validation?.fraudScore || 0) * 100).toFixed(0)}% ·
                                        Score ML : {((a.mlResult?.fraud_score || 0) * 100).toFixed(0)}%
                                    </p>

                                    {/* Détail anomalies */}
                                    {a.validation?.anomalies?.length > 0 && (
                                        <div className="mt-1.5 space-y-0.5">
                                            {a.validation.anomalies.map((an, i) => (
                                                <p key={i} className="text-xs text-slate-400">
                                                    · {an.description || an.type}
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    {/* Voir fiche uniquement — pas d'actions valider/rejeter ici */}
                                    {company && (
                                        <button
                                            onClick={() => navigate("/crm", { state: { companyId: company._id } })}
                                            className="mt-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition-all"
                                        >
                                            Voir fiche fournisseur →
                                        </button>
                                    )}
                                </div>

                                {/* Infos fournisseur */}
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-medium text-slate-700">
                                        {company?.raisonSociale || "—"}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        SIRET {company?.siret || "—"}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}