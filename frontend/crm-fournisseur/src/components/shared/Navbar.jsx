import { useLocation } from "react-router-dom";
const TITLES = { "/crm": "Fournisseurs", "/upload": "Upload de documents", "/resultats-ocr": "Resultats OCR" };
export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 flex-shrink-0">
      <h1 className="text-sm font-semibold text-slate-800">{TITLES[pathname] ?? "DocFlow CRM"}</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
          Pipeline actif
        </div>
      </div>
    </header>
  );
}
