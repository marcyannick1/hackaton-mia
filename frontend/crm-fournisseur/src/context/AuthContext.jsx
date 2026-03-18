import { createContext, useState } from "react";
import { USERS } from "../data/fournisseurs.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(USERS);
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem("crm_user"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [error, setError] = useState("");

  const login = (email, password) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...safe } = found;
      setUser(safe); localStorage.setItem("crm_user", JSON.stringify(safe)); setError(""); return true;
    }
    setError("Email ou mot de passe incorrect."); return false;
  };

  const register = ({ nom, email, password, role }) => {
    if (users.find(u => u.email === email)) { setError("Un compte avec cet email existe deja."); return false; }
    const newUser = { id: users.length + 1, nom, email, password, role };
    setUsers(prev => [...prev, newUser]);
    const { password: _, ...safe } = newUser;
    setUser(safe); localStorage.setItem("crm_user", JSON.stringify(safe)); setError(""); return true;
  };

  const logout = () => { setUser(null); localStorage.removeItem("crm_user"); };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}
