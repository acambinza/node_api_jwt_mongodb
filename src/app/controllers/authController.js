const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer')

const authConfig = require('../../config/auth.json');

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

router.post('/forgot_password', async (req, res) =>{
      
   const { email } = req.body;

      try {
         const user = await User.findOne({email});

         if(!user)
            return res.status(400).send({error: 'User not found'});

         const token = crypto.randomBytes(20).toString('hex');

         const now = new Date();
         now.setHours(now.getHours() + 1);

         await User.findByIdAndUpdate(user.id, {
            '$set': {
               passwordResetToken : token,
               passwordResetExpires: now,
            }
         });

         mailer.sendMail({
            from: '"acambinza@gmail.com', // sender address
            to: email, // list of receivers
            subject: "Recuperacao de Senha", // Subject line
            text: "Hi, ", // plain text body
            html: "<p>Voce esqueceu sua senha? Use o seguinte token "+token+"  para resetar! </p>", // html body
         }, (err) => {
            console.log(err)
               if(err)
                  return res.status(400).send({error: 'Cannot send forgot password email'});

               return res.send();
         }); 
         

        /* mailer.sendMail({
               to: email,
               from: 'acambinza@gmail.com',
               template: 'auth/forgot_password',
               context: { 
                  "token": token 
               }

         }, (err) => {
            console.log(err)
               if(err)
                  return res.status(400).send({error: 'Cannot send forgot password email'});

               return res.send();
         });

         */
         
      }catch(err){
         console.log(err)
         res.status(400).send({error: "Error on forgot password, try again"});
      }

});

router.post('/reset_password', async (req,res)=>{
       const { email, token, password } = req.body;

       try {
            const user = await User.findOne({ email })
                     .select('+passwordResetToken passwordResetExpires');

            if(!user)
                  return res.status(400).send({error: 'User not found'});
            
            if(token !== user.passwordResetToken)
                  return res.status(400).send({error : 'Token invalid '});
            
            const now = new Date();

            if(now > user.passwordResetExpires)
                  return res.status(400).send({error: 'Token expired, generate a new one'});

            user.password = password;

            await user.save();

            res.send();

       }catch(err){
            res.status(400).send({error: 'Cannot reset password, try again' });
       }
});


module.exports = app => app.use('/api', router);