const fs = require("fs");
const axios = require("axios");
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const {
  keyboard,
  profile_keyboard,
  check_style,
  chatOptions_profile,
} = require("./func/btns");

const {
  add_user,
  send_photo,
  send_dynamic_add_photo,
  select_photo,
  getProfile,
  delOrder,
  createPDF,
  add_gender,
  get_gender,
  past_orders,
  update_bonus,
  add_style,
  get_userStyle,
  get_currentOrder,
  new_order,
  addToOrder,
} = require("./DB/db");

const { sendPhotoWithNavigation } = require("./func/carusel");
const { start, tech, start_admin, check_folow } = require("./func/main-func");

const { admins } = require("./func/admin");
const { gender_choose } = require("./func/gender");
const {
  next_photo_o,
  prev_photo_o,
  showorders,
} = require("./func/orders-controller");
const { next_photo, prev_photo } = require("./func/show-controller");

const userSessions = new Map();
let userSession;
let selectedPhoto = 0;
const YokrossId = "@yokross12";
let check;

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: "./src/logs/bot-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

async function brandChoice(bot, chatId, data, user_callBack, messageId) {
  const messageHandler = async (msg) => {
    const log = await addToOrder(data, msg.text, chatId);
    const user = await get_userStyle(chatId);

    if (parseInt(msg.text) && log != false && log != undefined) {
      userSession = {
        size: msg.text,
        shooes_name: log[0].name,
        gender: user[0].gender,
        style: user[0].style,
      };
      userSessions.set(chatId, userSession);

      const res = await get_gender(
        userSession.shooes_name,
        userSession.size,
        userSession.style,
        userSession.gender
      );

      if (userSession) {
        userSession = {
          photos: res,
          currentIndex: 0,
        };
        userSessions.set(chatId, userSession);
      }

      if (userSession.photos.length > 0) {
        const currentIndex = userSession.currentIndex;
        const firstPhoto = userSession.photos[currentIndex];
        const totalPhotos = userSession.photos.length;
        const showPrevButton = currentIndex > 0;

        await sendPhotoWithNavigation(
          bot,
          chatId,
          userSession,
          currentIndex,
          firstPhoto,
          totalPhotos,
          showPrevButton
        );

        logger.info(
          `Size: ${msg.text} us for ${user_callBack} of ${log[0].name}\n Gender: ${user[0].gender}\n Style: ${user[0].style}\n. Success, Output: ${res.length}\n`
        );
      }
    } else {
      userSession = {
        gender: user[0].gender,
      };
      if (userSession.gender === "man") {
        userSession.gender = "мужской";
      } else {
        userSession.gender = "женский";
      }
      logger.info(`${user_callBack} cant find ${data} ${msg.text} us`);
      await bot.sendMessage(
        chatId,
        `☹️ <b>${msg.chat.first_name}</b>, я не смог найти ${userSession.gender} размер <b><i>${msg.text} us </i></b>бренд: <b><i>${data}</i></b>.\n\n` +
          `<b>Но</b> не стоит расстраиваться, следи за апдейтами в нашей группе <i><b><a href="https://t.me/yokross12">YoKross!</a></b></i>`,
        {
          reply_markup: JSON.stringify(keyboard),
          parse_mode: "HTML",
        }
      );
    }
    bot.off("message", messageHandler);
  };

  bot.on("message", messageHandler);

  bot.deleteMessage(chatId, messageId);
  await bot.sendPhoto(chatId, await send_photo(`${data}_size`), {
    caption: `👟 Доступные размеры <b>${data}</b>\n\n ❗️ Напиши в чат размер и я выведу тебе все доступные варианты в магазине.\n\n💬 <i>Пример: 8 или 8.5</i>`,
    parse_mode: "HTML",
  });
}

// ============ StartMenu ============
module.exports = (bot) => {
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.chat.username;
    const messageId = msg.message_id;

    switch (msg.text) {
      case "/start":
        check = await check_folow(YokrossId, chatId, bot, msg.chat.username);
        console.log(check);
        if (check === true) {
          bot.deleteMessage(chatId, messageId);
          await start(bot, chatId, msg.chat.first_name, userSessions);
          const res = await add_user(chatId, msg.chat.username);
          logger.info(`User ${username} was auth. Database: ${res}`);
        }

        break;
      case "/commands":
        await bot.sendMessage(
          chatId,
          `<b>⚙️ ${msg.chat.username}</b> вот пару команд:\n\n` +
            `➖ <b>/start</b> - <i>Перезапуск бота</i>\n` +
            `➖ <b>/donate</b> - <i>Поддержать разработчиков</i>\n` +
            `➖ <b>/locale</b> - <i>Отправить геолокацию</i>`,
          { parse_mode: "HTML" }
        );
        break;

      case "/admin":
        const chat_id = msg.chat.id.toString();
        if (
          process.env.ADMIN_ID === chat_id ||
          process.env.GROUP_ADMIN === chat_id ||
          process.env.LOGIST_ID === chat_id ||
          process.env.SERVIRCE_ID === chat_id
        ) {
          await start_admin(bot, chatId);
        } else {
          bot.sendMessage(chatId, "У вас нет доступа к этой команде.");
        }
        break;

      case "/donate":
        bot.sendMessage(
          chatId,
          `✌🏻 Yo <b>${msg.chat.first_name}</b>, ты можешь помочь развитию проекта задонатив любую сумму!\n\n` +
            `<b>Тинькофф: </b><code>5536 9139 7089 6656</code>`,
          { parse_mode: "HTML" }
        );
        break;
    }
  });

  //calbaks for menues
  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    const user_callBack = msg.message.chat.username;
    const messageId = msg.message.message_id;

    switch (data) {
      case "admin":
        const chat_id = msg.message.chat.id.toString();
        if (
          process.env.ADMIN_ID === chat_id ||
          process.env.GROUP_ADMIN === chat_id ||
          process.env.LOGIST_ID === chat_id ||
          process.env.SERVIRCE_ID === chat_id
        ) {
          await start_admin(bot, chatId);
        } else {
          bot.sendMessage(chatId, "У вас нет доступа к этой команде.");
        }
        break;
      case "admin_tables":
        await admins(bot, chatId);
        break;

      case "snippets":
        bot.sendMessage(
          chatId,
          "<i><b>Snippets</b></i>\n\n" +
            `➖ <b><i>Сниппет правил:</i></b>\n` +
            `<b><i><a href = "https://telegra.ph/Pravila-chata-11-06-17">📑 Правила чата</a></i></b>\n⁉️ Уважение трудно заработать, но легко потерять.`,
          { parse_mode: "HTML" }
        );
        break;

      case "choose":
        check = await check_folow(YokrossId, chatId, bot, user_callBack);
        if (check === true) {
          bot.sendMessage(
            chatId,
            `✌🏼 Yo <i><b>${msg.message.chat.first_name}</b></i>, давай выберем тип кроссовок, которые ты хочешь найти`,
            {
              parse_mode: "HTML",
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [{ text: "👟 Лайфстайл", callback_data: "lifestyle" }],
                  [{ text: "🏀 Баскетбольные", callback_data: "basket" }],
                  [{ text: "⚽️ Футбольные", callback_data: "football" }],
                  [{ text: "🏠 Выход в главное меню", callback_data: "home" }],
                ],
              }),
            }
          );
          break;
        }

      case "lifestyle":
        bot.deleteMessage(chatId, messageId);

        await add_style(chatId, "lifestyle");
        await gender_choose(bot, msg, chatId);

        logger.info(`${msg.message.chat.first_name} choose brand lifestyle`);
        break;

      case "basket":
        bot.deleteMessage(chatId, messageId);

        await add_style(chatId, "basket");
        await gender_choose(bot, msg, chatId);

        logger.info(`${msg.message.chat.first_name} choose brand basketball`);
        break;

      case "football":
        bot.deleteMessage(chatId, messageId);

        await add_style(chatId, "football");
        await gender_choose(bot, msg, chatId);

        logger.info(`${msg.message.chat.first_name} choose brand football`);
        break;

      case "man":
        bot.deleteMessage(chatId, messageId);

        await add_gender(chatId, "man");
        const model_m = await check_style(chatId);
        await bot.sendPhoto(chatId, "./src/app/img/man_choice.jpg", {
          caption: "",
          reply_markup: JSON.stringify(model_m),
        });
        break;

      case "woman":
        bot.deleteMessage(chatId, messageId);

        await add_gender(chatId, "woman");
        const model_w = await check_style(chatId);
        await bot.sendPhoto(chatId, "./src/app/img/female_choice.jpg", {
          caption: "",
          reply_markup: JSON.stringify(model_w),
        });
        break;

      case "Nike":
        logger.info(`${msg.message.chat.first_name} choose Nike`);
        await brandChoice(bot, chatId, data, user_callBack, messageId);
        break;

      case "Adidas":
        logger.info(`${msg.message.chat.first_name} choose Adidas`);
        await brandChoice(bot, chatId, data, user_callBack, messageId);
        break;

      case "Reebok":
        logger.info(`${msg.message.chat.first_name} choose Reebok`);
        await brandChoice(bot, chatId, data, user_callBack, messageId);
        break;

      case "Puma":
        logger.info(`${msg.message.chat.first_name} choose Puma`);
        await brandChoice(bot, chatId, data, user_callBack, messageId);
        break;

      case "Jordan":
        logger.info(`${msg.message.chat.first_name} choose Jordan`);
        await brandChoice(bot, chatId, data, user_callBack, messageId);
        break;

      case "NewBalance":
        logger.info(`${msg.message.chat.first_name} choose NewBalance`);
        brandChoice(bot, chatId, data, user_callBack, messageId);
        break;

      case "profile":
        check = await check_folow(YokrossId, chatId, bot, user_callBack);
        if (check === true) {
          const profileData = await getProfile(chatId);
          if (profileData.length > 0) {
            const profile = profileData[0];
            userSession = {
              orders: profile.orders,
              locale: profile.locale,
              bonuses: profile.bonus,
            };
            userSessions.set(chatId, userSession);

            await bot.sendPhoto(chatId, "./src/app/img/profile.jpg", {
              caption:
                `📈 <b>Вот твоя стата ${msg.message.chat.first_name}:</b>\n\n` +
                `● <b>Всего заказов сделано:</b> <i>${userSession.orders}</i>\n` +
                `● <b>Твоя геолокация:</b> <i>${
                  userSession.locale.length === 0
                    ? "Пока что твоя геолокация неизвестна.\nЧтобы отправить свою геолокацию, отправь --> /locale"
                    : userSession.locale
                }</i>\n` +
                `● <b>Бонусы:</b> <i>${userSession.bonuses}</i>`,

              parse_mode: "HTML",
              reply_markup: JSON.stringify(profile_keyboard),
            });

            logger.info(
              `${msg.message.chat.first_name} profile.\n` +
                `All orders: ${userSession.orders}\n` +
                `Geo: ${userSession.locale}\n` +
                `Bonuses: ${userSession.bonuses}`
            );
          }
        }
        break;

      case "current_order":
        bot.deleteMessage(chatId, messageId);
        const current = await get_currentOrder(chatId);
        if (current === false) {
          bot.sendMessage(
            chatId,
            `<b><i>${msg.message.chat.first_name}</i></b>, сейчас тебе ничего не доставляется!\n\n` +
              `😔 Воспользуйся поиском кроссовок или можешь посмотреть что у нас есть.`,
            {
              parse_mode: "HTML",
              reply_markup: JSON.stringify(chatOptions_profile),
            }
          );
        } else {
          await showorders(
            bot,
            current,
            chatId,
            userSession,
            userSessions,
            msg
          );
        }
        break;

      case "data_orders":
        bot.deleteMessage(chatId, messageId);
        const orders = await past_orders(chatId);

        await showorders(bot, orders, chatId, userSession, userSessions, msg);
        break;

      case "next_photo_o":
        bot.deleteMessage(chatId, messageId);
        userSession = userSessions.get(chatId);

        await next_photo_o(bot, userSession, userSessions, chatId);
        break;

      case "prev_photo_o":
        bot.deleteMessage(chatId, messageId);
        userSession = userSessions.get(chatId);

        await prev_photo_o(bot, chatId, userSession, userSessions);
        break;

      case "home":
        logger.info(`User ${msg.message.chat.first_name} go to Menu.`);
        bot.deleteMessage(chatId, messageId);
        break;

      case "exit":
        check = await check_folow(YokrossId, chatId, bot, user_callBack);
        if (check === true) {
          logger.info(`User ${msg.message.chat.first_name} go to Menu.`);
          bot.deleteMessage(chatId, messageId);

          await start(bot, chatId, msg.message.chat.first_name, userSessions);
        }
        break;

      case "show":
        check = await check_folow(YokrossId, chatId, bot, user_callBack);
        if (check === true) {
          logger.info(`User ${msg.message.chat.first_name} in ShowRoom.`);
          userSession = userSessions.get(chatId);
          const photosWithDescriptions = await send_dynamic_add_photo();

          if (photosWithDescriptions === false) {
            bot.sendMessage(
              chatId,
              `✌🏼 Yo <i><b>${msg.message.chat.first_name}</b></i>, идет обновление каталога пар, извини за недоразумение. Скоро пофиксим!`,
              {
                parse_mode: "HTML",
                reply_markup: JSON.stringify(keyboard),
              }
            );
          } else {
            if (!userSession) {
              userSession = {
                photos: photosWithDescriptions,
                currentIndex: 0,
              };
              userSessions.set(chatId, userSession);
            } else {
              userSession.photos = photosWithDescriptions;
              userSession.currentIndex = 0;
            }

            if (userSession.photos.length > 0) {
              const currentIndex = userSession.currentIndex;
              const firstPhoto = userSession.photos[currentIndex];
              const totalPhotos = userSession.photos.length;
              const showPrevButton = currentIndex > 0;

              await sendPhotoWithNavigation(
                bot,
                chatId,
                userSession,
                currentIndex,
                firstPhoto,
                totalPhotos,
                showPrevButton
              );
            }
          }
        }
        break;

      case "next_photo":
        bot.deleteMessage(chatId, messageId);
        userSession = userSessions.get(chatId);

        await next_photo(bot, chatId, userSession, userSessions);
        break;

      case "prev_photo":
        bot.deleteMessage(chatId, messageId);
        userSession = userSessions.get(chatId);

        await prev_photo(bot, chatId, userSession, userSessions);
        break;

      case "order":
        bot.deleteMessage(chatId, messageId);
        userSessions.get(chatId, userSession);
        if (userSession && userSession.photos) {
          selectedPhoto = userSession.photos[userSession.currentIndex];
        } else {
          console.error("userSession or photos is undefined or null.");
        }

        userSession = {
          order_id: chatId + Date.now(),
          name: selectedPhoto.name,
          size: selectedPhoto.size,
          price: selectedPhoto.price,
        };

        const addting = await new_order(
          chatId,
          userSession.order_id,
          userSession.name,
          userSession.size,
          userSession.price
        );
        if (addting === true) {
          console.log(`${userSession.order_id} was added`);
        }
        await bot.sendPhoto(chatId, selectedPhoto.path, {
          caption:
            `👟 <b>Кроссовки <i>${selectedPhoto.name}</i></b>\n\n` +
            `🧵 <b>Характеристики:</b>\n\n` +
            `➖ <b>Цвет:</b> <i>${selectedPhoto.color}</i>\n` +
            `➖ <b>Материал:</b> <i>${selectedPhoto.material}</i>\n` +
            `➖ <b>Размер:</b> <i>${selectedPhoto.size} us</i>\n\n` +
            `💸 <b>Цена:</b> <code>${selectedPhoto.price}₽</code>\n\n` +
            `Yo <i>${msg.message.chat.first_name}</i>, перед тем как оплатить прочитай <i><b>📑 Пользовательское соглашение</b></i>`,
          parse_mode: "HTML",
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: "📑 Пользовательское соглашение",
                  url: "https://t.me/yokrossguide12/3",
                },
              ],
              [
                {
                  text: `💸 Оплатить заказ #${userSession.order_id}`,
                  url: `https://yokrossbot.ru/payanyway.php?orderId=${userSession.order_id}`,
                },
              ],
              [
                { text: "✅ Я оплатил", callback_data: "payment" },
                { text: "🏠 Главное меню", callback_data: "home" },
              ],
            ],
          }),
        });

        break;

      case "yes":
        //url: `https://yokrossbot.ru/payanyway.php?orderId=${userSession.order_id}`

        break;

      case "payment":
        bot.deleteMessage(chatId, messageId);

        if (userSession && userSession.photos) {
          selectedPhoto = userSession.photos[userSession.currentIndex];
        } else {
          console.error("userSession or photos is undefined or null.");
        }

        console.log(userSession.order_id);

        await tech(bot, chatId, msg.message.chat.first_name);

        await createPDF();
        const fileStream = fs.createReadStream("output.csv");

        /*bot.sendPhoto(process.env.GROUP_ADMIN, selectedPhoto.path, {
          caption:
            `<b>🤑 Status</b>: <i> Новый оплаченный заказ</i>\n` +
            `@DreasTamyot новый заказ от ${msg.message.chat.first_name} (${chatId})\n\n` +
            `Кроссовки: <i>${selectedPhoto.name}</i>\n` +
            `Размер: <i>${selectedPhoto.size} us</i>\n` +
            `Цена: <i>${selectedPhoto.price}Р</i>\n\n` +
            `Тг ссылка на пользователя: <i><b>@${user_callBack}</b></i>`,
          parse_mode: 'HTML',
        })
        bot.sendDocument(process.env.GROUP_ADMIN, fileStream)*/

        await select_photo(selectedPhoto);
        await update_bonus(selectedPhoto, chatId);
        logger.info(
          `User ${msg.message.chat.first_name} paid and update bonuses.`
        );
        break;
    }
  });
};
