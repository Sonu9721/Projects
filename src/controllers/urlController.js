
const urlModel = require('../models/urlModel')
const validUrl = require('valid-url');
const shortId = require('shortid')  
    

let createUrl = async (req, res) => {

    try {
        let data= req.body
    
        if(Object.keys(data).length == 0){
            return res.status(400).send({status:false, message:"Invalid Url please provide valid details"})
        }
    
        if(!data.longUrl){
            return res.status(400).send({status:false, message:"Please give the long URL"})
        }
    
        if(!validUrl.isUri(data.longUrl)){
            return res.status(400).send({status:false, message:"please enter a valid long url"})
        }
    
        let url= await urlModel.findOne({longUrl: data.longUrl})
        if(url){
            return res.status(400).send({status:false, message:"url is alredy present in db"})
        }
    
        const baseUrl = 'http://localhost:3000'
        let urlCode = shortId.generate().toLowerCase();
        const shortUrl= baseUrl+ '/'+ urlCode;
    
        data.urlCode=urlCode;
        data.shortUrl=shortUrl;
    
        await urlModel.create(data)
        let bodyData =await urlModel.findOne({urlCode:urlCode}).select({_id:0, __v:0, createdAt:0, updatedAt:0})
    
        res.status(201).send({status:true, message:"URL create successfully", data:bodyData})    
      } catch (err) {
        res.status(500).send({status:false, message:err.message})
          
      }
    }



let getUrl = async (req, res) => {

    try {
        let urlCode = req.params.urlCode;
    
        let getUrl = await urlModel.findOne({ urlCode: urlCode })
        if(!getUrl) return res.status(404).send({ status: false, message: 'Url-code not found' });

        res.status(303).redirect(getUrl.longUrl)
      } catch (err) {
        res.status(500).send({ status: false, error: err.message });
      }
    }

module.exports = { createUrl, getUrl}