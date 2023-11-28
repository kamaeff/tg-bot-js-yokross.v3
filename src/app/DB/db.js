const moment = require("moment");
const mysql = require("mysql2/promise");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function createConnection() {
  return await mysql.createConnection({
    port: process.env.PORT,
    user: "gen_user",
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
  });
}

async function testDatabaseConnection() {
  try {
    const connection = await mysql.createConnection({
      port: process.env.PORT,
      user: "gen_user",
      host: process.env.HOST,
      database: process.env.DATABASE,
      password: process.env.PASSWORD,
    });

    console.log("Успешное подключение к базе данных");
    await connection.end();
  } catch (error) {
    console.error("Ошибка подключения к базе данных:", error);
  }
}

async function add_user(user_Id, user_Name) {
  user_Id = user_Id.toString();
  let res = "";
  try {
    const connection = await createConnection();

    const formattedDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
    const newUser = {
      chat_id: user_Id,
      username: user_Name,
      orders_count: 0,
      data_reg: formattedDateTime,
    };

    const [existingUser] = await connection.execute(
      "SELECT * FROM users WHERE chat_id = ?",
      [newUser.chat_id]
    );

    if (!existingUser.length) {
      const [result] = await connection.execute(
        "INSERT INTO users (chat_id, username, orders_count, data_reg) VALUES (?, ?, ?, ?)",
        [
          newUser.chat_id,
          newUser.username,
          newUser.orders_count,
          newUser.data_reg,
        ]
      );
      res = `${newUser.username} was add to database`;
    } else {
      res = `${newUser.username} already exist`;
    }

    await connection.end();
    return res;
  } catch (error) {
    res = `${newUser.username} error`;
    console.error(errorMessage);
  }
}

async function getProfile(chatId) {
  const connection = await createConnection();
  chatId = chatId.toString();
  const [rows, fields] = await connection.execute(
    "SELECT orders_count, bonus_count, locale, email, FIO FROM users WHERE chat_id = ?",
    [chatId]
  );
  const res = rows.map((row) => ({
    orders: row.orders_count,
    bonus: row.bonus_count,
    locale: row.locale,
    email: row.email,
    fio: row.FIO,
  }));
  return res;
}

async function add_style(chatId, style) {
  const connection = await createConnection();
  chatId = chatId.toString();

  try {
    const [rows] = await connection.execute(
      "UPDATE users SET style = ? WHERE chat_id = ?",
      [style, chatId]
    );

    if (rows.affectedRows > 0) {
      console.log("Успешно обновлено");
    } else {
      console.log("Нет соответствующих записей для обновления");
    }
  } catch (error) {
    console.error("Произошла ошибка:", error);
    throw error;
  } finally {
    connection.end();
  }
}

// For static photos
async function send_photo(photoName) {
  const connection = await createConnection();

  try {
    const [rows] = await connection.execute(
      "SELECT photo_path FROM photoStatic WHERE name = ?",
      [photoName]
    );

    if (rows.length > 0) {
      return rows[0].photo_path;
    } else {
      console.log(`Ошибка вывода ${photoName}`);
      return null;
    }
  } catch (error) {
    console.error("Произошла ошибка:", error);
    throw error;
  } finally {
    connection.end();
  }
}

async function send_dynamic_add_photo() {
  const connection = await createConnection();

  try {
    const [rows] = await connection.execute(
      "SELECT photo_path, material,price,name,size,color, gender_option FROM Updates WHERE flag_order = ?",
      [0]
    );
    if (rows.length > 0) {
      const photosWithDescriptions = rows.map((row) => ({
        path: row.photo_path,
        material: row.material,
        price: row.price,
        name: row.name,
        size: row.size,
        color: row.color,
        gender: row.gender_option,
      }));

      return photosWithDescriptions;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Произошла ошибка:", error);
  } finally {
    connection.end();
  }
}

async function select_photo(selectedPhoto) {
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute(
      "UPDATE Updates SET flag_order = ? WHERE photo_path = ?",
      ["1", selectedPhoto.path]
    );

    if (rows.affectedRows > 0) {
      console.log("Успешно обновлено");
    } else {
      console.log("Нет соответствующих записей для обновления");
    }
  } catch (error) {
    console.error("Ошибка при обновлении:", error);
  } finally {
    connection.end();
  }
}

async function addToOrder(data, size, chat_id) {
  const connection = await createConnection();

  try {
    const [rows] = await connection.execute(
      "SELECT name_shooes, gender_option FROM Updates WHERE name_shooes = ? AND size = ?",
      [data, size]
    );
    const [user_gender] = await connection.execute(
      "SELECT gender_option FROM users WHERE chat_id = ?",
      [chat_id]
    );

    if (rows[0].gender_option === user_gender[0].gender_option) {
      const log = rows.map((row) => ({
        name: row.name_shooes,
        gender: row.gender_option,
      }));
      return log;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Произошла ошибка:", error);
  } finally {
    connection.end();
  }
}

async function new_order(
  chat_id,
  order_id,
  name_shooes,
  size,
  price,
  address,
  email,
  fio
) {
  const connection = await createConnection();
  chat_id = chat_id.toString();
  try {
    await connection.execute(
      "INSERT INTO orders (chat_id, order_id, order_status, adress, FIO, name_kross, size, price, ordered, email) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [
        chat_id,
        order_id,
        "Не оплачено",
        address,
        fio,
        name_shooes,
        size,
        price,
        "Ожидание оплаты",
        email,
      ]
    );
    return true;
  } catch (error) {
    console.error("Произошла ошибка:", error);
  } finally {
    connection.end();
  }
}

async function delOrder(chat_id, name) {
  console.log(chat_id);
  const connection = await createConnection();
  try {
    await connection.execute(
      "UPDATE Updates SET flag_order = ? WHERE name = ?",
      [0, name]
    );
    console.log(`Отмена заказа`);
    await connection.execute("DELETE FROM orders WHERE order_id = ?", [
      chat_id,
    ]);
  } catch (error) {
    console.error("Произошла ошибка:", error);
  } finally {
    connection.end();
  }
}

async function add_gender(chat_id, gender) {
  const connection = await createConnection();
  chat_id = chat_id.toString();
  try {
    const [check] = await connection.execute(
      "SELECT gender_option FROM users WHERE chat_id = ?",
      [chat_id]
    );

    if (check.length === 0 || !check[0].gender_option) {
      console.log("Колонка gender_option пуста.");
      await connection.execute(
        "UPDATE users SET gender_option = ? WHERE chat_id = ?",
        [gender, chat_id]
      );
    } else {
      console.log("не пусто");
      await connection.execute(
        "UPDATE users SET gender_option = ? WHERE chat_id = ?",
        [gender, chat_id]
      );
    }
  } catch (error) {
    console.error("Произошла ошибка:", error);
  } finally {
    connection.end();
  }
}

async function get_gender(name_shooes, size, style, gender) {
  const connection = await createConnection();
  try {
    const [res] = await connection.execute(
      "SELECT photo_path, material,price,name,size,color,gender_option, style FROM Updates WHERE gender_option = ? AND size = ? AND style = ? AND name_shooes = ?",
      [gender, size, style, name_shooes]
    );
    const resault = res.map((row) => ({
      path: row.photo_path,
      material: row.material,
      price: row.price,
      name: row.name,
      size: row.size,
      color: row.color,
      gender: row.gender_option,
      style: row.style,
    }));
    if (resault == []) {
      return false;
    } else {
      return resault;
    }
  } catch (error) {
    console.error("Произошла ошибка:", error);
  } finally {
    connection.end();
  }
}

async function get_userStyle(chatId) {
  const connection = await createConnection();
  chatId = chatId.toString();

  const [res] = await connection.execute(
    "SELECT style, gender_option FROM users WHERE chat_id = ?",
    [chatId]
  );
  const resault = res.map((row) => ({
    style: row.style,
    gender: row.gender_option,
  }));
  return resault;
}

const csvWriter = createCsvWriter({
  path: "output.csv",
  header: [
    { id: "chat_id", title: "Chat ID" },
    { id: "order_id", title: "Order ID" },
    { id: "order_status", title: "Order Status" },
    { id: "adress", title: "Address" },
    { id: "name", title: "Name" },
    { id: "name_kross", title: "Cross Name" },
    { id: "size", title: "Size" },
    { id: "price", title: "Price" },
    { id: "ordered", title: "Ordered" },
    { id: "email", title: "Email" },
  ],
});
async function createPDF() {
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM orders");

    await csvWriter.writeRecords(rows);
    console.log("CSV файл успешно создан");
  } catch (error) {
    console.error("Ошибка: ", error);
  } finally {
    connection.end();
  }
}

async function past_orders(chat_id) {
  chat_id = chat_id.toString();
  const connection = await createConnection();
  const [res] = await connection.execute(
    "SELECT name_kross FROM orders WHERE chat_id = ? AND ordered = ?",
    [chat_id, "Доставлено"]
  );

  const resultArray = [];

  for (const order of res) {
    const [shooes] = await connection.execute(
      "SELECT photo_path, material, price, name, size, color FROM Updates WHERE name = ?",
      [order.name_kross]
    );

    if (shooes.length > 0) {
      const result = shooes.map((row) => ({
        path: row.photo_path,
        material: row.material,
        price: row.price,
        name: row.name,
        size: row.size,
        color: row.color,
      }));
      resultArray.push(...result);
    }
  }

  if (resultArray.length > 0) {
    return resultArray;
  } else {
    return false;
  }
}

async function update_bonus(selectedPhoto, chat_id) {
  const connection = await createConnection();
  const [rows] = await connection.execute(
    "SELECT price FROM Updates WHERE name = ?",
    [selectedPhoto.name]
  );
  const [user] = await connection.execute(
    "SELECT orders_count, bonus_count FROM users WHERE chat_id = ?",
    [chat_id]
  );
  await connection.execute(
    "UPDATE orders SET order_status = ? WHERE name_kross = ?",
    ["Оплачено", selectedPhoto.name]
  );

  let bonus = user[0].bonus_count + (rows[0].price / 100) * 3;
  let orders_count = user[0].orders_count + 1;

  await connection.execute(
    "UPDATE users SET bonus_count = ?, orders_count = ? WHERE chat_id = ?",
    [bonus, orders_count, chat_id]
  );
  orders_count = 0;
  bonus = 0;
}

async function get_currentOrder(chat_id) {
  const connection = await createConnection();

  try {
    const [rows] = await connection.execute(
      "SELECT name_kross FROM orders WHERE chat_id = ? AND order_status = ? AND ordered = ?",
      [chat_id, "Оплачено", "Доставка"]
    );

    if (rows[0].name_kross) {
      const [shooes] = await connection.execute(
        "SELECT * FROM Updates WHERE name = ?",
        [rows[0].name_kross]
      );
      const result = shooes.map((row) => ({
        path: row.photo_path,
        material: row.material,
        price: row.price,
        name: row.name,
        size: row.size,
        color: row.color,
      }));
      return result;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function add_email(chat_id, email) {
  chat_id = chat_id.toString();
  const connection = await createConnection();
  try {
    await connection.execute("UPDATE users SET email = ? WHERE chat_id = ?", [
      email,
      chat_id,
    ]);
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function add_location(chat_id, address) {
  const connection = await createConnection();

  try {
    await connection.execute("UPDATE users SET locale =? WHERE chat_id =?", [
      address,
      chat_id,
    ]);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function add_fio(chat_id, fio) {
  const connection = await createConnection();
  try {
    await connection.execute("UPDATE users SET FIO =? WHERE chat_id =?", [
      fio,
      chat_id,
    ]);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function check_payment(chat_id) {
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM orders WHERE chat_id =? AND order_status =? AND ordered =?",
      [chat_id, "Оплачено", "Доставка"]
    );

    if (rows.length > 0) {
      const result = shooes.map((row) => ({
        order_id: row.order_id,
        order_status: row.order_status,
        ordered: row.ordered,
        name: row.name_kross,
        size: row.size,
        price: row.price,
        email: row.email,
      }));
      return result;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

module.exports = {
  add_user,
  send_photo,
  send_dynamic_add_photo,
  select_photo,
  getProfile,
  testDatabaseConnection,
  new_order,
  delOrder,
  createPDF,
  add_gender,
  get_gender,
  past_orders,
  update_bonus,
  add_style,
  get_userStyle,
  get_currentOrder,
  addToOrder,
  add_email,
  add_location,
  add_fio,
  check_payment,
};
