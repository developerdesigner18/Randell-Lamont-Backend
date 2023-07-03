const db = require('../../db.js');
const otpGenerator = require("otp-generator");
const { sendEmail } = require('../utils/sendmail.js');
const User = require('../helper.js')
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const genratetoken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

class UserController {
  static async signUp(req, res) {
    try {
      const {
        salutation,
        firstname,
        lastname,
        email,
        mobilenumber,
        add1,
        add2,
        city,
        country,
        password
      } = req.body;

      const userExists = await User.getUser(email);
      if (userExists) {
        return res.status(409).json({ status: false, message: "User already exists" })
      }
      let hashedPass = await bcrypt.hash(password, 10);
      let proofImg = `${process.env.BASE_URL}/Proof-Images/${req.file?.filename}`
      await db.one(
        `INSERT INTO users
          (salutation, firstname, lastname, email, mobilenumber, add1, add2, city, country, proofImg, password)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *`,
        [
          salutation,
          firstname,
          lastname,
          email,
          mobilenumber,
          add1,
          add2,
          city,
          country,
          proofImg,
          hashedPass
        ]
      ).then(async (results) => {
        return res.status(200).json({
          status: true,
          message: "Signup successfully",
          data: results
        });
      })
        .catch((err) => {
          return res.status(400).json({ code: 400, message: err.message });
        });
    } catch (error) {
      return res.status(500).json({ status: false, error: error.message });
    }
  }

  static async sendOtp(req, res) {
    try {
      let otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
      await db.none(
        `DELETE FROM otps
         WHERE email = $1`,
        [req.body.email]
      );
      const hashOTP = await bcrypt.hash(otp, 10);
      await db.one(
        `INSERT INTO otps (email, otp)
         VALUES ($1, $2)
         RETURNING *`,
        [req.body.email, hashOTP]
      )
        .then(async (results) => {
          await sendEmail(req.body.email, otp, "singup")
            .then(async () => {
              return res.status(200).json({
                status: true,
                message: "Otp sent successfully",
                data: results
              });
            })
            .catch((err) => {
              return res.status(400).json({ status: false, message: err.message });
            });

        })
        .catch((err) => {
          return res.status(400).json({ status: false, message: err.message });
        });
    } catch (error) {
      return res.status(500).json({ status: false, error: error.message });
    }
  }

  static async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;

      const verifiedOTP = await db.oneOrNone(
        `SELECT *
         FROM otps
         WHERE email = $1`,
        [email]
      );
      if (!verifiedOTP) {
        return res.status(401).json({ status: false, error: 'OTP expired' });
      }
      const hashedOTP = verifiedOTP?.otp;
      const isMatch = await bcrypt.compare(otp, hashedOTP);
      if (isMatch) {
        await db.none(
          `DELETE FROM otps
           WHERE email = $1`,
          [email]
        );
        return res.status(200).json({ status: true, message: 'OTP verified successfully' });
      } else {
        return res.status(400).json({ status: false, error: 'Invalid OTP' });
      }
    } catch (error) {
      return res.status(500).json({ status: false, error: error.message });
    }
  }

  static async signIn(req, res) {
    try {
      const { email, password } = req.body;

      const userExists = await User.getUser(email);
      if (!userExists) {
        return res.status(409).json({ status: false, message: "User not found" });
      }
      let compare = await bcrypt.compare(password, userExists.password)
      if (!compare) {
        return res.status(401).json({ status: false, message: "Wrong password" })
      }
      let otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
      await db.none(
        `DELETE FROM otps
         WHERE email = $1`,
        [email]
      );
      const hashOTP = await bcrypt.hash(otp, 10);
      await db.one(
        `INSERT INTO otps (email, otp)
         VALUES ($1, $2)
         RETURNING *`,
        [email, hashOTP]
      )
      await sendEmail(email, otp, "signin")
        .then(async (results) => {
          return res.status(200).json({
            status: true,
            message: "Login OTP sent successfully",
            data: results
          });
        })
        .catch((err) => {
          return res.status(400).json({ status: false, message: err.message });
        });
    } catch (error) {
      return res.status(500).json({ status: false, error: error.message });
    }
  }

  static async verifyOtpAtLogin(req, res) {
    try {
      const { email, otp } = req.body;

      const verifiedOTP = await db.oneOrNone(
        `SELECT *
         FROM otps
         WHERE email = $1`,
        [email]
      );
      if (!verifiedOTP) {
        return res.status(401).json({ status: false, error: 'OTP expired' });
      }
      const hashedOTP = verifiedOTP?.otp;
      const isMatch = await bcrypt.compare(otp, hashedOTP);
      if (isMatch) {
        await db.none(
          `DELETE FROM otps
           WHERE email = $1`,
          [email]
        );
        let token = await genratetoken(email)
        return res.status(200).json({ status: true, message: 'User login successfully', token: token });
      } else {
        return res.status(400).json({ status: false, error: 'Invalid OTP' });
      }
    } catch (error) {
      return res.status(500).json({ status: false, error: error.message });
    }
  }

  static async getUserData(req, res) {
    try {
      const { email } = req.user;

      const userExists = await User.getUser(email);
      if (!userExists) {
        return res.status(409).json({ status: false, message: "User not found" });
      }else{
        return res.status(200).json({
          status: true,
          message: "User data fetched successfully",
          data: userExists
        });
      }
    } catch (error) {
      return res.status(500).json({ status: false, error: error.message });
    }
  }
}

module.exports = UserController;
