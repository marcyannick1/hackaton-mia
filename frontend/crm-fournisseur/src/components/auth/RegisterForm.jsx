import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

const ROLES = ["Operateur", "Administrateur"];

export default function RegisterForm() {
  const { register, error, setError } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nom: "", email: "", password: "", confirmPassword: "", role: "Operateur" });
  const [localError, setLocalError] = useState("");

  const handleChange = e => { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); setLocalError(""); setError(""); };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setLocalError("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 4) { setLocalError("Minimum 4 caracteres."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const ok = register(form);
    if (ok) navigate("/crm");
    setLoading(false);
  };

  const displayError = localError || error;

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
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
        <p className="text-sm text-slate-500">Creer un nouveau compte</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-lg font-semibold text-slate-800 mb-1">Inscription</h1>
        <p className="text-sm text-slate-400 mb-6">Remplissez les informations pour creer votre compte</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[{ name: "nom", label: "Nom complet", type: "text", placeholder: "Sophie Martin" }, { name: "email", label: "Adresse email", type: "email", placeholder: "prenom.nom@docflow.fr" }].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">{f.label}</label>
              <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} required className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {[{ name: "password", label: "Mot de passe" }, { name: "confirmPassword", label: "Confirmer le mot de passe" }].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">{f.label}</label>
              <input type="password" name={f.name} value={form[f.name]} onChange={handleChange} placeholder="..." required className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          ))}
          {displayError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
              {displayError}
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-all active:scale-[0.98] flex items-center justify-center">
            {loading ? "Chargement..." : "Creer mon compte"}
          </button>
        </form>
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">Deja un compte ?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
