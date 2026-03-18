import { createContext, useState } from "react";
import { FOURNISSEURS } from "../data/fournisseurs.js";

export const FournisseurContext = createContext(null);

export function FournisseurProvider({ children }) {
  const [fournisseurs, setFournisseurs] = useState(FOURNISSEURS);
  const [selected, setSelected] = useState(null);

  const updateFournisseur = (id, data) => {
    setFournisseurs(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
    if (selected?.id === id) setSelected(prev => ({ ...prev, ...data }));
  };

  return (
    <FournisseurContext.Provider value={{ fournisseurs, selected, setSelected, updateFournisseur }}>
      {children}
    </FournisseurContext.Provider>
  );
}
