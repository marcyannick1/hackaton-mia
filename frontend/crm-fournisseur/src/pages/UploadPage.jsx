import UploadZone from "../components/upload/UploadZone.jsx";
export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Upload de documents</h1>
        <p className="text-sm text-slate-500 mt-1">
          Deposez vos fichiers PDF ou images — ils seront classes et traites automatiquement par le pipeline OCR.
        </p>
      </div>
      <UploadZone />
    </div>
  );
}
