const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    originalName: String,
    fileSize: Number,
    gridfsId: {type: mongoose.Schema.Types.ObjectId, required: true},
    fileType: {
        type: String,
        enum: ["pdf", "image", "other"],
        required: true,
    },
    mimeType: String,

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: false,
    },

    status: {
        type: String,
        enum: ["uploaded", "processing", "failed"],
        default: "uploaded",
    },

    errors: [String],

}, {timestamps: true})

module.exports = mongoose.model("RawDocument", documentSchema);
