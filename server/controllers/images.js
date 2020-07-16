const fs = require('fs');
const path = require('path');
const Image = require('../models/image');

exports.getImage = (req, res) => {
  Image.findOne({ name: req.params.imageName })
    .then((image) => {
      res.status(200).contentType(image.img.contentType).send(image.img.data);
    })
    .catch(() => res.status(404).json({ message: 'Image not found' }));
};

exports.uploadImage = (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', 'uploads', req.file.filename);
  const image = new Image({
    name: req.userData.username,
    img: {
      data: fs.readFileSync(filePath),
      contentType: req.file.mimetype
    }
  });

  fs.unlinkSync(filePath);

  Image.exists({ name: image.name }).then(async (isExists) => {
    if (isExists) {
      await updateImage(res, image);
    } else {
      fs.unlinkSync(filePath);
      await saveImage(res, image);
    }
  });
};

function saveImage(res, image) {
  image
    .save()
    .then(() => {
      res.status(200).json({
        message: 'Image uploaded successfully',
        url: `${process.env.BACKEND_URL}/image/${image.name}`
      });
    })
    .catch(() => res.status(500).json({ message: 'Unknown error' }));
}

async function updateImage(res, image) {
  Image.findOneAndUpdate(
    {
      name: image.name
    },
    {
      img: image.img,
      createdAt: image.createdAt
    }
  )
    .then(() => {
      res.status(200).json({
        message: 'Image updated successfully',
        url: `${process.env.BACKEND_URL}/image/${image.name}`
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: 'Could not update image' });
    });
}
