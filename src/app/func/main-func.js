const { admin_btns } = require('./btns')
const { send_photo, add_user, getProfile } = require('../DB/db')

async function start(bot, chatId, username) {
	chatId = chatId.toString()
	await bot.sendPhoto(chatId, './src/app/img/Logo.png', {
		caption:
			`<b>✌🏻 Yo ${username}! Я бот группы <i><b><a href="https://t.me/stockhub12">StockHub!</a></b></i></b>\n\n` +
			`⚙️ <b>Кнопки основного меню:</b>\n\n` +
			`➖ <b>Поиск пары</b> - <i>Фильтр поиска пары</i>\n` +
			`➖ <b>ShowRoom</b> - <i>Коллекция магазина</i>\n` +
			`➖ <b>Мой профиль</b> - <i>Инфа о твоем профиле</i>\n` +
			`➖ <b>Обратная связь</b> - <i>help@stockhub12.ru</i>\n\n` +
			`<b><i>💬 Полезное:</i></b> \n` +
			`<i><b><a href="https://telegra.ph/Dogovor-oferty-na-okazanie-uslugi-11-27">➖ Договор оферты</a></b></i>\n` +
			`<i><b><a href="https://telegra.ph/Instrukciya-po-ispolzovaniyu-StockHubBot-12-13">➖ Инструкция использования</a></b></i>\n` +
			`➖ /commands <i>(Дополнительные команды)</i>\n\n` +
			`<i><b>Created by: </b><b><a href="https://t.me/kamaev_log">Anton Kamaev</a></b>.\n<b>Alfa-version.v3</b></i>`,
		parse_mode: 'HTML',
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[
					{ text: '🔎 Поиск пары', callback_data: 'choose' },
					{ text: '⚡️ ShowRoom', callback_data: 'show' },
				],
				[{ text: '📝 Поиск по артиклу', callback_data: 'articul' }],
				[{ text: '✌🏻 Мой профиль', callback_data: 'profile' }],
			],
		}),
	})
}

async function start_update(bot, chatId, username, messageid) {
	await bot.editMessageMedia(
		{
			type: 'photo',
			media: await send_photo('logo'),
			caption:
				`<b>✌🏻 Yo ${username}! Я бот группы <i><b><a href="https://t.me/stockhub12">StockHub!</a></b></i></b>\n\n` +
				`⚙️ <b>Кнопки основного меню:</b>\n\n` +
				`➖ <b>Поиск пары</b> - <i>Фильтр поиска пары</i>\n` +
				`➖ <b>ShowRoom</b> - <i>Коллекция магазина</i>\n` +
				`➖ <b>Мой профиль</b> - <i>Инфа о твоем профиле</i>\n` +
				`➖ <b>Обратная связь</b> - <i>help@stockhub12.ru</i>\n\n` +
				`<b><i>💬 Полезное:</i></b> \n` +
				`<i><b><a href="https://telegra.ph/Dogovor-oferty-na-okazanie-uslugi-11-27">➖ Договор оферты</a></b></i>\n` +
				`<i><b><a href="https://telegra.ph/Instrukciya-po-ispolzovaniyu-StockHubBot-12-13">➖ Инструкция использования</a></b></i>\n` +
				`➖ /commands <i>(Дополнительные команды)</i>\n\n` +
				`<i><b>Created by: </b><b><a href="https://t.me/kamaev_log">Anton Kamaev</a></b>.\n<b>Beta-version(stable).v1</b></i>`,
			parse_mode: 'HTML',
		},

		{
			chat_id: chatId,
			message_id: messageid,

			reply_markup: JSON.stringify({
				inline_keyboard: [
					[
						{ text: '🔎 Поиск пары', callback_data: 'choose' },
						{ text: '⚡️ ShowRoom', callback_data: 'show' },
					],
					[{ text: '📝 Поиск по артиклу', callback_data: 'articul' }],
					[{ text: '✌🏻 Мой профиль', callback_data: 'profile' }],
				],
			}),
		}
	)
}

async function profile_push(bot, chatId, userStorage, username) {
	const profileData = await getProfile(chatId)
	if (profileData.length > 0) {
		const profile = profileData[0]
		userStorage[chatId] = {
			orders: profile.orders,
			locale: profile.locale,
			bonuses: profile.bonus,
			email: profile.email,
			fio: profile.fio,
		}

		const chat_id = chatId.toString()
		const chat =
			chat_id === process.env.GROUP_ADMIN ||
			chat_id === process.env.ADMIN_ID ||
			chat_id === process.env.LOGIST ||
			chat_id === process.env.SERVIRCE_ID

		await bot.sendPhoto(chatId, './src/app/img/Logo.png', {
			caption:
				`📈 <b>Вот твоя стата ${username}:</b>\n\n` +
				`● <b>ФИО:</b> <i>${
					userStorage[chatId].fio.length === 0
						? ` 🚫 <i><b>Не заполнено!</b></i>`
						: userStorage[chatId].fio
				}</i>\n` +
				`● <b>Всего заказов сделано:</b> <i>${userStorage[chatId].orders}</i>\n` +
				`● <b>Бонусы:</b> <i>${userStorage[chatId].bonuses}</i>\n` +
				`● <b>Адрес доставки:</b> <i>${
					userStorage[chatId].locale.length === 0
						? ` 🚫 <i><b>Не заполнено!</b></i>`
						: userStorage[chatId].locale
				}</i>\n` +
				`● <b>Email:</b> <i>${
					userStorage[chatId].email.length === 0
						? ` 🚫 <i><b>Не заполнено!</b></i>`
						: userStorage[chatId].email
				}</i>\n\n` +
				`<i><b>P.S</b> Email, Адрес ПВЗ и ФИО нужны для формирования заказа</i>\n\n<i>Доставка по Москве возможна нашим курьром. Стоимость доставки в пределах МКАД составит 500 рублей, за пределами МКАД 800 рублей. Также возможна доставка в ПВЗ Боксберри.</i>`,
			parse_mode: 'HTML',
			reply_markup: JSON.stringify({
				inline_keyboard: [
					[
						{
							text: '⏳ История заказов',
							callback_data: 'data_orders',
						},
						{
							text: '📦 Обновить адрес',
							callback_data: 'locale',
						},
					],
					[
						{
							text:
								userStorage[chatId].email.length === 0
									? '✉️ Заполнить email'
									: '',
							callback_data: 'email',
						},
					],
					[
						{
							text:
								userStorage[chatId].fio.length === 0 ? '👤 Заполнить ФИО' : '',
							callback_data: 'fio',
						},
					],
					[
						{
							text: chat ? '📑 Админка' : '',
							callback_data: 'admin',
						},
					],
					[
						{
							text: '🏠 Главное меню',
							callback_data: 'exit',
						},
					],
				],
			}),
		})
	}
}

async function profile(bot, chatId, userStorage, username, messageid) {
	const profileData = await getProfile(chatId)
	if (profileData.length > 0) {
		const profile = profileData[0]
		userStorage[chatId] = {
			orders: profile.orders,
			locale: profile.locale,
			bonuses: profile.bonus,
			email: profile.email,
			fio: profile.fio,
		}

		const chat_id = chatId.toString()
		const chat =
			chat_id === process.env.GROUP_ADMIN ||
			chat_id === process.env.ADMIN_ID ||
			chat_id === process.env.LOGIST ||
			chat_id === process.env.SERVIRCE_ID

		await bot.editMessageCaption(
			`📈 <b>Вот твоя стата ${username}:</b>\n\n` +
				`● <b>ФИО:</b> <i>${
					userStorage[chatId].fio.length === 0
						? ` 🚫 <i><b>Не заполнено!</b></i>`
						: userStorage[chatId].fio
				}</i>\n` +
				`● <b>Всего заказов сделано:</b> <i>${userStorage[chatId].orders}</i>\n` +
				`● <b>Бонусы:</b> <i>${userStorage[chatId].bonuses}</i>\n` +
				`● <b>Адрес доставки:</b> <i>${
					userStorage[chatId].locale.length === 0
						? ` 🚫 <i><b>Не заполнено!</b></i>`
						: userStorage[chatId].locale
				}</i>\n` +
				`● <b>Email:</b> <i>${
					userStorage[chatId].email.length === 0
						? ` 🚫 <i><b>Не заполнено!</b></i>`
						: userStorage[chatId].email
				}</i>\n\n` +
				`<i><b>P.S</b> Email, Адрес ПВЗ и ФИО нужны для формирования заказа</i>\n\n<i>Доставка по Москве возможна нашим курьром. Стоимость доставки в пределах МКАД составит 500 рублей, за пределами МКАД 800 рублей. Также возможна доставка в ПВЗ Боксберри.</i>`,
			{
				chat_id: chatId,
				message_id: messageid,
				parse_mode: 'HTML',
				reply_markup: JSON.stringify({
					inline_keyboard: [
						[
							{
								text: '⏳ История заказов',
								callback_data: 'data_orders',
							},
							{
								text: '📦 Обновить адрес',
								callback_data: 'locale',
							},
						],
						[
							{
								text:
									userStorage[chatId].email.length === 0
										? '✉️ Заполнить email'
										: '',
								callback_data: 'email',
							},
						],
						[
							{
								text:
									userStorage[chatId].fio.length === 0
										? '👤 Заполнить ФИО'
										: '',
								callback_data: 'fio',
							},
						],
						[
							{
								text: chat ? '📑 Админка' : '',
								callback_data: 'admin',
							},
						],
						[
							{
								text: '🏠 Главное меню',
								callback_data: 'exit',
							},
						],
					],
				}),
			}
		)
	}
}

async function start_admin(bot, chatId) {
	await bot.sendMessage(
		chatId,
		`<b><i>✌🏻 Yo AdminPanel</i></b>\n\n` +
			`<i><b>Created by: </b>Anton Kamaev\n@yokross_bot Alfa-version(v3)</i>`,
		{
			parse_mode: 'HTML',
			reply_markup: JSON.stringify(admin_btns),
		}
	)
}

async function tech(bot, chatId, username) {
	await bot.sendPhoto(chatId, await send_photo('tech'), {
		caption:
			`❗️ <b>${username}</b>, данный раздел сейчас в разработке ❗️\n\n` +
			`🥺 Кому интересно, буду делиться своими мыслями и апдейтами вот тут ---> <b><a href="https://t.me/kamaev_log">YoKrossBot.log.</a></b>`,
		parse_mode: 'HTML',
		reply_markup: JSON.stringify({
			inline_keyboard: [[{ text: '🏠 Главное меню', callback_data: 'exit' }]],
		}),
	})
}

async function check_folow(YokrossId, chatId, bot, username, messageid) {
	console.log(YokrossId, chatId, username)
	try {
		const chatMember = await bot.getChatMember(YokrossId, chatId)
		console.log(chatMember)
		await add_user(chatId, username)
		const check_data =
			chatMember &&
			(chatMember.status === 'member' ||
				chatMember.status === 'creator' ||
				chatMember.status === 'administrator')

		if (check_data) {
			return true
		} else {
			await bot.deleteMessage(chatId, messageid)
			await bot.sendPhoto(chatId, await send_photo('logo'), {
				caption:
					`✌🏼 Yo <i><b>${username}</b></i>, я помогу подобрать тебе кроссовки, чтобы воспользоваться моими функциями, подпишись на нашу группу <b><i><a href='https://t.me/stockhub12'>StockHub</a></i></b> !` +
					`\n\nТак же обязательно прочитай <b><i><a href='https://telegra.ph/Dogovor-oferty-na-okazanie-uslugi-11-27'>Договор оферты</a></i></b> !\n\n` +
					`После выполнения всех требований --> <i><b>Я прочитал и подписался</b></i>\n\n`,
				parse_mode: 'HTML',
				reply_markup: JSON.stringify({
					inline_keyboard: [
						[{ text: '🌐 StockHub', url: 'https://t.me/stockhub12' }],
						[
							{
								text: '📑 Договор оферты',
								url: 'https://telegra.ph/Dogovor-oferty-na-okazanie-uslugi-11-27',
							},
						],
						[
							{
								text: '✅ Я прочитал и подписался',
								callback_data: 'end',
							},
						],
					],
				}),
			})
			return false
		}
	} catch (error) {
		console.error('Error in check_folow:', error)
		return false
	}
}

module.exports = {
	start,
	tech,
	start_admin,
	check_folow,
	start_update,
	profile,
	profile_push,
}
