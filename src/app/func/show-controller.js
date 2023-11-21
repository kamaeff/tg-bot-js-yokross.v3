const { keyboard } = require('./btns')
const { sendPhotoWithNavigation } = require('./carusel')

async function showmenu(
  photosWithDescriptions,
  bot,
  chatId,
  userSession,
  userSessions
) {
  if (photosWithDescriptions === false) {
    bot.sendMessage(
      chatId,
      `✌🏼 Yo <i><b>${msg.message.chat.first_name}</b></i>, идет обновление каталога пар, извини за недоразумение. Скоро пофиксим!`,
      {
        parse_mode: 'HTML',
        reply_markup: JSON.stringify(keyboard),
      }
    )
  } else {
    if (!userSession) {
      userSession = {
        photos: photosWithDescriptions,
        currentIndex: 0,
      }
      userSessions.set(chatId, userSession)
    } else {
      userSession.photos = photosWithDescriptions
      userSession.currentIndex = 0
    }

    if (userSession.photos.length > 0) {
      const currentIndex = userSession.currentIndex
      const firstPhoto = userSession.photos[currentIndex]
      const totalPhotos = userSession.photos.length
      const showPrevButton = currentIndex > 0

      await sendPhotoWithNavigation(
        bot,
        chatId,
        userSession,
        currentIndex,
        firstPhoto,
        totalPhotos,
        showPrevButton
      )
    }
  }
}

async function next_photo(bot, chatId, userSession, userSessions) {
  if (userSession && userSession.photos.length > 0) {
    const currentIndex = userSession.currentIndex
    const nextIndex = currentIndex + 1

    if (nextIndex < userSession.photos.length) {
      const nextPhoto = userSession.photos[nextIndex]
      const totalPhotos = userSession.photos.length

      await sendPhotoWithNavigation(
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

async function prev_photo(bot, chatId, userSession, userSessions) {
  if (userSession && userSession.photos.length > 0) {
    const currentIndex = userSession.currentIndex
    const prevIndex = currentIndex - 1

    if (prevIndex >= 0) {
      const prevPhoto = userSession.photos[prevIndex]
      const totalPhotos = userSession.photos.length
      const showPrevButton = prevIndex > 0

      await sendPhotoWithNavigation(
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
  showmenu,
  next_photo,
  prev_photo,
}
