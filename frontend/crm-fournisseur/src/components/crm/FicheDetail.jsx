import { useState } from "react";
import Badge from "../shared/Badge.jsx";
import EditFournisseurModal from "./EditFournisseurModal.jsx";

export default function FicheDetail({ fournisseur: f }) {
  const [showEdit, setShowEdit] = useState(false);
  return (
    <div className="space-y-5 h-full overflow-y-auto pb-4">
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0"/>
        <span className="text-xs text-blue-700">Fiche remplie automatiquement via OCR — derniere extraction il y a 2 minutes</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-base font-semibold text-blue-700 flex-shrink-0">{f.initiales}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-slate-800">{f.raisonSociale}</h2>
          <p className="text-xs text-slate-500 mt-0.5">SIRET {f.siret} · {f.adresse || "Adresse non renseignee"} · Fournisseur actif depuis {f.depuis}</p>
        </div>
        <Badge statut={f.statut} />
        <button onClick={() => setShowEdit(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all">
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Modifier
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Factures totales", value: f.metrics.factures, sub: "dont " + f.metrics.facturesAttente + " en attente" },
          { label: "Montant TTC total", value: f.metrics.montantTTC, sub: "sur 12 mois glissants" },
          { label: "Docs uploades", value: f.metrics.docsUploades, sub: f.metrics.docsValides + " valides · " + f.metrics.docsAlertes + " alerte" },
          { label: "Statut URSSAF", value: <Badge statut={f.urssafStatut} />, sub: f.urssafExpire ? "expire le " + f.urssafExpire : "Non renseigne" },
        ].map(m => (
          <div key={m.label} className="bg-slate-50 rounded-lg px-4 py-3">
            <p className="text-xs text-slate-500 mb-1">{m.label}</p>
            <p className="text-lg font-semibold text-slate-800">{m.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Informations generales</h3>
          <div className="space-y-2.5">
            {[
              { label: "Raison sociale", value: f.raisonSociale },
              { label: "SIRET", value: f.siret },
              { label: "N TVA", value: f.tva || "—" },
              { label: "Adresse", value: f.adresse || "—" },
              { label: "Contact", value: f.contact },
              { label: "IBAN", value: f.iban || "—" },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                <span className="text-xs text-slate-500">{row.label}</span>
                <span className="text-xs font-medium text-slate-800 text-right max-w-[55%] truncate">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Documents uploades</h3>
          {f.documents.length === 0 ? (
            <p className="text-xs text-slate-400 mt-4 text-center">Aucun document uploade</p>
          ) : (
            <div className="space-y-1">
              {f.documents.map(doc => (
                <div key={doc.nom} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" className="text-slate-500"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800">{doc.nom}</p>
                      <p className="text-xs text-slate-400">{doc.date}</p>
                    </div>
                  </div>
                  <Badge statut={doc.statut} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Historique factures et devis</h3>
          {f.factures.length === 0 ? (
            <p className="text-xs text-slate-400 mt-4 text-center">Aucune facture enregistree</p>
          ) : (
            <div className="space-y-1">
              {f.factures.map(fac => (
                <div key={fac.ref} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div><p className="text-xs font-semibold text-blue-600">{fac.ref}</p><p className="text-xs text-slate-400">{fac.date}</p></div>
                  <Badge statut={fac.statut} />
                  <p className="text-xs font-semibold text-slate-800">{fac.montant}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Alertes de conformite</h3>
          {f.alertes.length === 0 ? (
            <p className="text-xs text-slate-400 mt-4 text-center">Aucune alerte</p>
          ) : (
            <div className="space-y-1">
              {f.alertes.map((alerte, i) => {
                const dotClass = "w-2 h-2 rounded-full flex-shrink-0 mt-1 " + (alerte.niveau === "error" ? "bg-red-500" : alerte.niveau === "warn" ? "bg-amber-400" : "bg-emerald-500");
                return (
                  <div key={i} className="flex items-start gap-2.5 py-2 border-b border-slate-100 last:border-0">
                    <span className={dotClass}/>
                    <div>
                      <p className="text-xs font-medium text-slate-800">{alerte.titre}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{alerte.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showEdit && <EditFournisseurModal fournisseur={f} onClose={() => setShowEdit(false)} />}
    </div>
  );
}
