import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Form, Row, Col, Card } from "react-bootstrap";

import supabase from "./config/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";

import transcribePodcast from "./Transcriber";


function App() {
	const [podcasts, setpodcasts] = useState(null);
    const [count, setCount] = useState(1);

	async function getpodcasts() {
		const { data, error } = await supabase.from("podcast_summary").select();

		if (data !== null) {
			setpodcasts(data);
			console.log(data);
		} else {
			console.log(error);
			alert("Error grabbing files from database!");
		}
	}

	useEffect(() => {
		getpodcasts();
	}, []);

	async function uploadFile(e) {
		const podcastFile = e.target.files[0];
		console.log("Upload!");
		const { data, error } = await supabase.storage
			.from("podcasts")
			.upload(uuidv4() + ".mp3", podcastFile);

		if (error) {
			console.log(error);
			alert(error);
		}

		if (data) {
			console.log(data);
            const podcastFileLink = process.env.REACT_APP_PODCAST_CDN + data.path;
			const text = await transcribePodcast(
				process.env.REACT_APP_PODCAST_CDN + data.path
			);
			console.log("Transcribed text: " + text);
			const apiUrl = (process.env.API_BASE || "https://mindsdb-api.onrender.com") + "/summary"
			console.log(apiUrl);
			fetch(apiUrl, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					accept: "application/json",
				},
				body: JSON.stringify({
					text: text,
				}),
			})
				.then((response) => response.json())
				.then(async (response) => {
					console.log(response);
                    const  {data, error} = await supabase.from("podcast_summary").insert([{file: podcastFileLink , summary: response.summary}])
                    window.location.reload();
                    if(data) {
                        console.log(data);
                        getpodcasts();
                    } 
                    if(error) {
                        console.error(error);
        
                    }
				})
				.catch((err) => {
					console.log(err);
   
				});
			// Force re-render page on file upload to reflect new changes (ref https://stackoverflow.com/questions/30626030/can-you-force-a-react-component-to-rerender-without-calling-setstate)
			// getpodcasts();
            
		}
	}

	return (
		<Container className="mt-5" style={{ width: "700px" }}>
			<span aria-hidden="true" className="glitch">Semmariser</span>
			<Form.Group className="mb-3 mt-3">
				<Form.Label> <span className="info-box" style={{fontWeight: 'medium'}}> Upload your podcast audio file here! </span></Form.Label>
				<Form.Control
					type="file"
					accept="audio/mp3"
					onChange={(e) => uploadFile(e)}
				></Form.Control>
			</Form.Group>

			<br />
			<br />
			<br />
			<br />
			<br />

			<Row xs={1} className="g-4">
				{podcasts && podcasts.map((podcast) => {
					return (
						<Col md={4} key={podcast.id}>
								<Card>
									<audio controls>
										<source
											src={podcast.file}
											type="audio/mp3"
										></source>
									</audio>
									<Card.Body>
										<Card.Title></Card.Title>
										<Card.Text>
											{podcast.summary}
										</Card.Text>
									</Card.Body>
								</Card>
						</Col>
					);
				})}
			</Row>
		</Container>
	);
}

export default App;
