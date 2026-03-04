const express = require("express");
const report = require("../controllers/Report.controller");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

router.route("/")
    .get(report.findAll)
    .post(upload.none(), report.create)

router.route("/deactive/:id")
    .put(report.restore)

router.route("/:id")
    .get(report.findOne)
    .put(upload.none(), report.update)
    .delete(report.delete);

module.exports = router;