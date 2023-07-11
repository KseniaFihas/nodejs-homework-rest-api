const express = require("express");

const ctrl = require("../../controllers/auth");
const { validateBody, authenticate } = require("../../middlewars");
const { schemas } = require("../../models/user");


const router = express.Router();


//singup
router.post("/register", validateBody(schemas.registerSchema), ctrl.register);
//signin
router.post("/login", validateBody(schemas.loginSchema), ctrl.login);
router.get("/current", authenticate, ctrl.getCurrent);
router.post("/logout", authenticate, ctrl.logout);
router.patch('/', authenticate, validateBody(schemas.subscriptionSchema), ctrl.updateSubscription);
module.exports = router;