import express from "express"
import userController from "../Controller/userController.js"
import { userAuth } from "../Middleware/userAuth.js"
const router = express.Router()

router.post("/login", userController.login)
router.get("/getUserHistory/:user_id",userAuth,userController.getUserHistory)
router.post("/insertHistory",userAuth,userController.insertHistory)
router.post("/createLink",userAuth,userController.createLink)
router.get("/redirect_to/:shortKey",userController.redirect_to)

router.post("/deleteElement",userAuth, userController.deleteElement)

export default router