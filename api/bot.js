import { Bot, InputFile, webhookCallback } from "grammy";
import { returnMsgs } from "../assets/messages";
import { users } from "../assets/users";
import { earnKeyboard, keyboard, walletKeyboard } from "../assets/keyboards";
// import { createReadStream } from "fs";
export const config = {
  runtime: "edge",
};
const devID = parseInt(process.env.BOT_DEVELOPER);
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

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
  if (!users.find((x) => x?.id === id)) return;
  const devRep = `Hey Mom, ${first_name} started a chat with me today😁.
  `;
  await bot.api.sendMessage(devID, devRep);
  users.push({ first_name, id });
});
bot.hears("💳 Set Up Wallet", async (ctx) => {
  const { first_name, id } = ctx.from;
  await bot.api.sendChatAction(id, "typing");
  const msg = returnMsgs(first_name).wallet;
  await ctx.reply(msg, {
    reply_markup: walletKeyboard,
  });
});
bot.hears("➕ Installation", async (ctx) => {
  const { first_name, id } = ctx.from;
  await bot.api.sendChatAction(id, "typing");
  const msg = returnMsgs(first_name).walletInstall;
  await ctx.reply(msg, {
    reply_markup: walletKeyboard,
  });
});
bot.hears("🔗 Set Up Wallet", async (ctx) => {
  const { first_name, id } = ctx.from;
  bot.api.sendChatAction(id, "typing");
  const msg = returnMsgs(first_name).walletSetUp;
  await ctx.reply(msg, {
    reply_markup: walletKeyboard,
  });
});
bot.hears("🔐 Wallet Security", async (ctx) => {
  const { first_name, id } = ctx.from;
  await bot.api.sendChatAction(id, "typing");
  const msg = returnMsgs(first_name).walletSec;
  await ctx.reply(msg, {
    reply_markup: walletKeyboard,
  });
});

bot.hears("🚀 Getting Started", async (ctx) => {
  const { first_name, id } = ctx.from;
  await bot.api.sendChatAction(id, "typing");
  const msg = returnMsgs(first_name).overview;
  await ctx.reply(msg, {
    parse_mode: "Markdown",
  });
});
bot.hears("🌐 Community", async (ctx) => {
  const { first_name, id } = ctx.from;
  await bot.api.sendChatAction(id, "typing");
  const msg = returnMsgs(first_name).community;
  await ctx.reply(msg, {
    parse_mode: "Markdown",
  });
});
bot.hears("🗣️ Feedback", async (ctx) => {
  const { first_name, id } = ctx.from;
  await bot.api.sendChatAction(id, "typing");
  const msg = returnMsgs(first_name).feedback;
  await ctx.reply(msg, {
    parse_mode: "Markdown",
  });
});
bot.hears("💵 Earn", async (ctx) => {
  const { first_name, id } = ctx.from;
  await bot.api.sendChatAction(id, "typing");
  const msg = returnMsgs(first_name).earn;
  await ctx.reply(msg, {
    parse_mode: "Markdown",
    reply_markup: earnKeyboard,
  });
});
bot.hears("🏛️ Farcaster", async (ctx) => {
  const { first_name, id } = ctx.from;
  await bot.api.sendChatAction(id, "typing");
  const msg = returnMsgs(first_name).warpcast;
  await ctx.reply(msg, {
    parse_mode: "Markdown",
    reply_markup: earnKeyboard,
  });
  const fs = new InputFile(
    new URL(
      "https://github.com/solomonadzape95/adonis/blob/master/assets/warpcast.png"
    )
  );
  await ctx.replyWithPhoto(fs);
});
bot.hears("🕶️ Rounds", async (ctx) => {
  const { first_name, id } = ctx.from;
  await bot.api.sendChatAction(id, "typing");
  const msg = returnMsgs(first_name).rounds;
  await ctx.reply(msg, {
    parse_mode: "Markdown",
    reply_markup: earnKeyboard,
  });
});
bot.command("home", async (ctx) => {
  await ctx.reply("Home Menu:", { reply_markup: keyboard });
  // await ctx.editMessageReplyMarkup({ reply_markup: keyboard });
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
  // await ctx.editMessageReplyMarkup({ reply_markup: keyboard });
});
export default webhookCallback(bot, "std/http");
