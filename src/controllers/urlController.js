
const urlModel = require('../models/urlModel')
const validUrl = require('valid-url');
const shortId = require('shortid')

const redis = require("redis");//works like mongoose(conect to the database)

const { promisify } = require("util");//return promise when function call(responce in object)

//Connect to redis
const redisClient = redis.createClient(
  17638,
  "redis-17638.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("pROD6km7CUP9EOA5fAxqx6U1wgLfVLyc", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis.......");
});


//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);//.bind function ko create karata hai




let createShortUrl = async (req, res) => {

  try {
    let data = req.body

    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, message: "body is is required" })

    } else if (!data.longUrl) {
      return res.status(400).send({ status: false, message: "long url is missing" })

    } else if (!validUrl.isWebUri(data.longUrl)) {
      return res.status(400).send({ status: false, message: "please enter a valid long url" })

    } else if (!/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(data.longUrl)) {
      return res.status(400).send({ status: false, message: "please enter a valid long url" })

    }

    let cahcedUrlData = await GET_ASYNC(`${data.longUrl}`)

    let URL = JSON.parse(cahcedUrlData);//parse convert the string data into object with help of parse

    if (cahcedUrlData) {
      return res.status(200).send({ status: true, message: "redis return", data: URL })

    }

    const baseUrl = 'http://localhost:3000'
    let urlCode = shortId.generate().toLowerCase();
    const shortUrl = baseUrl + '/' + urlCode;//add with the help of concatination

    data.urlCode = urlCode;
    data.shortUrl = shortUrl;

    await urlModel.create(data)

    let bodyData = await urlModel.findOne({ urlCode: urlCode }).select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 })

    await SET_ASYNC(`${data.longUrl,60}`, JSON.stringify(bodyData))//stringify converts a JavaScript object or value to a JSON string

    res.status(201).send({ status: true, message: "URL create successfully", data: bodyData })

  } catch (err) {
    res.status(500).send({ status: false, message: err.message })

  }
}

//---------------------get url -------------------------------------------------------


let getUrl = async (req, res) => {

  try {
    let urlCode = req.params.urlCode;

    let cahcedUrlData = await GET_ASYNC(`${urlCode}`)

    if (cahcedUrlData) {
      return res.status(302).redirect(JSON.parse(cahcedUrlData))//parse convert the string data into object with help of parse

    } else {

      let getUrl = await urlModel.findOne({ urlCode: urlCode })
      if (!getUrl) return res.status(404).send({ status: false, message: 'Url-code not found' });

      await SET_ASYNC(`${urlCode}`, JSON.stringify(getUrl.longUrl))//stringify converts a JavaScript object or value to a JSON string
      return res.status(302).redirect(getUrl.longUrl)

    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
}


module.exports = { createShortUrl, getUrl }