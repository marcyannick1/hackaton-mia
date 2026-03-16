const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connexion à la BDD réussie !");
    } catch (error) {
        console.error("Une erreur est survenue lors de la connexion à la BDD :", error);
        process.exit(1);
    }
};

module.exports = connectDB;