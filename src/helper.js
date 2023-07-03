const db = require('../db.js');

class User {
  static async getUser(email) {
    try {
        const userExists = await db.oneOrNone(
            `SELECT *
             FROM users
             WHERE email = $1`,
            [email]
          );
      return userExists;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
