import { FOURNISSEURS } from "../data/fournisseurs.js";
import ConformiteStats from "../components/conformite/ConformiteStats.jsx";
import AlertesList from "../components/conformite/AlertesList.jsx";

export default function ConformitePage() {
  const toutesAlertes = FOURNISSEURS.flatMap(f =>
    f.alertes.filter(a => a.niveau !== "ok").map(a => ({ ...a, fournisseur: f.raisonSociale, fournisseurId: f.id }))
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Outil de conformite</h1>
        <p className="text-sm text-slate-500 mt-1">Verification et validation de la conformite des fournisseurs.</p>
      </div>
      <ConformiteStats fournisseurs={FOURNISSEURS} />
      <AlertesList alertes={toutesAlertes} />
    </div>
  );
}
