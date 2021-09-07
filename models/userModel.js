const mongoose = require('mongoose');
const validator = require('validator');
const bc = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./taskModel.js');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        trim: true,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error("Age cannot be negative");
            }
        }
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Not a valid email address");
            }
        }
    },
    password: {
        type: String,
        trim: true,
        validate(value) {
            if (value.length < 8) {
                throw new Error("Password must be at least 8 characters");
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// Method for userSchema
userSchema.methods.toJSON = function() {
    let user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
}

userSchema.methods.getAuthenticationToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });

    return token;
}

// Static function for userSchema
userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new Error('Could not find the user');
    }

    const isMatch = await bc.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Unable to login");
    }
    return user;
}

// Hashing the password before saving
userSchema.pre('save', async function(next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bc.hash(user.password, 8);
    }
    next();
})

// Removing all the tasks of the user being removed
userSchema.pre('remove', async function(next) {
    const user = this

    await Task.deleteMany({ owner: user._id });

    next();
})


const User = mongoose.model('user', userSchema)


module.exports = User;