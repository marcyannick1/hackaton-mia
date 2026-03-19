import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { companyAPI } from "../services/api.js";

export const FournisseurContext = createContext(null);

export function FournisseurProvider({ children }) {
  const { user, fournisseurs: fournisseursFromAuth, setFournisseurs: setFournisseursFromAuth } = useContext(AuthContext);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filtrer les fournisseurs selon le rôle
  const fournisseursFiltres = user?.role === "Fournisseur"
    ? fournisseursFromAuth.filter(f => {
        // Pour un fournisseur, afficher sa fiche (basée sur le owner du company)
        return f.owner === user._id || f.owner === user.id;
      })
    : fournisseursFromAuth;

  const updateFournisseur = async (id, data) => {
    try {
      setLoading(true);
      const response = await companyAPI.updateCompany(id, data);
      const updatedCompany = response.data.data || response.data;
      
      // Mettre à jour dans le contexte
      setFournisseursFromAuth(prev => prev.map(f => 
        (f._id === id || f.id === id) ? updatedCompany : f
      ));
      
      if (selected?.id === id || selected?._id === id) {
        setSelected(prevState => ({ ...prevState, ...updatedCompany }));
      }
      return true;
    } catch (err) {
      console.error("Erreur mise à jour fournisseur:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <FournisseurContext.Provider value={{ 
      fournisseurs: fournisseursFiltres, 
      selected, 
      setSelected, 
      updateFournisseur,
      loading,
    }}>
      {children}
    </FournisseurContext.Provider>
  );
}
