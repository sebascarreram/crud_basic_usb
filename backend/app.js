const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const AppError = require("./utils/appError");
// header("Access-Control-Allow-Origin: *");
// import express from "express"
// import morgan from "morgan"

// import AppError from "./utils/appError.js";
// import restaurantRouter from "./routes/restaurantRoutes.js";

// import userRouter from "./routes/userRoutes.js";
const userRouter = require("./routes/userRoutes");
const tourRouter = require("./routes/tourRoutes");

const app = express();

app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

//app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log("Hello from the middleware 🤟🏻");
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
// app.use("/api/v1/restaurants", restaurantRouter);
app.use("/api/v1/users", userRouter);
// app.use("/api/v1/tours", tourRouter);

app.use("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// export default app;
module.exports = app;
