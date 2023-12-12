const { chatOptions_profile } = require("./btns");

const { get_order_id } = require("../DB/db");

async function showorders(bot, orders, chatId, userStorage, msg) {
  if (orders === false) {
  } else {
    userStorage[chatId] = {
      photos: orders,
      currentIndex: 0,
    };

    const get_order = await get_order_id(
      chatId,
      userStorage[chatId].photos[userStorage[chatId].currentIndex].name
    );
    console.log(get_order);

    if (userStorage[chatId].photos.length > 0) {
      const currentIndex = userStorage[chatId].currentIndex;
      const currentPhoto = userStorage[chatId].photos[currentIndex];
      const totalPhotos = userStorage[chatId].photos.length;
      const showPrevButton = currentIndex > 0;
      const showNextButton = currentIndex < totalPhotos - 1;

      bot.editMessageMedia(
        {
          type: "photo",
          media: currentPhoto.path,
          caption:
            `👟 <b>Кроссовки ${currentPhoto.name}</b>\n` +
            `${
              get_order === false
                ? "\n"
                : `<i>Зкакз: ${get_order[0].order_id}</i>\n\n`
            }` +
            `➖ <b>Цвет:</b> <i>${currentPhoto.color}</i>\n` +
            `➖ <b>Материал:</b> <i>${currentPhoto.material}</i>\n` +
            `➖ <b>Размер:</b> <i>${currentPhoto.size} us</i>\n\n` +
            `💸 <b>Цена:</b> <code>${currentPhoto.price}₽</code>\n\n` +
            `${
              get_order == false
                ? ""
                : `<i><b>🚚 Код отслеживания:</b> <code>${get_order[0].track_value}</code></i>`
            }`,
          parse_mode: "HTML",
        },
        {
          chat_id: chatId,
          message_id: msg,
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: showPrevButton ? "<<" : "",
                  callback_data: "prev_photo_o",
                },
                {
                  text: `${currentIndex + 1}/${totalPhotos}`,
                  callback_data: "dummy",
                },
                {
                  text: showNextButton ? ">>" : "",
                  callback_data: "next_photo_o",
                },
              ],
              [{ text: "🏠 Выход в главное меню", callback_data: "exit" }],
            ],
          }),
        }
      );
    }
  }
}

async function Photo_orders(
  bot,
  chatId,
  userSession,
  currentIndex,
  photo,
  totalPhotos,
  showPrevButton,
  get_order
) {
  const showNext = currentIndex + 1 < totalPhotos;
  await bot.sendPhoto(chatId, photo.path, {
    caption:
      `👟 <b>Кроссовки ${photo.name}</b>\n\n` +
      `${
        get_order === false
          ? "\n"
          : `<i>Зкакз: ${get_order[currentIndex].order_id}</i>\n\n`
      }` +
      `🧵 <b>Характеристики:</b>\n\n` +
      `➖ <b>Цвет:</b> <i>${photo.color}</i>\n` +
      `➖ <b>Материал:</b> <i>${photo.material}</i>\n` +
      `➖ <b>Размер:</b> <i>${photo.size} us</i>\n\n` +
      `💸 <b>Цена:</b> <code>${photo.price}₽</code>` +
      `${
        get_order == false
          ? ""
          : `<i><b>🚚 Код отслеживания:</b> <code>${get_order[currentIndex].track_value}</code></i>`
      }`,
    parse_mode: "HTML",
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: showPrevButton ? "<<" : "", callback_data: "prev_photo_o" },
          {
            text: `${currentIndex + 1}/${totalPhotos}`,
            callback_data: "dummy",
          },
          { text: showNext ? ">>" : "", callback_data: "next_photo_o" },
        ],
        [{ text: "🏠 Выход в главное меню", callback_data: "exit" }],
      ],
    }),
  });
}

async function next_photo_o(bot, userStorage, chatId) {
  if (userStorage[chatId]) {
    const currentIndex = userStorage[chatId].currentIndex;
    const nextIndex = currentIndex + 1;

    const get_order = await get_order_id(
      chatId,
      userStorage[chatId].photos[nextIndex].name
    );
    console.log(get_order);

    if (nextIndex < userStorage[chatId].photos.length) {
      const nextPhoto = userStorage[chatId].photos[nextIndex];
      const totalPhotos = userStorage[chatId].photos.length;

      await Photo_orders(
        bot,
        chatId,
        userStorage,
        nextIndex,
        nextPhoto,
        totalPhotos,
        true,
        get_order
      );

      userStorage.currentIndex = nextIndex;
    }
  } else {
    console.log("no more photos");
  }
}

async function prev_photo_o(bot, chatId, userStorage) {
  if (userStorage[chatId]) {
    const currentIndex = userStorage[chatId].currentIndex;
    const prevIndex = currentIndex;

    const get_order = await get_order_id(
      chatId,
      userStorage[chatId].photos[prevIndex].name
    );
    console.log(get_order);

    if (prevIndex >= 0) {
      const prevPhoto = userStorage[chatId].photos[prevIndex];
      const totalPhotos = userStorage[chatId].photos.length;
      const showPrevButton = prevIndex > 0;

      await Photo_orders(
        bot,
        chatId,
        userStorage,
        prevIndex,
        prevPhoto,
        totalPhotos,
        showPrevButton,
        get_order
      );
      userStorage[chatId].currentIndex = prevIndex;
    }
  } else {
    console.log("no more photos");
  }
}

module.exports = {
  showorders,
  next_photo_o,
  prev_photo_o,
};
