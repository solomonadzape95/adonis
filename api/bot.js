import { Bot, webhookCallback } from "grammy";
import { returnMsgs } from "../assets/messages";
import { fetchRounds } from "../assets/rounds";

// import { users } from "../assets/users";
import {
  backKeyboard,
  earnKeyboard,
  extraKeyboard,
  faqKeyboard,
  infoKeyboard,
  keyboard,
  walletKeyboard,
} from "../assets/keyboards";
import { getGeminiResponse } from "../assets/gemini";
import { timeLeft } from "../assets/helpers";
// import telegramifyMarkdown from "telegramify-markdown";
export const config = {
  runtime: "edge",
};
const devID = parseInt(process.env.BOT_DEVELOPER);
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");
//sorry my code is tattered :) had to rush some things
const bot = new Bot(token);
bot.use(async (ctx, next) => {
  ctx.config = {
    botDeveloper: devID,
    isDeveloper: ctx.from?.id === devID,
  };
  // Run remaining handlers.
  await next();
});
bot.command("start", async (ctx) => {
  const { first_name, id } = ctx.from;
  await bot.api.sendChatAction(id, "typing");
  const msg = ctx.config.isDeveloper
    ? "Hi mom!! <3"
    : returnMsgs(first_name).start;
  await ctx.reply(msg, {
    reply_markup: keyboard,
  });
  const devRep = `Hey Mom, ${first_name} started a chat with me today😁.
  `;
  if (id !== devID) {
    await bot.api.sendMessage(devID, devRep);
  }
});
bot.command("home", async (ctx) => {
  await ctx.reply("Going Home...", { reply_markup: keyboard });
});
bot.command("review", async (ctx) => {
  const msg = ctx.match;
  if (msg === "") {
    await ctx.reply("You know you didn't actually send a message right?🤔");
    return;
  }
  const { first_name } = ctx.from;
  await bot.api.sendMessage(
    devID,
    `${first_name} sent a review :
"${msg}"`
  );
  await ctx.reply("Review Sent😁", { reply_markup: keyboard });
});
bot.command("bb", async (ctx) => {
  // let link = "https://warpcast.com/~/channel/base-builds";
  let msg = await fetchRounds(242);
  let time = timeLeft(new Date("2024-09-30T20:00:00.000Z"));
  let markup = `<b>${msg.name}</b>\n<b>Reward: ${msg.awardAmount} ${msg.award.assetType}</b>\n${msg.description}
  \n<b>Time Left: ${time}</b>\nParticipate: <a href="https://warpcast.com/~/channel/base-builds">base-builds</a>`;
  await ctx.reply(markup, { parse_mode: "HTML", reply_markup: infoKeyboard });
});
bot.command("bc", async (ctx) => {
  // let link = "https://warpcast.com/~/channel/base-creators";
  let msg = await fetchRounds(707);
  let time = timeLeft(new Date(msg.votingEndsAt));
  let markup = `<b>${msg.name}</b>\n<b>Reward: ${msg.awardAmount} ${msg.award.assetType}</b>\n${msg.description}
  \n<b>Time Left: ${time}</b>\nParticipate: <a href="https://warpcast.com/~/channel/base-creators">base-creators</a>`;
  await ctx.reply(markup, { parse_mode: "HTML", reply_markup: infoKeyboard });
});
bot.command(["video", "setup"], async (ctx) => {
  const { id } = ctx.from;
  let fileID = ctx.message.text.includes("video")
    ? process.env.VID_B
    : process.env.VID_A;
  await bot.api.sendChatAction(id, "upload_video");
  await ctx.replyWithVideo(fileID);
});
bot.reaction("🎉", (ctx) => {
  ctx.reply("Partaaaay Time");
});
bot.on("message_reaction", async (ctx) => {
  const reaction = ctx.messageReaction;
  // const message = reaction.message_id;
  await ctx.reply(reaction.new_reaction);
});
bot.on([":file", ":media"], async (ctx) => {
  const { first_name } = ctx.from;
  const msg = `Sorry ${first_name}, I can't handle your files right now.
  Yeah, I know 😔
  But I will be able to soon 😁
  You can use the keyboard below or ask me a question`;
  await ctx.reply(msg, { parse_mode: "Markdown", reply_markup: keyboard });
});
// bot.on("message:video", async (ctx) => {
//   const { first_name, id } = ctx.from;
//   const file = await ctx.getFile(); // valid for at least 1 hour
//   let path = file.file_path;
//   if (id === devID) {
//     let file = ctx.message.video;
//     let fileid = file.file_id; // file path on Bot API server
//     await ctx.reply("Download your own file again: " + path + fileid);
//   }
// });

bot.on("message:text", async (ctx) => {
  const { first_name, id } = ctx.from;

  let msg, kb, text;
  switch (ctx.msg.text) {
    case "💳 Wallet":
      text = "/wallet";
      msg = returnMsgs(first_name).wallet;
      kb = walletKeyboard;
      break;
    case "➕ Installation":
      text = "/installwallet";
      msg = returnMsgs(first_name).walletInstall;
      kb = walletKeyboard;
      break;
    case "🔗 Set Up Wallet":
      text = "/setupwallet";
      msg = returnMsgs(first_name).walletSetUp;
      kb = walletKeyboard;
      break;
    case "🔐 Wallet Security":
      text = "/walletsecurity";
      msg = returnMsgs(first_name).walletSec;
      kb = walletKeyboard;
      break;
    case "🚀 Get Started":
      text = "/overview";
      msg = returnMsgs(first_name).overview;
      kb = keyboard;
      break;
    case "🔨 Buildathon":
      text = "/build";
      msg = returnMsgs(first_name).build;
      break;
    case "🌐 Community":
      text = "/community";
      msg = returnMsgs(first_name).community;
      break;
    case "🗣️ Feedback":
      text = "/feedback";
      msg = returnMsgs(first_name).feedback;
      break;
    case "💵 Earn":
      text = "/earn";
      msg = returnMsgs(first_name).earn;
      kb = earnKeyboard;
      break;
    case "🏛️ Farcaster":
      text = "/warpcast";
      msg = returnMsgs(first_name).warpcast;
      kb = earnKeyboard;
      break;
    case "🕶️ Rounds":
      text = "/rounds";
      msg = returnMsgs(first_name).rounds;
      kb = earnKeyboard;
      break;
    case "❓ FAQ":
      text = "/faq";
      msg = returnMsgs(first_name).faq;
      kb = faqKeyboard;
      break;
    case "I'm a developer 🧑‍💻, How do i build on Base?🤔":
      text = "/faq";
      msg = returnMsgs(first_name).q2;
      kb = faqKeyboard;
      break;
    case "I am a complete newbie, I know nothing😫":
      text = "/faq";
      msg = returnMsgs(first_name).q1;
      kb = faqKeyboard;
      break;
    case "What makes Base better than other Ethereum L2s?🤔":
      text = "/faq";
      msg = returnMsgs(first_name).q4;
      kb = faqKeyboard;
      break;
    case "Whats the difference between Farcaster and Warpcast?🤷":
      text = "/faq";
      msg = returnMsgs(first_name).q3;
      kb = faqKeyboard;
      break;
    case "🖥️ Dapps":
      text = "/dapps";
      msg = returnMsgs(first_name).dapp;
      break;
    case "🚿 Faucets":
      text = "/faucet";
      msg = returnMsgs(first_name).faucet;
      break;
    case "🆘 Help":
      text = "/help";
      msg = returnMsgs(first_name).help;
      break;
    case "/help":
      msg = returnMsgs(first_name).help;
      break;
    case "📒 Rounds Info":
      text = "/roundsInfo";
      msg = returnMsgs(first_name).info;
      kb = infoKeyboard;
      break;
    case "🔙 Back":
      text = "/home";
      msg = "...";
      kb = keyboard;
      break;
    case "➕ More":
      text = "/more";
      msg = "...";
      kb = extraKeyboard;
      break;
    default:
      msg = await getGeminiResponse(id, ctx.msg.text);
  }
  msg = msg.includes("**") ? msg.replace(/\*\*/g, "") : msg;
  await bot.api.sendChatAction(id, "typing");
  await ctx.reply(
    msg,
    kb
      ? {
          parse_mode: "Markdown",
          reply_markup: kb,
        }
      : { reply_parameters: { message_id: ctx.msg.message_id } }
  );
});

export default webhookCallback(bot, "std/http");
