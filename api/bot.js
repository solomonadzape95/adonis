import { Bot, webhookCallback } from "grammy";
import { returnMsgs } from "../assets/messages";
// import { fetchRounds } from "../assets/rounds";
import { getGeminiResponse } from "../assets/gemini";
// import { timeLeft } from "../assets/helpers";
import {
  earnKeyboard,
  extraKeyboard,
  faqKeyboard,
  keyboard,
  walletKeyboard,
  learnkeyboard,
} from "../assets/keyboards";
import {
  initializeTables,
  createGame,
  getActiveGame,
  getAllActiveGames,
  getGuesses,
  getGameByIdentifier,
  getUsers,
  generateIdentifier,
  updateGuesses,
  deleteGame,
  addUser,
  checkAndResetGuesses,
  getWords,
  resetWords,
  updateUser,
  checkLeaderboard,
} from "../assets/dataHelpers";

export const config = {
  runtime: "edge",
  maxDuration: 9000,
};

const devID = parseInt(process.env.BOT_DEVELOPER || "0");
// const token = "7385792159:AAHBwe3oEuuHEJANQCki1iQr5OU1hUfC48U";
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token);

bot.use(async (ctx, next) => {
  try {
    const { id, first_name, last_name } = ctx.from || {};
    if (!id) return;

    await initializeTables();

    const existingUser = await getUsers(id);
    console.log(existingUser);
    if (!existingUser || existingUser.length === 0) {
      await addUser({ id, first_name, last_name });
    }
    if (ctx.message.new_chat_members || ctx.message.left_chat_member) {
      return;
    } else {
      const isGroupChat =
        ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";
      const isBotMentioned =
        ctx.message && ctx.message?.text.includes(`@${ctx.me.username}`);
      const isDM = ctx.chat?.type === "private";

      ctx.config = {
        isGroupChat,
        isBotMentioned,
        isDM,
        shouldRespond:
          isDM ||
          (isGroupChat && isBotMentioned) ||
          (ctx.message?.reply_to_message &&
            ctx.message.reply_to_message.from.id === ctx.me.id),
        isDeveloper: id === devID,
      };

      await next();
    }
  } catch (error) {
    console.error("Middleware error:", error);
    await ctx
      .reply("...", { reply_to_message_id: ctx.message.message_id })
      .catch(() => {});
  }
});

bot.command("start", async (ctx) => {
  try {
    const { id, first_name } = ctx.from;
    if (!id) return;
    const msg = ctx.config?.isDeveloper
      ? "Hi mom!! <3"
      : returnMsgs(first_name).start;
    await bot.api.sendChatAction(id, "typing");

    // Respond in user's DM regardless of where /start was sent
    if (ctx.config.isGroupChat) {
      await bot.api.sendMessage(id, msg);

      // Notify developer of new users
      if (id !== devID) {
        await bot.api
          .sendMessage(devID, `New user: ${first_name} (${id}) started the bot`)
          .catch(() => {});
      }

      // Optionally notify in group that user has started the bot
      await ctx.reply(`${first_name}, I've sent you a DM!`, {
        reply_to_message_id: ctx.message.message_id,
      });
    } else if (ctx.config.isDM) {
      await ctx.reply(msg, {
        reply_markup: keyboard,
        reply_to_message_id: ctx.message.message_id,
      });
    }
  } catch (error) {
    console.error("Start command error:", error);
    await ctx
      .reply("An error occurred while starting the bot. Please try again.")
      .catch(() => {});
  }
});

bot.command("game", async (ctx) => {
  try {
    const { first_name } = ctx.from;

    if (!ctx.config.isGroupChat) {
      return await ctx.reply("This command can only be used in groups!", {
        reply_to_message_id: ctx.message.message_id,
      });
    }

    const groupId = ctx.chat?.id;
    if (!groupId) return;

    const existingGame = await getActiveGame(groupId);
    if (existingGame) {
      return await ctx.reply(
        `There's already an active game in this group!\nGroup identifier: ${existingGame.identifier}\nClue: ${existingGame.clue}`,
        { reply_to_message_id: ctx.message.message_id }
      );
    }

    await checkAndResetGuesses();

    const identifier = await generateIdentifier(ctx.chat.title || "group");
    const gameWord = await getWords();

    const canGameBePlayed = await createGame(
      groupId,
      gameWord.word,
      gameWord.clue,
      ctx.chat.title || "Unknown Group",
      identifier
    );
    if (canGameBePlayed === false) {
      await ctx.reply(
        `Hi ${first_name}.Two games have already been played in this group today. Wait until tomorrow before starting another game`,
        { reply_to_message_id: ctx.message.message_id }
      );
    } else {
      await ctx.reply(
        `Hi ${first_name}. Thanks for starting today's guessing game!\nThis is game ${
          canGameBePlayed + 1
        } in this group today\nTo guess, send me a DM with:\n/guess [your_guess] ${identifier}\n\nFor example: /guess basecoin ${identifier}`,
        { reply_to_message_id: ctx.message.message_id }
      );

      await ctx.reply(
        `The word has been generated. Here is a clue... 👇🏾\n${gameWord.clue}`,
        { reply_to_message_id: ctx.message.message_id }
      );
    }
  } catch (error) {
    console.error("Game command error:", error);
    await ctx
      .reply("An error occurred while creating the game. Please try again.", {
        reply_to_message_id: ctx.message.message_id,
      })
      .catch(() => {});
  }
});

bot.command("guess", async (ctx) => {
  if (!ctx.config.isDM) {
    return await ctx.reply(
      "Please send your guess in a private message to me!",
      { reply_to_message_id: ctx.message.message_id }
    );
  }

  const { first_name, id } = ctx.from;
  const args = ctx.message.text.split(" ");

  if (args.length < 3) {
    return await ctx.reply(
      "Please use the format: /guess [your_guess] [group_identifier]\n" +
        "Example: /guess basecoin cryptogroup",
      { reply_to_message_id: ctx.message.message_id }
    );
  }

  const guess = args[1].toLowerCase();
  const identifier = args[2].toLowerCase();

  // Get game by identifier
  const gameState = await getGameByIdentifier(identifier);

  if (!gameState) {
    return await ctx.reply(
      "Invalid group identifier! Use /activegames to see all active games and their identifiers.",
      { reply_to_message_id: ctx.message.message_id }
    );
  }

  // Verify user is in the group
  try {
    const chatMember = await bot.api.getChatMember(gameState.group_id, id);
    if (!chatMember) {
      return await ctx.reply(
        `You must be a member of ${gameState.group_name} to participate in its game!`,
        { reply_to_message_id: ctx.message.message_id }
      );
    }
  } catch (error) {
    console.error("Error checking group membership:", error);
    return await ctx.reply(
      "Couldn't verify your group membership. Make sure you're in the group!",
      { reply_to_message_id: ctx.message.message_id }
    );
  }

  const guesses = await getGuesses(id);

  if (guesses > 0) {
    if (guess === gameState.word.toLowerCase()) {
      // Send congratulations in DM
      await ctx.reply(
        `🎉 Congratulations! You correctly guessed "${gameState.word}"!`,
        { reply_to_message_id: ctx.message.message_id }
      );
      // Send announcement to the group
      try {
        await bot.api.sendMessage(
          gameState.group_id,
          `🎉 ${first_name} has correctly guessed the word: "${gameState.word}"!`
        );
        await bot.api.sendMessage(
          gameState.group_id,
          `@brenisbot tip 20 $bren @${ctx.from.username}`
        );
        await updateUser(id);
        // Delete game from database
        await deleteGame(gameState.group_id);
      } catch (error) {
        console.error("Error sending group message:", error);
      }
    } else {
      await updateGuesses(id, guesses - 1);
      const remainingGuesses = await getGuesses(id);
      await ctx.reply(
        `❌ Wrong guess! You have ${remainingGuesses} guesses left.`,
        { reply_to_message_id: ctx.message.message_id }
      );
    }
  } else {
    await ctx.reply(
      `Sorry ${first_name}, you're out of guesses for today. Try again tomorrow! 😞`,
      { reply_to_message_id: ctx.message.message_id }
    );
  }
});
// DM Command handler
bot.command("comedm", async (ctx) => {
  if (ctx.config.isGroupChat) {
    try {
      await bot.api.sendMessage(
        ctx.from.id,
        `Hi ${ctx.from.first_name}! 👋 You requested me from the group. How can I help you?`
      );

      // Confirm in group
      await ctx.reply(
        `I've sent you a DM, @${ctx.from.username}! Check your private messages.`,
        { reply_to_message_id: ctx.message.message_id }
      );
    } catch (error) {
      // Handle case where user hasn't started bot
      await ctx.reply(
        `${ctx.from.first_name}, please start a chat with me first by clicking this link: t.me/${ctx.me.username}`,
        { reply_to_message_id: ctx.message.message_id }
      );
    }
  } else {
    await ctx.reply("We're already in a private chat! How can I help you?", {
      reply_to_message_id: ctx.message.message_id,
    });
  }
});
bot.command("stats", async (ctx) => {
  if (ctx.from.id !== devID || ctx.config.isGroupChat) return;

  const totalUsers = await getUsers();
  const words = await getWords();

  await ctx.reply(
    `Bot Statistics:\nTotal Users: ${totalUsers.length} ${words}`,
    { reply_to_message_id: ctx.message.message_id }
  );
});
bot.command("board", async (ctx) => {
  if (ctx.from.id !== devID || ctx.config.isGroupChat) return;

  const words = await checkLeaderboard();
  let message = "";
  words.map(
    (word) =>
      (message += word.row.replace(/\(|\)/g, "").replace(",", ":") + `\n`)
  );

  await ctx.reply(message, {
    reply_to_message_id: ctx.message.message_id,
  });
});
bot.command("resetwords", async (ctx) => {
  if (ctx.from.id !== devID || ctx.config.isGroupChat) return;

  const words = await resetWords();

  await ctx.reply(`Completed`, { reply_to_message_id: ctx.message.message_id });
});
bot.command("resetguess", async (ctx) => {
  if (ctx.from.id !== devID || ctx.config.isGroupChat) return;

  const words = await checkAndResetGuesses();

  await ctx.reply(`Completed`, { reply_to_message_id: ctx.message.message_id });
});
bot.command("help", async (ctx) => {
  const { first_name, id } = ctx.from;

  const msg = ctx.config.isGroupChat
    ? returnMsgs(first_name).helpa
    : returnMsgs(first_name).help;
  await ctx.reply(msg, { reply_to_message: ctx.message.message_id });
});

bot.command("activegames", async (ctx) => {
  if (!ctx.config.isDM) {
    return await ctx.reply("Please check active games in a private message!", {
      reply_to_message_id: ctx.message.message_id,
    });
  }

  const activeGames = await getAllActiveGames();

  if (activeGames.length === 0) {
    return await ctx.reply("There are no active games at the moment!", {
      reply_to_message_id: ctx.message.message_id,
    });
  }

  let message = "Active Games:\n\n";

  for (const game of activeGames) {
    message +=
      `Group: ${game.group_name}\n` +
      `Identifier: ${game.identifier}\n` +
      `Started: ${new Date(game.start_time).toLocaleString()}\n` +
      `Clue: ${game.clue}\n\n`;
  }

  message += "\nTo make a guess, use:\n/guess [your_guess] [identifier]";

  await ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
});
bot.command("endgame", async (ctx) => {
  if (!ctx.config.isGroupChat) return;

  // Check if user is admin
  const member = await ctx.getChatMember(ctx.from.id);

  if (!["administrator", "creator"].includes(member.status)) {
    return await ctx.reply("Only group administrators can end games!", {
      reply_to_message_id: ctx.message.message_id,
    });
  }

  const existingGame = await getActiveGame(ctx.chat.id);

  if (existingGame) {
    await deleteGame(ctx.chat.id);
    await ctx.reply("The current game has been ended by an administrator.", {
      reply_to_message_id: ctx.message.message_id,
    });
  } else {
    await ctx.reply("There's no active game to end!", {
      reply_to_message_id: ctx.message.message_id,
    });
  }
});

bot.command("learn", async (ctx) => {
  const { first_name } = ctx.from;

  let response = returnMsgs(first_name).learn;
  await ctx.reply(response, {
    reply_markup: learnkeyboard,
    reply_to_message_id: ctx.message.message_id,
  });
});
bot.command("review", async (ctx) => {
  if (ctx.config.isGroupChat) {
    await ctx.reply("Try that again in a private message with me", {
      reply_to_message_id: ctx.message.message_id,
    });
    await bot.api.sendMessage(ctx.from.id, "You can review me here");
  } else {
    const msg = ctx.match;
    if (msg === "") {
      await ctx.reply("You know you didn't actually send a message right?🤔", {
        reply_to_message_id: ctx.message.message_id,
      });
      return;
    }
    const { first_name, id } = ctx.from;
    await bot.api.sendMessage(
      devID,
      `${first_name} sent a review :
"${msg}"`
    );
    await bot.api.sendMessage(id, "Review Sent😁", {
      reply_markup: keyboard,
      reply_to_message_id: ctx.message.message_id,
    });
  }
});
bot.command("read", async (ctx) => {
  if (!ctx.config?.isGroupChat) return;
  const { first_name, id } = ctx.from;
  const msg = ctx.match;
  let response = await getGeminiResponse(id, msg);
  if (response) {
    response = response.includes("**")
      ? response.replace(/\*\*/g, "")
      : response;
  }
  await ctx.reply(response, { reply_to_message_id: ctx.message.message_id });
});
// Message handler with improved error handling and type checking
bot.on("message:text", async (ctx) => {
  try {
    if (!ctx.config?.shouldRespond && !ctx.config.isDM) return;

    const { first_name, id } = ctx.from;

    const messageText = ctx.message?.text;

    // Handle reactions
    if (messageText.includes("basik") || messageText.includes("base")) {
      await ctx.react("❤️").catch(() => {});
    }

    if (ctx.config.shouldRespond || ctx.config.isDM) {
      let editedMsg = messageText;
      if (
        ctx.config.isGroupChat &&
        editedMsg.includes(`@${ctx.me.username?.toLowerCase()}`)
      )
        editedMsg = editedMsg
          .replace(`@${ctx.me.username?.toLowerCase()}`, "")
          .trim();

      await bot.api.sendChatAction(id, "typing");

      let response, kb;
      switch (editedMsg) {
        case "💳 Wallet":
          response = returnMsgs(first_name).wallet;
          kb = walletKeyboard;
          break;
        case "➕ Installation":
          response = returnMsgs(first_name).walletInstall;
          kb = walletKeyboard;
          break;
        case "🔗 Set Up Wallet":
          response = returnMsgs(first_name).walletSetUp;
          kb = walletKeyboard;
          break;
        case "🔐 Wallet Security":
          response = returnMsgs(first_name).walletSec;
          kb = walletKeyboard;
          break;
        case "🚀 Get Started":
          response = returnMsgs(first_name).overview;
          kb = keyboard;
          break;
        case "🔨 Buildathon":
          response = returnMsgs(first_name).build;
          break;
        case "🌐 Community":
          response = returnMsgs(first_name).community;
          break;
        case "🗣️ Feedback":
          response = returnMsgs(first_name).feedback;
          break;
        case "💵 Earn":
          response = returnMsgs(first_name).earn;
          kb = earnKeyboard;
          break;
        case "🏛️ Farcaster":
          response = returnMsgs(first_name).warpcast;
          kb = earnKeyboard;
          break;
        case "🕶️ Rounds":
          response = returnMsgs(first_name).rounds;
          kb = earnKeyboard;
          break;
        case "❓ FAQ":
          response = returnMsgs(first_name).faq;
          kb = faqKeyboard;
          break;
        case "I'm a developer 🧑‍💻, How do i build on Base?🤔":
          text = "/faq";
          response = returnMsgs(first_name).q2;
          kb = faqKeyboard;
          break;
        case "I am a complete newbie, I know nothing😫":
          text = "/faq";
          response = returnMsgs(first_name).q1;
          kb = faqKeyboard;
          break;
        case "What makes Base better than other Ethereum L2s?🤔":
          response = "/faq";
          response = returnMsgs(first_name).q4;
          kb = faqKeyboard;
          break;
        case "Whats the difference between Farcaster and Warpcast?🤷":
          response = "/faq";
          response = returnMsgs(first_name).q3;
          kb = faqKeyboard;
          break;
        case "🖥️ Dapps":
          response = "/dapps";
          response = returnMsgs(first_name).dapp;
          break;
        case "🚿 Faucets":
          response = "/faucet";
          response = returnMsgs(first_name).faucet;
          break;
        case "🆘 Help":
          response = "/help";
          response = returnMsgs(first_name).help;
          break;
        case "/help":
          response = returnMsgs(first_name).help;
          break;
        case "✈️ Jesse's Visit":
          response = "/roundsInfo";
          response = returnMsgs(first_name).info;
          break;
        case "🔙 Back":
          response = "/home";
          response = "...";
          kb = keyboard;
          break;
        case "➕ More":
          response = "/more";
          response = "...";
          kb = extraKeyboard;
          break;
        default:
          response = await getGeminiResponse(id, editedMsg);
      }

      if (response) {
        response = response.includes("**")
          ? response.replace(/\*\*/g, "")
          : response;

        // Removed inline keyboard response parts
        if (ctx.config.isGroupChat) {
          if (editedMsg === "") return;
          await ctx.api.sendMessage(
            id,
            `${response}`,
            kb
              ? {
                  reply_markup: kb,
                }
              : undefined
          );
          await ctx.reply(`I just replied in your DM`, {
            reply_to_message_id: ctx.message.message_id,
          });
        } else {
          await ctx.reply(
            `${response}`,
            kb
              ? {
                  reply_markup: kb,
                  reply_to_message_id: ctx.message.message_id,
                }
              : {
                  reply_to_message_id: ctx.message.message_id,
                }
          );
        }
      }
    }
  } catch (error) {
    console.error("Message handler error:", error);
  }
});

export default webhookCallback(bot, "std/http");
