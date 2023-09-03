import mongoose from "mongoose";
import { userDB } from "../Model/userModel.js";
import jwt from "jsonwebtoken"
import randomstring from "randomstring"
import { urlDB } from "../Model/urlsModel.js";

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
        const newArray = userData.links.sort((a,b) => b.time - a.time)
        res.json(newArray)
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

const createLink = async (req, res) => {
    try{
        const {link, id, alias} = req.body
        const obj = {}
        let shortKey = null
        const LinkExist = await urlDB.findOne({longUrl:link})
        if(LinkExist){
            obj.status = true
            obj.response = process.env.origin + /r/ + "" + LinkExist.short_id
        }else{
            if(!alias){
                shortKey = randomstring.generate(6)
                let exist = await urlDB.findOne({short_id:shortKey})
                let round = 0
                while(true){
                    if(!exist) break
                    round++
                    shortKey = randomstring.generate(6)
                    exist = await urlDB.findOne({short_id:shortKey})
                }
            }else{
                const exist = await urlDB.findOne({short_id:alias})
                if(exist){
                    obj.status = false
                }else{
                    shortKey = alias
                }
            }
            if(shortKey){
                await urlDB.create({short_id:shortKey,longUrl:link,creator:id})
                obj.status = true
                obj.response = process.env.origin + /r/ + "" + shortKey
            }else{
                obj.status = false
            }
        }
        res.json(obj)
    }catch(err){
        res.json({error:err.message})
    }
}

const redirect_to = async (req, res) => {
    try{
        const shortKey = req.params.shortKey
        const response = await urlDB.findOne({short_id:shortKey})
        res.json({response:response.longUrl})
    }catch(err){
        res.json({error:err.message})
    }
}

export default {login, getUserHistory, insertHistory, createLink, redirect_to}