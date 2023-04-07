const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

const MindsDB = require('mindsdb-js-sdk');

// Dotenv setup
dotenv.config({ path: "../frontend/.env" });


// MindsDB setup
const user = {
    user: process.env.MINDSDB_USER,
    password: process.env.MINDSDB_PASS
}

const connectToMindsDB = async (user) => {
    await MindsDB.default.connect(user);
}

const getSummarisedText = async (text) => {
    const model = await MindsDB.default.Models.getModel("summariser_en", "mindsdb");
    
    const queryOptions = {
        where: [
            `text_long = "${text}"`
        ]
    }

    const prediction = await model.query(queryOptions);
    return prediction;
}

// Express API setup
const app = express();
app.use(cors());

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());



// Base route
app.get("/", function (req, res) {
    return res.json("Hello world!");
});

// Login route
app.get("/login", async function (req, res) {
    try{
        await connectToMindsDB(user);
        res.json("Login successful");
    }
    catch(error){
        res.json(error);
    }
    
});

// Text summarisation route
app.get("/summary", async function (req, res) {
    let text = req.body.text;
    try{
        let summaryText = await getSummarisedText(text);
        let retValue = summaryText["data"]["text_summary"]
        res.json({"summary": retValue});
    }
    catch(error){
        res.json(error);
    }
});

// Run the API
const port = 3000;
app.listen(port, () => {
    console.log(`Listening at Port https://localhost:${port}`);
});

module.exports = app;
