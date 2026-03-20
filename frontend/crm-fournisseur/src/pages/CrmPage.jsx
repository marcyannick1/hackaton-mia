import {useEffect, useState} from "react";
import FournisseurList from "../components/crm/FournisseurList.jsx";
import FicheDetail from "../components/crm/FicheDetail.jsx";
import {useFournisseur} from "../hooks/useFournisseur.js";
import {useAuth} from "../hooks/useAuth.js";
import {companyAPI} from "../services/api.js";

export default function CrmPage() {
    const {fournisseurs, selected, setSelected} = useFournisseur();
    const {user} = useAuth();
    const [company, setCompany] = useState(null);
    const [loadingCompany, setLoadingCompany] = useState(false);

    // Fournisseur : récupère la fiche company du user connecté
    useEffect(() => {
        console.log("user", user);
        if (user?.role === "fournisseur" && user?.company) {
            setLoadingCompany(true);
            companyAPI
                .getCompanyById(user.company)
                .then((res) => {
                    setCompany(res.data.data);
                    setSelected(res.data.data); // on sélectionne directement la fiche
                })
                .catch((err) => {
                    console.error("Erreur lors de la récupération de la company :", err);
                })
                .finally(() => {
                    setLoadingCompany(false);
                });
        }

        console.log("company", company);
    }, [user?.role, user?.companyId]);

    // Vue Fournisseur : fiche seule sans sidebar liste
    if (user?.role === "fournisseur") {
        return (
            <div className="h-full">
                {loadingCompany && (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        Chargement de votre fiche...
                    </div>
                )}
                {!loadingCompany && selected ? (
                    <FicheDetail fournisseur={selected}/>
                ) : (
                    !loadingCompany && (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                            Aucune fiche trouvée pour votre compte.
                        </div>
                    )
                )}
            </div>
        );
    }

    // Vue Admin : liste + fiche
    return (
        <div className="flex h-full gap-6">
            <div className="w-80 flex-shrink-0">
                <FournisseurList
                    fournisseurs={fournisseurs}
                    selected={selected}
                    onSelect={setSelected}
                />
            </div>
            <div className="flex-1 min-w-0">
                {selected ? (
                    <FicheDetail fournisseur={selected}/>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        Selectionnez un fournisseur pour voir sa fiche
                    </div>
                )}
            </div>
        </div>
    );
}