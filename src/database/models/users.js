const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

userSchema = new Schema( {
	unique_id: {
        type: String,
        unique: true,
        trim: true
    },
    link_session_id: {
        type: String,
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
          message: '{VALUE} is not a valid email!'
        },
    },
    role: {
        type: String,
        enum: ["normal", "admin"],
        required: [true, "Please specify user role"]
    },
    username: {
        type: String,
        unique: [true, "an account already exist on this username!"],
        maxlength: [100, "username can't be more than 100 characters"],
        required: [true, "username is required"],
    },
//    phonenumber: {
//        type: String,
//        required: 'Your phone number is required',
//    },
//    adress: {
//        type: String,
//        required: 'Your adress is required',
//    },
    password: {
        type: String,
        required: 'Your password is required',
        max: 100
    },
    oldPassword: {
        type: String,
        max: 100,
        default: ""

    },
//    firstName: {
//        type: String,
//        required: 'First Name is required',
//        max: 100
//    },
//    lastName: {
//        type: String,
//        required: 'Last Name is required',
//        max: 100
//    },
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
	}
}),

userSchema.pre('save',  function(next) {
    const user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateJWT = function() {
    return jwt.sign({
        email: this.email,
        username: this.username,
        role: this.role
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

userSchema.statics.emailExists = async function(email) {
    try {
        const user = await this.findOne({ email: email });
        return user ? true : false;
    } catch (err) {
        console.error("Error checking if user exists: ", err);
        return true;
    }
};

userSchema.statics.usernameExists = async function(username) {
    try {
        const user = await this.findOne({ username: username });
        console.log("username is already taken");   
        return user ? true : false;
    } catch (err) {
        console.error("Error checking if user exists: ", err);
       return true;
    }
};

User = mongoose.model('User', userSchema);

module.exports = User;