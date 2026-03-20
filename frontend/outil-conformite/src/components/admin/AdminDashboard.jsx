import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../shared/Badge.jsx";
import { documentAPI } from "../../services/api.js";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [showRejetModal, setShowRejetModal] = useState(false);
    const [docARejet, setDocARejet] = useState(null);
    const [motifRejet, setMotifRejet] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const loadDocs = async () => {
        try {
            const res = await documentAPI.getAnomalies();
            const allDocs = res.data.data || [];
            // On affiche uniquement les suspicious dans ce dashboard
            setDocs(allDocs.filter((d) => d.status === "suspicious"));
        } catch (err) {
            console.error("Erreur chargement dashboard :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDocs(); }, []);

    // Stats
    const enAttente = docs.filter((d) => d.status === "suspicious").length;
    const approuves = docs.filter((d) => d.status === "validated").length;
    const rejetes = docs.filter((d) => d.status === "rejected").length;

    const handleApprouver = async (doc) => {
        setActionLoading(true);
        try {
            await documentAPI.updateCuratedStatus(doc._id, "validated");
            await loadDocs();
            setSelected(null);
        } catch (err) {
            console.error("Erreur validation :", err);
        } finally {
            setActionLoading(false);
        }
    };

    const ouvrirRejet = (doc) => {
        setDocARejet(doc);
        setMotifRejet("");
        setShowRejetModal(true);
    };

    const confirmerRejet = async () => {
        setActionLoading(true);
        try {
            await documentAPI.updateCuratedStatus(docARejet._id, "rejected");
            await loadDocs();
            setSelected(null);
            setShowRejetModal(false);
            setDocARejet(null);
        } catch (err) {
            console.error("Erreur rejet :", err);
        } finally {
            setActionLoading(false);
        }
    };

    // Champs à afficher selon le documentType
    const buildInfoRows = (doc) => {
        const d = doc.data || {};
        const base = [
            { label: "Type",        value: doc.documentType || "—" },
            { label: "Fournisseur", value: doc.rawDocument?.company?.raisonSociale || "—" },
            { label: "SIRET",       value: doc.rawDocument?.company?.siret || d.siret || "—" },
            { label: "Date",        value: new Date(doc.createdAt).toLocaleDateString("fr-FR") },
        ];
        if (doc.documentType === "invoice" || doc.documentType === "devis") {
            base.push({ label: "Montant TTC", value: d.montant_ttc != null ? `${d.montant_ttc} €` : "—" });
        }
        if (doc.documentType === "rib") {
            base.push({ label: "IBAN",      value: d.iban      || "—" });
            base.push({ label: "Titulaire", value: d.titulaire || "—" });
        }
        return base;
    };

    return (
        <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Suspicious",  value: enAttente, bg: "bg-amber-50",   color: "text-amber-700"  },
                    { label: "Approuvés",   value: approuves, bg: "bg-emerald-50", color: "text-emerald-700" },
                    { label: "Rejetés",     value: rejetes,   bg: "bg-red-50",     color: "text-red-700"    },
                ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl px-5 py-4 border border-slate-200`}>
                        <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                        <p className={`text-3xl font-semibold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-5">
                {/* Liste */}
                <div className="w-96 flex-shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-800">Documents suspicious</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{docs.length} document{docs.length > 1 ? "s" : ""} à traiter</p>
                    </div>
                    {loading ? (
                        <p className="text-xs text-slate-400 text-center py-8">Chargement...</p>
                    ) : docs.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-8">Aucun document suspicious</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {docs.map((doc) => (
                                <button
                                    key={doc._id}
                                    onClick={() => setSelected(doc)}
                                    className={`w-full text-left px-5 py-4 transition-all hover:bg-slate-50 ${
                                        selected?._id === doc._id ? "bg-amber-50 border-l-2 border-l-amber-500" : ""
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">
                                                {doc.rawDocument?.fileName || doc.documentType || "Document"}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {doc.rawDocument?.company?.raisonSociale || "—"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                    {doc.documentType || "—"}
                                                </span>
                                                {doc.validation?.anomalyCount > 0 && (
                                                    <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                                        {doc.validation.anomalyCount} anomalie{doc.validation.anomalyCount > 1 ? "s" : ""}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge statut={doc.status} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Détail */}
                <div className="flex-1 min-w-0">
                    {!selected ? (
                        <div className="h-full flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
                            Sélectionnez un document pour le traiter
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        {selected.rawDocument?.fileName || selected.documentType || "Document"}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {selected.rawDocument?.company?.raisonSociale || "—"} ·{" "}
                                        {new Date(selected.createdAt).toLocaleDateString("fr-FR")}
                                    </p>
                                </div>
                                <Badge statut={selected.status} />
                            </div>

                            <div className="px-6 py-5 space-y-4">
                                {/* Infos */}
                                <div className="grid grid-cols-2 gap-4">
                                    {buildInfoRows(selected).map((row) => (
                                        <div key={row.label} className="bg-slate-50 rounded-lg px-4 py-3">
                                            <p className="text-xs text-slate-400 mb-1">{row.label}</p>
                                            <p className="text-sm font-medium text-slate-800">{row.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Score fraude */}
                                <div className="bg-slate-50 rounded-lg px-4 py-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs text-slate-400">Score fraude</p>
                                        <span className={`text-sm font-semibold ${
                                            (selected.validation?.fraudScore || 0) > 0.6
                                                ? "text-red-600"
                                                : (selected.validation?.fraudScore || 0) > 0.3
                                                ? "text-amber-600"
                                                : "text-emerald-600"
                                        }`}>
                                            {((selected.validation?.fraudScore || 0) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${
                                                (selected.validation?.fraudScore || 0) > 0.6
                                                    ? "bg-red-500"
                                                    : (selected.validation?.fraudScore || 0) > 0.3
                                                    ? "bg-amber-400"
                                                    : "bg-emerald-500"
                                            }`}
                                            style={{ width: `${(selected.validation?.fraudScore || 0) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Anomalies */}
                                {selected.validation?.anomalies?.length > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 space-y-1">
                                        <p className="text-xs font-medium text-amber-700 mb-2">
                                            {selected.validation.anomalies.length} anomalie{selected.validation.anomalies.length > 1 ? "s" : ""} détectée{selected.validation.anomalies.length > 1 ? "s" : ""}
                                        </p>
                                        {selected.validation.anomalies.map((a, i) => (
                                            <p key={i} className="text-xs text-amber-600">· {a.description || a.type}</p>
                                        ))}
                                    </div>
                                )}

                                {/* Lien vers fiche fournisseur */}
                                {selected.rawDocument?.company && (
                                    <button
                                        onClick={() => navigate("/crm", { state: { companyId: selected.rawDocument.company._id } })}
                                        className="w-full py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all"
                                    >
                                        Voir la fiche fournisseur →
                                    </button>
                                )}

                                {/* Actions — uniquement pour suspicious */}
                                {selected.status === "suspicious" && (
                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            onClick={() => ouvrirRejet(selected)}
                                            disabled={actionLoading}
                                            className="flex-1 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all disabled:opacity-50"
                                        >
                                            Rejeter
                                        </button>
                                        <button
                                            onClick={() => handleApprouver(selected)}
                                            disabled={actionLoading}
                                            className="flex-1 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {actionLoading ? "En cours..." : "Approuver"}
                                        </button>
                                    </div>
                                )}

                                {selected.status === "validated" && (
                                    <div className="flex items-center gap-2 justify-center py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
                                        <p className="text-sm font-medium text-emerald-700">Document approuvé</p>
                                    </div>
                                )}

                                {selected.status === "rejected" && (
                                    <div className="flex items-center gap-2 justify-center py-3 bg-red-50 border border-red-200 rounded-lg">
                                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="text-red-500"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                        <p className="text-sm font-medium text-red-700">Document rejeté</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal rejet */}
            {showRejetModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowRejetModal(false); }}
                >
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-base font-semibold text-slate-800 mb-1">Rejeter le document</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Indiquez le motif de rejet pour notifier le fournisseur.
                        </p>
                        <textarea
                            value={motifRejet}
                            onChange={(e) => setMotifRejet(e.target.value)}
                            placeholder="Ex : SIRET incorrect, attestation expirée..."
                            rows={4}
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all resize-none"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowRejetModal(false)}
                                className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmerRejet}
                                disabled={!motifRejet.trim() || actionLoading}
                                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 rounded-lg transition-all"
                            >
                                {actionLoading ? "En cours..." : "Confirmer le rejet"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}