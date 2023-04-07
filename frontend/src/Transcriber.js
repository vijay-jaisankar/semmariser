import {
	RevAiApiClient,
	RevAiApiDeployment,
	RevAiApiDeploymentConfigMap,
} from "revai-node-sdk";

/*
    Get RevAI client
*/
const getClient = () => {
	const accessToken = process.env.REACT_APP_REVAI_KEY;
	const client = new RevAiApiClient({
		token: accessToken,
		deploymentConfig: RevAiApiDeploymentConfigMap.get(
			RevAiApiDeployment.US
		),
	});
	return client;
};

/*
    Get the current instance of the submitted job for transcription 
*/
const getJobRemote = async (client, file_url) => {
	const job = await client.submitJobUrl(file_url);
	return job;
};

/*
    Get all pending jobs from the RevAI client
*/
const getPendingJobs = async (client) => {
	const jobs = await client.getListOfJobs();
	return jobs;
};

/*
    Check if the status of the given job is `transcribed`
*/
const checkTranscribed = async (client, id) => {
	let pendingJobs = await getPendingJobs(client);
	for (let i = 0; i < pendingJobs.length; i++) {
		if (pendingJobs[i]["id"] === id) {
			if (pendingJobs[i]["status"] === "transcribed") {
				return true;
			}
		}
	}

	return false;
};

/*
    Wait until the job has been transcribed (query every 3 seconds),
    and then return the transcribed text
*/
const getText = async (client, job) => {
	while (true) {
		let status = await checkTranscribed(client, job.id);
		if (status === true) {
			const textStream = await client.getTranscriptText(job.id);
			return textStream;
		}
		await new Promise((r) => setTimeout(r, 3000));
		console.log("Retrying...");
	}

	return null;
};

/*
    RevAI pipeline - return the text transcribed from the mp3 file
*/
const transcribePodcast = async (url) => {
	let client = getClient();
	let job = await getJobRemote(client, url);
	let text = await getText(client, job);
	return text;
};

export default transcribePodcast;