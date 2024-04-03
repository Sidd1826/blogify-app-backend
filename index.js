const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs')
const postModel = require("./models/post")
const jwt = require("jsonwebtoken");
app.use("/uploads", express.static(__dirname + "/uploads"))

const PORT = process.env.PORT || 4000;

app.use(cors({credentials:true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser())

const dbConnect = require("./config/database");
dbConnect();

const userRoutes = require("./routes/userRoute");
app.use(userRoutes);


app.post("/post", uploadMiddleware.single('file') , async(req, res) => {
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath)


    const {token} = req.cookies;
    jwt.verify(token, process.env.JWT_SECRET_KEY, {}, async(error, info) => {
        if(error)
            throw error;
        const {title, summary, content} = req.body;
        const postDoc = await postModel.create({
            title, summary, content, cover: newPath, author: info.id
        })
        res.json(postDoc);
    })
})

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null;

    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;

    try {
        const info = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET_KEY, {}, (error, decoded) => {
                if (error) {
                    reject(error); // Reject if error occurs during verification
                } else {
                    resolve(decoded); // Resolve with decoded information
                }
            });
        });

        const { id, title, summary, content } = req.body;
        const postDoc = await postModel.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);

        if (!isAuthor) {
            return res.status(400).json("You are not the author");
        }

        await postDoc.updateOne({
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover,
        });

        res.status(200).json("Post updated successfully");
    } catch (error) {
        // Handle error here
        console.error(error);
        res.status(500).json("Internal server error");
    }
});



app.get('/post', async (req, res) => {
    res.json(
        await postModel.find()
            .populate('author',['username'])
            .sort({createdAt: -1})
            .limit(20)
    );
})          

app.listen(PORT, () => {
    console.log("Listening on port 3000")
})