require("dotenv").config();
require("dotenv").config({ path: "../../.env" });

const mongoose = require("mongoose");
const connectDB = require("../../config/database.config");
const User = require("../models/user.model");
const { hashPassword } = require("../utils/password.utils");

const seedAdmin = async () => {
  try {
    await connectDB();
    console.log("Connexion à la base de données réussie.");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@admin.com";
    const adminUsername = process.env.ADMIN_USERNAME || "Admin Hackaton";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin1234";

    const existingAdmin = await User.findOne({
      $or: [
        { email: adminEmail },
        { username: adminUsername },
        { role: "admin" },
      ],
    });

    if (existingAdmin) {
      console.log(
        `Un administrateur existe déjà : ${existingAdmin.email} (Username: ${existingAdmin.username})`,
      );
      process.exit(0);
    }

    console.log(
      "Aucun administrateur trouvé. Création de l'administrateur par défaut...",
    );

    const hashedPassword = await hashPassword(adminPassword);

    const adminUser = new User({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      department: "Direction",
    });

    await adminUser.save();
    console.log(`Administrateur crée avec succès !`);
    console.log(`Email : ${adminEmail}`);
    console.log(`Username : ${adminUsername}`);
    console.log(`Password : ${adminPassword}`);

    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de la création de l'administrateur :", error);
    process.exit(1);
  }
};

seedAdmin();
