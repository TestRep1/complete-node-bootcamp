const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./controllerFactory');

// const storage = multer.diskStorage({
//   destination:  (req, file, cb) => {
//     cb(null, process.cwd() + '/public/uploads')
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, `${req.user.id}-${uniqueSuffix}.${ext}`)
//   }
// })

const storage = multer.memoryStorage();

const upload = multer({ storage });
exports.uploadUserPhoto = upload.single('photoField');

exports.resizeUserPhoto = (req, res, next) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  req.file.filename = `${req.user.id}-${uniqueSuffix}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/uploads/${req.file.filename}`);
    
    next();
};

const pickFields = (obj, ...fields) => {
  let newObj = {};
  Object.keys(obj).forEach(key => {
    if (fields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

//POPULATE USER ID MIDDLEWARE
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log('req.file', req.file);

  const filteredBody = pickFields(req.body, 'name', 'email'); //check if undefined

  if (req.file) {
    filteredBody.photo = req.file.filename;
  }

  console.log({ filteredBody });
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'success',
    data: null
  });
});

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.getUser = Factory.getOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
