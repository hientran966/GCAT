const express = require("express");
const assign = require("../controllers/Assign.controller");

const router = express.Router();

router.route("/")
    .get(assign.findAll)
    .post(assign.create)

router.route("/deactive/:id")
    .put(assign.restore)

router.route("/:id")
    .get(assign.findOne)
    .put(assign.update)
    .delete(assign.delete);

module.exports = router;