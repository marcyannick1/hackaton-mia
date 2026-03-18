import pandas as pd
from faker import Faker
import random
from datetime import datetime, timedelta
import os
from jinja2 import Environment, FileSystemLoader
import pdfkit

# -----------------------
# Config
# -----------------------
fake = Faker("fr_FR")
TEMPLATE_DIR = "./dataset-generation/templates"
OUTPUT_FACTURES = "./data/output/factures"
OUTPUT_DEVIS = "./data/output/devis"
OUTPUT_KBIS = "./data/output/kbis"

os.makedirs(OUTPUT_FACTURES, exist_ok=True)
os.makedirs(OUTPUT_DEVIS, exist_ok=True)
os.makedirs(OUTPUT_KBIS, exist_ok=True)

env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
CSV_FILE = "./dataset-generation/entreprisesv2.csv"

# -----------------------
# Lecture entreprises
# -----------------------
def retrieve_entreprise_data(file_path):
    return pd.read_csv(file_path, index_col=False)

# -----------------------
# Faker clients
# -----------------------
def generate_client():
    return {
        "nom": fake.name(),
        "adresse": fake.street_address(),
        "ville": fake.city(),
        "code_postal": fake.postcode(),
        "email": fake.email(),
        "telephone": fake.phone_number()
    }

def generate_date_validite():
    today = datetime.today()
    if random.choice([True, False]):
        return today + timedelta(days=random.randint(30, 365)), "valide"
    else:
        return today - timedelta(days=random.randint(30, 365)), "invalide"

def generate_lignes(n):
    lignes = []
    for _ in range(n):
        nom = random.choice([
            "Fournitures de bureau",
            "Matériel informatique (accessoires)",
            "Equipement professionnel",
            "Livraison matériel",
            "Formation"
        ])
        qte = random.randint(1, 5)
        prix = random.randint(50, 1500)
        total = qte * prix
        lignes.append({"nom": nom, "qte": qte, "prix": prix, "total": total})
    return lignes

def total_facture(lignes):
    ht = sum(l["total"] for l in lignes)
    tva = int(ht * 0.2)
    ttc = ht + tva
    return ht, tva, ttc

# -----------------------
# Scénarios incohérents
# -----------------------
def apply_incoherence(lignes_devis, siret, entreprise_nom, ref_devis):
    lignes_facture = [l.copy() for l in lignes_devis]
    facture_siret = siret
    facture_nom = entreprise_nom
    facture_ref_devis = ref_devis
    incoherence_type = "none"

    incoherence_type = random.choice([
        "ligne_manquante",
        "ligne_modifiee",
        "ligne_en_plus",
        "entreprise_diff",
        "siret_faux",
        "montant_faux",
        "mauvaise_ref",
        "none"
    ])

    if incoherence_type == "ligne_manquante" and len(lignes_facture) > 1:
        lignes_facture.pop()
    elif incoherence_type == "ligne_modifiee":
        lignes_facture[0]["qte"] += 1
        lignes_facture[0]["total"] = lignes_facture[0]["qte"] * lignes_facture[0]["prix"]
    elif incoherence_type == "ligne_en_plus":
        lignes_facture.append(generate_lignes(1)[0])
    elif incoherence_type == "entreprise_diff":
        facture_nom = fake.company()
    elif incoherence_type == "siret_faux":
        facture_siret = str(random.randint(10000000000000, 99999999999999))
    elif incoherence_type == "montant_faux":
        ht_f, tva_f, ttc_f = total_facture(lignes_facture)
        ttc_f += random.randint(50, 500)
        return lignes_facture, facture_siret, facture_nom, facture_ref_devis, ht_f, tva_f, ttc_f, incoherence_type
    elif incoherence_type == "mauvaise_ref":
        facture_ref_devis = f"DV-{random.randint(1000,9999)}"

    ht_f, tva_f, ttc_f = total_facture(lignes_facture)
    return lignes_facture, facture_siret, facture_nom, facture_ref_devis, ht_f, tva_f, ttc_f, incoherence_type

# -----------------------
# KBIS fictif
# -----------------------
def generate_kbis(row):
    date_immatriculation = fake.date_between(start_date="-20y", end_date="today")
    greffe = random.choice([
        "Tribunal de Commerce de Paris",
        "Tribunal de Commerce de Lyon",
        "Tribunal de Commerce de Marseille",
        "Tribunal de Commerce de Lille"
    ])
    dirigeant = fake.name()
    duree = str(random.randint(20,99)) +" ans"

    return {
        "raison_sociale": row["nom"],
        "siret": row["siret"],
        "siren": row["siren"],
        "forme_juridique": row.get("intitule_categorie_juridique", ""),
        "adresse": row["adresse"],
        "ville": row["ville"],
        "code_postal": row["code_postal"],
        "code_naf": row.get("code_naf", ""),
        "intitule_naf": row.get("intitule_naf", ""),
        "date_immatriculation": date_immatriculation.strftime("%d/%m/%Y"),
        "greffe": greffe,
        "dirigeant": dirigeant,
        "duree": duree
    }

# -----------------------
# Export PDF
# -----------------------
def generate_pdf(template_name, row, output_dir, filename):
    template = env.get_template(template_name)
    html_content = template.render(**row)
    safe_name = row.get("entreprise_nom", row.get("raison_sociale", "Entreprise")).replace(" ", "_").replace("/", "_")
    if template_name == "facture.html" or template_name == "devis.html"  :
        file_path = os.path.join(output_dir, f"{filename}_{safe_name}_{row['scenario']}.pdf")
    else:
        file_path = os.path.join(output_dir, f"{filename}_{safe_name}.pdf")
    pdfkit.from_string(html_content, file_path)

# -----------------------
# Main pipeline
# -----------------------
def main():
    df = retrieve_entreprise_data(CSV_FILE)
    dataset = []

    for _, ent in df.iterrows():
        entreprise_nom = ent["nom"]
        siret = ent["siret"]
        siren = ent["siren"]
        adresse = ent["adresse"]
        ville = ent["ville"]
        code_postal = ent["code_postal"]
        categorie_juridique = ent.get("intitule_categorie_juridique", "")

        # Génération KBIS
        kbis_data = generate_kbis(ent)
        generate_pdf("kbis.html", kbis_data, OUTPUT_KBIS, "KBIS")

        for _ in range(3):
            client = generate_client()
            lignes_devis = generate_lignes(random.randint(1,4))
            ht_d, tva_d, ttc_d = total_facture(lignes_devis)
            date_validite, statut = generate_date_validite()
            ref_devis = f"DV-{random.randint(1000,9999)}"
            ref_facture = f"FA-{random.randint(1000,9999)}"
            
            scenario_ok = random.choice([True, False])
            if scenario_ok:
                lignes_facture = lignes_devis
                facture_siret = siret
                facture_nom = entreprise_nom
                facture_ref_devis = ref_devis
                ht_f, tva_f, ttc_f = ht_d, tva_d, ttc_d
                incoherence_type = "none"
            else:
                (lignes_facture, facture_siret, facture_nom, facture_ref_devis,
                 ht_f, tva_f, ttc_f, incoherence_type) = apply_incoherence(
                     lignes_devis, siret, entreprise_nom, ref_devis
                 )
            
            row = {
                "entreprise_nom": entreprise_nom,
                "siret": siret,
                "siren": siren,
                "adresse": adresse,
                "ville": ville,
                "code_postal": code_postal,
                "categorie_juridique": categorie_juridique,
                "client_nom": client["nom"],
                "client_adresse": client["adresse"],
                "client_ville": client["ville"],
                "client_code_postal": client["code_postal"],
                "client_email": client["email"],
                "client_telephone": client["telephone"],
                "ref_devis": ref_devis,
                "devis_lignes": lignes_devis,
                "devis_total_TTC": ttc_d,
                "date_validite": date_validite.strftime("%d/%m/%Y"),
                "ref_facture": ref_facture,
                "facture_lignes": lignes_facture,
                "facture_total_HT": ht_f,
                "facture_total_TTC": ttc_f,
                "facture_ref_devis": facture_ref_devis,
                "facture_siret": facture_siret,
                "facture_nom": facture_nom,
                "date_facture": datetime.today().strftime("%d/%m/%Y"),
                "scenario": "OK" if scenario_ok else "NOT_OK",
                "incoherence_type": incoherence_type,
                "statut": statut
            }

            dataset.append(row)
            # Génération PDF style screenshot
            generate_pdf("facture.html", row, OUTPUT_FACTURES, f"facture_{ref_facture}")
            generate_pdf("devis.html", row, OUTPUT_DEVIS, f"devis_{ref_devis}")

    print("Devis, factures et KBIS générés !")
    return dataset

if __name__ == "__main__":
    dataset = main()