const Document = require("../models/document.model");
const Extraction = require("../models/extraction.model");

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
