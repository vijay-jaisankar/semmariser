import logo from "./logo.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Form, Row, Col, Card } from "react-bootstrap";


import supabase from "./config/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";

import { RevAiApiClient,RevAiApiDeployment, RevAiApiDeploymentConfigMap } from "revai-node-sdk";

import MindsDB from "mindsdb-js-sdk";

const getClient = () => {
    const accessToken = process.env.REACT_APP_REVAI_KEY;
    const client = new RevAiApiClient({ token: accessToken, deploymentConfig: RevAiApiDeploymentConfigMap.get(RevAiApiDeployment.US) });
    return client;
}

const getJob = async(client, file_path) => {
    const job = await client.submitJobLocalFile(file_path);
    return job;
}

const getJobRemote = async(client, file_url) => {
    const job = await client.submitJobUrl(file_url);
    return job;
}

const getPendingJobs = async(client) => {
    const jobs = await client.getListOfJobs();
    return jobs;
}

const checkTranscribed = async(client, id) => {
    let pendingJobs = await getPendingJobs(client);
    for(let i = 0; i < pendingJobs.length; i++){
        if (pendingJobs[i]['id'] === id){
            if(pendingJobs[i]['status'] === "transcribed"){
                return true;
            }
        }
    }

    return false;
}

const getText = async(client, job) => {
    while(true){
        let status = await checkTranscribed(client, job.id);
        if(status === true){
            const textStream = await client.getTranscriptText(job.id);
            return textStream;
        }
        await new Promise(r => setTimeout(r, 3000));
        console.log("Retrying...");
    }

    return null;
}

const transcribePodcast = async(url) => {
    let client = getClient();
    let job = await getJobRemote(client, url);
    let text = await getText(client, job);
    return text;
}

const userDetails = {
    user: process.env.MINDSDB_USER,
    password: process.env.MINDSDB_PASS
};


const connectToMindsDB = async (user) => {
    await MindsDB.connect(user);
}

const getSummarisedText = async (text) => {
    const model = await MindsDB.Models.getModel("summariser_en", "mindsdb");
    console.log(model);
    
    const queryOptions = {
        where: [
            `text_long = "${text}"`
        ]
    }

    const prediction = await model.query(queryOptions);
    return prediction;
}


function App() {
    const [podcasts, setpodcasts] = useState([]);


    async function getpodcasts() {
        const {data, error} = await supabase.storage.from("podcasts").list("");
    
        if(data !== null) {
            setpodcasts(data);
            console.log(data);
        } else {
            console.log(error);
            alert("Error grabbing files from database!");
        }   
    }

    useEffect(() => {
        getpodcasts();
    },[])


    
	async function uploadFile(e) {
        const podcastFile = e.target.files[0];
		console.log("Upload!");
        const {data,error} = await supabase.storage.from("podcasts").upload(uuidv4() + ".mp3", podcastFile)

        if(error) {
            console.log(error);
            alert(error);
        }

        if(data) {
            console.log(data);

            // Transcribe text
            const text = await transcribePodcast(process.env.REACT_APP_PODCAST_CDN + data.path);
            console.log("Transcribed text: " + text);

            // Summarise text
            await connectToMindsDB({
                user: process.env.MINDSDB_USER,
                password: process.env.MINDSDB_PASS
            });
            console.log("Connected!")
            let summary = await getSummarisedText(text);
            console.log(summary);
        }
	}

	return (
		<Container className="mt-5" style={{ width: "700px" }}>
			<h1>Podcast Feed</h1>
			<Form.Group className="mb-3 mt-3">
				<Form.Label>Upload your podcast audio file here!</Form.Label>
				<Form.Control
					type="file"
					accept="audio/mp3"
					onChange={(e) => uploadFile(e)}
				></Form.Control>
			</Form.Group>

            <Row xs={1} className="g-4">
                {podcasts.map((podcast) => {
                    return (
                        <Col md={4}>
                            <Card>
                                <audio controls>
                                    <source src={process.env.REACT_APP_PODCAST_CDN + podcast.name} type="audio/mp3"></source>
                                </audio>
                            </Card>
                        </Col>
                    )
                })}
            </Row>


		</Container>
	);
}

export default App;
