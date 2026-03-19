import { useState } from "react";
import { useFournisseur } from "../../hooks/useFournisseur.js";

export default function EditFournisseurModal({ fournisseur, onClose }) {
  const { updateFournisseur } = useFournisseur();
  const [form, setForm] = useState({
    raisonSociale: fournisseur.raisonSociale,
    siret: fournisseur.siret,
    tva: fournisseur.tva,
    adresse: fournisseur.adresse,
    contact: fournisseur.contact,
    telephone: fournisseur.telephone,
    iban: fournisseur.iban,
  });
  const [saved, setSaved] = useState(false);
  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = e => {
    e.preventDefault();
    updateFournisseur(fournisseur.id, form);
    setSaved(true);
    setTimeout(onClose, 1000);
  };
  const CHAMPS = [
    { name: "raisonSociale", label: "Raison sociale", type: "text" },
    { name: "siret", label: "SIRET", type: "text" },
    { name: "tva", label: "N TVA", type: "text" },
    { name: "adresse", label: "Adresse", type: "text" },
    { name: "contact", label: "Email contact", type: "email" },
    { name: "telephone", label: "Telephone", type: "text" },
    { name: "iban", label: "IBAN", type: "text" },
  ];
  return (
    <div style={{ minHeight: "400px", background: "rgba(0,0,0,0.45)" }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Modifier la fiche</h3>
            <p className="text-xs text-slate-400 mt-0.5">{fournisseur.raisonSociale}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {saved ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p className="text-sm font-medium text-slate-800">Modifications enregistrees</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {CHAMPS.map(champ => (
              <div key={champ.name}>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{champ.label}</label>
                <input type={champ.type} name={champ.name} value={form[champ.name]} onChange={handleChange}
                  className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all">Annuler</button>
              <button type="submit" className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all active:scale-[0.98]">Enregistrer</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
