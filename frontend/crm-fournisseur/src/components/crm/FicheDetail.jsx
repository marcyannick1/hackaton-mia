import {useState, useEffect} from "react";
import Badge from "../shared/Badge.jsx";
import EditFournisseurModal from "./EditFournisseurModal.jsx";
import {companyAPI} from "../../services/api.js";

export default function FicheDetail({fournisseur: f}) {
    const [showEdit, setShowEdit] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(true);

    useEffect(() => {
        if (!f?._id) return;
        setLoadingDocs(true);
        companyAPI
            .getCompanyDocuments(f._id)
            .then((res) => setDocuments(res.data.data || []))
            .catch((err) => console.error("Erreur chargement documents :", err))
            .finally(() => setLoadingDocs(false));
    }, [f?._id]);

    // Sépare factures et autres documents
    const factures = documents.filter(
        (doc) => doc.curatedDocument?.documentType === "facture"
    );
    const autresDocs = documents.filter(
        (doc) => doc.curatedDocument?.documentType !== "facture"
    );

    // Métriques calculées depuis les vraies données
    const montantTTCTotal = factures
        .reduce((sum, doc) => sum + (doc.curatedDocument?.data?.montant_ttc || 0), 0)
        .toLocaleString("fr-FR", {style: "currency", currency: "EUR"});

    const docsValides = documents.filter(
        (doc) => doc.curatedDocument?.status === "validated"
    ).length;

    const docsAlertes = documents.filter(
        (doc) => doc.curatedDocument?.status === "rejected"
    ).length;

    // Initiales fallback si pas en BDD
    const initiales =
        f.initiales ||
        f.raisonSociale
            ?.split(" ")
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase();

    return (
        <div className="space-y-5 h-full overflow-y-auto pb-4">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0"/>
                <span className="text-xs text-blue-700">
          Fiche remplie automatiquement via OCR — dernière extraction il y a 2 minutes
        </span>
            </div>

            {/* Header */}
            <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
                <div
                    className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-base font-semibold text-blue-700 flex-shrink-0">
                    {initiales}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-slate-800">{f.raisonSociale}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        SIRET {f.siret} · {f.adresse || "Adresse non renseignée"} · Fournisseur actif
                        depuis {f.depuis || "—"}
                    </p>
                </div>
                <Badge statut={f.statut}/>
                <button
                    onClick={() => setShowEdit(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Modifier
                </button>
            </div>

            {/* Métriques */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    {
                        label: "Factures totales",
                        value: factures.length,
                        sub: `dont ${factures.filter((d) => d.curatedDocument?.status === "pending").length} en attente`,
                    },
                    {
                        label: "Montant TTC total",
                        value: montantTTCTotal,
                        sub: "sur 12 mois glissants",
                    },
                    {
                        label: "Docs uploadés",
                        value: documents.length,
                        sub: `${docsValides} valides · ${docsAlertes} alerte(s)`,
                    },
                    {
                        label: "Statut URSSAF",
                        value: <Badge statut={f.urssafStatut}/>,
                        sub: f.urssafExpire
                            ? "expire le " + new Date(f.urssafExpire).toLocaleDateString("fr-FR")
                            : "Non renseigné",
                    },
                ].map((m) => (
                    <div key={m.label} className="bg-slate-50 rounded-lg px-4 py-3">
                        <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                        <p className="text-lg font-semibold text-slate-800">{m.value}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{m.sub}</p>
                    </div>
                ))}
            </div>

            {/* Infos générales + Documents */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                        Informations générales
                    </h3>
                    <div className="space-y-2.5">
                        {[
                            {label: "Raison sociale", value: f.raisonSociale},
                            {label: "SIRET", value: f.siret},
                            {label: "N° TVA", value: f.tva || "—"},
                            {label: "Adresse", value: f.adresse || "—"},
                            {label: "Contact", value: f.contact || "—"},
                            {label: "Téléphone", value: f.telephone || "—"},
                            {label: "IBAN", value: f.iban || "—"},
                        ].map((row) => (
                            <div
                                key={row.label}
                                className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0"
                            >
                                <span className="text-xs text-slate-500">{row.label}</span>
                                <span className="text-xs font-medium text-slate-800 text-right max-w-[55%] truncate">
                  {row.value}
                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Documents uploadés */}
                <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                        Documents uploadés
                    </h3>
                    {loadingDocs ? (
                        <p className="text-xs text-slate-400 mt-4 text-center">Chargement...</p>
                    ) : autresDocs.length === 0 ? (
                        <p className="text-xs text-slate-400 mt-4 text-center">Aucun document uploadé</p>
                    ) : (
                        <div className="space-y-1">
                            {autresDocs.map((doc) => (
                                <div
                                    key={doc._id}
                                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                                                 stroke="currentColor" strokeWidth="1.8" className="text-slate-500">
                                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                                <polyline points="14 2 14 8 20 8"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-800">
                                                {doc.curatedDocument?.documentType || doc.fileName || "Document"}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge statut={doc.curatedDocument?.status || "en_cours"}/>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Factures + Alertes */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                        Historique factures
                    </h3>
                    {loadingDocs ? (
                        <p className="text-xs text-slate-400 mt-4 text-center">Chargement...</p>
                    ) : factures.length === 0 ? (
                        <p className="text-xs text-slate-400 mt-4 text-center">Aucune facture enregistrée</p>
                    ) : (
                        <div className="space-y-1">
                            {factures.map((doc) => (
                                <div
                                    key={doc._id}
                                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                                >
                                    <div>
                                        <p className="text-xs font-semibold text-blue-600">
                                            {doc.curatedDocument?.data?.siret || doc._id}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {doc.curatedDocument?.data?.date_emission
                                                ? new Date(doc.curatedDocument.data.date_emission).toLocaleDateString("fr-FR")
                                                : new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                                        </p>
                                    </div>
                                    <Badge statut={doc.curatedDocument?.status || "en_cours"}/>
                                    <p className="text-xs font-semibold text-slate-800">
                                        {doc.curatedDocument?.data?.montant_ttc
                                            ? Number(doc.curatedDocument.data.montant_ttc).toLocaleString("fr-FR", {
                                                style: "currency",
                                                currency: "EUR",
                                            })
                                            : "—"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Alertes de conformité via fraudScore et anomalies */}
                <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                        Alertes de conformité
                    </h3>
                    {loadingDocs ? (
                        <p className="text-xs text-slate-400 mt-4 text-center">Chargement...</p>
                    ) : (
                        (() => {
                            const alertes = documents
                                .filter((doc) => doc.curatedDocument)
                                .flatMap((doc) => {
                                    const c = doc.curatedDocument;
                                    const items = [];
                                    if (c.status === "rejected") {
                                        items.push({
                                            niveau: "error",
                                            titre: `Document rejeté — ${c.documentType || "inconnu"}`,
                                            detail: `Score fraude : ${(c.validation?.fraudScore * 100).toFixed(0)}%`,
                                        });
                                    }
                                    if (c.mlResult?.is_anomaly) {
                                        items.push({
                                            niveau: "warn",
                                            titre: `Anomalie détectée — ${c.documentType || "inconnu"}`,
                                            detail: `Score ML : ${(c.mlResult.fraud_score * 100).toFixed(0)}%`,
                                        });
                                    }
                                    return items;
                                });

                            return alertes.length === 0 ? (
                                <p className="text-xs text-slate-400 mt-4 text-center">Aucune alerte</p>
                            ) : (
                                <div className="space-y-1">
                                    {alertes.map((alerte, i) => {
                                        const dotClass =
                                            "w-2 h-2 rounded-full flex-shrink-0 mt-1 " +
                                            (alerte.niveau === "error"
                                                ? "bg-red-500"
                                                : alerte.niveau === "warn"
                                                    ? "bg-amber-400"
                                                    : "bg-emerald-500");
                                        return (
                                            <div key={i}
                                                 className="flex items-start gap-2.5 py-2 border-b border-slate-100 last:border-0">
                                                <span className={dotClass}/>
                                                <div>
                                                    <p className="text-xs font-medium text-slate-800">{alerte.titre}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">{alerte.detail}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()
                    )}
                </div>
            </div>

            {showEdit && <EditFournisseurModal fournisseur={f} onClose={() => setShowEdit(false)}/>}
        </div>
    );
}