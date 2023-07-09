const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const { ctrlWrapper, HttpError } = require("../helpers");
const dotenv = require("dotenv");
dotenv.config();

const { SECRET_KEY } = process.env;

const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        throw HttpError(409, "Email already in use.");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        ...req.body,
        password: hashPassword,
        subscription: "starter",
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
    


module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    updateSubscription: ctrlWrapper(updateSubscription),
    getCurrent: ctrlWrapper(getCurrent),
    logout:ctrlWrapper(logout),
};