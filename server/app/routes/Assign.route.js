const express = require("express");
const assign = require("../controllers/Assign.controller");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

router.route("/")
    .get(assign.findAll)
    .post(upload.none(), assign.create)

router.route("/deactive/:id")
    .put(assign.restore)

router.route("/:id")
    .get(assign.findOne)
    .put(upload.none(), assign.update)
    .delete(assign.delete);

module.exports = router;