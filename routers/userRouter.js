const express = require('express');
const User = require('../models/userModel.js');
const auth = require('../src/middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendLeaveEmail } = require('../emails/account.js')

const router = new express.Router();

router.get('/user/:id', async(req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.send(user);
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: "An error occured" });
    }
})

router.get('/users', async(req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (err) {
        console.log(err);
        res.send({ error: "Error occured" });
    }
})

router.post('/login', auth, async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.getAuthenticationToken();
        res.send({ user, token });
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: "Error occured" });
    }
})

router.post('/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (err) {
        res.status(400).send();
    }
})

router.post('/signup', async(req, res) => {
    const user = new User(req.body);
    try {
        user.save();
        const token = await user.getAuthenticationToken();
        sendWelcomeEmail(user.email, user.name);
        res.send({ user, token });
    } catch (err) {
        res.status(400).send({ error: "Error occured while saving user to database" });
    }
})

router.patch('/user/me', auth, async(req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, req.body, { runValidators: true });
        res.send(req.user);
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: "Something went wrong" });
    }
})

router.delete('/user/me', auth, async(req, res) => {
    try {
        await req.user.remove();
        sendLeaveEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: "Error while deleting user" });
    }
})


const uploadAvatar = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Invalid file extension. Please upload .png, .jpg or .jpeg file'));
        }
        cb(undefined, true);
    }
})


router.post('/user/me/avatar', auth, uploadAvatar.single('avatar'), async(req, res) => {
    const imageBuffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();

    req.user.avatar = imageBuffer;
    await req.user.save();
    res.send({ msg: "Uploaded successfully" });
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
})

router.delete('/user/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

const uploadFile = multer({
    dest: 'files',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(doc|docx)$/)) {
            return cb(new Error('Invalid file type. Please upload Word Document'));
        }
        cb(undefined, true);
    }
})

router.post('/upload', uploadFile.single('upload'), (req, res) => {
    res.send("File uploaded successfully");
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/user/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);
    } catch (err) {
        res.status(400).send();
    }
})

module.exports = router;