const settings = require("./settings/config");

async function startClients(alpha, mu, phi, proton, theta) {
    
    const clientNames = ['Alpha', 'Mu', 'Phi', 'Proton', 'Theta'];

    // Starting Clients

    await alpha.start(settings.Tokens.Alpha);
    await mu.start(settings.Tokens.Mu);
    await phi.start(settings.Tokens.Phi);
    await proton.start(settings.Tokens.Proton);
    await theta.start(settings.Tokens.Theta);

    // Console stuff

    // Commands
    const { alphaOnline } = require('./Clients/Alpha/handlers/handler');
    const { muOnline } = require('./Clients/Mu/handlers/handler');
    const { phiOnline } = require('./Clients/Phi/handlers/handler');
    const { protonOnline } = require('./Clients/Proton/handlers/handler');
    const { thetaOnline } = require('./Clients/Theta/handlers/handler');

    let clientCommands = [alphaOnline, muOnline, phiOnline, protonOnline, thetaOnline];
    let clientCommandStatus = [];
    for (var i = 0; i < clientNames.length; i++) {
        if (clientCommands[i] == undefined) {
            clientCommandStatus.push(`X ${clientNames[i]}`)
        } else {
            clientCommandStatus.push(`O ${clientNames[i]}`)
        }
    }

    console.log(`Loading Commands - | ${clientCommandStatus.join(' | ')} |`);

    // Clients
    await new Promise((resolve) => {
        setTimeout(resolve, 1800);
    });

    const { alphaReady } = require('./Clients/Alpha/events/ready');
    const { muReady } = require('./Clients/Mu/events/ready');
    const { phiReady } = require('./Clients/Phi/events/ready');
    const { protonReady } = require('./Clients/Proton/events/ready');
    const { thetaReady } = require('./Clients/Theta/events/ready');

    let onlineClients = [alphaReady, muReady, phiReady, protonReady, thetaReady];
    let clientOnlineStatus = [];
    for (var i = 0; i < clientNames.length; i++) {
        if (onlineClients[i] == undefined) {
            clientOnlineStatus.push(`X ${clientNames[i]}`)
        } else {
            clientOnlineStatus.push(`O ${clientNames[i]}`)
        }
    }

    console.log(`Loading Commands - | ${clientCommandStatus.join(' | ')} |`);

    // Database
    await require('./Database/dbHandler')(alpha, mu, phi, proton, theta)
    console.log(`Database Online`);

    //Reset interactions
    await phi.client.interaction_db.delete(phi.client.interaction_db.all);
    console.log("Interactions reset")

    // Final
    console.log("Everything is Set Up!");

}

module.exports = { startClients };
