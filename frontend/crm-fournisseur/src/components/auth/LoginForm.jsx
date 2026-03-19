import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

export default function LoginForm() {
  const { login, error, setError, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate("/crm");
  };

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
        <p className="text-sm text-slate-500">Plateforme de gestion fournisseurs</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-lg font-semibold text-slate-800 mb-1">Connexion</h1>
        <p className="text-sm text-slate-400 mb-6">Acces a votre espace DocFlow</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Adresse email</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
              placeholder="votre@email.fr" required
              className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="..." required
                className="w-full h-10 px-3.5 pr-10 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}
          <button type="submit" disabled={authLoading}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            {authLoading ? <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Nouveau fournisseur ?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">Creer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
