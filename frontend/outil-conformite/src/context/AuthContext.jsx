import { createContext, useState } from "react";
import { authAPI } from "../services/api.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem("conformite_user"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const response = await authAPI.signIn(email, password);
      const userData = response.data.data || response.data;
      
      const userToStore = {
        ...userData,
        token: userData.token || userData.accessToken,
      };
      
      setUser(userToStore);
      localStorage.setItem("conformite_user", JSON.stringify(userToStore));
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Email ou mot de passe incorrect.";
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ nom, email, password, role = "Admin" }) => {
    setLoading(true);
    setError("");
    try {
      const response = await authAPI.signUp({
        name: nom,
        email,
        password,
        role,
      });

      const userData = response.data.data || response.data;
      const userToStore = {
        ...userData,
        token: userData.token || userData.accessToken,
      };
      
      setUser(userToStore);
      localStorage.setItem("conformite_user", JSON.stringify(userToStore));
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur lors de l'inscription";
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => { 
    setUser(null); 
    localStorage.removeItem("conformite_user"); 
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, error, setError, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
