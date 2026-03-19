import { createContext, useState } from "react";
import { USERS, FOURNISSEURS } from "../data/fournisseurs.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(USERS);
  const [fournisseurs, setFournisseurs] = useState(FOURNISSEURS);
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem("crm_user");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [error, setError] = useState("");

  const login = (email, password) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...safe } = found;
      setUser(safe);
      localStorage.setItem("crm_user", JSON.stringify(safe));
      setError("");
      return true;
    }
    setError("Email ou mot de passe incorrect.");
    return false;
  };

  // Inscription réservée aux fournisseurs
  // Crée automatiquement une fiche fournisseur liée au compte
  const registerFournisseur = ({ nom, raisonSociale, siret, email, password }) => {
    if (users.find(u => u.email === email)) {
      setError("Un compte avec cet email existe deja.");
      return false;
    }
    if (users.find(u => u.email === email)) {
      setError("Un compte avec cet email existe deja.");
      return false;
    }

    // Créer la fiche fournisseur
    const newId = Math.max(...fournisseurs.map(f => f.id)) + 1;
    const initiales = raisonSociale.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
    const nouvelleFiche = {
      id: newId,
      initiales,
      raisonSociale,
      siret,
      tva: "",
      adresse: "",
      contact: email,
      telephone: "",
      iban: "",
      statut: "conforme",
      depuis: new Date().toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
      urssafExpire: "",
      urssafStatut: "valide",
      metrics: { factures: 0, facturesAttente: 0, montantTTC: "0 €", docsUploades: 0, docsValides: 0, docsAlertes: 0 },
      documents: [],
      factures: [],
      alertes: [],
    };
    setFournisseurs(prev => [...prev, nouvelleFiche]);

    // Créer le compte utilisateur lié à la fiche
    const newUser = { id: users.length + 1, nom, email, password, role: "Fournisseur", ficheId: newId };
    setUsers(prev => [...prev, newUser]);

    const { password: _, ...safe } = newUser;
    setUser(safe);
    localStorage.setItem("crm_user", JSON.stringify(safe));
    setError("");
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("crm_user");
  };

  return (
    <AuthContext.Provider value={{ user, users, fournisseurs, setFournisseurs, login, registerFournisseur, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}
