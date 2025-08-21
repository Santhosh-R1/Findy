const mongoose=require("mongoose")
mongoose.connect(process.env.MONGO_URI)
var db=mongoose.connection
db.on("error",console.error.bind("error"))
db.once("open",function(){
    console.log("connection successful")
})
 
module.exports=db