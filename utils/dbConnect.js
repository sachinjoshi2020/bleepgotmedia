const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const dbname = process.env.DBNAME;


const uri = `mongodb+srv://admin:UBlYREpr4o40XtFR@cluster0.jyecipz.mongodb.net/bleepgotmedia?retryWrites=true&w=majority&appName=Clust`
const dbConnection = async () => {
    try {
        await mongoose.connect(uri);
        console.log(`connected to ${dbname}`);
        
    } catch (error) {
        console.log(error);
        
    }
}

module.exports = dbConnection;