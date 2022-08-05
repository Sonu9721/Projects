const blogModel = require('../models/blogModel')
const authorModel = require('../models/authorModel')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId
const dv = /[a-zA-Z]/;

const check = function(x) {
    return x.every(i => (typeof i === "string"));
}

const createBlog = async function (req , res) {

    try {
        let data = req.body

         // Validate the blog data is present or not
        if (Object.keys(data).length == 0) { 
            return res.status(400).send({ status: false, msg: "Invalid request !! Please Provide Blog Details"})
          }

          // Validate that authorid is coming or not in blog
          if (data.authorId.length==0) {
            return res.status(400).send({ status: false, msg: "Please Provide Blog Author Id"})
        }
        data.authorId = data.authorId.trim()    //remove space from authorid
        // Validate the authorId
        if(!ObjectId.isValid(data.authorId)) {
            return res.status(400).send({status: false , msg:"Invalid Author-Id"})
         }

         // authorization
         let decodedToken =  req.decodedToken
        if( data.authorId != decodedToken.authorId ){
            return res.status(400).send({status: false , msg: "Author is Different"})
        }
       
        
        // Validate the title in blog 
        if ( data.title.length==0 || !dv.test(data.title)) {
            return res.status(400).send({ status: false, msg: "Please Provide Blog Title"})
        }

        // Validate the Body in blog 
        if ( data.body.length==0 || !dv.test(data.body)) { 
            return res.status(400).send({ status: false, msg: "Please Provide Blog's Body"})
        }

          // Validate the category in blog
        if (data.category.length == 0 || !dv.test(data.category)) {
            return res.status(400).send({ status: false, msg: "Please Provide Blog category"})
        }
        data.category = data.category.toLowerCase().trim()  //save data in lowercase and remove the spaces
        
        //validate the tags in blog
        if( data.tags != undefined && check(data.tags) == false){
            return res.status(400).send({ status: false, msg: "Please Provide Valid Tags"})
        }
       
        //validate the tags in blog
        if( data.subcategory != undefined &&  check(data.subcategory)== false){
            return res.status(400).send({ status: false, msg: "Please Provide Valid Subcategory"})
        }
        // for array data like tags and subcategory
        for (let key in data) {
            if (Array.isArray(data[key])) {
                let arr=[];
                for (let i = 0; i < data[key].length; i++) {
                        if(data[key][i].trim().length>0)
                    arr.push(data[key][i].toLowerCase().trim())
                }
                data[key] = [...arr];
            }
        }
        
        
        let authorId = await authorModel.findById(data.authorId)
        // check authorId
        if(!authorId) {
            return res.status(400).send({status: false , msg:"Invalid Author-Id"})   
        }
        if(data.isPublished == true){
            data.publishedAt =  new Date().toISOString()  // add the date if isPublished is true
        }
        
        let blog = await blogModel.create(data)
        res.status(201).send({status: true , data: blog})
           
    } 
    catch (err) {
        res.status(500).send({status: false , error: err.message})
    } 

   
}


const getBlogs = async function (req , res) {
    try{
        
        
        let queryData = req.query
         
        if (Object.keys(queryData).length == 0) { 
            let blogInfo = await blogModel.find({isPublished: true , isDeleted: false })
            if(!blogInfo){
                return res.status(404).send({status: false , msg:"Document not found"})
            }
            return res.status(200).send({status: true , data:blogInfo})
          } 
        //   check if filter have  value 
        if(!( queryData.title || queryData.category || queryData.tags || queryData.subcategory ) ){
            return res.status(400).send( {status: false , msg: "Invalid Filters"})
        }
        // Authorization
        let decodedToken =  req.decodedToken
        if(queryData.authorId != undefined && queryData.authorId != decodedToken.authorId ){
            return res.status(400).send({status: false , msg: "Author is Different"})
        }
        if(queryData.authorId == undefined) 
        queryData.authorId =  decodedToken.authorId
        // check if  query are valid
        if(req.query.title && !req.query.body) delete req.query.title
        else if(req.query.body && !req.query.title) delete req.query.body
        else if(req.query.title && req.query.body){
            delete req.query.title
            delete req.query.body
        }

        queryData = req.query
    
        if(queryData.authorId && !(ObjectId.isValid(queryData.authorId))){
            return res.status(400).send( {status: false, msg: 'AuthorId is Invalid'})
        }
        
        if(queryData.authorId ){ 
             let authorId = await authorModel.findById(queryData.authorId)
             if(!authorId) {
                return res.status(404).send({status: false , msg:"Author not Found"})   
            }
        }
        
            if(queryData.category){
                queryData.category = queryData.category.toLowerCase().trim()  // remove the space in category and save in lowecase
            }

            if(queryData.tags) queryData.tags = queryData.tags.toLowerCase().trim()  // remove the space in tags and save in lowecase
            if(queryData.subcategory) queryData.subcategory = queryData.subcategory.toLowerCase().trim()   // remove the space in subcategory and save in lowecase
            
            // for array data like tags and subcategory
            for (let key in queryData) {
                if (Array.isArray(queryData[key])) {
                    let arr=[];
                    for (let i = 0; i < queryData[key].length; i++) {
                            if(queryData[key][i].trim().length>0)
                        arr.push(queryData[key][i].toLowerCase().trim())
                    }
                    queryData[key] = [...arr];
                }
            }
          console.log(queryData)
            //  check if it is not deleted and published
            queryData.isDeleted = false
            queryData.isPublished = true
            const blogData = await blogModel.find(queryData)
 
            if(blogData.length == 0){
                return res.status(404).send({status: false , msg: 'Document Not Found'})
            } 
            return res.status(200).send({status: true , Data: blogData})
    }
    catch(err){
        res.status(500).send({status: false , error: err.message})
    } 
    
}

const updateBlogs = async function ( req , res) {
    try {
        let blog = req.body
          // Validate the data is present or not in body
        if (Object.keys(blog).length == 0) { 
            return res.status(400).send({ status: false, msg: "Invalid request !! Please Provide Blog Details"})
          }
           //   check if filter have  value 
        if(! (blog.title || blog.body || blog.tags || blog.category ||blog.subcategory || blog.isPublished) ){
            return res.status(400).send( {status: false , msg: "Invalid Filters"})
        }

        let blogId = req.params.blogId
        //  find data in model
        let blogData = await blogModel.findById(blogId)
        if(!blogData || blogData.isDeleted == true){
            return res.status(404).send({status: false , msg: "Document Not Found"})
        }
        // for array data like tags and subcategory
        for (let key in blog) {
            if (Array.isArray(blog[key])) {
                let arr=[];
                for (let i = 0; i < blog[key].length; i++) {
                        if(blog[key][i].trim().length>0)
                    arr.push(blog[key][i].toLowerCase().trim())
                }
                blog[key] = [...arr];
            }
        }
        //  if blog is published or not
        if(blogData.isPublished == false && blog.isPublished == true){
            blogData.isPublished = true
            blogData.publishedAt = new Date().toISOString()
        }
        // save the data 
        await blogData.save()

        let updatedBlog = await blogModel.findByIdAndUpdate( {_id : blogId},
                {$addToSet : {tags : blog.tags , subcategory: blog.subcategory} , $set : {title: blog.title , body: blog.body }},
                {new : true}
            )
        
            res.status(200).send({status: true , updatedData: updatedBlog})
            
            
    } catch (err) {
        res.status(500).send({status: false , error: err.message})  
    }
}

const deleteByBlogId = async function ( req , res){
    try {
        let blogId = req.params.blogId

        let blogData =  await blogModel.findById(blogId)
        if(!blogData || blogData.isDeleted == true){
            res.status(404).send({status: false , msg: "Data Not Found"})
        }
      
        // set isDeleted true with the date
        blogData.isDeleted = true
        blogData.deletedAt = new Date().toISOString()
        await blogData.save()
        res.status(200).send({msg:"Document is Successfully Deleted"})
        
    } catch (err) {
        res.status(500).send({status: false , error: err.message}) 
    }
}


const deleteByQuery = async function (req, res) {
    try {

        let queryData = req.query
        let decodedToken = req.decodedToken
        // token validation with auhtorId 
        if(queryData.authorId && decodedToken.authorId != queryData.authorId ){
            return res.status(403).send({status: false , msg: "Author is not allowed to perform this task"})
        } 
        queryData.authorId = decodedToken.authorId 
          //   check if filter have  value 
        if (!(queryData.category || queryData.authorId || queryData.tags || queryData.subcategory)) {
            return res.status(404).send({ status: false, msg: "Invalid Request...." })
        }
        // check if authorid is a valid type of objectId
        if (queryData.authorId && !(ObjectId.isValid(queryData.authorId))){
            return res.status(400).send( {status: false, msg: 'AuthorId is Invalid'})
        }
        //  find author in data
        if(queryData.authorId){
            let authorId = await authorModel.findById(queryData.authorId)
            if(!authorId) {
                return res.status(404).send({status: false , msg:"Author not Found"})   
            }
        }
        if(queryData.category){
            queryData.category = queryData.category.toLowerCase().trim()  // remove the space in category and save in lowecase
        }

        if(queryData.tags) queryData.tags = queryData.tags.toLowerCase().trim()    // remove the space in tags and save in lowecase
        if(queryData.subcategory) queryData.subcategory = queryData.subcategory.toLowerCase().trim() // remove the space in subcategory and save in lowecase

        
  
      let deletedDate = new Date().toISOString()
      queryData.isDeleted = false
      let data1 = await blogModel.updateMany(queryData, { isDeleted: true, deletedAt: deletedDate }, { new: true })
    
      if(data1.matchedCount == 0){
          return res.status().send( {status: false , msg: 'No match found'})
      }
      return res.status(200).send({ status: true, msg: data1 })
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message });
    }
  }



module.exports.createBlog = createBlog
module.exports.getBlogs = getBlogs
module.exports.updateBlogs = updateBlogs
module.exports.deleteByBlogId = deleteByBlogId
module.exports.deleteByQuery = deleteByQuery

