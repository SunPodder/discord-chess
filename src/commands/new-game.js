const {SlashCommandBuilder} = require("discord.js");

module.exports = new SlashCommandBuilder()
    .setName("new")
    .setDescription("Creates a new game of Chess!")
    .addUserOption(
        option => option.setName("opponent")
            .setDescription("The user you want to play against!")
            .setRequired(true));
