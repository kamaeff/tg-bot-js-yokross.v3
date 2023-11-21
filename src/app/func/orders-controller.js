const { chatOptions_profile } = require('./btns')
const { Photo_orders } = require('./carusel')

async function showorders(bot, orders, chatId, userSession, userSessions, msg) {
  if (orders === false) {
    bot.sendMessage(
      chatId,
      `✌🏼 Yo ${msg.message.chat.first_name}, ты еще не сделал ни одного заказа!\n\n` +
        `Ты можешь выбрать кроссовки в <i><b>⚡️ Show Room</b></i> или найти пару по фильтру <i><b>🔎 Поиск пары</b></i>`,
      {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify(chatOptions_profile),
      }
    )
  } else {
    userSession = {
      photos: orders,
      currentIndex: 0,
    }
    userSessions.set(chatId, userSession)

    if (userSession.photos.length > 0) {
      const currentIndex = userSession.currentIndex
      const currentPhoto = userSession.photos[currentIndex]
      const totalPhotos = userSession.photos.length
      const showPrevButton = currentIndex > 0
      const showNextButton = currentIndex < totalPhotos - 1

      bot.sendPhoto(chatId, currentPhoto.path, {
        caption:
          `👟 <b>Кроссовки ${currentPhoto.name}</b>\n\n` +
          `🧵 <b>Характеристики:</b>\n\n` +
          `➖ <b>Цвет:</b> <i>${currentPhoto.color}</i>\n` +
          `➖ <b>Материал:</b> <i>${currentPhoto.material}</i>\n` +
          `➖ <b>Размер:</b> <i>${currentPhoto.size} us</i>\n\n` +
          `💸 <b>Цена:</b> <code>${currentPhoto.price}₽</code>`,
        parse_mode: 'HTML',
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: showPrevButton ? '<<' : '',
                callback_data: 'prev_photo_o',
              },
              {
                text: `${currentIndex + 1}/${totalPhotos}`,
                callback_data: 'dummy',
              },
              {
                text: showNextButton ? '>>' : '',
                callback_data: 'next_photo_o',
              },
            ],
            [{ text: '🏠 Выход в главное меню', callback_data: 'home' }],
          ],
        }),
      })
    }
  }
}

async function next_photo_o(bot, userSession, userSessions, chatId) {
  if (userSession && userSession.photos.length > 0) {
    const currentIndex = userSession.currentIndex
    const nextIndex = currentIndex + 1

    if (nextIndex < userSession.photos.length) {
      const nextPhoto = userSession.photos[nextIndex]
      const totalPhotos = userSession.photos.length

      await Photo_orders(
        bot,
        chatId,
        userSession,
        nextIndex,
        nextPhoto,
        totalPhotos,
        true
      )

      userSession.currentIndex = nextIndex
      userSessions.set(chatId, userSession)
    }
  }
}

async function prev_photo_o(bot, chatId, userSession, userSessions) {
  if (userSession && userSession.photos.length > 0) {
    const currentIndex = userSession.currentIndex
    const prevIndex = currentIndex - 1

    if (prevIndex >= 0) {
      const prevPhoto = userSession.photos[prevIndex]
      const totalPhotos = userSession.photos.length
      const showPrevButton = prevIndex > 0

      await Photo_orders(
        bot,
        chatId,
        userSession,
        prevIndex,
        prevPhoto,
        totalPhotos,
        showPrevButton
      )
      userSession.currentIndex = prevIndex
      userSessions.set(chatId, userSession)
    }
  }
}

module.exports = {
  showorders,
  next_photo_o,
  prev_photo_o,
}
