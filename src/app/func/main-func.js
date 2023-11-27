const config = require("../Config/config");
const { admin_btns } = require("./btns");
const { send_photo } = require("../DB/db");

async function start(bot, chatId, username, userSessions) {
  userSessions.delete(chatId);
  chatId = chatId.toString();
  const chat =
    chatId === process.env.GROUP_ADMIN ||
    chatId === process.env.ADMIN_ID ||
    chatId === process.env.LOGIST ||
    chatId === process.env.SERVIRCE_ID;
  await bot.sendPhoto(chatId, "./src/app/img/mainlogo.png", {
    caption:
      `<b>✌🏻 Yo ${username}! Я бот группы <i><b><a href="https://t.me/yokross12">YoKross!</a></b></i></b>\n\n` +
      `⚙️ <b>Кнопки основного меню:</b>\n\n` +
      `➖ <b>Поиск пары</b> - <i>Фильтр поиска пары</i>\n` +
      `➖ <b>ShowRoom</b> - <i>Коллекция магазина</i>\n` +
      `➖ <b>Мой профиль</b> - <i>Инфа о твоем профиле</i>\n` +
      `➖ <b>Гайд</b> - <i>Как правильно заказать кроссовки</i>\n` +
      `➖ <b>Обратная связь</b> - <i>help@yokrossbot.ru</i>\n\n` +
      `<b><i>💬 Полезное:</i></b> \n` +
      `<i><b><a href="https://telegra.ph/Dogovor-oferty-na-okazanie-uslugi-11-27">➖ Договор оферты</a></b></i>\n` +
      `➖ /commands <i>(Дополнительные команды)</i>\n\n` +
      `<i><b>Created by: </b><b><a href="https://t.me/YoKrossbot_log">Anton Kamaev</a></b>.\n<b>Alfa-version.v3</b></i>`,
    parse_mode: "HTML",
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "🔎 Поиск пары", callback_data: "choose" },
          { text: "⚡️ ShowRoom", callback_data: "show" },
        ],
        [{ text: "🤓 Гайд", url: "https://t.me/yokrossguide12/5" }],
        [{ text: "🙋🏻‍♂️ Мой профиль", callback_data: "profile" }],
        [{ text: chat ? "📑 Админка" : "", callback_data: "admin" }],
      ],
    }),
  });
}

async function start_admin(bot, chatId) {
  await bot.sendMessage(
    chatId,
    `<b><i>✌🏻 Yo AdminPanel</i></b>\n\n` +
      `<i><b>Created by: </b>Anton Kamaev\n@yokross_bot Alfa-version(v2)</i>`,
    {
      parse_mode: "HTML",
      reply_markup: JSON.stringify(admin_btns),
    }
  );
}

async function tech(bot, chatId, username) {
  await bot.sendPhoto(chatId, await send_photo("tech"), {
    caption:
      `❗️ <b>${username}</b>, данный раздел сейчас в разработке ❗️\n\n` +
      `🥺 Кому интересно, буду делиться своими мыслями и апдейтами вот тут ---> <b><a href="https://t.me/YoKrossbot_log">YoKrossBot.log.</a></b>`,
    parse_mode: "HTML",
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "🏠 Выход в главное меню", callback_data: "exit" }],
      ],
    }),
  });
}

async function check_folow(YokrossId, chatId, bot, username) {
  try {
    const chatMember = await bot.getChatMember(YokrossId, chatId);

    if (
      chatMember &&
      (chatMember.status === "member" ||
        chatMember.status === "creator" ||
        chatMember.status === "administrator")
    ) {
      return true;
    } else {
      await bot.sendPhoto(chatId, "./src/app/img/profile_second.jpg", {
        caption:
          `✌🏼 Yo <i><b>${username}</b></i>, я помогу подобрать тебе кроссовки, чтобы воспользоваться моими функциями, подпишись на нашу группу <b><i><a href='https://t.me/yokross12'> YoKross</a></i></b> !` +
          `\n\nТак же обязательно прочитай <b><i><a href='https://telegra.ph/Dogovor-oferty-na-okazanie-uslugi-11-27'>Договор оферты</a></i></b> !\n\n` +
          `После выполнения всех требований --> <i><b>Я прочитал и подписался</b></i>\n\n`,
        parse_mode: "HTML",
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: "✌🏼 YoKross", url: "https://t.me/yokross12" }],
            [
              {
                text: "📑 Договор оферты",
                url: "https://telegra.ph/Dogovor-oferty-na-okazanie-uslugi-11-27",
              },
            ],
            [
              {
                text: "✅ Я прочитал и подписался",
                callback_data: "exit",
              },
            ],
          ],
        }),
      });
      return false;
    }
  } catch (error) {
    console.error("Error in check_folow:", error);
    return false;
  }
}

module.exports = {
  start,
  tech,
  start_admin,
  check_folow,
};
