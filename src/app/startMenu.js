const fs = require("fs");
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const {
  keyboard,
  check_style,
  chatOptions_profile,
  admin_btns,
} = require("./func/btns");

const {
  add_user,
  send_photo,
  send_dynamic_add_photo,
  createPDF,
  delOrder,
  add_gender,
  get_gender,
  past_orders,
  update_bonus,
  add_style,
  get_userStyle,
  get_currentOrder,
  new_order,
  addToOrder,
  add_email,
  add_location,
  add_fio,
  check_payment,
  search_articul,
  add_msk,
  getProfile,
} = require("./DB/db");

const { editCaptionShow } = require("./func/carusel");
const {
  start,
  tech,
  start_admin,
  check_folow,
  start_update,
  profile,
} = require("./func/main-func");

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
const YokrossId = "@stockhub12";
let check;
const userStorage = {};

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

const objectToString = (obj) => {
  if (typeof obj === "object") {
    return JSON.stringify(obj, null, 2);
  }
  return obj.toString();
};

// ============ StartMenu ============
module.exports = (bot) => {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.chat.username;
    const messageId = msg.message_id;

    check = await check_folow(YokrossId, chatId, bot, msg.chat.username);
    console.log(check);
    if (check === true) {
      bot.deleteMessage(chatId, messageId - 1);
      bot.deleteMessage(chatId, messageId - 2);
      await start(bot, chatId, msg.chat.first_name);
      const res = await add_user(chatId, msg.chat.username);
      logger.info(`User ${username} was auth. Database: ${res}`);
    }
  });

  bot.onText(/\/guide/, async (msg) => {
    bot.deleteMessage(msg.chat.id, msg.message_id - 1);
    bot.deleteMessage(msg.chat.id, msg.message_id - 2);
    bot.sendMessage(
      msg.chat.id,
      `<b>Ссылка на гайд:</b> \n<i><a href="https://t.me/yokrossguide12/5">Guide</a></i>`,
      { parse_mode: "HTML" }
    );
  });

  bot.onText(/\/commands/, async (msg) => {
    bot.deleteMessage(msg.chat.id, msg.message_id - 1);
    bot.deleteMessage(msg.chat.id, msg.message_id - 2);
    await bot.sendMessage(
      msg.chat.id,
      `<b>⚙️ ${msg.chat.username}</b> вот пару команд:\n\n` +
        `➖ <b>/start</b> - <i>Перезапуск бота</i>\n` +
        `➖ <b>/donate</b> - <i>Поддержать разработчиков</i>\n` +
        `➖ <b>/guide</b> - <i>Посмотреть гайд</i>\n`,
      { parse_mode: "HTML" }
    );
  });

  bot.onText(/\/admin/, async (msg) => {
    const chat_id = msg.chat.id.toString();
    if (
      process.env.ADMIN_ID === chat_id ||
      process.env.GROUP_ADMIN === chat_id ||
      process.env.LOGIST_ID === chat_id ||
      process.env.SERVIRCE_ID === chat_id
    ) {
      await start_admin(bot, msg.chat.id);
    } else {
      bot.sendMessage(msg.chat.id, "У вас нет доступа к этой команде.");
    }
  });

  bot.onText(/\/donate/, async (msg) => {
    bot.deleteMessage(msg.chat.id, msg.message_id - 1);
    bot.deleteMessage(msg.chat.id, msg.message_id - 2);
    bot.sendMessage(
      msg.chat.id,
      `✌🏻 Yo <b>${msg.chat.first_name}</b>, ты можешь помочь развитию проекта задонатив любую сумму!\n\n` +
        `<b>Тинькофф: </b><code>5536 9139 7089 6656</code>`,
      { parse_mode: "HTML" }
    );
  });

  //calbaks for menues
  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    const user_callBack = msg.message.chat.username;
    const messageId = msg.message.message_id;

    switch (data) {
      case "admin":
        bot.deleteMessage(chatId, messageId);
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
        bot.deleteMessage(chatId, messageId);
        await admins(bot, chatId);
        break;

      case "snippets":
        bot.deleteMessage(chatId, messageId);
        bot.sendMessage(
          chatId,
          "<i><b>Snippets</b></i>\n\n" +
            `➖ <b><i>Сниппет правил:</i></b>\n` +
            `<b><i><a href = "https://telegra.ph/Pravila-chata-11-06-17">📑 Правила чата</a></i></b>\n⁉️ Уважение трудно заработать, но легко потерять.`,
          { parse_mode: "HTML", reply_markup: JSON.stringify(admin_btns) }
        );
        break;

      case "locale":
        // bot.deleteMessage(chatId, messageId);

        bot.editMessageCaption(
          `✌🏼 Yo ${msg.message.chat.first_name}, отправь мне пожалуйста адрес, который ближе к тебе или адресс ПВЗ Boxberry.\n\n` +
            `<i>P.S Если не знаешь где находятся <i><b>ПВЗ Boxberry</b></i>, то можешь посмотреть на карте</i>\n\n` +
            `<i>Пример ввода для доставки по России: Йошкар-Ола, Йывана Кырли 44</i>\n\n`,
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "HTML",
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [
                  {
                    text: "🌐 Открыть карту",
                    web_app: { url: "https://yandex.ru/maps/" },
                  },
                  {
                    text: "🧨 Отмена",
                    callback_data: "cancel",
                  },
                ],
              ],
            }),
          }
        );

        userStorage[chatId] = { state: "awaitingAddress" };
        break;

      case "email":
        // bot.deleteMessage(chatId, messageId);

        bot.editMessageCaption(
          `✌🏼 Yo <b>${msg.message.chat.first_name}</b>, напиши мне свою рабочую почту (это надо для отправки чека после покупки)`,
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "HTML",
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [
                  {
                    text: "🧨 Отмена",
                    callback_data: "cancel",
                  },
                ],
              ],
            }),
          }
        );

        userStorage[chatId] = { state: "awaitingEmail" };
        break;

      case "fio":
        // bot.deleteMessage(chatId, messageId);

        bot.editMessageCaption(
          `✌🏼 Yo <b>${msg.message.chat.first_name}</b>, напиши мне свой ФИО (это надо для заполнения получателя при доставке)`,
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "HTML",
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [
                  {
                    text: "🧨 Отмена",
                    callback_data: "cancel",
                  },
                ],
              ],
            }),
          }
        );

        userStorage[chatId] = { state: "awaitingFIO" };
        break;

      case "cancel":
        // bot.deleteMessage(chatId, messageId);
        await profile(
          bot,
          chatId,
          userStorage,
          msg.message.chat.first_name,
          messageId
        );
        break;

      case "choose":
        // bot.deleteMessage(chatId, messageId);
        check = await check_folow(YokrossId, chatId, bot, user_callBack);
        if (check === true) {
          bot.editMessageCaption(
            `✌🏼 Yo <i><b>${msg.message.chat.first_name}</b></i>, давай выберем тип кроссовок, которые ты хочешь найти`,
            {
              chat_id: chatId,
              message_id: messageId,
              parse_mode: "HTML",
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [{ text: "👟 Лайфстайл", callback_data: "lifestyle" }],
                  [{ text: "🏀 Баскетбольные", callback_data: "basket" }],
                  [{ text: "⚽️ Футбольные", callback_data: "football" }],
                  [{ text: "🏠 Выход в главное меню", callback_data: "exit" }],
                ],
              }),
            }
          );
          break;
        }

      case "lifestyle":
        // bot.deleteMessage(chatId, messageId);

        await add_style(chatId, "lifestyle");
        await gender_choose(bot, msg, chatId, messageId);

        logger.info(`${msg.message.chat.first_name} choose brand lifestyle`);
        break;

      case "basket":
        // bot.deleteMessage(chatId, messageId);

        await add_style(chatId, "basket");
        await gender_choose(bot, msg, chatId, messageId);

        logger.info(`${msg.message.chat.first_name} choose brand basketball`);
        break;

      case "football":
        // bot.deleteMessage(chatId, messageId);

        await add_style(chatId, "football");
        await gender_choose(bot, msg, chatId, messageId);

        logger.info(`${msg.message.chat.first_name} choose brand football`);
        break;

      case "man":
        // bot.deleteMessage(chatId, messageId);

        await add_gender(chatId, "man");
        const model_m = await check_style(chatId);
        await bot.editMessageMedia(
          { type: "photo", media: await send_photo("man"), caption: "" },
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: JSON.stringify(model_m),
          }
        );
        break;

      case "woman":
        // bot.deleteMessage(chatId, messageId);

        await add_gender(chatId, "woman");
        const model_w = await check_style(chatId);
        await bot.editMessageMedia(
          {
            type: "photo",
            media: await send_photo("woman"),
            caption: "",
          },
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: JSON.stringify(model_w),
          }
        );
        break;

      case "Nike":
        logger.info(`${msg.message.chat.first_name} choose Nike`);
        // bot.deleteMessage(chatId, messageId);
        await bot.editMessageMedia(
          {
            type: "photo",
            media: await send_photo(`${data}_size`),
            caption: `👟 Доступные размеры <b>${data}</b>\n\n ❗️ Напиши в чат размер и я выведу тебе все доступные варианты в магазине.\n\n💬 <i>Пример: 8 или 8.5</i>`,
            parse_mode: "HTML",
          },
          {
            chat_id: chatId,
            message_id: messageId,
          }
        );

        userStorage[chatId] = { state: "brandChoice", data: data };
        break;

      case "Adidas":
        logger.info(`${msg.message.chat.first_name} choose Adidas`);

        // bot.deleteMessage(chatId, messageId);
        await bot.editMessageMedia(
          {
            type: "photo",
            media: await send_photo(`${data}_size`),
            caption: `👟 Доступные размеры <b>${data}</b>\n\n ❗️ Напиши в чат размер и я выведу тебе все доступные варианты в магазине.\n\n💬 <i>Пример: 8 или 8.5</i>`,
            parse_mode: "HTML",
          },
          {
            chat_id: chatId,
            message_id: messageId,
          }
        );

        userStorage[chatId] = { state: "brandChoice", data: data };
        break;

      case "Reebok":
        logger.info(`${msg.message.chat.first_name} choose Reebok`);

        // bot.deleteMessage(chatId, messageId);
        await bot.editMessageMedia(
          {
            type: "photo",
            media: await send_photo(`${data}_size`),
            caption: `👟 Доступные размеры <b>${data}</b>\n\n ❗️ Напиши в чат размер и я выведу тебе все доступные варианты в магазине.\n\n💬 <i>Пример: 8 или 8.5</i>`,
            parse_mode: "HTML",
          },
          {
            chat_id: chatId,
            message_id: messageId,
          }
        );
        userStorage[chatId] = { state: "brandChoice", data: data };
        break;

      case "Puma":
        logger.info(`${msg.message.chat.first_name} choose Puma`);

        // bot.deleteMessage(chatId, messageId);
        await bot.editMessageMedia(
          {
            type: "photo",
            media: await send_photo(`${data}_size`),
            caption: `👟 Доступные размеры <b>${data}</b>\n\n ❗️ Напиши в чат размер и я выведу тебе все доступные варианты в магазине.\n\n💬 <i>Пример: 8 или 8.5</i>`,
            parse_mode: "HTML",
          },
          {
            chat_id: chatId,
            message_id: messageId,
          }
        );
        userStorage[chatId] = { state: "brandChoice", data: data };
        break;

      case "Jordan":
        logger.info(`${msg.message.chat.first_name} choose Jordan`);

        // bot.deleteMessage(chatId, messageId);
        await bot.editMessageMedia(
          {
            type: "photo",
            media: await send_photo(`${data}_size`),
            caption: `👟 Доступные размеры <b>${data}</b>\n\n ❗️ Напиши в чат размер и я выведу тебе все доступные варианты в магазине.\n\n💬 <i>Пример: 8 или 8.5</i>`,
            parse_mode: "HTML",
          },
          {
            chat_id: chatId,
            message_id: messageId,
          }
        );
        userStorage[chatId] = { state: "brandChoice", data: data };
        break;

      case "NewBalance":
        logger.info(`${msg.message.chat.first_name} choose NewBalance`);

        // bot.deleteMessage(chatId, messageId);
        await bot.editMessageMedia(
          {
            type: "photo",
            media: await send_photo(`${data}_size`),
            caption: `👟 Доступные размеры <b>${data}</b>\n\n ❗️ Напиши в чат размер и я выведу тебе все доступные варианты в магазине.\n\n💬 <i>Пример: 8 или 8.5</i>`,
            parse_mode: "HTML",
          },
          {
            chat_id: chatId,
            message_id: messageId,
          }
        );
        userStorage[chatId] = { state: "brandChoice", data: data };
        break;

      case "profile":
        // bot.deleteMessage(chatId, messageId);
        check = await check_folow(YokrossId, chatId, bot, user_callBack);

        if (check === true) {
          await profile(
            bot,
            chatId,
            userStorage,
            msg.message.chat.first_name,
            messageId
          );
        }
        break;

      case "data_orders":
        // bot.deleteMessage(chatId, messageId);
        const orders = await past_orders(chatId);
        console.log(orders);
        if (orders === false) {
          bot.editMessageCaption(
            `✌🏼 Yo ${msg.message.chat.first_name}, ты еще не сделал ни одного заказа!\n\n` +
              `Ты можешь выбрать кроссовки в <i><b>⚡️ Show Room</b></i> или найти пару по фильтру <i><b>🔎 Поиск пары</b></i>`,
            {
              chat_id: chatId,
              message_id: messageId,
              parse_mode: "HTML",
              reply_markup: JSON.stringify(chatOptions_profile),
            }
          );
        } else {
          await showorders(bot, orders, chatId, userStorage, msg);
        }

        break;

      case "articul":
        // bot.deleteMessage(chatId, messageId);

        bot.editMessageCaption(
          `Yo <i><b>${msg.message.chat.first_name}</b></i>, введи артикул пары, которую ты хочешь найти:`,
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "HTML",
          }
        );

        userStorage[chatId] = { state: "articul" };
        break;

      case "next_photo_o":
        bot.deleteMessage(chatId, messageId);
        userSession = userSessions.get(chatId);

        await next_photo_o(bot, userStorage, chatId);
        break;

      case "prev_photo_o":
        bot.deleteMessage(chatId, messageId);
        userSession = userSessions.get(chatId);

        await prev_photo_o(bot, chatId, userStorage);
        break;

      case "end":
        bot.deleteMessage(chatId, messageId);
        await start(bot, chatId, msg.message.chat.first_name);
        break;

      case "home":
        await add_user(chatId, msg.message.chat.username);
        logger.info(`User ${msg.message.chat.first_name} go to Menu.`);

        bot.deleteMessage(chatId, messageId);
        await start_update(bot, chatId, msg.message.chat.first_name, messageId);
        break;

      case "exit":
        // bot.deleteMessage(chatId, messageId + 1);
        await add_user(chatId, msg.message.chat.username);

        check = await check_folow(YokrossId, chatId, bot, user_callBack);
        if (check === true) {
          logger.info(`User ${msg.message.chat.first_name} go to Menu.`);
          // await start(bot, chatId, msg.message.chat.first_name);
          await start_update(
            bot,
            chatId,
            msg.message.chat.first_name,
            messageId
          );
        }
        break;

      case "show":
        // bot.deleteMessage(chatId, messageId);
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
            userStorage[chatId] = {
              photo: photosWithDescriptions,
              currentIndex: 0,
            };

            if (userStorage[chatId].photo.length > 0) {
              const currentIndex = userStorage[chatId].currentIndex;
              const firstPhoto = userStorage[chatId].photo[currentIndex];
              const totalPhotos = userStorage[chatId].photo.length;
              const showPrevButton = currentIndex > 0;

              await editCaptionShow(
                bot,
                chatId,
                userSession,
                messageId,
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
        //bot.deleteMessage(chatId, messageId);
        userSession = userSessions.get(chatId);

        await next_photo(bot, chatId, userStorage, messageId);
        break;

      case "prev_photo":
        //bot.deleteMessage(chatId, messageId);
        userSession = userSessions.get(chatId);

        await prev_photo(bot, chatId, userStorage, messageId);
        break;

      case "order":
        // bot.deleteMessage(chatId, messageId);

        selectedPhoto =
          userStorage[chatId].photo[userStorage[chatId].currentIndex];

        const profileData = await getProfile(chatId);
        console.log(profileData);
        if (profileData.length > 0) {
          const profile = profileData[0];
          userSession = {
            order_id: chatId + Date.now(),
            name: selectedPhoto.name,
            size: selectedPhoto.size,
            price: selectedPhoto.price,
            locale: profile.locale,
            email: profile.email,
            fio: profile.fio,
          };
          console.log(profile);
          logger.info(objectToString(profile));
          userStorage[chatId] = { order_id: userSession.order_id };

          userSessions.set(chatId, userSession);
          logger.info(userSession.locale, userSession.email, userSession.fio);

          if (userSession.locale && userSession.email && userSession.fio) {
            const addting = await new_order(
              chatId,
              userSession.order_id,
              userSession.name,
              userSession.size,
              userSession.price,
              userSession.locale,
              userSession.email,
              userSession.fio
            );

            logger.info(`Add to DB: ${objectToString(addting)}`);
            bot.editMessageCaption(
              `Yo ${msg.message.chat.first_name} проверь свои данные!\n\n` +
                `✌🏼 <b>Получатель: </b><i>${userSession.fio}</i>\n` +
                `🚚 <b>ПВЗ Boxberry: </b><i>${userSession.locale}</i>\n` +
                `✉️ <b>Email для отправки чека: </b><i>${userSession.email}</i>\n\n` +
                `👟 <b>Кроссовки <i>${selectedPhoto.name}</i></b>\n\n` +
                `🧵 <b>Характеристики:</b>\n\n` +
                `➖ <b>Цвет:</b> <i>${selectedPhoto.color}</i>\n` +
                `➖ <b>Материал:</b> <i>${selectedPhoto.material}</i>\n` +
                `➖ <b>Размер:</b> <i>${selectedPhoto.size} us</i>\n\n` +
                `💸 <b>Цена:</b> <code>${selectedPhoto.price}₽</code>\n\n` +
                `Yo <i>${msg.message.chat.first_name}</i>, перед тем как оплатить прочитай <i><b>📑 Договор оферты</b></i>\n`,

              {
                parse_mode: "HTML",
                chat_id: chatId,
                message_id: messageId,
                reply_markup: JSON.stringify({
                  inline_keyboard: [
                    [
                      {
                        text: "📑 Договор оферты",
                        url: "https://telegra.ph/Dogovor-oferty-na-okazanie-uslugi-11-27",
                      },
                    ],
                    [
                      {
                        text: `💸 Оплатить заказ #${userSession.order_id}`,
                        url: `https://stockhub12.ru/payanyway.php?orderId=${userSession.order_id}`,
                      },
                    ],
                    [
                      { text: "✅ Я оплатил", callback_data: "payment" },
                      {
                        text: "🧨 Отменить заказ",
                        callback_data: "cancel_order",
                      },
                    ],
                  ],
                }),
              }
            );
          } else {
            bot.sendMessage(
              chatId,
              `<i><b>✌🏼 Yo ${msg.message.chat.first_name}</b></i>, кажется ты не заполнил информацию о себе. Давай исправим!\n<i>После заполнения возвращайся!</i>`,
              {
                parse_mode: "HTML",
                reply_markup: JSON.stringify({
                  inline_keyboard: [
                    [{ text: "Заполнить профиль", callback_data: "profile" }],
                    [
                      {
                        text: "🏠 Выход в главное меню",
                        callback_data: "home",
                      },
                    ],
                  ],
                }),
              }
            );
          }
        }

        break;

      case "cancel_order":
        // bot.deleteMessage(chatId, messageId);

        const cancelOrder = await delOrder(userStorage[chatId].order_id);
        if (cancelOrder === true) {
          await start_update(bot, chatId, user_callBack, messageId);
          logger.info(
            objectToString(
              `Cancel order by ${msg.message.chat.username}: Order_id ${userStorage[chatId].order_id} - ${cancelOrder}`
            )
          );
        } else {
          logger.info(objectToString(cancelOrder));
        }
        break;

      case "payment":
        // tech(bot, chatId, msg.message.chat.username);

        if (userSession && userSession.photos) {
          ы;
          selectedPhoto = userSession.photos[userSession.currentIndex];
        } else {
          console.error("userSession or photos is undefined or null.");
        }

        const res = await check_payment(chatId);
        console.log(res);

        if (res == false) {
          bot.sendMessage(
            chatId,
            `<i><b>Yo ${msg.message.chat.first_name}</b></i>, кажется ты не оплачивал заказ ${userStorage[chatId].order_id}.`,
            {
              parse_mode: "HTML",
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [
                    {
                      text: "🏠 Выход в главное меню",
                      callback_data: "exit",
                    },
                  ],
                ],
              }),
            }
          );
        } else {
          bot.sendMessage(
            chatId,
            `🤑 Yo <b><i>${msg.message.chat.first_name}</i></b>, оплата прошла успешно. В скором времени тебе отправится чек на почту!\n` +
              `Так же в скором времени у тебя в профиле появится трек номер для отслеживания твоей посылки.\n\n`,
            {
              parse_mode: "HTML",
              reply_markup: JSON.stringify(keyboard),
            }
          );

          await createPDF();
          const fileStream = fs.createReadStream("output.csv");

          bot.sendPhoto(process.env.GROUP_ADMIN, selectedPhoto.path, {
            caption:
              `<b>🤑 Status</b>: <i> Новый оплаченный заказ</i>\n` +
              `@DreasTamyot новый заказ от ${msg.message.chat.first_name} (${chatId})\n\n` +
              `Кроссовки: <i>${selectedPhoto.name}</i>\n` +
              `Размер: <i>${selectedPhoto.size} us</i>\n` +
              `Цена: <i>${selectedPhoto.price}Р</i>\n\n` +
              `Тг ссылка на пользователя: <i><b>@${user_callBack}</b></i>`,
            parse_mode: "HTML",
          });
          bot.sendDocument(process.env.GROUP_ADMIN, fileStream);

          await update_bonus(selectedPhoto, chatId);
          logger.info(
            `User ${msg.message.chat.first_name} paid and update bonuses.`
          );
        }
        break;
    }
  });

  bot.on("text", async (msg) => {
    const chatId = msg.chat.id;
    const userText = msg.text;
    const messageId = msg.message_id;

    if (userStorage[chatId]) {
      const currentState = userStorage[chatId].state;

      switch (currentState) {
        case "articul":
          userStorage[chatId].articul = userText;

          const buff = await search_articul(userText);

          if (buff === false) {
            await bot.deleteMessage(chatId, messageId - 1);
            await bot.sendPhoto(chatId, await send_photo("logo"), {
              caption: `Yo <i><b>${msg.chat.first_name}</b></i>, я не смог найти такой артикул. Или данная пара уже находится в стадии оплаты.`,
              parse_mode: "HTML",
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [
                    {
                      text: "🏠 Выход в главное меню",
                      callback_data: "exit",
                    },
                  ],
                ],
              }),
            });
          } else {
            userStorage[chatId] = { photo: buff, currentIndex: 0 };
            selectedPhoto = userStorage[chatId].photo;

            logger.info(
              `Output articul by ${msg.chat.username}: ${objectToString(
                selectedPhoto
              )}`
            );
            await bot.deleteMessage(chatId, messageId - 1);
            await bot.sendPhoto(chatId, selectedPhoto[0].path, {
              caption:
                `👟 <b>Кроссовки <i>${selectedPhoto[0].name}</i></b>\n\n` +
                `🧵 <b>Характеристики:</b>\n\n` +
                `➖ <b>Цвет:</b> <i>${selectedPhoto[0].color}</i>\n` +
                `➖ <b>Материал:</b> <i>${selectedPhoto[0].material}</i>\n` +
                `➖ <b>Размер:</b> <i>${selectedPhoto[0].size} us</i>\n\n` +
                `💸 <b>Цена:</b> <code>${selectedPhoto[0].price}₽</code>\n\n`,
              parse_mode: "HTML",

              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [
                    {
                      text: "🛒 Заказать",
                      callback_data: "order",
                    },
                  ],
                  [
                    {
                      text: "🏠 Выход в главное меню",
                      callback_data: "exit",
                    },
                  ],
                ],
              }),
            });
          }
          break;

        case "awaitingAddress":
          userStorage[chatId].address = userText;

          if (userStorage[chatId].address.length > 0) {
            await add_location(chatId, userStorage[chatId].address);
          }
          delete userStorage[chatId];
          await profile(
            bot,
            chatId,
            userStorage,
            msg.chat.first_name,
            messageId - 1
          );
          break;

        case "awaitingEmail":
          userStorage[chatId].email = userText;

          if (userStorage[chatId].email.length > 0) {
            await add_email(chatId, userStorage[chatId].email);
          }
          delete userStorage[chatId];
          await profile(
            bot,
            chatId,
            userStorage,
            msg.chat.first_name,
            messageId - 1
          );
          break;

        case "awaitingFIO":
          userStorage[chatId].fio = userText;

          if (userStorage[chatId].fio.length > 0) {
            await add_fio(chatId, userStorage[chatId].fio);
          }
          delete userStorage[chatId];
          await profile(
            bot,
            chatId,
            userStorage,
            msg.chat.first_name,
            messageId - 1
          );
          break;

        case "brandChoice":
          userStorage[chatId].size = userText;

          const log = await addToOrder(
            userStorage[chatId].data,
            userStorage[chatId].size,
            chatId
          );
          const user = await get_userStyle(chatId);

          if (
            parseFloat(userStorage[chatId].size) &&
            log != false &&
            log != undefined &&
            log.some((log) => log.style === user[0].style)
          ) {
            const logMessage = `${userStorage[chatId].data}, size: ${
              userStorage[chatId].size
            }\nLog: ${objectToString(log)}\n\nUser: ${objectToString(user)}\n`;

            logger.info(logMessage);

            userSession = {
              size: userStorage[chatId].size,
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

            userStorage[chatId] = {
              photo: res,
              currentIndex: 0,
            };

            if (userStorage[chatId].photo.length > 0) {
              const currentIndex = userStorage[chatId].currentIndex;
              const firstPhoto = userStorage[chatId].photo[currentIndex];
              const totalPhotos = userStorage[chatId].photo.length;
              const showPrevButton = currentIndex > 0;

              await editCaptionShow(
                bot,
                chatId,
                userStorage[chatId],
                messageId - 1,
                currentIndex,
                firstPhoto,
                totalPhotos,
                showPrevButton
              );

              logger.info(
                `Size: ${userStorage[chatId].size} us for ${
                  msg.chat.first_name
                } of ${log[0].name}\n Gender: ${user[0].gender}\n Style: ${
                  user[0].style
                }\n. Success, Output: ${res.length}\n\n${objectToString(
                  res
                )}\n\n`
              );
            }
          } else {
            bot.deleteMessage(chatId, messageId - 1);
            bot.deleteMessage(chatId, messageId);
            userSession = {
              gender: user[0].gender,
            };
            if (userSession.gender === "man") {
              userSession.gender = "мужской";
            } else {
              userSession.gender = "женский";
            }
            logger.info(
              `${msg.chat.first_name} cant find ${userStorage[chatId].data} ${userStorage[chatId].size} us`
            );
            await bot.sendMessage(
              chatId,
              `☹️ <b>${msg.chat.first_name}</b>, я не смог найти ${userSession.gender} размер <b><i>${userStorage[chatId].size} us </i></b>бренд: <b><i>${userStorage[chatId].data}</i></b>.\n\n` +
                `<b>Но</b> не стоит расстраиваться, следи за апдейтами в нашей группе <i><b><a href="https://t.me/stockhub12">🌐 StockHub!</a></b></i>`,
              {
                reply_markup: JSON.stringify({
                  inline_keyboard: [
                    [{ text: "🏠 Выйти в главное меню", callback_data: "end" }],
                  ],
                }),
                parse_mode: "HTML",
              }
            );
          }
          break;
      }
    }
  });
};
