const {generateJWT} = require("../utils/jwt.utils");
const {hashPassword, comparePassword} = require("../utils/password.utils");
const User = require("../models/user.model");

// const users = [];

exports.SignUp = async (data) => {
    try {
        const {name, email, password, company} = data;

        const isExists = await User.findOne({email});

        if (isExists) {
            return {
                error: true,
                message: "Un utilisateur existe déjà avec ces informations.",
                statusCode: 400,
            };
        }

        const hashedPassword = await hashPassword(password);

        const newUserData = {
            // id: !users.length ? 1 : users[users.length - 1].id + 1,
            name,
            email,
            password: hashedPassword,
            company,
        };

        // users.push(user);
        const newUser = new User(newUserData);
        await newUser.save();

        return {
            error: false,
            message: "Utilisateur créé avec succès.",
            data: newUser,
            statusCode: 201,
        };
    } catch (error) {
        return {
            error: true,
            message: error.message || "Erreur lors de la création de l'utilisateur",
            statusCode: 500,
        };
    }
};

exports.SignIn = async (data) => {
    try {
        const {email, password} = data;

        const user = await User.findOne({email}).select("+password");

        if (!user) {
            return {
                error: true,
                message: "Identifiants invalide.",
                statusCode: 401,
            };
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return {
                error: true,
                message: "Identifiants invalide.",
                statusCode: 401,
            };
        }

        const token = await generateJWT({
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        });

        await User.updateOne({_id: user._id}, {lastLogin: new Date()});

        return {
            error: false,
            message: "Vous êtes désormais connecté.",
            data: {token},
            statusCode: 200,
        };
    } catch (error) {
        return {
            error: true,
            message: error,
            statusCode: 500,
        };
    }
};

exports.GetMe = async (userId) => {
    try {
        const user = await User.findById(userId).select("-__v");

        if (!user) {
            return {
                error: true,
                message: "Utilisateur introuvable.",
                statusCode: 404,
            };
        }

        return {
            error: false,
            message: "Profil récupéré avec succès.",
            data: user,
            statusCode: 200,
        };
    } catch (error) {
        return {
            error: true,
            message: error.message || "Erreur serveur.",
            statusCode: 500,
        };
    }
};
