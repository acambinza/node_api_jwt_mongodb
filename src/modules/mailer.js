const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const mailConfig = require('../config/mail.json');
const path = require('path');

const transport = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port ,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.pass
    }
  });

  /*transport.use('compile', hbs({
      viewEngine: 'handlebars',
      viewPath : path.resolve('./src/resources/mail/'),
      extName: '.html',
  }));
*/
  module.exports = transport;