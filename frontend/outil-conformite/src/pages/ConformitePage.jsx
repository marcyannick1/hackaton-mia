import { useEffect, useState } from "react";
import { documentAPI } from "../services/api.js";
import ConformiteStats from "../components/conformite/ConformiteStats.jsx";
import AlertesList from "../components/conformite/AlertesList.jsx";

export default function ConformitePage() {
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadAnomalies = async () => {
        try {
            const res = await documentAPI.getAnomalies();
            setAnomalies(res.data.data || []);
        } catch (err) {
            console.error("Erreur chargement anomalies :", err.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAnomalies(); }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-slate-800">Outil de conformité</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Vérification et validation de la conformité des fournisseurs.
                </p>
            </div>
            {loading ? (
                <p className="text-sm text-slate-400">Chargement...</p>
            ) : (
                <>
                    <ConformiteStats anomalies={anomalies} />
                    <AlertesList anomalies={anomalies} onStatusChange={loadAnomalies} />
                </>
            )}
        </div>
    );
}