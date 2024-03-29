const { CommandInteraction, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Phi = require('../handlers/client');
const pages = require('./pages');
const config = require('../../../settings/config');

module.exports = {
    name: "phi",
    description: config.Strings.descriptions.Phi,
    type: ApplicationCommandType.ChatInput,
    cooldown: 5,
    options: [
        {
            name: "private",
            description: "Select if the Canvas should be only visible to you or not (default false)",
            type: 5,
            required: false,
        }
    ],

    /**
     * @param {Phi} client
     * @param {CommandInteraction} interaction
     */

    run: async (client, interaction) => {

        //Check if there is an active canvas. note: might not work as expected when the canvas is ephemeral/private (only visible to author)
        const author = interaction.user.id;
        const private = interaction.options.getInteger("private")
        if (await client.interaction_db.has(author)) {
            interaction.reply({ content: `You already have an active Phi`, ephemeral: true });
            return;
        }

        //Variables
        const project = await client.project.get(`${interaction.user.id}`) || false;
        let pageStack = ['pageMain']; //Main page name (dont change :3)
        let currentPage = pages.pageMain; //This has to match the name in pageMain.js
        var content = await currentPage.getContent(client, interaction, project); //Get the canvas for main page
        var rows = await currentPage.buttons(client, interaction, project); //First 1-4 button rows
        const navigationRow = new ActionRowBuilder() //The back and close buttons
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back')
                    .setLabel('Back')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('close')
                    .setLabel('Close')
                    .setStyle(ButtonStyle.Danger)
            );
        rows.push(navigationRow);

        //Send message
        let message = await interaction.reply({
            ...content,
            components: rows,
            ephemeral: private ? true : false,
        });

        await client.interaction_db.set(author);

        let filter = (i) => i.user.id === author;
        let collector = message.createMessageComponentCollector({
            filter: filter,
            time: 180000,
        });

        collector.on("collect", async (i) => {
            if (i.user.id !== author) {
                await i.followUp({ content: `You aren't the message author.`, ephemeral: true });
                return;
            } else if (i.isButton()) {
                if (i.customId === 'back') {
                    pageStack.pop();
                    if (pageStack.length === 0) {
                        return;
                    }
                    const previousPageName = pageStack[pageStack.length - 1];
                    currentPage = pages[previousPageName];
                } else if (i.customId === 'close') {
                    collector.stop();
                    return;
                } else if (i.customId.startsWith("modal")) {
                    const modals = require('./modals');
                    const modalId = i.customId.slice(5);
                    const modal = modals[modalId];
                    if (modal) {
                        await modal.showModal(i);
                    } else {
                        console.error(`Modal with ID ${modalId} not found.`);
                        interaction.followUp({ content: "there was an unexpected error", ephemeral: true });
                    }
                    return;
                } else {
                    const pageName = i.customId;
                    if (pages[pageName]) {
                        currentPage = pages[pageName];
                        pageStack.push(pageName);
                    } else {
                        interaction.followUp({ content: "there was an unexpected error", ephemeral: true });
                    }
                }

                content = await currentPage.getContent();
                rows = currentPage.buttons();

                navigationRow.components[0].setDisabled(pageStack.length <= 1);
                rows.push(navigationRow);

                await i.update({ ...content, components: rows });
            }
        });

        collector.on("end", async (reason) => {
            if (reason == "error") {
                message.edit(config.Strings.error.canvas_interaction);
                await client.interaction_db.delete(author);
            } else {
                message.delete();
                await client.interaction_db.delete(author);
            }
        });
    },
};