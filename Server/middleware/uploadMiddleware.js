const multer = require('multer');
const path = require('path');
const fs = require('fs');
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: You can only upload image files (jpeg, jpg, png, gif)!'));
    }
}

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/profiles';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadProfileImage = multer({
    storage: profileStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single('profileImage'); 


const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/logos';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadOrganisationLogo = multer({
    storage: logoStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single('organisationLogo'); 

module.exports = {
    uploadProfileImage,
    uploadOrganisationLogo
};