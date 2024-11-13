const { mainDB } = require("../mongo");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    unique_id: {
        type: String,
        unique: true,
        trim: true
    },
    link_session_id: {
        type: Array,
    },
    email: {
        type: String,
        unique: [true, "an account already exist on this email!"],
        lowercase: true,
        trim: true,
        required: [true, "email is required"],
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: "{VALUE} is not a valid email!"
        },
    },
    role: {
        type: String,
        enum: ["normal", "admin"],
        required: [true, "Please specify user role"],
        default: "normal"
    },
    username: {
        type: String,
        unique: [true, "an account already exist on this username!"],
        maxlength: [100, "username can't be more than 100 characters"],
        required: [true, "username is required"],
    },
    profilePicture: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: "Your password is required",
        validate: {
            validator: function (v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(v);
            },
            message: "Password must contain at least 8 characters, including uppercase, lowercase letters and numbers"
        },
        max: 100
    },
    oldPassword: {
        type: String,
        max: 100,
        default: ""

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
        default: "default"
    }
})

userSchema.pre("save", function (next) {
    const user = this;

    user.unique_id = crypto.randomUUID();
    user.LastModificationIp = user.creationIp;

    if (!user.isModified("password")) return next();

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateJWT = function () {
    return jwt.sign({
        email: this.email,
        username: this.username,
        role: this.role
    }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

userSchema.statics.emailExists = async function (email) {
    try {
        const found = await this.findOne({ email: email });
        return !!found;
    } catch (err) {
        console.error(err);
        return true;
    }
};

userSchema.statics.usernameExists = async function (username) {
    try {
        return !!(await this.findOne({ username: username }));
    } catch (err) {
        console.error(err);
        return true;
    }
};

const User = mainDB.model("User", userSchema);

module.exports = User;