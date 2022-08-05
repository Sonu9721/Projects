const jwt = require('jsonwebtoken')
const authorModel = require('../models/authorModel')
  const re = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/; //email
  const dv = /[a-zA-Z]/;   //string 

  
const createAuthor = async function (req , res) {

    try {
        let data = req.body

       
       // Validate the  data is present or not
        if(Object.keys(data).length == 0){
            return res.status(400).send( { status: false , msg: 'Invalid Request !! Please Enter Author Detail '})
        }
        //check for blank data or match with regex syntax
        if(data.fname.length == 0 || !dv.test(data.fname)){
            return res.status(400).send( { status: false , msg: 'Please Enter Author First Name '})
        }
        
        if(data.lname.length == 0  || !dv.test(data.lname)){
            return res.status(400).send( { status: false , msg: 'Please Enter Author Last Name '})
        }
        // check that title will only allow these
        if(!['Mr','Mrs','Miss'].includes(data.title)){
            return res.status(400).send({status: false , msg: "Title Must be of these values [Mr, Mrs, Miss] "})
        }

        if(data.email.length == 0){
            return res.status(400).send( { status: false , msg: "Please Enter Author's Email "})
        }

        // method for email validation using regular expression
        if(!re.test(data.email)){ 
            return res.status(400).send({status: false , msg: "Invalid EmailId Address "})
        }
        // check email with database
        existingEmail = await authorModel.findOne({email : data.email})

        if(existingEmail){
            return res.status(400).send({status: false , msg: "User with this email is already exist "})
        }
        let passRE = /^(?!\S*\s)(?=\D*\d)(?=.*[!@#$%^&*])(?=[^A-Z]*[A-Z]).{8,15}$/;

          // check  password validation using regular expression
         if(!passRE.test(data.password)){
            return res.status(400).send({status: false , msg: "Password should contain atleast one upercase ,lowercase, numbers and special character"})
        }

        let author = await authorModel.create(data)
        res.status(201).send({status: true , msg:"Author Created Successfully" , data: author})
           
    } catch (err) {
        
        res.status(500).send({status: false , error: err.message})
    }
}

const loginAuthor = async function ( req, res) {

    try {
        let data = req.body
         // Validate the  data is present or not
        if(Object.keys(data).length == 0){
            return res.status(400).send( { status: false , msg: 'Invalid Request !! Please Enter Author Email, Password '})
        }
        //convert email in lowercase
        let userName = data.email.toLowerCase();
        let password = data.password;
        if(userName !== '' && password !== ''){
            
            // email validation using regex
            if((re.test(userName)==true)){
            
                let user = await authorModel.findOne( {email: userName , password: password});
                if(!user) 
                return res.status(400).send({  msg: "Invalid username or the password" })
    
                let token = jwt.sign(
                    {
                        authorId: user._id.toString(),
                        batch: "uranium",
                        organisation: 'FunctionUp'
                    },
                    "functionup-uranium"
                )
                res.setHeader('x-api-key' , token)
                res.status(201).send({ status: true, data: token });
        
            }
            else
             return res.status(401).send({msg:'Invalid Username'})

        }
        else
     return res.status(400).send({msg:'UserName, Password are missing'})
        
    } 
    catch (err) {
       return res.status(500).send({ msg: "Error", error: err.message })
    }

}
module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor
