// netlify/functions/deleteBlog.js
const { MongoClient, ObjectId } = require("mongodb");

exports.handler = async (event, context) => {
  const blogId = event.queryStringParameters && event.queryStringParameters.blogId;
  if (!blogId || !ObjectId.isValid(blogId)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid or missing blogId" }),
    };
  }

  let client;
  try {
    client = await MongoClient.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // use the default database from your URI
    const db = client.db();
    const blogsCollection = db.collection("blogs");

    const result = await blogsCollection.deleteOne({ _id: new ObjectId(blogId) });
    if (result.deletedCount === 1) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Blog deleted successfully" }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Blog not found" }),
      };
    }
  } catch (err) {
    console.error("Error deleting blog:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  } finally {
    if (client) await client.close();
  }
};
