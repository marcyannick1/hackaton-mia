import { useEffect } from "react";
import FournisseurList from "../components/crm/FournisseurList.jsx";
import FicheDetail from "../components/crm/FicheDetail.jsx";
import { useFournisseur } from "../hooks/useFournisseur.js";
import { useAuth } from "../hooks/useAuth.js";

export default function CrmPage() {
  const { fournisseurs, selected, setSelected } = useFournisseur();
  const { user } = useAuth();

  // Fournisseur : sélectionne automatiquement sa propre fiche
  useEffect(() => {
    if (user?.role === "Fournisseur" && fournisseurs.length > 0 && !selected) {
      setSelected(fournisseurs[0]);
    }
  }, [user, fournisseurs]);

  // Vue Fournisseur : fiche seule sans sidebar liste
  if (user?.role === "Fournisseur") {
    return (
      <div className="h-full">
        {selected ? (
          <FicheDetail fournisseur={selected} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Chargement de votre fiche...
          </div>
        )}
      </div>
    );
  }

  // Vue Admin : liste + fiche
  return (
    <div className="flex h-full gap-6">
      <div className="w-80 flex-shrink-0">
        <FournisseurList fournisseurs={fournisseurs} selected={selected} onSelect={setSelected} />
      </div>
      <div className="flex-1 min-w-0">
        {selected ? (
          <FicheDetail fournisseur={selected} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Selectionnez un fournisseur pour voir sa fiche
          </div>
        )}
      </div>
    </div>
  );
}
