const VARIANTS = {
  valide:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
  conforme: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  ok:       "bg-emerald-50 text-emerald-700 border border-emerald-200",
  attention:"bg-amber-50 text-amber-700 border border-amber-200",
  alerte:   "bg-amber-50 text-amber-700 border border-amber-200",
  warn:     "bg-amber-50 text-amber-700 border border-amber-200",
  attente:  "bg-amber-50 text-amber-700 border border-amber-200",
  expire:   "bg-red-50 text-red-700 border border-red-200",
  error:    "bg-red-50 text-red-700 border border-red-200",
  payee:    "bg-blue-50 text-blue-700 border border-blue-200",
  accepte:  "bg-blue-50 text-blue-700 border border-blue-200",
};

const LABELS = {
  valide: "Valide", conforme: "Conforme", ok: "OK",
  attention: "À vérifier", alerte: "Alerte", warn: "Attention",
  attente: "En attente", expire: "Expirée", error: "Erreur",
  payee: "Payée", accepte: "Accepté",
};

export default function Badge({ statut }) {
  const classes = VARIANTS[statut] ?? "bg-slate-100 text-slate-600";
  const label = LABELS[statut] ?? statut;
  return (
    <span className={["inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium", classes].join(" ")}>
      {label}
    </span>
  );
}