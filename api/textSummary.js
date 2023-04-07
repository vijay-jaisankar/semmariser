const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

const MindsDB = require("mindsdb-js-sdk");

// Dotenv setup
dotenv.config({ path: "../frontend/.env" });

// MindsDB setup
const user = {
	user: process.env.MINDSDB_USER,
	password: process.env.MINDSDB_PASS,
};

const connectToMindsDB = async (user) => {
	await MindsDB.default.connect(user);
};

const getSummarisedText = async (text) => {
	const model = await MindsDB.default.Models.getModel(
		"summariser_en",
		"mindsdb"
	);

	const queryOptions = {
		where: [`text_long = "${text}"`],
	};

	const prediction = await model.query(queryOptions);
	return prediction;
};

// Express API setup
const app = express();
app.use(cors(({
    origin: "*"
})));

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin: *",
        "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization"
    );
    next();
});



// Base route
app.get("/", function (req, res) {
	return res.json("Hello world!");
});

// Text summarisation route
app.post("/summary", async function (req, res) {
	let text = req.body.text;
	try {
		await connectToMindsDB(user);
		let summaryText = await getSummarisedText(text);
		let retValue = summaryText["data"]["text_summary"];
		res.json({ summary: retValue });
	} catch (error) {
		console.log(error);
		res.json(error);
	}
});

// Run the API
const port = 9000;
app.listen(port, () => {
	console.log(`Listening at Port https://localhost:${port}`);
});

module.exports = app;
