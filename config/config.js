const fs = require('fs')
const path = require('path')
var randomstring = require('randomstring')
const base64Img = require('base64-img')

module.exports = class UploadFile {
  static async uploadDocument(req) {
    var aPromise = new Promise(function (resolve, reject) {
      try {
        var document_dir = 'public/profile/'

        if (!fs.existsSync(document_dir)) {
          fs.mkdirSync(document_dir)
        }

        var oldPath = req.body.avatar.path
        var newPath = path.join(__dirname, '../')
        let filesplit = req.body.avatar.originalFilename.split('.')
        let fileExtension = filesplit[filesplit.length - 1]
        const file_name = randomstring.generate()
        var newPath = newPath + document_dir + file_name + '.' + fileExtension
        var rawData = fs.readFileSync(oldPath)

        fs.writeFile(newPath, rawData, async function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(file_name + '.' + fileExtension)
          }
        })
      } catch (error) {
        console.log('profile image upload error', error)
        reject(error)
      }
    })
    return aPromise
  }

  static async uploadEventDocument(req) {
    var aPromise = new Promise(function (resolve, reject) {
      try {
        var document_dir = 'public/event/'

        if (!fs.existsSync(document_dir)) {
          fs.mkdirSync(document_dir)
        }

        var oldPath = req.body.banner.path
        var newPath = path.join(__dirname, '../')
        let filesplit = req.body.banner.originalFilename.split('.')
        let fileExtension = filesplit[filesplit.length - 1]
        const file_name = randomstring.generate()
        var newPath = newPath + document_dir + file_name + '.' + fileExtension
        var rawData = fs.readFileSync(oldPath)

        fs.writeFile(newPath, rawData, async function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(file_name + '.' + fileExtension)
          }
        })
      } catch (error) {
        console.log('profile image upload error', error)
        reject(error)
      }
    })
    return aPromise
  }

  static async uploadAddonImage(image) {
    var aPromise = new Promise(function (resolve, reject) {
      try {
        var document_dir = 'public/addon/'

        if (!fs.existsSync(document_dir)) {
          fs.mkdirSync(document_dir)
        }

        var oldPath = image.path
        var newPath = path.join(__dirname, '../')
        let filesplit = image.originalFilename.split('.')
        let fileExtension = filesplit[filesplit.length - 1]
        const file_name = 'addon' + randomstring.generate()
        var newPath = newPath + document_dir + file_name + '.' + fileExtension
        var rawData = fs.readFileSync(oldPath)

        fs.writeFile(newPath, rawData, async function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(file_name + '.' + fileExtension)
          }
        })
      } catch (error) {
        console.log('addon image upload error', error)
        reject(error)
      }
    })
    return aPromise
  }

  static async uploadOrganizationLogo(req) {
    var aPromise = new Promise(function (resolve, reject) {
      try {
        var document_dir = 'public/organization/'

        if (!fs.existsSync(document_dir)) {
          fs.mkdirSync(document_dir)
        }

        var oldPath = req.body.organizationLogo.path
        var newPath = path.join(__dirname, '../')
        let filesplit = req.body.organizationLogo.originalFilename.split('.')
        let fileExtension = filesplit[filesplit.length - 1]
        const file_name = randomstring.generate()
        var newPath = newPath + document_dir + file_name + '.' + fileExtension
        var rawData = fs.readFileSync(oldPath)

        fs.writeFile(newPath, rawData, async function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(file_name + '.' + fileExtension)
          }
        })
      } catch (error) {
        console.log('organization logo upload error', error)
        reject(error)
      }
    })
    return aPromise
  }

  static async uploadOrganizerProfileImage(req) {
    var aPromise = new Promise(function (resolve, reject) {
      try {
        var document_dir = 'public/organizer/'

        if (!fs.existsSync(document_dir)) {
          fs.mkdirSync(document_dir)
        }

        var oldPath = req.body.organizerProfileImage.path
        var newPath = path.join(__dirname, '../')
        let filesplit =
          req.body.organizerProfileImage.originalFilename.split('.')
        let fileExtension = filesplit[filesplit.length - 1]
        const file_name = randomstring.generate()
        var newPath = newPath + document_dir + file_name + '.' + fileExtension
        var rawData = fs.readFileSync(oldPath)

        fs.writeFile(newPath, rawData, async function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(file_name + '.' + fileExtension)
          }
        })
      } catch (error) {
        console.log('organizer profile image upload error', error)
        reject(error)
      }
    })
    return aPromise
  }

  static async deleteExiestingAddonImage(image) {
    var aPromise = new Promise(function (resolve, reject) {
      try {
        let newpath = path.join(__dirname, '../')
        let document_dir = 'public/addon/'
        newpath = newpath + document_dir + image

        fs.unlinkSync(newpath, async function (err) {
          if (err) {
            reject(err)
          } else {
            resolve('file deleted successfully')
          }
        })
      } catch (error) {
        console.log('exiesting addon image not deleted', error)
        reject(error)
      }
    })
    return aPromise
  }

  // static async imageUpload(image, directory, image_name, image_type) {
  //   let imageType = image_type == 'jpeg' ? 'jpg' : image_type
  //   var aPromise = new Promise(function (resolve, reject) {
  //     try {
  //       base64Img.img(
  //         image,
  //         directory,
  //         image_name,
  //         async function (err, filepath) {
  //           console.log('Filepath>>>>>>>>>>>>', filepath)
  //           if (err) {
  //             console.log('addon image upload error ', err)
  //             reject(err)
  //           } else {
  //             var addon_image_name = image_name + '.' + imageType
  //             resolve(addon_image_name)
  //           }
  //         }
  //       )
  //     } catch (error) {
  //       console.log('addon image upload error', error)
  //       reject(error)
  //     }
  //   })
  //   return aPromise
  // }
  static async imageUpload(image, directory) {
    try {
      const image_type = image.split(';')[0].split('/')[1]
      const imageName = 'addon' + randomstring.generate()
      const path = `${directory}/${imageName}.${image_type}`
      const base64Data = image.replace(/^data:([A-Za-z-+/]+);base64,/, '')
      fs.writeFileSync(path, base64Data, { encoding: 'base64' })
      return `${imageName}.${image_type}`
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  static async uploadStaffImage(req) {
    var aPromise = new Promise(function (resolve, reject) {
      try {
        var staff_dir = 'public/userStaff/'

        if (!fs.existsSync(staff_dir)) {
          fs.mkdirSync(staff_dir)
        }

        var oldPath = req.body.image.path
        var newPath = path.join(__dirname, '../')
        let filesplit = req.body.image.originalFilename.split('.')
        let fileExtension = filesplit[filesplit.length - 1]
        const file_name = randomstring.generate()
        var newPath = newPath + staff_dir + file_name + '.' + fileExtension
        var rawData = fs.readFileSync(oldPath)

        fs.writeFile(newPath, rawData, async function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(file_name + '.' + fileExtension)
          }
        })
      } catch (error) {
        console.log('user staff profile image upload error', error)
        reject(error)
      }
    })
    return aPromise
  }

  static async paginator(items, current_page, per_page_items) {
    let page = current_page || 1,
      per_page = per_page_items || 4,
      offset = (page - 1) * per_page,
      paginatedItems = items.slice(offset).slice(0, per_page_items),
      total_pages = Math.ceil(items.length / per_page)

    return {
      page: page,
      perPage: per_page,
      prePage: page - 1 ? page - 1 : null,
      nextPage: total_pages > page ? page + 1 : null,
      total: items.length,
      totalPages: total_pages,
      data: paginatedItems,
      totalDocs: items.length,
    }
  }
}
