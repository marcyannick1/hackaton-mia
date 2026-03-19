import { createContext, useContext, useState } from "react";
import { AuthContext } from "./AuthContext.jsx";

export const FournisseurContext = createContext(null);

export function FournisseurProvider({ children }) {
  const { user, fournisseurs, setFournisseurs } = useContext(AuthContext);
  const [selected, setSelected] = useState(null);

  // Admin voit tout, Fournisseur voit uniquement sa fiche
  const fournisseursFiltres = user?.role === "Fournisseur"
    ? fournisseurs.filter(f => f.id === user.ficheId)
    : fournisseurs;

  const updateFournisseur = (id, data) => {
    setFournisseurs(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
    if (selected?.id === id) setSelected(prev => ({ ...prev, ...data }));
  };

  return (
    <FournisseurContext.Provider value={{ fournisseurs: fournisseursFiltres, selected, setSelected, updateFournisseur }}>
      {children}
    </FournisseurContext.Provider>
  );
}
