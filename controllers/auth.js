const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const jimp = require("jimp");
const path = require("path");
const fs = require("fs/promises");
const { User } = require("../models/user");
const { ctrlWrapper, HttpError } = require("../helpers");
const dotenv = require("dotenv");
dotenv.config();

const { SECRET_KEY } = process.env;

const tempDir = path.join(__dirname, "../", "temp");
const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        throw HttpError(409, "Email already in use.");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);

    const newUser = await User.create({
        ...req.body,
        password: hashPassword,
        subscription: "starter",
        avatarURL,
    });
    res.status(201).json({
        email: newUser.email,
        subscription: newUser.subscription,
    });
};



const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw  HttpError(401, "Email or password invalid.");
    }
    const passwordCompare = await bcrypt.compare(password, user.password || "");
    if (!passwordCompare) {
        throw HttpError(401, "Email or password invalid.");
    }
    const payload = {
        id: user._id,
    };
  
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

    await User.findByIdAndUpdate(user._id, { token });
    res.json({
        token,
    });
};

const updateSubscription = async (req, res) => {
    const { _id } = req.user;
    const user = await User.findByIdAndUpdate(_id, req.body, { new: true });
    res.json({ subscription: user.subscription });
};

const getCurrent = async (req, res) => {
    const { email } = req.user;

    res.json({
        email,
    })
}

const logout = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.json({
        message:"Loguot succes"
    })
}
    
const updateAvatar = async (req, res) => {
    const {_id} = req.user;
    const { path: tempUpload, originalname } = req.file;
    const filename = `${_id}_${originalname}`;
const resultUpload = path.join(tempDir, filename);
    const resultAvatar = path.join(avatarsDir, filename);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);
    const avatar = await jimp.read(resultUpload);
    avatar.resize(250, 250);
    await avatar.writeAsync(resultAvatar);

    await User.findByIdAndUpdate(_id, { avatarURL });
    
    res.json({
        avatarURL,
    })
}

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    updateSubscription: ctrlWrapper(updateSubscription),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateAvatar:ctrlWrapper(updateAvatar),
};