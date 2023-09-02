import mongoose from "mongoose";
import { userDB } from "../Model/userModel.js";
import jwt from "jsonwebtoken"

const login = async (req, res) => {
    try{
        const {extractData} = req.body
        const obj = {}
        obj.name = extractData.name
        obj.username = extractData.email?.split("@")[0]
        obj.email = extractData.email
        obj.picture = extractData.picture 
        let userData = await userDB.findOne({email:obj.email})
        if(!userData){
            userData = await userDB.create(obj)
        }
        const maxAge = 60 * 60 * 24 * 3
        const token = jwt.sign({ sub : userData._id } , process.env.JWT_KEY , {expiresIn:maxAge*1000})
        const userObj = {
            userData: userData,
            loggedIn: true,
            token: token
        }
        res.json({userObj})
    }catch(err){
        res.json({error:err.message})
    }
}

const getUserHistory = async (req, res) => {
    try{
        const user_id = req.params.user_id
        const userData = await userDB.findOne({_id:user_id})
        res.json(userData.links)
    }catch(err){
        res.json({error:err.message})
    }
}

const insertHistory = async (req, res) => {
    try{
        const {insertData,id} = req.body
        const response = await userDB.updateOne({_id: new mongoose.Types.ObjectId(id)},{$push:{links:insertData}})
        res.json({response:response})
    }catch(err){
        res.json({error:err.message})
    }
} 

export default {login, getUserHistory, insertHistory}