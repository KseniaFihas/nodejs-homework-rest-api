const express = require('express');
const {schemas}=require("../../models/contact")
const router = express.Router();
const ctrl = require("../../controllers/contacts");
const{validateBody, authenticate, isValidId}=require("../../middlewars")

router.get('/', authenticate, ctrl.getAll);
router.get("/:id", authenticate, isValidId, ctrl.getContactById);
router.post('/', authenticate, validateBody(schemas.addSchema), ctrl.addContacts);
router.patch('/:id/favorite', authenticate, isValidId, validateBody(schemas.updateFavoriteSchema), ctrl.updateFavorite);
router.delete("/:id", authenticate, ctrl.deleteContacts);
router.put("/:id", authenticate, isValidId, validateBody(schemas.updateSchema), ctrl.changeContacts);
module.exports = router;