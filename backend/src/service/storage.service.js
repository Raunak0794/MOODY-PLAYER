var ImageKit = require("imagekit");

var imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
});

function uploadfile(file){
    return new Promise((resolve, reject) => {
        imagekit.upload({
            file: file.buffer,   // buffer from multer
            fileName: Math.random().toString(36).substring(2, 10),
            folder: "moody-song"
        }, (error, result) => {
            if (error) reject(error)
            else resolve(result)
        })
    })
}

module.exports = uploadfile
