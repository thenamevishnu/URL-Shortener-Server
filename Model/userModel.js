import mongoose from "mongoose"

const user = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    picture:{
        type:String
    },
    links:[
        {
            longUrl: {
                type:String,
            },
            shortUrl:{
                type:String,
            },
            icon:{
                type:String
            },
            time:{
                type:Number
            }
        }
    ]
},{
    timestamps:true
})

export const userDB = mongoose.model("users",user)