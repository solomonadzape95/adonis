import { InlineKeyboard, Keyboard } from "grammy";
// Keyboard configurations
// createSelectiveKeyboard(new Keyboard().remove(), id);

export const learnkeyboard = new InlineKeyboard().webApp(
  "📱 Try Lumina In Telgram",
  `https://www.learnonlumina.xyz`
);
export const keyboard = new Keyboard()
  .text("🚀 Get Started")
  .text("💳 Wallet")
  .text("🖥️ Dapps")
  .row()
  .text("🌐 Community")
  .text("🚿 Faucets")
  .text("💵 Earn")
  .row()
  .text("🗣️ Feedback")
  .text("🆘 Help")
  .text("➕ More")
  .resized()
  .oneTime();
export const mainInlineKeyboard = new InlineKeyboard()
  .text("🚀 Get Started", "overview")
  .text("💳 Wallets", "wallet")
  .row()
  .text("🔨 Buildathon", "build")
  .text("🌐 Community", "community")
  .row()
  .text("💵 Earn", "earn")
  .text("➕ More", "more");

export const infoKeyboard = new InlineKeyboard()
  .text("Base Builds", "bb")
  .text("Base Creators", "bc")
  .row()
  .text("🔙 Back", "back");
export const extraKeyboard = new Keyboard()
  .text("❓ FAQ")
  .text("🔨 Buildathon")
  .text("✈️ Jesse's Visit")
  .row()
  .text("🔙 Back", "back")
  .resized();

export const walletKeyboard = new Keyboard()
  .text("➕ Installation", "install")
  .text("🔗 Set Up Wallet", "connect")
  .row()
  .text("🔐 Wallet Security", "security")
  .text("🔙 Back", "back")
  .resized();

export const backKeyboard = new Keyboard().text("🔙 Back", "back");
export const earnKeyboard = new InlineKeyboard()
  .text("🕶️ Rounds", "rounds")
  .text("🏛️ Farcaster", "warpcast")
  .row()
  .text("🔙 Back", "back");
export const faqKeyboard = new Keyboard()
  .text("I am a complete newbie, I know nothing😫")
  .row()
  .text("I'm a developer 🧑‍💻, How do i build on Base?🤔")
  .row()
  .text("Whats the difference between Farcaster and Warpcast?🤷")
  .row()
  .text("What makes Base better than other Ethereum L2s?🤔")
  .row()
  .text("🔙 Back", "back");
