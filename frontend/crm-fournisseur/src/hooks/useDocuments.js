import { useState } from "react";
export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const upload = async (files) => {
    setUploading(true);
    await new Promise(r => setTimeout(r, 1200));
    const nouveaux = Array.from(files).map(f => ({
      nom: f.name, type: f.type, taille: f.size, statut: "en_attente", uploadedAt: new Date().toISOString(),
    }));
    setDocuments(prev => [...prev, ...nouveaux]);
    setUploading(false);
  };
  const remove = (nom) => setDocuments(prev => prev.filter(d => d.nom !== nom));
  return { documents, uploading, upload, remove };
}
