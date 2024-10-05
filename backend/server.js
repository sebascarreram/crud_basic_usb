const mongoose = require("mongoose");
// import mongoose from 'mongoose';
// for file '.env'
const dotenv = require("dotenv");
// import dotenv from 'dotenv';

process.on("uncaughtException", (err) => {
  console.log("UNCAUGH EXCEPTION 💥 Shutting down");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// Connect methods
mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // hide warning
    // useUnifiedTopology: true
    // It's a promise down ⬇
  })
  .then(() => {
    // console.log(con.connections);
    console.log("DB Connection successful 🎉");
  });

const app = require("./app");
// import app from './app.js';
// console.log(app.get('env'));
// console.log(process.env);

////////////////////
//////////////mongo "mongodb+srv://cluster0-6qi9l.mongodb.net/test"  --username dbShop//////
////

const port = process.env.PORT || 3000;
// For connections on the specified host and port.
// http://127.0.0.1:3000
// app.listen(port, () => {
//   console.log(`App running on port ${port}... 🔗`);
// });
const server = app.listen(port, () => {
  console.log(`App running on port ${port}... 🔗`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION 💥 Shutting down");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
