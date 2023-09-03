import mongoose from "mongoose"

const urls = new mongoose.Schema({
    short_id:{
        type:String,
        required:true
    },
    longUrl:{
        type:String,
        required:true
    },
    creator:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    visits:{
        type:Number,
        default:0
    }
},{
    timestamps:true
})

export const urlDB = mongoose.model("urls",urls)