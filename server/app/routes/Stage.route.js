const express = require("express");
const stage = require("../controllers/Stage.controller");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

router.route("/")
    .get(stage.findAll)
    .post(upload.single("file"), stage.create)

router.route("/deactive/:id")
    .put(stage.restore)

router.route("/:id")
    .get(stage.findOne)
    .put(upload.single("file"), stage.update)
    .delete(stage.delete);

module.exports = router;