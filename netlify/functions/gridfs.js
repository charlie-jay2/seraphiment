const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const connectToDB = require('./db');

let gfs;

async function initializeGridFS() {
  const db = await connectToDB();
  gfs = Grid(db, mongoose.mongo);
  gfs.collection('uploads'); // Use 'uploads' as the GridFS collection
}

async function uploadFile(file) {
  if (!gfs) await initializeGridFS();

  const writeStream = gfs.createWriteStream({
    filename: file.originalname,
    content_type: file.mimetype,
  });

  file.stream.pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on('close', (file) => resolve(file));
    writeStream.on('error', (err) => reject(err));
  });
}

async function getFileById(fileId) {
  if (!gfs) await initializeGridFS();

  return new Promise((resolve, reject) => {
    gfs.files.findOne({ _id: mongoose.Types.ObjectId(fileId) }, (err, file) => {
      if (err) return reject(err);
      resolve(file);
    });
  });
}

module.exports = { uploadFile, getFileById };
