const User = require("../models/user.model");
const { hashPassword } = require("../utils/password.utils");
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");

    return res.status(200).json({
      error: false,
      message: "Utilisateurs récupérés avec succès",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Erreur lors de la récupération des utilisateurs",
      details: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id, "-password");

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "Utilisateur non trouvé",
      });
    }

    return res.status(200).json({
      error: false,
      message: "Utilisateur récupéré avec succès",
      data: {
        ...user.toObject(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Erreur lors de la récupération de l'utilisateur",
      details: error.message,
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId, "-password");

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "Utilisateur non trouvé",
      });
    }

    return res.status(200).json({
      error: false,
      message: "Profil récupéré avec succès",
      data: {
        ...user.toObject(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Erreur lors de la récupération du profil",
      details: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "Utilisateur non trouvé",
      });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          error: true,
          message: "Ce nom d'utilisateur est déjà pris",
        });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: true,
          message: "Cette adresse email est déjà utilisée",
        });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.status(200).json({
      error: false,
      message: "Profil mis à jour avec succès",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Erreur lors de la mise à jour du profil",
      details: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        error: true,
        message: "Le nouveau mot de passe est requis",
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    return res.status(200).json({
      error: false,
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Erreur lors du changement de mot de passe",
      details: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        error: true,
        message: "Utilisateur non trouvé",
      });
    }

    return res.status(200).json({
      error: false,
      message: "Compte supprimé avec succès",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Erreur lors de la suppression du compte",
      details: error.message,
    });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        error: true,
        message: "Le paramètre de recherche est requis",
      });
    }

    const users = await User.find(
      {
        $or: [
          { username: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      },
      "-password",
    ).limit(20);

    return res.status(200).json({
      error: false,
      message: "Recherche effectuée avec succès",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Erreur lors de la recherche",
      details: error.message,
    });
  }
};
