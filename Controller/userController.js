import mongoose from "mongoose";
import { userDB } from "../Model/userModel.js";
import jwt from "jsonwebtoken"
import randomstring from "randomstring"
import { urlDB } from "../Model/urlsModel.js";
import axios from "axios"

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

const fetchIcon = async (url) => {
    const response = await axios.get(url)
    const htmlContent = await response.data
    const match = htmlContent.match(/<link .*?rel=["']icon["'].*?href=["'](.*?)["']/i);
    
    if(match && match[1]) {
        return {
            status:true,
            response: match[1]
        }
    }else{
        return { 
            status: false
        }
    }
}

const insertHistory = async (req, res) => {
    try{
        const {insertData,id} = req.body
        const icon = await fetchIcon(insertData.longUrl)
        if(icon.status) insertData.icon = icon.response
        const exist = await userDB.find({links:{$elemMatch:{$and:[{longUrl:insertData.longUrl,shortUrl:insertData.shortUrl}]}}})
        if(exist.length===0){
            await userDB.updateOne({_id: new mongoose.Types.ObjectId(id)},{$push:{links:insertData}})
            res.json({status:true,response:insertData})
        }else{
            res.json({status:false,response:insertData})
        }
    }catch(err){
        res.json({error:err.message})
    }
} 

const createLink = async (req, res) => {
    try{
        const {link, id, alias} = req.body
        const obj = {}
        let shortKey = null
        const checkObj = alias ? {longUrl:link,short_id:alias,creator:id} : {longUrl:link,creator:id}
        const LinkExist = await urlDB.findOne(checkObj)
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

const deleteElement = async (req, res) => {
    try{
        const {item, user_id} = req.body
        await userDB.updateOne({_id: new mongoose.Types.ObjectId(user_id)},{$pull:{links:item}});
        const response = await userDB.findOne({_id: user_id})
        res.json({status:true, response: response.links})
    }catch(err){
        res.json({error:err.message})
    }
}

export default {login, getUserHistory, insertHistory, createLink, redirect_to, deleteElement}