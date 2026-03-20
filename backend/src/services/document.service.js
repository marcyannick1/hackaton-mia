const Document = require("../models/document.model");
const CuratedDocument = require("../models/curatedDocument.model")
const fs = require("fs").promises;

exports.getAllDocuments = async () => {
    try {
        const documents = await Document.find({})
            .sort({createdAt: -1});

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
        const documents = await Document.find({uploadedBy: userId})
            .sort({createdAt: -1});

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

exports.createDocument = async (fileData, userId, companyId) => {
    try {
        const {filename, originalname, size, id, mimetype} = fileData;

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
            company: companyId,
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
                console.error("Erreur suppression fichier :", err);
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
        let raw;

        if (userRole === "admin") {
            raw = await Document.findById(documentId);
        } else {
            // Un fournisseur ne peut voir que ses propres documents
            raw = await Document.findOne({ _id: documentId, uploadedBy: userId });
        }

        if (!raw) {
            return { error: true, statusCode: 404, message: "Document introuvable" };
        }

        return { error: false, statusCode: 200, data: raw.toObject() };

    } catch (err) {
        return { error: true, statusCode: 500, message: "Erreur serveur", details: err.message };
    }
};

exports.getCuratedByRawId = async (rawDocumentId) => {
    try {
        const curated = await CuratedDocument.findOne({ rawDocumentId });
        return curated || null;
    } catch {
        return null;
    }
};

exports.getDocumentsByCompany = async (companyId) => {
    try {

        const rawDocs = await Document.find({company: companyId})
            .sort({createdAt: -1});

        const docsWithCurated = await Promise.all(
            rawDocs.map(async (raw) => {
                const curated = await CuratedDocument.findOne({rawDocumentId: raw._id});
                return {...raw.toObject(), curatedDocument: curated || null};
            })
        );

        return {
            error: false,
            message: "Documents récupérés avec succès",
            data: docsWithCurated,
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
