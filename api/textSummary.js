const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

// Express API setup
const app = express();
app.use(cors());

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());

// Dotenv setup
dotenv.config({ path: "../frontend/.env" });

// Base route
app.get("/", function (req, res) {
    return res.json("Hello world!");
});

// Run the API
const port = 3000;
app.listen(port, () => {
    console.log(`Listening at Port https://localhost:${port}`);
});

module.exports = app;