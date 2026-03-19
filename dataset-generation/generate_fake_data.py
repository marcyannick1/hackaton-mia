import pandas as pd
from faker import Faker
import random
from datetime import datetime, timedelta
import os
from jinja2 import Environment, FileSystemLoader
import imgkit
import io
from PIL import Image, ImageFilter

# Config
fake = Faker("fr_FR")
TEMPLATE_DIR = "./dataset-generation/templates"
OUTPUT_FACTURES = "./data/output/factures"
OUTPUT_DEVIS = "./data/output/devis"
OUTPUT_KBIS = "./data/output/kbis"
OUTPUT_RIB = "./data/output/rib"
OUTPUT_ATTESTATION_SIRET = "./data/output/attestation_siret"
OUTPUT_ATTESTATION_URSSAF = "./data/output/attestation_urssaf"

os.makedirs(OUTPUT_FACTURES, exist_ok=True)
os.makedirs(OUTPUT_DEVIS, exist_ok=True)
os.makedirs(OUTPUT_KBIS, exist_ok=True)
os.makedirs(OUTPUT_RIB, exist_ok=True)
os.makedirs(OUTPUT_ATTESTATION_SIRET, exist_ok=True)
os.makedirs(OUTPUT_ATTESTATION_URSSAF, exist_ok=True)

os.makedirs("./data/cas_usage/kbis", exist_ok=True)
os.makedirs("./data/cas_usage/rib", exist_ok=True)
os.makedirs("./data/cas_usage/attestation_siret", exist_ok=True)
os.makedirs("./data/cas_usage/attestation_urssaf", exist_ok=True)
os.makedirs("./data/cas_usage/devis", exist_ok=True)
os.makedirs("./data/cas_usage/factures", exist_ok=True)

env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
CSV_FILE = "./dataset-generation/entreprisesv2.csv"
CSV_FILE_SCENARIO ="./dataset-generation/entreprises_cas_usage.csv"

# Lecture entreprises
def retrieve_entreprise_data(file_path):
    return pd.read_csv(file_path, index_col=False)


# Faker clients
def generate_client():
    return {
        "nom": fake.name(),
        "adresse": fake.street_address(),
        "ville": fake.city(),
        "code_postal": fake.postcode(),
        "email": fake.email(),
        "telephone": fake.phone_number()
    }

# Faker generate company
def generate_company(name,code_naf,intitule,categorie_juridique):
    fake_siren = fake.siren().replace(" ", "")
    fake_siret = fake_siren+str(random.randint(10000, 99999))
    cle_tva = (12 + 3 * (int(fake_siren) % 97)) % 97
    num_tva = "FR"+ str(cle_tva) + fake_siren
    return{
        "nom" : name,
        "adresse": fake.street_address(),
        "ville": fake.city(),
        "code_postal":fake.postcode(),
        "email":"administration@"+name+".com",
        "telephone": fake.phone_number(),
        "siren" : fake_siren,
        "siret" : fake_siret,
        "date_creation": fake.date(),
        "code_naf" : code_naf,
        "intitule_naf": intitule,
        "intitule_categorie_juridique" : categorie_juridique,
        "num_tva": num_tva
    }
def generate_date_validite():
    today = datetime.today()
    if random.choice([True, False]):
        return today + timedelta(days=random.randint(30, 365)), "valide"
    else:
        return today - timedelta(days=random.randint(30, 365)), "invalide"

# Faker créer lignes factures et devis
def generate_lignes(n,description):
    lignes = []
    for _ in range(n):
        nom = random.choice(description)
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


# Scénarios incohérents
def apply_incoherence(lignes_devis, siret, entreprise_nom, ref_devis,description):
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
        lignes_facture.append(generate_lignes(1,description)[0])
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


# KBIS fictif
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

def generate_ban(row):
    banques = [
    "BNP Paribas",
    "Société Générale",
    "Crédit Agricole",
    "Crédit Mutuel",
    "Banque Populaire",
    "Caisse d'Épargne",
    "La Banque Postale",
    "HSBC France",
    "Boursorama Banque",
    "LCL"
    ]
    bics = [
    "BNPAFRPP",  # BNP Paribas
    "SOGEFRPP",  # Société Générale
    "AGRIFRPP",  # Crédit Agricole
    "CMCIFR2A",  # Crédit Mutuel
    "CCBPFRPP",  # Banque Populaire
    "CEPAFRPP",  # Caisse d'Épargne
    "PSSTFRPP",  # La Banque Postale
    "CCFRFRPP",  # HSBC France
    "BOUSFRPP",  # Boursorama Banque
    "CRLYFRPP"   # LCL
    ]

    index = random.randint(0, len(banques) - 1)

    base_company = row["nom"].lower().replace(" ", "").replace("'", "")
    clean_name = fake.name().lower().replace(" ","")
    email = clean_name +"@"+base_company+".com"
    return{
        "entreprise_nom" : row["nom"],
        "bank" : banques[index],
        "iban" : fake.iban(),
        "bic" : bics[index],
        "siren" : row["siren"],
        "siret" : row["siret"],
        "num_tva" : row["num_tva"],
        "telephone_entreprise" : fake.phone_number(),
        "email_entreprise" : email,
        "code_naf" : row["code_naf"]
    }

def generate_attestation_siret(row):

    today = datetime.today()
    # On choisit un nombre de jours aléatoire dans le passé (0 à 3 ans)
    random_date_debut = random.randint(0, 3 * 365)
    date_debut = today - timedelta(days=random_date_debut)
    # Date de fin = + 1 an
    date_fin = date_debut + timedelta(days=365)
    
    return {
        "entreprise_nom" : row["nom"],
        "forme_juridique" : row["intitule_categorie_juridique"],
        "date_creation" : row["date_creation"],
        "siren" : row["siren"],
        "siret" : row["siret"],
        "code_ape" : row["code_naf"],
        "activite" :row["intitule_naf"],
        "date_debut" : date_debut.strftime("%d/%m/%Y"),
        "date_fin" : date_fin.strftime("%d/%m/%Y"),
        "num_attestation" : str(random.randint(10000000000000, 99999999999999))
    }

def generate_attestation_urssaf(row):
    today = datetime.today()
    # On choisit un nombre de jours aléatoire dans le passé (0 à 3 ans)
    random_date_debut = random.randint(0, 3 * 365)
    date_debut = today - timedelta(days=random_date_debut)
    # Date de fin = + 6 mois
    date_fin = date_debut + timedelta(days=182)
    return {
    "entreprise_nom" : row["nom"],
    "forme_juridique" : row["intitule_categorie_juridique"],
    "siren" : row["siren"],
    "siret" : row["siret"],
    "adresse": row["adresse"],
    "reference_attestation" :str(random.randint(10000000000000, 99999999999999)),
    "date_debut" : date_debut.strftime("%d/%m/%Y"),
    "date_fin" : date_fin.strftime("%d/%m/%Y"),
    }

# -----------------------
# Export files
# -----------------------
def generate_files(template_name, row, output_dir, filename):
    template = env.get_template(template_name)
    html_content = template.render(**row)
    safe_name = row.get("entreprise_nom", row.get("raison_sociale", "Entreprise")).replace(" ", "_").replace("/", "_")
    if template_name == "facture.html" or template_name == "devis.html"  :
        file_path = os.path.join(output_dir, f"{filename}_{safe_name}_{row['scenario']}.pdf")
        img_path = os.path.join(output_dir,f"{filename}_{safe_name}_{row['scenario']}.png")
    else:
        file_path = os.path.join(output_dir, f"{filename}_{safe_name}.pdf")
        img_path = os.path.join(output_dir, f"{filename}_{safe_name}.png")

    # 1. HTML → PNG
    imgkit.from_string(html_content, img_path)

    #Appliquer effet ou non + export PDF
    apply_scan_effects(
        input_img_path=img_path,
        output_img_path=img_path,
        output_pdf_path=file_path
    )


# -----------------------
# Effets image
# -----------------------

def apply_rotation(img, max_angle=2):
    angle = random.uniform(-max_angle, max_angle)
    return img.rotate(angle, expand=True, fillcolor="white")


def apply_blur(img, blur_radius=None):
    if blur_radius is None:
        blur_radius = random.uniform(1.5, 2.5)
    return img.filter(ImageFilter.GaussianBlur(radius=blur_radius))


def apply_low_quality(img, quality=None):
    if quality is None:
        quality = random.randint(15, 20)

    buffer = io.BytesIO()
    img.save(buffer, format="PNG", quality=quality, optimize=False)
    buffer.seek(0)
    return Image.open(buffer).convert("RGB")


def apply_smartphone(img):
    w, h = img.size
    angle = random.uniform(-1.2, 1.2)
    img = img.rotate(angle, expand=True, fillcolor="white")
    new_w, new_h = img.size
    crop_x = int(new_w * random.uniform(0.005, 0.02))
    crop_y = int(new_h * random.uniform(0.005, 0.02))
    img = img.crop((
        crop_x,
        crop_y,
        new_w - crop_x,
        new_h - crop_y
    ))
    img = img.resize((w, h))
    return img

def apply_scan_effects(input_img_path,output_img_path,output_pdf_path):
    img = Image.open(input_img_path).convert("RGB")

    # Applique effet ou non
    if random.randint(0,1) < 1:
        img.save(output_img_path)
        img.convert("RGB").save(output_pdf_path, "PDF", resolution=150.0)
        return

    # Choix de deux effets
    effects = ["rotation", "blur", "low_quality", "smartphone"]
    selected_effects = random.sample(effects, k=random.randint(1, 2))

    # Appliquer effets
    for effect in selected_effects:
        if effect == "rotation":
            img = apply_rotation(img)

        elif effect == "blur":
            img = apply_blur(img)

        elif effect == "low_quality":
            img = apply_low_quality(img)

        elif effect == "smartphone":
            img = apply_smartphone(img)

    img.save(output_img_path)
    img.convert("RGB").save(output_pdf_path, "PDF", resolution=150.0)

    return 

# -----------------------
# Main pipeline
# -----------------------
def create_generic_documents():
    df = retrieve_entreprise_data(CSV_FILE)
    dataset = []
    details_facture = [
            "Fournitures de bureau",
            "Matériel informatique (accessoires)",
            "Equipement professionnel",
            "Livraison matériel",
            "Formation"
        ]
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
        generate_files("kbis.html", kbis_data, OUTPUT_KBIS, "KBIS")
        rib_data = generate_ban(ent)
        generate_files("rib.html",rib_data,OUTPUT_RIB,"RIB")
        attestation_siret = generate_attestation_siret(ent)
        generate_files("attestation_siret.html",attestation_siret,OUTPUT_ATTESTATION_SIRET,"AS")
        attestation_urssaf = generate_attestation_urssaf(ent)
        generate_files("attestation_urssaf.html",attestation_urssaf,OUTPUT_ATTESTATION_URSSAF,"AU")

    
        for _ in range(3):
            client = generate_client()
            lignes_devis = generate_lignes(random.randint(1,4),details_facture)
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
                     lignes_devis, siret, entreprise_nom, ref_devis,details_facture
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
            generate_files("devis.html", row, OUTPUT_DEVIS, f"devis_{ref_devis}")
            generate_files("facture.html", row, OUTPUT_FACTURES, f"facture_{ref_facture}")
            

    print("Devis, factures et KBIS générés !")
    
    return dataset


def create_scenario(details_facture):
    df = retrieve_entreprise_data(CSV_FILE_SCENARIO)
    
    dataset = []
    pme_company = generate_company("PMEConstruction","4120A","Construction générale","SAS, société par actions simplifiée")
    kbis_data = generate_kbis(pme_company)
    generate_files("kbis.html", kbis_data, "./data/cas_usage/kbis", "KBIS")
    
    rib_data = generate_ban(pme_company)
    generate_files("rib.html",rib_data,"./data/cas_usage/rib","RIB")
    attestation_siret = generate_attestation_siret(pme_company)
    generate_files("attestation_siret.html",attestation_siret,"./data/cas_usage/attestation_siret","AS")
    attestation_urssaf = generate_attestation_urssaf(pme_company)
    generate_files("attestation_urssaf.html",attestation_urssaf,"./data/cas_usage/attestation_urssaf","AU")
    

    for _, ent in df.iterrows():
        entreprise_nom = ent["enseigne"]
        siret = ent["siret"]
        siren = ent["siren"]
        adresse = ent["adresse"]
        ville = ent["ville"]
        code_postal = ent["code_postal"]
        categorie_juridique = ent.get("intitule_categorie_juridique", "")

        for _ in range(5):
            client = pme_company
            lignes_devis = generate_lignes(random.randint(1,4),details_facture[entreprise_nom])
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
                     lignes_devis, siret, entreprise_nom, ref_devis,details_facture[entreprise_nom]
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
            generate_files("devis.html", row, "./data/cas_usage/devis", f"devis_{ref_devis}")
            generate_facture = random.choice([True, False])
            if generate_facture:
                generate_files("facture.html", row, "./data/cas_usage/factures", f"facture_{ref_facture}")
         
    return

if __name__ == "__main__":
    #dataset = create_generic_documents()
    dict_details = {
    "Saint-Gobain": [
        "Fourniture de ciment Portland 25kg",
        "Plaques de plâtre BA13",
        "Isolation laine de verre",
        "Mortier prêt à l’emploi",
        "Panneaux isolants thermiques"
    ],
    "EDF": [
        "Abonnement électricité mensuel",
        "Consommation électrique (kWh)",
        "Contribution service public électricité (CSPE)",
        "Taxe sur la consommation finale d’électricité",
        "Frais de gestion et acheminement"
    ],
    "OVHCloud": [
        "Hébergement web mutualisé",
        "Serveur cloud VPS",
        "Stockage cloud (100 Go)",
        "Nom de domaine annuel",
        "Sauvegarde automatique"
    ]
    }
    create_scenario(dict_details)