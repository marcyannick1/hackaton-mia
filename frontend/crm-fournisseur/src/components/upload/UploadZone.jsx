import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const TYPE_LABELS = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/jpg": "JPG",
};

function FileRow({ file, onRemove, onUpload, uploading, status }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" className="text-slate-500">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {TYPE_LABELS[file.type] ?? file.type} · {(file.size / 1024).toFixed(0)} Ko
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {status === "pending" && (
          <button
            onClick={() => onUpload(file)}
            disabled={uploading}
            className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
          >
            {uploading ? "Upload..." : "Upload"}
          </button>
        )}
        {status === "uploading" && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Upload en cours...
          </div>
        )}
        {/* Polling Airflow après upload réussi */}
        {status === "processing" && (
          <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Analyse OCR...
          </div>
        )}
        {status === "uploaded" && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Terminé
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Erreur
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(file.name)}
        className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

export default function UploadZone({ useDocumentsHook }) {
  const [files, setFiles] = useState([]);
  const [fileStatuses, setFileStatuses] = useState({});
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const navigate = useNavigate();
  const { upload: apiUpload, uploading: isUploading } = useDocumentsHook
    ? useDocumentsHook()
    : { upload: null, uploading: false };

  const addFiles = (newFiles) => {
    const liste = Array.from(newFiles).filter((f) => !files.find((x) => x.name === f.name));
    setFiles((prev) => [...prev, ...liste]);
    liste.forEach((f) => {
      setFileStatuses((prev) => ({ ...prev, [f.name]: "pending" }));
    });
  };

  const removeFile = (name) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
    setFileStatuses((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // Polling sur rawDocument jusqu'à status "done"
  const pollUntilDone = (rawDocumentId, fileName) => {
    const MAX_ATTEMPTS = 20; // 20 × 3s = 60s max
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const { documentAPI } = await import("../../services/api.js"); // adapte le chemin
        const res = await documentAPI.getDocumentById(rawDocumentId);
        const doc = res.data.data;

        if (doc.status === "done" && doc.curatedDocument) {
          clearInterval(interval);
          setFileStatuses((prev) => ({ ...prev, [fileName]: "uploaded" }));
          // console.log(doc)
          setTimeout(() => {
            navigate("/resultats-ocr", {
              state: {
                fichier: { nom: fileName },
                rawDocumentId,
                curatedDocument: doc.curatedDocument,
              },
            });
          }, 500);
        } else if (attempts >= MAX_ATTEMPTS) {
          clearInterval(interval);
          setFileStatuses((prev) => ({ ...prev, [fileName]: "error" }));
        }
      } catch {
        clearInterval(interval);
        setFileStatuses((prev) => ({ ...prev, [fileName]: "error" }));
      }
    }, 3000);
  };

  const handleUpload = async (file) => {
    setFileStatuses((prev) => ({ ...prev, [file.name]: "uploading" }));

    if (apiUpload) {
      const result = await apiUpload([file]); // doit retourner { success, rawDocumentId }
      if (result?.success && result?.rawDocumentId) {
        setFileStatuses((prev) => ({ ...prev, [file.name]: "processing" }));
        pollUntilDone(result.rawDocumentId, file.name);
      } else {
        setFileStatuses((prev) => ({ ...prev, [file.name]: "error" }));
      }
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        className={"relative border-2 border-dashed rounded-xl px-8 py-12 text-center cursor-pointer transition-all " +
          (dragging ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-white hover:border-blue-300 hover:bg-slate-50")}
      >
        <input ref={inputRef} type="file" multiple accept=".pdf,image/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
        <div className="flex flex-col items-center gap-3">
          <div className={"w-12 h-12 rounded-xl flex items-center justify-center transition-colors " + (dragging ? "bg-blue-100" : "bg-slate-100")}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" className={dragging ? "text-blue-600" : "text-slate-500"}>
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">{dragging ? "Déposez vos fichiers ici" : "Glissez-déposez vos fichiers"}</p>
            <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPEG · Plusieurs fichiers acceptés</p>
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-lg">Parcourir</span>
        </div>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">
              {files.length} fichier{files.length > 1 ? "s" : ""} sélectionné{files.length > 1 ? "s" : ""}
            </p>
            <button onClick={() => setFiles([])} className="text-xs text-red-500 hover:text-red-700 transition-colors">
              Tout supprimer
            </button>
          </div>
          {files.map((file) => (
            <FileRow
              key={file.name}
              file={file}
              onRemove={removeFile}
              onUpload={handleUpload}
              uploading={isUploading}
              status={fileStatuses[file.name] || "pending"}
            />
          ))}
        </div>
      )}
    </div>
  );
}