require("dotenv").config();
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const {getUser} = require('../helper.js')
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };
module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, async(jwt_payload, done) => {
      let user = await getUser(jwt_payload.email)
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }    
    })
  );
};
