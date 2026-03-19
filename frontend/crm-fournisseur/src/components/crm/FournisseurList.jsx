import Badge from "../shared/Badge.jsx";
export default function FournisseurList({ fournisseurs, selected, onSelect }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 h-full flex flex-col">
      <div className="px-4 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Fournisseurs</h2>
        <p className="text-xs text-slate-400 mt-0.5">{fournisseurs.length} enregistres</p>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {fournisseurs.map(f => {
          const isSelected = selected?.id === f.id;
          return (
            <button key={f.id} onClick={() => onSelect(f)}
              className={"w-full text-left px-4 py-3.5 transition-all hover:bg-slate-50 " + (isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : "")}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 flex-shrink-0">{f.initiales}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{f.raisonSociale}</p>
                  <p className="text-xs text-slate-400 truncate">{f.siret}</p>
                </div>
                <Badge statut={f.statut} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
