const nodemailer = require("nodemailer");

exports.sendEmail = async (email, code, stag) => {
  const smtpTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  let data = {
    from: process.env.EMAIL,
    to: email,
    subject: `Verification code for the ${stag}`,
    text:
    "Here is your verification code: " +
    code
  };
  smtpTransport.sendMail(data,(error,result)=>{
    if (error) {      
        console.log(error.message,'.....Mail error')
      return error;
    } else {        
      return result;                
    }
  });
};
