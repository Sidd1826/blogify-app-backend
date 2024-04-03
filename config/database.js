const mongoose = require("mongoose");

require("dotenv").config();

const dbConnect = async (req, res) => {
    await mongoose.connect(process.env.DATABASE_URL)
    .then( () => console.log("DB Connected Successfully") )
    .catch( (error) => {
        console.error(error);
        console.log("Issue while connecting database");
        process.exit(1);
    })
}

module.exports = dbConnect;