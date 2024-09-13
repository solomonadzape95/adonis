import { Bot, webhookCallback } from "grammy";
export const config = {
  runtime: "edge",
};
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token);
bot.command('start', ctx => ctx.reply('Hello mom!!'))
export default webhookCallback(bot, "std/http");
