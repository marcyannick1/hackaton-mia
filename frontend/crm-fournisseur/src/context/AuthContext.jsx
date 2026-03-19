import { createContext, useState, useEffect } from "react";
import { authAPI, companyAPI } from "../services/api.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem("crm_user");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [fournisseurs, setFournisseurs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Charger les fournisseurs au montage
  useEffect(() => {
    if (user) {
      loadFournisseurs();
    }
  }, [user]);

  const loadFournisseurs = async () => {
    try {
      const response = await companyAPI.getAllCompanies();
      setFournisseurs(response.data.data || response.data);
    } catch (err) {
      console.error("Erreur chargement fournisseurs:", err);
      setError("Erreur lors du chargement des fournisseurs");
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const response = await authAPI.signIn(email, password);
      const userData = response.data.data || response.data;
      
      // Stocker l'utilisateur avec le token
      const userToStore = {
        ...userData,
        token: userData.token || userData.accessToken,
      };
      
      setUser(userToStore);
      localStorage.setItem("crm_user", JSON.stringify(userToStore));
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Email ou mot de passe incorrect.";
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerFournisseur = async ({ nom, raisonSociale, siret, email, password, confirmPassword }) => {
    setLoading(true);
    setError("");
    try {
      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        setLoading(false);
        return false;
      }
      if (password.length < 4) {
        setError("Le mot de passe doit contenir au moins 4 caractères.");
        setLoading(false);
        return false;
      }
      if (siret.replace(/\s/g, "").length < 9) {
        setError("Le SIRET doit contenir au moins 9 chiffres.");
        setLoading(false);
        return false;
      }

      // Créer le compte utilisateur
      const response = await authAPI.signUp({
        name: nom,
        email,
        password,
        role: "Fournisseur",
      });

      const userData = response.data.data || response.data;
      const userToStore = {
        ...userData,
        token: userData.token || userData.accessToken,
      };

      setUser(userToStore);
      localStorage.setItem("crm_user", JSON.stringify(userToStore));

      // Créer la fiche fournisseur
      if (userToStore.token) {
        await companyAPI.createCompany({
          name: raisonSociale,
          siret,
          email,
          owner: userToStore._id || userToStore.id,
        });
      }

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
    setFournisseurs([]);
    localStorage.removeItem("crm_user");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      fournisseurs, 
      setFournisseurs, 
      login, 
      registerFournisseur, 
      logout, 
      error, 
      setError,
      loading,
      loadFournisseurs,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
