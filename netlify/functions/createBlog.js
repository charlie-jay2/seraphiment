const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  try {
    // Parse the incoming request body
    const { blogName, description, posts } = JSON.parse(event.body);

    // Validate the input data
    if (!blogName || !description || !Array.isArray(posts)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid input. Missing required fields.' }),
      };
    }

    // Use a persistent MongoDB connection
    const client = await MongoClient.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db();
    const blogsCollection = db.collection('blogs');

    // Insert the new blog with posts
    const result = await blogsCollection.insertOne({
      blogName,
      description,
      posts, // Assuming posts is an array of objects
    });

    client.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, blogId: result.insertedId, blogName }),
    };
  } catch (error) {
    console.error("Error creating blog:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error creating blog' }),
    };
  }
};
