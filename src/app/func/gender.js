const { gender } = require('./btns')

async function gender_choose(bot, msg, chatId) {
  await bot.sendMessage(
    chatId,
    `<b>${msg.message.chat.first_name}</b> для кого будем искать?`,
    {
      parse_mode: 'HTML',
      reply_markup: JSON.stringify(gender),
    }
  )
}

module.exports = {
  gender_choose,
}
