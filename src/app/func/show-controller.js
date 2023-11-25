const { keyboard } = require('./btns')
const { sendPhotoWithNavigation } = require('./carusel')

async function showmenu(
  photosWithDescriptions,
  bot,
  chatId,
  userSession,
  userSessions
) {
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
