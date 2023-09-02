import express from "express"
import userController from "../Controller/userController.js"
const router = express.Router()

router.post("/login", userController.login)
router.get("/getUserHistory/:user_id",userController.getUserHistory)
router.post("/insertHistory",userController.insertHistory)

export default router