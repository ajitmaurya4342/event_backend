const checkValidation = (validateArray, reqObj) => {
  return new Promise((resolve, reject) => {
    let count = 0;
    validateArray.map(x => {
      if (reqObj.hasOwnProperty(x) == false) {
        resolve({ status: false, message: x + ' key does not exist' });
        count++;
      } else if (typeof reqObj[x] == 'boolean') {
        console.log('BOolean', x);
      } else if (typeof reqObj[x] == 'number' && reqObj[x] == 0) {
        console.log('Number', x);
      } else if (
        reqObj[x] == '' ||
        reqObj[x] == null ||
        reqObj[x] == undefined ||
        reqObj[x] == 'undefined' ||
        reqObj[x] == 'null'
      ) {
        resolve({ status: false, message: x + ' cannot be empty or undefined or 0' });
      }
    });

    if (count == 0) {
      resolve({ status: true, message: '' });
    }
  });
};

module.exports.checkValidation = checkValidation;
