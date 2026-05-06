import {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth.js";

export default function RegisterForm() {
    const {register, error, setError, loading: authLoading} = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({nom: "", email: "", password: "", confirmPassword: "", role: "fournisseur"});
    const [localError, setLocalError] = useState("");

    const handleChange = e => {
        setForm(prev => ({...prev, [e.target.name]: e.target.value}));
        setLocalError("");
        setError("");
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setLocalError("Les mots de passe ne correspondent pas.");
            return;
        }
        const ok = await register(form);
        if (ok) navigate("/conformite");
    };

    const displayError = localError || error;

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                            <path
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                    </div>
                    <span className="text-xl font-semibold text-slate-800 tracking-tight">DocFlow Conformite</span>
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h1 className="text-lg font-semibold text-slate-800 mb-1">Inscription</h1>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {[{name: "nom", label: "Nom complet", type: "text"}, {
                        name: "email",
                        label: "Email",
                        type: "email"
                    }].map(f => (
                        <div key={f.name}>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">{f.label}</label>
                            <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange} required
                                   className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"/>
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Role</label>
                        <select name="role" value={form.role} onChange={handleChange}
                                className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                            <option>admin</option>
                        </select>
                    </div>
                    {[{name: "password", label: "Mot de passe"}, {
                        name: "confirmPassword",
                        label: "Confirmer"
                    }].map(f => (
                        <div key={f.name}>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">{f.label}</label>
                            <input type="password" name={f.name} value={form[f.name]} onChange={handleChange} required
                                   className="w-full h-10 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"/>
                        </div>
                    ))}
                    {displayError && <div
                        className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">{displayError}</div>}
                    <button type="submit" disabled={authLoading}
                            className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center">
                        {authLoading ?
                            <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                                <path className="opacity-75" fill="white"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg> : "Creer mon compte"}
                    </button>
                </form>
                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400">Deja un compte ?{" "}<Link to="/login"
                                                                                     className="text-emerald-600 font-medium">Se
                        connecter</Link></p>
                </div>
            </div>
        </div>
    );
}
