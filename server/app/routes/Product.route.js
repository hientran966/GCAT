const express = require("express");
const product = require("../controllers/Product.controller");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

router.route("/")
    .get(product.findAll)
    .post(upload.single("file"), product.create)

router.route("/deactive/:id")
    .put(product.restore)

router.route("/:id")
    .get(product.findOne)
    .put(upload.single("file"), product.update)
    .delete(product.delete);

module.exports = router;