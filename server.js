
// ===== server.js =====

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(
  session({
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Admin login ma'lumotlari
const ADMIN_LOGIN = "truslon";
const ADMIN_PASSWORD = "ruslonbek11";

// Buyurtmalarni xotirada saqlash
let orders = [];

// === Asosiy sahifa ===
app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 My Portfolio</h1>
    <p>Welcome to my Node.js website!</p>
    <h2>📩 Place Your Order</h2>
    <form method="POST" action="/order">
      <label>👤 Name: <input type="text" name="name" required /></label><br/><br/>
      <label>📧 Gmail: <input type="email" name="email" required /></label><br/><br/>
      <label>📱 WhatsApp Number: <input type="text" name="phone" required /></label><br/><br/>
      <label>📦 Choose Package:
        <select name="package" required>
          <option value="Basic">Basic</option>
          <option value="Standard">Standard</option>
          <option value="Premium">Premium</option>
        </select>
      </label><br/><br/>
      <button type="submit">Submit Order</button>
    </form>
  `);
});

// === Buyurtma qabul qilish ===
app.post("/order", (req, res) => {
  const { name, email, phone, package } = req.body;

  const order = { name, email, phone, package, date: new Date() };
  orders.push(order);

  console.log("✅ New order received:");
  console.log(order);

  res.send(`
    <h2>Thank you, ${name}!</h2>
    <p>Your order has been received. We will respond within 12 hours.</p>
    <a href="/">Back to Home</a>
  `);
});

// === Admin panel ===
app.get("/admin", (req, res) => {
  if (req.session.loggedIn) {
    let orderList =
      orders.length > 0
        ? `<ul>${orders
            .map(
              (o, i) =>
                `<li><b>${i + 1}.</b> ${o.name} | Gmail: ${o.email} | WhatsApp: ${
                  o.phone
                } | Package: ${o.package} | Date: ${o.date.toLocaleString()}</li>`
            )
            .join("")}</ul>`
        : "<p>No orders yet.</p>";

    res.send(`
      <h1>🔒 Admin Panel</h1>
      <p>Welcome, ${ADMIN_LOGIN}!</p>
      <h2>Orders:</h2>
      ${orderList}
      <br/>
      <a href="/logout">Logout</a>
    `);
  } else {
    res.send(`
      <h2>Admin Login</h2>
      <form method="POST" action="/login">
        <label>Login: <input type="text" name="login" /></label><br/><br/>
        <label>Password: <input type="password" name="password" /></label><br/><br/>
        <button type="submit">Login</button>
      </form>
    `);
  }
});

// === Login ===
app.post("/login", (req, res) => {
  const { login, password } = req.body;

  if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    res.redirect("/admin");
  } else {
    res.send("<h3>❌ Wrong login or password!</h3><a href='/admin'>Try again</a>");
  }
});

// === Logout ===
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin");
  });
});
// Admin sahifa
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});
// Buyurtmalarni olish (faqat admin ko‘radi)
app.get("/orders", (req, res) => {
  if (!req.session.user) {
    return res.status(403).json({ message: "Ruxsat yo‘q" });
  }
  res.json(orders);
});

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log(`✅ Server running: http://localhost:${PORT}`);
});
