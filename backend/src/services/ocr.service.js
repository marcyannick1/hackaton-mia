const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || "http://ocr:8000/ocr";

exports.processDocument = async (filePath) => {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath));

    const response = await axios.post(OCR_SERVICE_URL, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    return {
      error: false,
      data: response.data,
    };
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API OCR :", error.message);
    return {
      error: true,
      message: error.message,
      details: error.response?.data || null,
    };
  }
};
