const core = require("@actions/core");
const github = require("@actions/github");
const ftp = require("basic-ftp")

function getInputs() {
    const host = core.getInput("host");
    const username = core.getInput("username");
    const password = core.getInput("password");
    const sourceFolder = core.getInput("source-folder");
    const destinationFolder = core.getInput("destination-folder");

    return {
        host,
        username,
        password,
        sourceFolder,
        destinationFolder
    }
}

async function run() {
    try { 
        const args = getInputs();

        const client = new ftp.Client();
        client.ftp.verbose = true;

        await client.access({
            host: args.host,
            user: args.username,
            password: args.password,
            secure: false
        });
        console.log("Client connected");

        client.trackProgress(info => {
            console.log("File", info.name)
            console.log("Type", info.type)
            console.log("Transferred", info.bytes)
            console.log("Transferred Overall", info.bytesOverall)
        });
 
        await client.cd(args.destinationFolder);
        console.log("Remote folder selected");
        
        console.log(`Start upload from ${args.sourceFolder} to ${args.destinationFolder}`);
        await client.uploadFromDir(args.sourceFolder);

        console.log("Upload completed");
        client.close();

        console.log("Client disconnected");
    } 
    catch (error) {
      core.setFailed(error.message);
    }
  }
  
  run()