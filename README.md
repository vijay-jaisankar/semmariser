# Semmariser

The app works by taking an mp3 file and transcribing it. It then uses `rev-ai` to transcribe and a `MindsDB` model to summarise the content in a quick and efficient manner. This means that you can listen to a long podcast or audio file and get a summary of it in just a few minutes!  
The best part about Semmariser is that it is incredibly user-friendly and is accessible anywhere. All you have to do is upload your audio file, and the app takes care of the rest. In just a matter of minutes, you'll have a summary of the content that you can read on the go.

![Semmariser - demo](https://user-images.githubusercontent.com/56185979/234370223-23749231-1dc1-4f66-bf4b-5ae676252bff.gif)


## Deployed link
https://mindsdb.hackathonrunway.repl.co/

## Blog Post
https://vijayjaisankar.hashnode.dev/sql-sorcery-with-mindsdb-and-express-clgqci2yt000h09jt0rzr8ink

## Running Semmariser locally
- Create a new file named `.env` and populate it with API keys and URLs specified in `.env.example`.
- To install all dependencies, run `npm install` in both the `api` and `frontend` directories.
- To run the API, navigate to the `api` directory and run `node textSummary.js`
- To run the frontend, navigate to the `frontend` directory and run `npm start`.