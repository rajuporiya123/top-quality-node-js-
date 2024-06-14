const bcrypt = require('bcryptjs')

module.exports = class Constant {
    static async passwordCompare(old_password, new_password) {
        return new Promise(async function (resolve, reject) {
            const match = await bcrypt.compare(new_password, old_password);
            resolve(match);
        });
    }

    static async passwordHashValue(password) {
      return new Promise(async function (resolve, reject) {
        bcrypt.hash(password, 10, async function (err, hash) {
          if (err) {
            reject(err);
          } else {
            console.log("err");
            resolve(hash);
          }
        });
      });
    }
}