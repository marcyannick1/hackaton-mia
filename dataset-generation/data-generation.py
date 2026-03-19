import requests
import csv
import pandas as pd

TOKEN = "ffc7e73d-2c34-4747-87e7-3d2c3467476b"

HEADERS = {
    "X-INSEE-Api-Key-Integration": TOKEN
}

BASE_URL_SIRET = "https://api.insee.fr/api-sirene/3.11/siret"


# 🔹 1. Appel API
def fetch_etablissement(enseigne):
    query = f'denominationUniteLegale:"{enseigne}" AND -periode(etatAdministratifEtablissement:F) AND -codePaysEtrangerEtablissement:*'

    params = {
        "q": query,
        "nombre": 1
    }

    response = requests.get(BASE_URL_SIRET, params=params, headers=HEADERS)

    if response.status_code == 200:
        data = response.json()
        etablissements = data.get("etablissements", [])
        return etablissements[0] if etablissements else None
    else:
        print(f"Erreur API pour {enseigne} : {response.status_code}")
        return None


# 🔹 2. Extraction des données
def extract_data(enseigne, etab,naf_bdd,forme_juridique_bdd):
    if not etab:
        return None
    siren = etab.get("siren", "N/A")
    siret = etab.get("siret", "N/A")
    nom = etab.get("uniteLegale", {}).get("denominationUniteLegale", "N/A")
    code_naf = etab.get("uniteLegale", {}).get("activitePrincipaleUniteLegale","N/A")
    date_creation = etab.get("dateCreationEtablissement","N/A")
    intitule_naf = naf_bdd[naf_bdd["Code"] == code_naf]["Intitulé"].values[0]
    categorie_juridique = etab.get("uniteLegale", {}).get("categorieJuridiqueUniteLegale","N/A")
    intitule_categorie_juridique = forme_juridique_bdd[forme_juridique_bdd["Code"] == str(categorie_juridique)]["Libellé"].values[0]
    adresse_data = etab.get("adresseEtablissement", {})

    numero = adresse_data.get("numeroVoieEtablissement", "") or ""
    voie = adresse_data.get("typeVoieEtablissement", "") or ""
    rue = adresse_data.get("libelleVoieEtablissement", "") or ""

    adresse = f"{numero} {voie} {rue}".strip()

    ville = adresse_data.get("libelleCommuneEtablissement", "N/A")
    code_postal = adresse_data.get("codePostalEtablissement", "N/A")
    cle_tva = (12 + 3 * (int(siren) % 97)) % 97
    num_tva = "FR"+ str(cle_tva) + siren

    return [
        enseigne,
        siren,
        siret,
        date_creation,
        nom,
        adresse,
        ville,
        code_postal,
        code_naf,
        intitule_naf,
        categorie_juridique,
        intitule_categorie_juridique,
        num_tva
    ]


# 🔹 3. Export CSV
def export_to_csv(filename, data_rows):
    with open(filename, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)

        writer.writerow([
            "enseigne",
            "siren",
            "siret",
            "date_creation",
            "nom",
            "adresse",
            "ville",
            "code_postal",
            "code_naf",
            "intitule_naf",
            "categorie_juridique",
            "intitule_categorie_juridique",
            "num_tva"
        ])

        writer.writerows(data_rows)

def get_naf_description():
    file_path = "./dataset-generation/int_courts_naf_rev_2.xls"
    df = pd.read_excel(file_path)
    df = df[["Code"," Intitulés de la  NAF rév. 2, version finale "]]
    df.rename(columns={" Intitulés de la  NAF rév. 2, version finale ": "Intitulé"}, inplace=True)
    df_clean = df.dropna(subset=["Code"])
    df_clean = df_clean[~df_clean["Code"].str.contains("SECTION")]
    print(df_clean[df_clean["Code"] == "62.01Z"]["Intitulé"].values[0])
    return df_clean
    

def get_forme_juridique_description():
    file_path = "./dataset-generation/cj_septembre_2022.xls"
    df = pd.read_excel(file_path,sheet_name="Niveau III",)
    # 🔹 Supprimer les deux premières lignes
    df.drop(index=df.index[0:2], inplace=True)
    # Mettre la première ligne restante comme header
    df.columns = df.iloc[0]  # nouvelle première ligne comme noms de colonnes
    df = df[1:].reset_index(drop=True)
    print(df.info())
    print(df.head())

    return df

# 🔹 4. Pipeline principal
def main():
    naf_bdd = get_naf_description()
    forme_juridique_bdd = get_forme_juridique_description()
    enseignes_connues = [
        "Saint-Gobain", "EDF", "OVHCloud"
    ]

    results = []

    for enseigne in enseignes_connues:
        etab = fetch_etablissement(enseigne)
        if etab:
            row = extract_data(enseigne, etab,naf_bdd,forme_juridique_bdd)
            if row:
                results.append(row)
                print(f"{enseigne} ajouté")
        else:
            print(f"{enseigne} → Aucun résultat")

    export_to_csv("./dataset-generation/entreprises_cas_usage.csv", results)
    print("CSV généré avec succès ✅")


if __name__ == "__main__":
    main()