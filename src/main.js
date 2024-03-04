const {Client, GatewayIntentBits, Events} = require("discord.js")
const {token} = require("./config")
const Game = require("./game")

/*
 * Game States
 */

const GAMES = {}

/* 
 * Game States End
 */



const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
    ]
});

client.once("ready", function () {
    console.log("Running!");
})


client.on(Events.InteractionCreate, function (interaction) {
    //if (interaction.channel.name != "chess" || interaction.) return;

    // on ping command
    if (interaction.isCommand() && interaction.commandName === "ping") {
        interaction.reply({content: "Pong!", ephemeral: true});
        return;
    }
    // on new command
    if (interaction.isCommand() && interaction.commandName === "new") {
        // create a new game
        let user1 = interaction.user;
        let user2 = interaction.options.getUser("opponent");
        let game = new Game(user1, user2);

        game.sendChallenge(interaction);

        // Map game to both users
        GAMES[`${user1.id}-${user2.id}`] = game;
        GAMES[`${user2.id}-${user1.id}`] = game;
        return;
    }

    // on move command
    if ((interaction.isCommand() && interaction.commandName === "move") || interaction.isStringSelectMenu()) {
        let game
        for (let [key, value] of Object.entries(GAMES)) {
            if (interaction.user.id === value.user1.id || interaction.user.id === value.user2.id) {
                game = value;
            }
        }

        if (game) {
            // player hasn't accepted the game yet
            if (!game.isAccepted) return interaction.reply({content: "Game has not been started yet!", ephemeral: true});

            game.play(interaction);
        } else {
            interaction.reply({
                content: "You are not in a game!",
                ephemeral: true
            });
        }
        return;
    }

    // on invite button press
    if (interaction.isButton()) {
        // button was clicked by somebody else
        if (interaction.user.id != interaction
            .message.mentions.users.last().id) {
            //interaction.reply({content: "You can't accept a game you are not invited to!", ephemeral: true});
            //return;
        }

        let game
        for (let [key, value] of Object.entries(GAMES)) {
            if (interaction.user.id === value.user1.id || interaction.user.id === value.user2.id) {
                game = value;
            }
        }

        if (game) {
            if (interaction.customId === "accept") {
                game.accept(interaction);
            } else if (interaction.customId === "decline") {
                game.decline(interaction);
            }
        }
    }
})



client.login(token);
