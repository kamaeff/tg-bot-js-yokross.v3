async function sendPhotoWithNavigation(
  bot,
  chatId,
  userSession,
  currentIndex,
  photo,
  totalPhotos,
  showPrevButton
) {
  const showNext = currentIndex + 1 < totalPhotos;
  await bot.sendPhoto(chatId, photo.path, {
    caption:
      `👟 <b>Кроссовки <i>${photo.name}</i>\n<b>🔎 Articul:</b> <code>${photo.articul}</code></b>\n\n` +
      `🧵 <b>Характеристики:</b>\n\n` +
      `➖ <b>Пол:</b> <i>${photo.gender}</i>\n` +
      `➖ <b>Цвет:</b> <i>${photo.color}</i>\n` +
      `➖ <b>Материал:</b> <i>${photo.material}</i>\n` +
      `➖ <b>Размер:</b> <i>${photo.size} us</i>\n\n` +
      `💸 <b>Цена:</b> <code>${photo.price}₽</code>`,
    parse_mode: "HTML",
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: showPrevButton ? "<<" : "", callback_data: "prev_photo" },
          {
            text: `${currentIndex + 1}/${totalPhotos}`,
            callback_data: "dummy",
          },
          { text: showNext ? ">>" : "", callback_data: "next_photo" },
        ],
        [
          { text: "🇷🇺 Заказ по России", callback_data: "order" },
          //{ text: "🛒 Заказ по МСК", callback_data: "order_msk" },
        ],
        [{ text: "🏠 Выход в главное меню", callback_data: "exit" }],
      ],
    }),
  });
}

module.exports = {
  sendPhotoWithNavigation,
};
