const Document = require("../models/document.model");
const Extraction = require("../models/extraction.model");

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

    // Création de l'instance Document
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

    // Création de l'entrée Extraction vide liée au Document
    const newExtraction = new Extraction({
      document: savedDocument._id,
      documentType: savedDocument.documentType,
      status: "pending",
    });

    const savedExtraction = await newExtraction.save();

    // Lier l'extraction au document
    savedDocument.extractedData = savedExtraction._id;
    await savedDocument.save();

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
