const { MongoClient, GridFSBucket } = require('mongodb');
const Busboy = require('busboy');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const busboy = new Busboy({ headers: event.headers });
  const fields = {};
  let fileBuffer = Buffer.alloc(0);
  let fileName = '';
  let fileMimeType = '';
  
  return new Promise((resolve, reject) => {
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      fileName = filename;
      fileMimeType = mimetype;

      file.on('data', (data) => {
        fileBuffer = Buffer.concat([fileBuffer, data]);
      });
    });

    busboy.on('field', (fieldname, value) => {
      fields[fieldname] = value;
    });

    busboy.on('finish', async () => {
      try {
        // Validate required fields
        if (!fields.blogName || !fields.description || !fields.content) {
          return reject({
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing required fields: blogName, description, or content' }),
          });
        }

        const client = await MongoClient.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        const db = client.db();
        const bucket = new GridFSBucket(db, { bucketName: 'videos' });

        let videoId = null;

        // Upload the video if a file is provided
        if (fileBuffer.length > 0) {
          const uploadStream = bucket.openUploadStream(fileName, {
            contentType: fileMimeType,
            metadata: { uploadedBy: 'admin', uploadDate: new Date() },
          });

          uploadStream.end(fileBuffer);
          videoId = uploadStream.id; // Save the video ID if uploaded
        }

        // Insert the blog post into the database
        const blogPost = {
          blogName: fields.blogName,
          description: fields.description,
          content: fields.content,
          date: new Date().toLocaleDateString('en-GB'),
          videoId: videoId || null, // Video ID will be null if no video is uploaded
        };

        await db.collection('blogs').insertOne(blogPost);
        client.close();

        resolve({
          statusCode: 200,
          body: JSON.stringify({ message: 'Blog post created successfully!' }),
        });
      } catch (error) {
        console.error('Error creating blog:', error);
        reject({
          statusCode: 500,
          body: JSON.stringify({ error: 'Error creating blog post' }),
        });
      }
    });

    busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
    busboy.end();
  });
};
