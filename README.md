# 📋 Task Management Application

A full-stack task management application with user authentication and personalized task management.

Users can create an account, sign in, and manage their own tasks through a personalized dashboard.

---

## 📖 About

Task Management Application is a full-stack web application built with Node.js and Express.js.

The application provides user authentication and allows each user to create and manage their own tasks. User information and task data are managed using MongoDB and PostgreSQL.

This project was originally developed as part of my WEB322 coursework at Seneca Polytechnic and has been adapted for my portfolio.

---

## ✨ Features

- User registration and login
- Secure password hashing
- User session management
- Personalized task dashboard
- Create new tasks
- Edit existing tasks
- Delete tasks
- Mark tasks as complete or incomplete
- Users can access and manage their own tasks
- Dynamic server-side rendering with EJS

---

## 🛠️ Tech Stack

### Backend

`Node.js` `Express.js`

### Frontend

`EJS` `HTML` `CSS`

### Databases

`MongoDB` `PostgreSQL`

### Database Tools

`Mongoose` `Sequelize`

### Authentication

`bcrypt` `client-sessions`

---

## 🔐 User Authentication

The application includes a user authentication system that allows users to register and sign in to their accounts.

Passwords are securely hashed using **bcrypt**, while sessions are used to maintain authentication between requests.

Each authenticated user has access to their own personalized task data.

---

## ✅ Task Management

After signing in, users can manage their tasks through a personalized dashboard.

Users can:

- Create new tasks
- Edit existing tasks
- Delete tasks
- Mark tasks as complete or incomplete
- View their own task list

Task data is associated with individual users so that each account can manage its own tasks.

---

## 🚀 Running Locally

Clone the repository:

```bash
git clone https://github.com/Vivian060406/task-management-app.git
```

Navigate to the project directory:

```bash
cd task-management-app
```

Install dependencies:

```bash
npm install
```

Configure the required database connections and environment variables.

Start the application:

```bash
npm start
```

---

## 💡 What I Practiced

Through this project, I practiced:

- Building a full-stack application with Node.js and Express.js
- Implementing user registration and authentication
- Hashing passwords securely with bcrypt
- Managing authenticated sessions
- Working with MongoDB and PostgreSQL
- Using Mongoose and Sequelize
- Implementing CRUD operations
- Associating application data with individual users
- Rendering dynamic pages with EJS
- Structuring a server-side web application

---

## 🎓 Course Context

Originally developed for **WEB322 - Web Programming Principles** at Seneca Polytechnic.

The repository is presented here as part of my programming portfolio.
