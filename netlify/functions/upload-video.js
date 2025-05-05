const { uploadFile } = require('./gridfs');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Upload file to GridFS
  const form = new formidable.IncomingForm();
  form.parse(event.body, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return { statusCode: 400, body: 'Failed to parse form data' };
    }

    const file = files.video;
    if (!file) {
      return { statusCode: 400, body: 'No video uploaded' };
    }

    try {
      const uploadedFile = await uploadFile(file);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'File uploaded successfully!', file: uploadedFile }),
      };
    } catch (error) {
      console.error(error);
      return { statusCode: 500, body: 'Error uploading file' };
    }
  });
};
