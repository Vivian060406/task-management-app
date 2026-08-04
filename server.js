/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: _Khanh Vy Tran___ Student ID: _120175245__ Date: _8/4/2026___
*
********************************************************************************/
require("dotenv").config();
require("pg");

const express = require("express");
const mongoose = require("mongoose");
const Sequelize = require("sequelize");
const clientSessions = require("client-sessions");
const bcrypt = require("bcrypt");
const path = require("path");

const User = require("./models/User");
const createTaskModel = require("./models/Task");

const app = express();
const HTTP_PORT = process.env.PORT || 3000;

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Client session setup
app.use(
  clientSessions({
    cookieName: "session",
    secret: process.env.SESSION_SECRET,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
  })
);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

const Task = createTaskModel(sequelize);

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  next();
}

// Home route
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  return res.redirect("/login");
});

// Register page
app.get("/register", (req, res) => {
  res.render("register", {
    message: "",
  });
});

// Register user
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    }).exec();

    if (existingUser) {
      return res.render("register", {
        message: "Username or email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.redirect("/login");
  } catch (err) {
    console.error("Registration error:", err);

    return res.render("register", {
      message: "Registration failed. Please try again.",
    });
  }
});

// Login page
app.get("/login", (req, res) => {
  res.render("login", {
    message: "",
  });
});

// Login user
app.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;

    const user = await User.findOne({
      $or: [{ username: login }, { email: login }],
    }).exec();

    if (!user) {
      return res.render("login", {
        message: "Invalid username/email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.render("login", {
        message: "Invalid username/email or password.",
      });
    }

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    return res.redirect("/dashboard");
  } catch (err) {
    console.error("Login error:", err);

    return res.render("login", {
      message: "Login failed. Please try again.",
    });
  }
});

// Dashboard
app.get("/dashboard", ensureLogin, (req, res) => {
  res.render("dashboard", {
    user: req.session.user,
  });
});

app.get("/tasks", ensureLogin, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: {
        userId: req.session.user.id,
      },
      order: [["createdAt", "DESC"]],
    });

    res.render("tasks", {
      user: req.session.user,
      tasks,
    });
  } catch (err) {
    console.error(err);

    res.render("tasks", {
      user: req.session.user,
      tasks: [],
    });
  }
});

app.get("/tasks/add", ensureLogin, (req, res) => {
  return res.render("addTask", {
    user: req.session.user,
    message: "",
  });
});

app.post("/tasks/add", ensureLogin, async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    await Task.create({
      title,
      description: description || null,
      dueDate: dueDate || null,
      status: status || "pending",
      userId: req.session.user.id,
    });

    return res.redirect("/tasks");
  } catch (err) {
    console.error("Add task error:", err);

    return res.render("addTask", {
      user: req.session.user,
      message: "Unable to create task. Please try again.",
    });
  }
});

app.post("/tasks/delete/:id", ensureLogin, async (req, res) => {
  try {
    await Task.destroy({
      where: {
        id: req.params.id,
        userId: req.session.user.id,
      },
    });

    return res.redirect("/tasks");
  } catch (err) {
    console.error("Delete task error:", err);
    return res.redirect("/tasks");
  }
});

app.post("/tasks/status/:id", ensureLogin, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.session.user.id,
      },
    });

    if (!task) {
      return res.redirect("/tasks");
    }

    task.status =
      task.status === "completed" ? "pending" : "completed";

    await task.save();

    return res.redirect("/tasks");
  } catch (err) {
    console.error("Update status error:", err);
    return res.redirect("/tasks");
  }
});

app.get("/tasks/edit/:id", ensureLogin, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.session.user.id,
      },
    });

    if (!task) {
      return res.redirect("/tasks");
    }

    return res.render("editTask", {
      user: req.session.user,
      task,
      message: "",
    });
  } catch (err) {
    console.error("Load edit task error:", err);
    return res.redirect("/tasks");
  }
});

app.post("/tasks/edit/:id", ensureLogin, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.session.user.id,
      },
    });

    if (!task) {
      return res.redirect("/tasks");
    }

    const { title, description, dueDate, status } = req.body;

    await task.update({
      title,
      description: description || null,
      dueDate: dueDate || null,
      status: status || "pending",
    });

    return res.redirect("/tasks");
  } catch (err) {
    console.error("Update task error:", err);

    return res.render("editTask", {
      user: req.session.user,
      task: {
        id: req.params.id,
        ...req.body,
      },
      message: "Unable to update task. Please try again.",
    });
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.reset();

  return res.redirect("/login");
});


Promise.all([
  mongoose.connect(process.env.MONGODB_URI),
  sequelize.sync(),
])
  .then(() => {
    console.log("MongoDB and PostgreSQL connected.");

    app.listen(HTTP_PORT, () => {
      console.log(`Server running on http://localhost:${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error("Startup error:", err);
  });