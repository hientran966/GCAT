const express = require("express");
const auth = require("../controllers/Account.controller");

const router = express.Router();

router.route("/")
    .get(auth.findAll)
    .post(auth.create)

router.route("/deactive/:id")
    .put(auth.restore)

router.route("/login")
    .post(auth.login);

router.route("/:id")
    .get(auth.findOne)
    .put(auth.update)
    .delete(auth.delete);

router.route("/:id/password")
    .put(auth.changePassword);

module.exports = router;