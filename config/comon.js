module.exports = class  common 
{
    static async commonsuccess(data,message,code) {
        var success = {
            success: true,
            code:code,
            data :data,
            message :message
        }
        return success;
    }
    static async commonerror(data,message,code) {
          var error = {
            success: false,
            data :data,
            message :message
        }
        return error;
    }

    static async tokenError(data =[], message='') {
        var error = {
            success: false,
            data :data,
            message :message
        }
        return error;
    }
}