import MindsDB from 'mindsdb-js-sdk';

const user = {
    user: "haha@gmail.com",
    password: "haha"
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

// Main block
(async () => {
    await connectToMindsDB(user);
    let text = "Hello there, my name is Vijay and I am a student at IIIT Bangalore. My research interests include machine learning and deep learning and Steph Curry is the greatest player to exist on the face of the earth. Steph is the best at shooting and dribbling!"
    let summary = await getSummarisedText(text);
    console.log(summary);
})();