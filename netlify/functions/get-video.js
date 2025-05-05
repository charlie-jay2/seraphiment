const { getFileById } = require('./gridfs');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const fileId = event.queryStringParameters.id;
  if (!fileId) {
    return { statusCode: 400, body: 'Missing file ID' };
  }

  try {
    const file = await getFileById(fileId);
    if (!file) {
      return { statusCode: 404, body: 'File not found' };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': file.contentType,
        'Content-Disposition': `inline; filename="${file.filename}"`,
      },
      body: file.stream,
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Error retrieving file' };
  }
};
