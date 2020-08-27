const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth.json');

const User = require('../models/User');

const router = express.Router();

function genereteToken(params = {} ){
      return  token = jwt.sign(params, authConfig.secret, { expiresIn: 86400, });
}


router.post('/register', async(req, res) => {

   const { email } = req.body;

   try {
       if(await User.findOne({ email })) {
          return res.status(400).send({error: "User already exists"});
       }
        const user = await User.create(req.body);
        // para nao retornar o email do user
        user.password = undefined;
        return res.send({
           user,
           token : genereteToken({ id:user.id }),
         });

   }catch(error){
         console.log(error)
         return res.status(400).send({error : 'Registration failed'});
   }  

});

router.post('/authenticate', async (req, res) => {
      const { email , password } = req.body;

      const user = await User.findOne({ email }).select('+password');

      if(!user)
         return res.status(400).send({ error : "User not found" });

      if(!await bcrypt.compare(password, user.password))
         return res.status(400).send({ error: "Invalid password" });

      user.password = undefined;

      res.send({
         user, 
         token : genereteToken({ id:user.id }),
      });

});

module.exports = app => app.use('/api', router);