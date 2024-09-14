import { Keyboard } from "grammy";
export const keyboard = new Keyboard()
  .text("🚀 Getting Started")
  .text("💳 Set Up Wallet")
  .text("🖥️ Dapps")
  .row()
  .text("🌐 Community")
  .text("🚿 Faucet Guide")
  .text("💵 Earn")
  .row()
  .text("❓ FAQ")
  .text("🗣️ Feedback")
  .text("🆘 Help")
  .resized();

export const walletKeyboard = new Keyboard()
  .text("➕ Installation", "install")
  .row()
  .text("🔗 Set Up Wallet", "connect")
  .row()
  .text("🔐 Wallet Security", "security");

export const earnKeyboard = new Keyboard()
  .text("🕶️ Rounds")
  .row()
  .text("🏛️ Farcaster");
export const faqKeyboard = new Keyboard()
  .text("I am a complete newbie, I know nothing😫")
  .row()
  .text("I'm a developer 🧑‍💻, How do i build on Base?🤔")
  .row()
  .text("Whats the difference between Farcaster and Warpcast?🤷")
  .row()
  .text("What makes Base better than other Ethereum L2s?🤔");