const express = require("express");
const router = express.Router();

const {register, login, logout} = require("../controllers/user");
const {profile, getPost} = require("../controllers/profile")

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", profile);
router.get("/post/:id", getPost)

module.exports = router;