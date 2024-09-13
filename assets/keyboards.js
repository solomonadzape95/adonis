import { Keyboard } from "grammy";
export const keyboard = new Keyboard()
  .text("🚀 Getting Started")
  .text("💳 Set Up Wallet")
  .text("🖥️ Dapps")
  .row()
  .text("🌐 Community")
  .text("💱 Make a Transaction")
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
  .text("🏛️ Farcaster");
