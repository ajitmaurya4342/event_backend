const QRCode = require('qrcode');
// import { createCanvas, loadImage } from "canvas";
var fs = require('fs');

var opts = {
  errorCorrectionLevel: 'H',
  type: 'image/jpeg',
  quality: 0.3,
  margin: 1,
  width: '100',
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
};

const optsV2 = {
  errorCorrectionLevel: 'H',
  type: 'image/jpeg',
  quality: 0.3,
  margin: 1,
  width: '100',
  moduleStyle: {
    type: 'square',
    colordark: '#000000',
    colorlight: '#ffffff',
  },
  positionMarker: {
    squareType: 'none',
    squareColor: '#000000',
    innerType: 'square',
    innerColor: '#000000',
  },
  // image: imagepath,
};

module.exports.createQRCode = async (qrcode_data, returnType = 'buffer', logo) => {
  if (logo == 'fnb') {
    const qrcode = await QRCode.toDataURL(qrcode_data, opts);
    if (returnType == 'buffer') {
      return Buffer.from(qrcode.split(',')[1], 'base64');
    } else if (returnType == 'url') {
      return qrcode;
    } else {
      return Buffer.from(qrcode.split(',')[1], 'base64');
    }
  } else {
    const qrcode = await QRCode.toDataURL(qrcode_data, opts);
    if (returnType == 'buffer') {
      return Buffer.from(qrcode.split(',')[1], 'base64');
    } else if (returnType == 'url') {
      return qrcode;
    } else {
      return Buffer.from(qrcode.split(',')[1], 'base64');
    }
  }
};

module.exports.createQRCodeV2 = async (qrcode_data, returnType = 'buffer') => {
  let options = {
    errorCorrectionLevel: 'H',
    type: 'image/jpeg',
    quality: 0.3,
    margin: 1,
    width: '500',
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  };

  const qrcode = await QRCode.toDataURL(qrcode_data, options);
  if (returnType == 'buffer') {
    return Buffer.from(qrcode.split(',')[1], 'base64');
  } else if (returnType == 'url') {
    return qrcode;
  } else {
    return Buffer.from(qrcode.split(',')[1], 'base64');
  }
};
