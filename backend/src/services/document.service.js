const Document = require("../models/document.model");
const Extraction = require("../models/extraction.model");
const fs = require("fs").promises;

exports.getAllDocuments = async () => {
  try {
    const documents = await Document.find({})
      .populate("extractedData")
      .sort({ createdAt: -1 });

    return {
      error: false,
      message: "Documents récupérés avec succès",
      data: documents,
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
    const documents = await Document.find({ uploadedBy: userId })
      .populate("extractedData")
      .sort({ createdAt: -1 });

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

exports.createDocument = async (fileData, metadata, userId) => {
  try {
    const { filename, originalname, size, path, mimetype } = fileData;
    const { documentType, company } = metadata;

    let fileType = "other";
    if (mimetype === "application/pdf") {
      fileType = "pdf";
    } else if (mimetype.startsWith("image/")) {
      fileType = "image";
    }

    const newDocument = new Document({
      filename: filename,
      originalName: originalname,
      fileSize: size,
      filePath: path,
      fileType: fileType,
      mimeType: mimetype,
      documentType: documentType || "other",
      company: company || null,
      uploadedBy: userId,
      status: "uploaded",
      storageZone: "raw",
    });

    const savedDocument = await newDocument.save();

    const newExtraction = new Extraction({
      document: savedDocument._id,
      documentType: savedDocument.documentType,
      status: "pending",
    });

    const savedExtraction = await newExtraction.save();

    savedDocument.extractedData = savedExtraction._id;
    await savedDocument.save();

    if (company) {
      const Company = require("../models/company.model");
      await Company.findByIdAndUpdate(company, {
        $push: { documents: savedDocument._id },
      });
    }

    return {
      error: false,
      message: "Document uploadé avec succès",
      data: {
        document: savedDocument,
        extractionId: savedExtraction._id,
      },
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
        message:
          "Accès refusé. Vous n'êtes pas autorisé à supprimer ce document.",
        statusCode: 403,
      };
    }

    if (document.filePath) {
      try {
        await fs.unlink(document.filePath);
      } catch (err) {
        console.error(
          "Erreur lors de la suppression du fichier physique :",
          err,
        );
      }
    }

    if (document.extractedData) {
      await Extraction.findByIdAndDelete(document.extractedData);
    }

    if (document.company) {
      const Company = require("../models/company.model");
      await Company.findByIdAndUpdate(document.company, {
        $pull: { documents: documentId },
      });
    }

    await Document.findByIdAndDelete(documentId);

    return {
      error: false,
      message: "Document supprimé de manière propre avec succès",
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
