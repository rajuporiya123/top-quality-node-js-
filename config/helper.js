const bcrypt = require("bcryptjs");

module.exports = class Helper {
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