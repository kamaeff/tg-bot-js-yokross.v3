const { keyboard } = require("./btns");
const { sendPhotoWithNavigation } = require("./carusel");

async function showmenu(photosWithDescriptions, bot, chatId, userStorage) {}

async function next_photo(bot, chatId, userStorage) {
  if (userStorage[chatId] && userStorage[chatId].photo.length > 0) {
    const currentIndex = userStorage[chatId].currentIndex;
    const nextIndex = currentIndex + 1;

    if (nextIndex < userStorage[chatId].photo.length) {
      const nextPhoto = userStorage[chatId].photo[nextIndex];
      const totalPhotos = userStorage[chatId].photo.length;

      await sendPhotoWithNavigation(
        bot,
        chatId,
        userStorage,
        nextIndex,
        nextPhoto,
        totalPhotos,
        true
      );

      userStorage[chatId].currentIndex = nextIndex;
    }
  }
}

async function prev_photo(bot, chatId, userStorage) {
  if (userStorage && userStorage[chatId].photo.length > 0) {
    const currentIndex = userStorage[chatId].currentIndex;
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      const prevPhoto = userStorage[chatId].photo[prevIndex];
      const totalPhotos = userStorage[chatId].photo.length;
      const showPrevButton = prevIndex > 0;

      await sendPhotoWithNavigation(
        bot,
        chatId,
        userStorage,
        prevIndex,
        prevPhoto,
        totalPhotos,
        showPrevButton
      );
      userStorage[chatId].currentIndex = prevIndex;
    }
  }
}

module.exports = {
  showmenu,
  next_photo,
  prev_photo,
};
