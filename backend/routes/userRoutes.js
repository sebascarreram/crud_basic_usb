// import express from "express";
const express = require("express");
// import userController from "./../controllers/userController.js";
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
// import { getAllUsers, getUser } from "./../controllers/userController.js";

const router = express.Router();

// LOGIN
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router
  .route("/")
  // .get(authController.protect, userController.getAllUsers)
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// export default router;
module.exports = router;
