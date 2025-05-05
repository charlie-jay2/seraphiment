const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  try {
    // Use a persistent MongoDB connection
    const client = await MongoClient.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    const db = client.db();
    const blogsCollection = db.collection('blogs');

    // Fetch all blogs and posts
    const blogs = await blogsCollection.find().toArray();

    // Map the blogs data to the required format for the frontend
    const result = blogs.map(blog => ({
      blogName: blog.blogName,
      description: blog.description,
      posts: blog.posts.map(post => ({
        title: post.title,
        content: post.content,
        date: post.date ? new Date(post.date).toLocaleDateString('en-GB') : "No Date Provided",
        video: post.videoId ? `/getVideo/${post.videoId}` : "",
      })),
    }));

    client.close();

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error fetching blog data' }),
    };
  }
};
