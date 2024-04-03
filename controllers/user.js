const bcrypt = require("bcrypt")
const userModel = require("../models/userSchema")
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async(req, res) => {
    try {
        const {name, username, password} = req.body;

        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (error) {
            res.status(400).json(
                {
                    success: false,
                    message: "Issue while hashing password",
                }
            )
        }

        const user = await userModel.create(
            {name, username, password: hashedPassword}
        )
        
        return res.json({
            success:true,
            message: "User created successfully"
        });

    } catch (error) {
        res.status(500).json(
            {
                success: false,
                message: "User not created",
            }
        )
    }
}

exports.login = async(req, res) => {

    try {
        
        const {username, password} = req.body;

        const user = await userModel.findOne({username})

        if(!user)
        {
            res.status(401).json({
                success: false,
                message: "User not registered",
            })
        }

        const payload = {
            username: user.username,
            id: user._id
        }

        if(await bcrypt.compare(password, user.password))
        {
            let token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {});

            const option = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            res.cookie("token", token, option).status(200).json({
                id: user._id,
                username
            })
        }
        else{
            return res.status(403).json(
                {
                    success: false,
                    message: "Password incorrect"
                }
            )
        }


    } catch (error) {
        console.log(error);
        res.status(500).json(
            {
                success: false, 
                message: "Internal Server error",
            }
        )
    }

}

exports.logout = (req, res) => {
    res.cookie("token", "" ).json("ok");
}