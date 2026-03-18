const Document = require("../models/document.model");
const Extraction = require("../models/extraction.model");
const ocrService = require("./ocr.service");
const fs = require("fs").promises;
const { parseAmount, parseDate } = require("../utils/formatter.utils");

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

    //OCR
    try {
      savedDocument.status = "processing";
      await savedDocument.save();

      const ocrResult = await ocrService.processDocument(
        savedDocument.filePath,
      );

      if (!ocrResult.error && ocrResult.data) {
        const { type, full_text, extracted } = ocrResult.data;

        savedDocument.ocrText = full_text || "";

        const typeMapping = {
          facture: "invoice",
          devis: "quote",
          attestation_siret: "attestation_siret",
          urssaf_vigilance: "attestation_urssaf",
          kbis: "kbis",
          rib: "rib",
        };

        if (type && typeMapping[type.toLowerCase()]) {
          savedDocument.documentType = typeMapping[type.toLowerCase()];
          savedExtraction.documentType = typeMapping[type.toLowerCase()];
        }

        savedDocument.status = "completed";
        await savedDocument.save();

        if (extracted) {
          savedExtraction.extractedData = {
            siret: extracted.siret || null,
            tva: extracted.tva || null,
          };

          const docType = savedDocument.documentType;

          if (docType === "invoice" || docType === "quote") {
            savedExtraction.invoiceData = {
              amount: {
                ht: parseAmount(extracted.montant_ht),
                ttc: parseAmount(extracted.montant_ttc),
              },
              issueDate: parseDate(
                extracted.date_emission || extracted.validite,
              ),
              dueDate: parseDate(extracted.date_expiration),
            };
          } else if (
            docType === "attestation_siret" ||
            docType === "attestation_urssaf" ||
            docType === "kbis"
          ) {
            let attType = "unknown";
            if (docType === "attestation_siret") attType = "siret";
            if (docType === "attestation_urssaf") attType = "urssaf";
            if (docType === "kbis") attType = "kbis";

            savedExtraction.attestationData = {
              attestationType: attType !== "unknown" ? attType : undefined,
              issuer:
                extracted.denomination || extracted.forme_juridique || null,
              issueDate: parseDate(
                extracted.date_delivrance || extracted.date_vigilance,
              ),
              expiryDate: parseDate(extracted.date_fin_validite),
              status: extracted.situation === "RÉGULIÈRE" ? "valid" : "unknown",
            };
          } else if (docType === "rib") {
            savedExtraction.ribData = {
              iban: extracted.iban || null,
              bic: extracted.bic || null,
              accountHolder: extracted.titulaire || null,
              bankName: extracted.domiciliation || null,
            };
          }

          savedExtraction.status = "in_review";
          await savedExtraction.save();
        }
      } else {
        savedDocument.status = "failed";
        savedDocument.errors.push(
          "Échec de l'extraction OCR : " + ocrResult.message,
        );
        await savedDocument.save();

        savedExtraction.status = "rejected";
        await savedExtraction.save();
      }
    } catch (ocrError) {
      console.error("Erreur inattendue pendant le traitement OCR:", ocrError);
      savedDocument.status = "failed";
      savedDocument.errors.push("Crash inattendu du processus OCR");
      await savedDocument.save();
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
