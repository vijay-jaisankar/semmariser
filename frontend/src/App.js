import logo from "./logo.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Form, Row, Col, Card } from "react-bootstrap";

import supabase from "./config/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";



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
