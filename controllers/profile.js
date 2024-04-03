const jwt = require("jsonwebtoken");
const userModel = require("../models/userSchema");
const postModel = require("../models/post")
require("dotenv").config();



exports.profile = (req, res) => {

    const {token} = req.cookies;

    jwt.verify(token, process.env.JWT_SECRET_KEY, {}, (error, info) => {
        if(error) throw error;
        res.json(info)
    })
}

exports.getPost = async (req, res) => {

    const {id} = req.params;

    const postDoc = await postModel.findById(id).populate('author', ['username']);
    res.json(postDoc);

}

