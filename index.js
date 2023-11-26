const TelegramApi = require("node-telegram-bot-api");
//const config = require('./app/Config/config')
const { config } = require("dotenv");
const { testDatabaseConnection } = require("./src/app/DB/db");

const startMenu = require("./src/app/startMenu");

config();
const bot = new TelegramApi(process.env.TOKEN, { polling: true });

//todo: Сделать проверку email (пока не заполнен email пользователь не сможет закакзать пару)

const main = async () => {
  testDatabaseConnection();

  console.log("Bot create by Anton Kamaev");

  bot.setMyCommands([
    { command: "/start", description: "Перезапуск бота" },
    { command: "/commands", description: "Дополнительные команды бота" },
    { command: "/donate", description: "Поддержать разработчиков" },
    { command: "/locale", description: "Отправить геолокацию" },
  ]);

  startMenu(bot); // Start menu --> Hello, My profile module, ShowRoom Model and Choose brand Model
};

main();
