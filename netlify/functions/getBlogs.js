// netlify/functions/getBlogs.js
const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  let client;
  try {
    console.log('Connecting to MongoDB...');
    client = await MongoClient.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db();
    const blogsCollection = db.collection('blogs');

    console.log('Fetching blogs...');
    const blogs = await blogsCollection.find().toArray();

    // Check if blogs are returned properly
    if (!blogs || blogs.length === 0) {
      console.error('No blogs found in the database.');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No blogs found in the database' }),
      };
    }

    // Log the blogs for debugging
    console.log('Fetched blogs:', blogs);

    // Format the blogs correctly
    const result = blogs.map(blog => ({
      _id: blog._id.toString(),
      blogName: blog.blogName,
      description: blog.description,
      posts: (blog.posts || []).map(post => ({
        title:   post.title,
        content: post.content,
        date:    post.date ? new Date(post.date).toLocaleDateString('en-GB') : 'No Date Provided',
      })),
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error fetching blog data' }),
    };
  } finally {
    if (client) await client.close();
  }
};
