import {createContext, useState, useEffect} from "react";
import {authAPI, companyAPI} from "../services/api.js";

export const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [user, setUser] = useState(() => {
        try {
            const s = localStorage.getItem("crm_user");
            return s ? JSON.parse(s) : null;
        } catch {
            return null;
        }
    });
    const [fournisseurs, setFournisseurs] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Charger les fournisseurs au montage
    useEffect(() => {
        if (user) {
            loadFournisseurs();
        }
    }, [user]);

    const loadFournisseurs = async () => {
        try {
            const response = await companyAPI.getAllCompanies();
            setFournisseurs(response.data.data || response.data);
        } catch (err) {
            console.error("Erreur chargement fournisseurs:", err);
            setError("Erreur lors du chargement des fournisseurs");
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        setError("");
        try {
            const response = await authAPI.signIn(email, password);
            const userData = response.data.data || response.data;

            // Stocker l'utilisateur avec le token
            const userToStore = {
                ...userData,
                token: userData.token || userData.accessToken,
            };

            setUser(userToStore);
            localStorage.setItem("crm_user", JSON.stringify(userToStore));
            return true;
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Email ou mot de passe incorrect.";
            setError(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const registerFournisseur = async ({nom, raisonSociale, siret, email, password, confirmPassword}) => {
        setLoading(true);
        setError("");

        try {
            // ÉTAPE 1 : Vérifier si l'entreprise existe déjà avec ce SIRET
            let companyId = null;
            try {
                const existingCompanyResponse = await companyAPI.getCompanyBySiret(siret);
                if (existingCompanyResponse?.data?._id) {
                    companyId = existingCompanyResponse.data._id;
                    console.log("Entreprise existante trouvée:", companyId);
                }
            } catch (err) {
                console.log("Aucune entreprise trouvée avec ce SIRET, création d'une nouvelle entreprise");
            }

            // ÉTAPE 2 : Si l'entreprise n'existe pas, la créer AVANT l'utilisateur
            if (!companyId) {
                const newCompanyResponse = await companyAPI.createCompany({
                    raisonSociale,
                    siret,
                    email,
                });

                console.log(newCompanyResponse)

                const companyData = newCompanyResponse?.data?.data || newCompanyResponse?.data;
                companyId = companyData?._id || companyData?.id;

                if (!companyId) throw new Error("Impossible de récupérer l'ID de la nouvelle entreprise.");

                console.log("Nouvelle entreprise créée:", companyId);
            }

            // ÉTAPE 3 : Créer l'utilisateur avec le companyId (existant ou nouveau)
            const signUpResponse = await authAPI.signUp({
                name: nom,
                email,
                password,
                company: companyId, // ✅ toujours renseigné ici
            });

            const newUser = signUpResponse?.data?.data || signUpResponse?.data;
            const userId = newUser?._id || newUser?.id;

            if (!userId) throw new Error("Impossible de récupérer l'ID utilisateur après inscription.");

            return true;

        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Erreur lors de l'inscription";
            setError(errorMsg);
            return false;

        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setFournisseurs([]);
        localStorage.removeItem("crm_user");
    };

    return (
        <AuthContext.Provider value={{
            user,
            fournisseurs,
            setFournisseurs,
            login,
            registerFournisseur,
            logout,
            error,
            setError,
            loading,
            loadFournisseurs,
        }}>
            {children}
        </AuthContext.Provider>
    );
}
