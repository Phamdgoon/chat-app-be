import express from "express";
import { findUser, getUsers } from "../controllers/user.controller.js";
const router = express.Router();

router.get("/find/:userId", findUser);
router.get("/", getUsers);

export default router;
