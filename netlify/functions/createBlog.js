const { MongoClient } = require("mongodb");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const { blogName, description, content } = JSON.parse(event.body);

    if (!blogName || !description || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields." }),
      };
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db("seraphim");
    const collection = db.collection("blogs");

    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const dateString = `${day}/${month}/${year}`;

    const post = {
      title: blogName,
      date: dateString,
      content
    };

    const existing = await collection.findOne({ blogName });

    if (existing) {
      await collection.updateOne(
        { blogName },
        {
          $set: { description },
          $push: { posts: post }
        }
      );
    } else {
      await collection.insertOne({
        blogName,
        description,
        posts: [post]
      });
    }

    client.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Blog post saved!" }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error: err.message }),
    };
  }
};
