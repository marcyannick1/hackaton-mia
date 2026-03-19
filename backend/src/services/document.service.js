const Document = require("../models/document.model");
const fs = require("fs").promises;

exports.getAllDocuments = async () => {
  try {
    const mongoose = require("mongoose");
    const documents = await Document.find({}).sort({ createdAt: -1 });

    const db = mongoose.connection.db;

    const enrichedDocuments = await Promise.all(
      documents.map(async (doc) => {
        const docObj = doc.toObject();

        const curated = await db.collection("curateddocuments").findOne({
          rawDocumentId: doc._id,
        });

        if (curated) {
          docObj.curatedData = {
            documentType: curated.documentType,
            anomalyCount: curated.validation?.anomalyCount || 0,
            fraudScore: curated.validation?.fraudScore || 0,
          };
        } else {
          docObj.curatedData = null;
        }

        return docObj;
      }),
    );

    return {
      error: false,
      message: "Documents récupérés avec succès",
      data: enrichedDocuments,
      statusCode: 200,
    };
  } catch (error) {
    return {
      error: true,
      message: "Erreur lors de la récupération des documents",
      statusCode: 500,
    };
  }
};

exports.getUserDocuments = async (userId) => {
  try {
    const documents = await Document.find({ uploadedBy: userId }).sort({
      createdAt: -1,
    });

    return {
      error: false,
      message: "Documents récupérés avec succès",
      data: documents,
      statusCode: 200,
    };
  } catch (error) {
    return {
      error: true,
      message: "Erreur lors de la récupération de vos documents",
      statusCode: 500,
    };
  }
};

exports.createDocument = async (fileData, userId) => {
  try {
    // "path" remplacé par "id" (ObjectId GridFS)
    const { filename, originalname, size, id, mimetype } = fileData;

    let fileType = "other";
    if (mimetype === "application/pdf") {
      fileType = "pdf";
    } else if (mimetype.startsWith("image/")) {
      fileType = "image";
    }

    const newDocument = new Document({
      filename,
      originalName: originalname,
      fileSize: size,
      gridfsId: id,
      fileType,
      mimeType: mimetype,
      uploadedBy: userId,
      status: "uploaded",
    });

    const savedDocument = await newDocument.save();

    return {
      error: false,
      message: "Document uploadé avec succès",
      data: savedDocument,
      statusCode: 201,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Erreur lors de la création du document",
      statusCode: 500,
    };
  }
};

exports.deleteDocument = async (documentId, userId, userRole) => {
  try {
    const document = await Document.findById(documentId);

    if (!document) {
      return {
        error: true,
        message: "Document introuvable",
        statusCode: 404,
      };
    }

    if (
      userRole !== "admin" &&
      document.uploadedBy.toString() !== userId.toString()
    ) {
      return {
        error: true,
        message: "Accès refusé",
        statusCode: 403,
      };
    }

    if (document.filePath) {
      try {
        await fs.unlink(document.filePath);
      } catch (err) {
        console.error("Erreur suppression fichier local :", err);
      }
    }

    await Document.findByIdAndDelete(documentId);

    return {
      error: false,
      message: "Document supprimé avec succès",
      statusCode: 200,
    };
  } catch (error) {
    return {
      error: true,
      message: "Erreur serveur lors de la suppression du document",
      details: error.message,
      statusCode: 500,
    };
  }
};

exports.getDocumentById = async (documentId, userId, userRole) => {
  try {
    const document = await Document.findById(documentId);

    if (!document) {
      return {
        error: true,
        message: "Document introuvable",
        statusCode: 404,
      };
    }

    if (
      userRole !== "admin" &&
      document.uploadedBy.toString() !== userId.toString()
    ) {
      return {
        error: true,
        message:
          "Accès refusé. Vous n'êtes pas autorisé à consulter ce document.",
        statusCode: 403,
      };
    }

    return {
      error: false,
      message: "Document récupéré avec succès",
      data: document,
      statusCode: 200,
    };
  } catch (error) {
    return {
      error: true,
      message: "Erreur lors de la récupération du document",
      details: error.message,
      statusCode: 500,
    };
  }
};

exports.getCuratedData = async (documentId, userId, userRole) => {
  try {
    const mongoose = require("mongoose");

    const document = await Document.findById(documentId);
    if (!document) {
      return { error: true, message: "Document introuvable", statusCode: 404 };
    }
    if (
      userRole !== "admin" &&
      document.uploadedBy.toString() !== userId.toString()
    ) {
      return { error: true, message: "Accès refusé", statusCode: 403 };
    }

    const db = mongoose.connection.db;
    const curatedData = await db.collection("curateddocuments").findOne({
      rawDocumentId: new mongoose.Types.ObjectId(documentId),
    });

    if (!curatedData) {
      return {
        error: true,
        message:
          "Données consolidées non encore disponibles (Analyse Airflow en cours)",
        statusCode: 404,
      };
    }

    return {
      error: false,
      message: "Données consolidées récupérées avec succès",
      data: curatedData,
      statusCode: 200,
    };
  } catch (error) {
    return {
      error: true,
      message: "Erreur lors de la récupération des données consolidées",
      details: error.message,
      statusCode: 500,
    };
  }
};

exports.validateDocument = async (documentId, status) => {
  try {
    const mongoose = require("mongoose");
    const validStatuses = ["validated", "rejected"];

    if (!validStatuses.includes(status)) {
      return {
        error: true,
        message: "Statut de validation invalide",
        statusCode: 400,
      };
    }

    const document = await Document.findByIdAndUpdate(
      documentId,
      { status: status },
      { new: true },
    );

    if (!document) {
      return { error: true, message: "Document introuvable", statusCode: 404 };
    }

    const db = mongoose.connection.db;
    await db
      .collection("curateddocuments")
      .updateOne(
        { rawDocumentId: new mongoose.Types.ObjectId(documentId) },
        { $set: { status: status, updatedAt: new Date() } },
      );

    return {
      error: false,
      message: `Document marqué comme ${status} avec succès`,
      data: document,
      statusCode: 200,
    };
  } catch (error) {
    return {
      error: true,
      message: "Erreur lors de la validation du document",
      details: error.message,
      statusCode: 500,
    };
  }
};
