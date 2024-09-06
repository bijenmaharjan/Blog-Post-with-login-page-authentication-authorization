// const multer = require('multer');
// const crypto = require('crypto')
// const path = require('path');
// const { model } = require('mongoose');



// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {    // cb is a callback function so it has a argument of error,filename,destination.

//     cb(null, './public/images/uploads')// null because there is no error in cb.

//   },

//   //Using the crypto helps in security and it helps in buffering so that we can easily convert the binary digit number into a hex,binary or any alphabet.

//   filename: function (req, file, cb) {
//     crypto.randomBytes(12, (err, name) => {

//       const fn = name.toString('hex') + path.extname(file.originalname);
//       cb(null, fn);



//     })

//   }
// })

// const upload = multer({ storage: storage })

// module.exports=
