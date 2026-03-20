const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
            required: [true, "Email is required"],
            maxlength: 100,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ["admin", "fournisseur"],
            default: "fournisseur",
        },
        department: {
            type: String,
            default: "General",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: false,
        },
    },
    {
        timestamps: true,
    },
);

userSchema.index({email: 1});

const User = mongoose.model("User", userSchema);

module.exports = User;
