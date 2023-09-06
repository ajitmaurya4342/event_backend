var path = require('path');
var multer = require('multer');
const fs = require('fs');
let s3 = require('@auth0/s3');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(global.__base + '/public/uploads')) {
      fs.mkdirSync(path.normalize(global.__base + '/public/uploads'));
    }
    cb(null, path.normalize(global.__base + '/public/uploads'));
  },
});

export const uploadSingleFile = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== '.xls' && ext !== '.xlsx') {
      return callback('Only Files are allowed');
    }
    callback(null, true);
  },
}).single('file');

export const uploadImage = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (
      ext !== '.png' &&
      ext !== '.jpg' &&
      ext !== '.gif' &&
      ext !== '.jpeg' &&
      ext !== '.PNG' &&
      ext !== '.SVG' &&
      ext !== '.JPG' &&
      ext !== '.JPEG' &&
      ext !== '.svg' &&
      !file.mimetype.includes('image')
    ) {
      return callback('Only images are allowed');
    }
    callback(null, true);
  },
  // limits: {
  //   fileSize: 1024 * 1024 // Bytes
  // }
}).single('image');

export const uploadToS3 = (dirPath, OGfileName, callback) => {
  let folder = path.normalize(`${global.__base}/public${dirPath}`);
  let fileName = OGfileName.replace(/[/\\?%*:|"<>]/g, '-');
  let FinalUploadImagePath = `S3${dirPath}${fileName}`;

  let params = {
    localFile: folder + OGfileName,
    s3Params: {
      Bucket: global.config.configuration.awsConfig.bucketName,
      Key: FinalUploadImagePath, // `S3${dirPath}${fileName}`,
    },
  };
  console.log('params :', params);
  const AWS = require('aws-sdk');
  const awsS3Client = new AWS.S3(global.config.configuration.awsConfig);
  let client = s3.createClient({
    s3Client: awsS3Client,
    maxAsyncS3: 20, // this is the default
    s3RetryCount: 3, // this is the default
    s3RetryDelay: 1000, // this is the default
    multipartUploadThreshold: 20971520, // this is the default (20 MB)
    multipartUploadSize: 15728640, // this is the default (15 MB)
  });
  let uploader = client.uploadFile(params);

  uploader.on('progress', function () {
    // console.log('progress', uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);
  });
  uploader.on('error', function (error) {
    console.error('unable to upload:', error.stack);
    callback(error, null);
  });
  uploader.on('end', function () {
    callback(null, FinalUploadImagePath);
  });
};
