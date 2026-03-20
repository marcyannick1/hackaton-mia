import { useLocation, useNavigate } from "react-router-dom";
import ResultatsOCR from "../components/upload/ResultatsOCR.jsx";

export default function ResultatsOCRPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.fichier || !state?.curatedDocument) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-400">Aucun fichier traité à afficher.</p>
        <button
          onClick={() => navigate("/upload")}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Retour à l'upload
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/upload")}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Résultats OCR</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Données extraites depuis{" "}
            <span className="font-medium text-slate-700">{state.fichier.nom}</span>
          </p>
        </div>
      </div>
      <ResultatsOCR
        fichier={state.fichier}
        curatedDocument={state.curatedDocument}
      />
    </div>
  );
}