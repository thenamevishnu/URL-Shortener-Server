import jwt from "jsonwebtoken"

export const userAuth = async (req, res, next) => {
    try{
        const token = req.headers["authorization"]
        const obj = {}
        if(token?.split(" ")[1] == null){
            obj.status = false
            obj.message = "Authorization Faild!"
        }else{
            const auth = jwt.verify(token?.split(" ")[1],process.env.JWT_KEY)
            const now = Math.floor(new Date().getTime() / 1000)
            console.log(auth);
            if(auth.exp <= now){
                obj.status = false
                obj.message = "Authorization Faild!"
            }else{
                next()
            }
        }
    }catch(err){
        res.json({error:err.message})
    }
}