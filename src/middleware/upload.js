const multer = require("multer");
const fs = require("fs");
const path = require("path");

const imageStorage = multer.diskStorage({
  destination: async function (req, file, cb) {  
    if (file.fieldname == "image") {            
      const imageDir = path.join("src","public", "Proof-Images");
      if (fs.existsSync(imageDir)) {
        cb(null, imageDir);
      } else {
        fs.mkdirSync(imageDir, { recursive: true });
        cb(null, imageDir);
        }
    }          
  },
  filename: async function (req, file, cb) {   
    cb(null, file.originalname);
  },
});

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    const fileType = /jpeg|jpg|png|svg|SVG/;
    const extension = file.originalname.substring(
      file.originalname.lastIndexOf(".") + 1
    );
    const mimetype = fileType.test(file.mimetype);

    if (mimetype && extension) {
      return cb(null, true);
    } else {
      cb("You can upload only Image file");
    }
  },
});

module.exports = {uploadImage};
