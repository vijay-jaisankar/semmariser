const { RevAiApiClient, RevAiApiDeployment, RevAiApiDeploymentConfigMap } = require('revai-node-sdk');

// Initialize your client with your Rev AI access token
const getClient = () => {
    const accessToken = "soyouthinkyouhavemytokenhuh";
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

// Main block
(async () => {
    let text = await transcribePodcast("https://soktpsszydugdumqagyc.supabase.co/storage/v1/object/public/podcasts/d0179c42-4d23-444b-b549-3cabdf6ced75.mp3");
    console.log(text);
  })();