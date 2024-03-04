const chess = require('chess.js');
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder} = require('discord.js');

class Game {

    constructor(user1, user2) {
        this.user1 = user1;
        this.user2 = user2;
        this.turn = this.user1//Math.random() < 0.5 ? user1 : user2;
        this.board = new chess.Chess();
        this.isAccepted = false;
        this.thread = null;
    }

    disableButtons(interaction) {
        // deactivate the buttons
        interaction.message.edit({
            content: interaction.message.content,
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("accept")
                            .setLabel("Accept")
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId("decline")
                            .setLabel("Decline")
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true)
                    )
            ]
        });
    }

    getBoard() {
        let fen = this.board.fen();
        return `https://chessboardimage.com/${fen}.png`;
    }

    sendBoard() {
        let lastMove = this.board.history().at(-1);
        let lastMoveFrom = this.turn === this.user1 ? this.user2 : this.user1;
        lastMove = lastMove ? `${lastMoveFrom.username} played \`${lastMove}\`\n` : "";

        let row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("move")
                    .setPlaceholder("Select a move")
                    .addOptions(this.board.moves().slice(0, 25).map(move => {
                        return {
                            label: move,
                            value: move
                        }
                    }))
            );

        return this.thread.send({
            content: `${lastMove}`,
            files: [{
                attachment: this.getBoard(),
                name: "board.png"
            }],
            components: [row]
        });
    }


    // game invite accepted
    async accept(interaction) {
        this.isAccepted = true;
        interaction.reply({
            content: `${this.user1}, ${this.user2.username} accepted the game!`,
        });
        this.disableButtons(interaction);

        let thread = await interaction.channel.threads.create({
            name: `${this.user1.username} vs ${this.user2.username}`,
            autoArchiveDuration: 10080,
            reason: "Chess game"
        });

        this.thread = thread;
        thread.send(`${this.user1} vs ${this.user2}`);

        this.sendBoard(interaction);
        this.thread.send(`${this.turn}'s turn!`);
    }

    // game invite declined
    decline(interaction) {
        interaction.reply({
            content: `${this.user1}, ${this.user2.username} declined the game!`,
        });
        this.disableButtons(interaction);
    }

    // send game challenge
    sendChallenge(interaction) {
        interaction.reply({
            content: `You challenged ${this.user2.username} to a game!`,
            ephemeral: true
        });

        let row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("accept")
                    .setLabel("Accept")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("decline")
                    .setLabel("Decline")
                    .setStyle(ButtonStyle.Danger)
            );

        interaction.channel.send({
            content: `${this.user2} you have been challenged to a game by ${this.user1}!`,
            components: [row]
        });
    }


    play(interaction) {
        if (interaction.user.id === this.turn.id) {
            let move = interaction.values ? interaction.values[0] : interaction.options.getString("move");


            let result = this.board.move(move);
            if (result) {
                // check if game is over
                if (this.board.isGameOver()) {
                    this.sendBoard();
                    if (this.board.isCheckmate()) {
                        this.thread.send(`${this.turn} won by checkmate!`);
                    } else if (this.board.isStalemate()) {
                        this.thread.send(`Draw by stalemate!`);
                    } else if (this.board.isInsufficientMaterial()) {
                        this.thread.send(`Draw by insufficient material!`);
                    } else if (this.board.isThreefoldRepetition()) {
                        this.thread.send(`Draw by threefold repetition!`);
                    } else if (this.board.isDraw()) {
                        this.thread.send(`Draw!`);
                    }
                    this.thread.setArchived(true);
                    return;
                }


                this.turn = this.turn === this.user1 ? this.user2 : this.user1;
                interaction.deferReply();
                interaction.deleteReply();
                this.sendBoard()
                    .then(_ => this.thread.send(`${this.turn}'s turn!`));
            } else {
                interaction.reply({
                    content: "Invalid move!",
                    ephemeral: true
                });
            }
        } else {
            interaction.reply({
                content: "It's not your turn!",
                ephemeral: true
            });
        }
    }
}


module.exports = Game
