import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

export default function RegisterFournisseurForm() {
  const { registerFournisseur, error, setError, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState("");
  const [form, setForm] = useState({
    nom: "",
    raisonSociale: "",
    siret: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError(""); setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setLocalError("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 4) { setLocalError("Le mot de passe doit contenir au moins 4 caracteres."); return; }
    if (form.siret.replace(/\s/g, "").length < 9) { setLocalError("Le SIRET doit contenir au moins 9 chiffres."); return; }
    const ok = await registerFournisseur(form);
    if (ok) navigate("/crm");
  };

  const displayError = localError || error;

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white"/>
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.6"/>
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.6"/>
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white"/>
            </svg>
          </div>
          <span className="text-xl font-semibold text-slate-800 tracking-tight">DocFlow CRM</span>
        </div>
        <p className="text-sm text-slate-500">Inscription fournisseur</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-lg font-semibold text-slate-800 mb-1">Creer votre compte</h1>
        <p className="text-sm text-slate-400 mb-6">
          Une fiche fournisseur sera creee automatiquement
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Votre nom</label>
              <input type="text" name="nom" value={form.nom} onChange={handleChange} placeholder="Jean Dupont" required
                className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Raison sociale</label>
              <input type="text" name="raisonSociale" value={form.raisonSociale} onChange={handleChange} placeholder="Ma Societe SAS" required
                className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">SIRET</label>
            <input type="text" name="siret" value={form.siret} onChange={handleChange} placeholder="XXX XXX XXX XXXXX" required
              className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            <p className="text-xs text-slate-400 mt-1">Votre SIRET servira a identifier votre fiche fournisseur</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Adresse email professionnelle</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="contact@masociete.fr" required
              className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Mot de passe</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="..." required
                className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirmer</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="..." required
                className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>

          {displayError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
              {displayError}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-3">
            <p className="text-xs text-blue-700 font-medium mb-1">Ce qui sera cree automatiquement</p>
            <p className="text-xs text-blue-600">Une fiche fournisseur a votre nom avec votre SIRET. Vous pourrez completer vos informations apres connexion.</p>
          </div>

          <button type="submit" disabled={authLoading}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-all active:scale-[0.98] flex items-center justify-center">
            {authLoading ? <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : "Creer mon compte fournisseur"}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Deja un compte ?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
