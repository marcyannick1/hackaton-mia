const documentService = require("../services/document.service");
const axios = require("axios")

exports.getAllDocuments = async (req, res) => {
    try {
        const result = await documentService.getAllDocuments();

        if (result.error) {
            return res.status(result.statusCode).json({
                error: true,
                message: result.message,
            });
        }

        return res.status(result.statusCode).json({
            error: false,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Erreur lors de la récupération des documents",
            details: error.message,
        });
    }
};

exports.getMyDocuments = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await documentService.getUserDocuments(userId);

        if (result.error) {
            return res.status(result.statusCode).json({
                error: true,
                message: result.message,
            });
        }

        return res.status(result.statusCode).json({
            error: false,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Erreur lors de la récupération de vos documents",
            details: error.message,
        });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: true,
                message: "Aucun fichier n'a été fourni",
            });
        }

        const userId = req.user.userId;

        const result = await documentService.createDocument(
            req.file,
            userId
        );

        if (result.error) {
            return res.status(result.statusCode).json({
                error: true,
                message: result.message,
            });
        }


        // Envoi a apache airflow
        const documentId = result.data._id.toString();

        try {
            await axios.post(
                "http://airflow:8080/api/v1/dags/document_pipeline/dagRuns",
                {
                    conf: {document_id: documentId}
                },
                {
                    auth: {
                        username: "admin",
                        password: "admin"
                    }
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
        } catch (err) {
            console.error("Airflow trigger error:", err.message);
        }

        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Erreur lors de l'upload du document",
            details: error.message,
        });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const result = await documentService.deleteDocument(id, userId, userRole);

        if (result.error) {
            return res.status(result.statusCode).json({
                error: true,
                message: result.message,
            });
        }

        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Erreur serveur lors de la suppression du document",
            details: error.message,
        });
    }
};

exports.getDocumentById = async (req, res) => {
    try {
        const documentId = req.params.id;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const result = await documentService.getDocumentById(
            documentId,
            userId,
            userRole,
        );

        return res.status(result.statusCode).json(result);
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Erreur serveur lors de la récupération du document",
            details: error.message,
        });
    }
};
