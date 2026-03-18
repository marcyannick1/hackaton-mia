import FournisseurList from "../components/crm/FournisseurList.jsx";
import FicheDetail from "../components/crm/FicheDetail.jsx";
import { useFournisseur } from "../hooks/useFournisseur.js";

export default function CrmPage() {
  const { fournisseurs, selected, setSelected } = useFournisseur();
  return (
    <div className="flex h-full gap-6">
      <div className="w-80 flex-shrink-0">
        <FournisseurList fournisseurs={fournisseurs} selected={selected} onSelect={setSelected} />
      </div>
      <div className="flex-1 min-w-0">
        {selected ? <FicheDetail fournisseur={selected} /> : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Selectionnez un fournisseur pour voir sa fiche
          </div>
        )}
      </div>
    </div>
  );
}
