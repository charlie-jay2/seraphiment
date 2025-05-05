const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  try {
    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Username and password are required" }),
      };
    }

    // MongoDB connection
    const client = await MongoClient.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db('seraphim');
    const usersCollection = db.collection('users');

    // Find user with matching username and password
    const user = await usersCollection.findOne({ username, password });

    client.close();

    if (user) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, error: "Invalid username or password" }),
      };
    }
  } catch (error) {
    console.error("Error during login:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: "Internal server error" }),
    };
  }
};
