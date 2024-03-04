const mongoose = require('mongoose');

const connectDB = async (URL) => {
    try {
        await mongoose.connect(URL);
        console.log("DB connected!");
    }
    catch(err) {
        console.log("DB connection error:\n\n ", err);
    }  
}

module.exports = connectDB;