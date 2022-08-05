const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const blogModel = require("../models/blogModel");
const ObjectId = mongoose.Types.ObjectId

///--------------- middleware for token verification 

let authentication = function (req , res , next){
    //console.log("innerAuth");
    try {

        
        let token = req.headers['x-api-key']

        if(!token) return res.status(401).send({message: "token must be present" })

        let decodedToken = jwt.verify( token , "functionup-uranium")

        if(!decodedToken){
            return res.status(404).send({status: false , msg: "Token is not present"})
        }
        req.decodedToken = decodedToken
        next()
    } 
    catch(err) {
        return res.status(401).send({  message: "token is invalid"})
    }

}

let authorisation = async function (req, res , next){

    try {

        if(!ObjectId.isValid(req.params.blogId)){
            return res.status(400).send({status: false , msg:"Invalid Blog-Id"})
        }
        
        blog = await blogModel.findById(req.params.blogId)
        
        let decodedToken = req.decodedToken

        if(decodedToken.authorId != blog.authorId)
            return res.status(401).send({  error: 'Author is not allowed to perform this task'})
    
        next()
    } 
    catch(err) {
        return res.status(401).send({  message: "token is invalid"})
    }
}

module.exports.authentication = authentication
module.exports.authorisation = authorisation