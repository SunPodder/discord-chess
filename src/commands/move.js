const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageActionRow, MessageButton} = require('discord.js');

module.exports = new SlashCommandBuilder()
    .setName('move')
    .setDescription('Play your move')
    .addStringOption(option =>
        option.setName('move')
            .setDescription('The move to play')
            .setRequired(true)
    )

