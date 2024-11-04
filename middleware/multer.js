const multer = require('multer');
const fs = require('fs');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads');
    if(!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, {recursive : true})
    }
      cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  })
  
  const upload = multer({ storage: storage })

  module.exports = upload;