/*
/**
 * @typedef {import('../Clients/Alpha/handlers/client')} Alpha
 * @typedef {import('../Clients/Mu/handlers/client')} Mu
 * @typedef {import('../Clients/Phi/handlers/client')} Phi
 * @typedef {import('../Clients/Proton/handlers/client')} Proton
 * @typedef {import('../Clients/Theta/handlers/client')} Theta
 */

const Josh = require("@joshdb/core");
const provider = require("@joshdb/json");

/**
 * @param {Alpha} alpha
 * @param {Mu} mu
 * @param {Phi} phi
 * @param {Proton} proton
 * @param {Theta} theta
 */

module.exports = async (alpha, mu, phi, proton, theta) => {

    phi.client.interaction_db = new Josh({
        name: "interaction_db",
        provider: provider,
        providerOptions: {
            dataDir: "./Database/data/interaction"
        }
    })

    phi.client.project = new Josh({
        name: "project",
        provider: provider,
        providerOptions: {
            dataDir: "./Database/data/project"
        }
    })

}