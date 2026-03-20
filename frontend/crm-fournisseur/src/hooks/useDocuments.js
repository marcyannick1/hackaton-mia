import {useState, useCallback} from "react";
import {documentAPI} from "../services/api.js";

export function useDocuments() {
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const loadDocuments = useCallback(async () => {
        try {
            setError("");
            const response = await documentAPI.getMyDocuments();
            setDocuments(response.data.data || response.data || []);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Erreur lors du chargement des documents";
            setError(errorMsg);
            console.error("Erreur chargement documents:", err);
        }
    }, []);

    const upload = async (files, metadata = {}) => {
        try {
            setUploading(true);
            setError("");

            // On upload fichier par fichier et on retourne le résultat du premier
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                Object.entries(metadata).forEach(([key, value]) => {
                    formData.append(key, value);
                });

                const response = await documentAPI.uploadDocument(formData);

                // ✅ Retourne l'id du rawDocument créé par le backend
                const rawDocumentId =
                    response.data?.data?._id ||
                    response.data?._id ||
                    null;

                await loadDocuments();
                return {success: true, rawDocumentId};
            }

        } catch (err) {
            const errorMsg = err.response?.data?.message || "Erreur lors de l'upload";
            setError(errorMsg);
            console.error("Erreur upload:", err);
            console.log(err.response?.data);
            return {success: false, rawDocumentId: null};
        } finally {
            setUploading(false);
        }
    };

    const remove = async (docId) => {
        try {
            setError("");
            await documentAPI.deleteDocument(docId);
            setDocuments(prev => prev.filter(d => d._id !== docId && d.id !== docId));
            return true;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Erreur lors de la suppression";
            setError(errorMsg);
            console.error("Erreur suppression:", err);
            return false;
        }
    };

    return {documents, uploading, upload, remove, error, loadDocuments};
}
