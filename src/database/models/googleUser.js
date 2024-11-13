const { mainDB } = require("../mongo");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const googleUserSchema = new mongoose.Schema({
    unique_id: {
        type: String,
        unique: true,
        trim: true
    },
    google_id: {
        type: String,
        unique: [true, "An account with this Google ID already exists."],
        trim: true
    },
    link_session_id: {
        type: Array,
    },
    profilePicture: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        unique: [true, "An account with this email already exists."],
    },
    role: {
        type: String,
        enum: ["normal", "admin"],
        required: [true, "Please specify user role"],
        default: "normal"
    },
    username: {
        type: String,
        maxlength: [20, "Username must be less than 20 characters"],
        required: [true, "Please specify a username"],
    },
    creationIp: {
        type: String,
    },
    LastModification: {
        type: Date,
        default: Date.now
    },
    LastModificationIp: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    accountType: {
        type: String,
        default: "google"
    }
});

googleUserSchema.pre("save", function (next) {
    const user = this;

    user.unique_id = crypto.randomUUID();
    user.LastModificationIp = user.creationIp;

    return next();
});

googleUserSchema.statics.emailExists = async function (email) {
    try {
        const found = await this.findOne({ email: email });
        return !!found;
    } catch (err) {
        console.error(err);
        return true;
    }
};

const GoogleUser = mainDB.model("GoogleUser", googleUserSchema);

module.exports = GoogleUser;