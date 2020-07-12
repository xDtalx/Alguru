const fs = require('fs');
const path = require('path');
const Image = require('../models/image');

exports.getImage = (req, res, next) => {
  Image.findOne({ name: req.params.imageName })
    .then((image) => {
      res.status(200).contentType(image.img.contentType).send(image.img.data);
    })
    .catch(() => res.status(404).json({ message: 'Image not found' }));
};

exports.uploadImage = (req, res, next) => {
  const filePath = path.join(__dirname, '..', 'public', 'uploads', req.file.filename);
  const image = new Image({
    name: req.userData.username,
    img: {
      data: fs.readFileSync(filePath),
      contentType: req.file.mimetype
    }
  });

  fs.unlinkSync(filePath);

  image
    .save()
    .then((uploadedImg) => {
      res.status(200).json(uploadedImg.img);
    })
    .catch(() => res.status(500).json({ message: 'Unknown error' }));
};
