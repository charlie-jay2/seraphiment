const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

let db = null;

async function connectToDB() {
  if (db) return db; // Return cached connection if already established
  const mongoURI = process.env.MONGO_URI; // Your MongoDB URI from .env

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = mongoose.connection;
    console.log('MongoDB connected');
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    throw new Error('Failed to connect to MongoDB');
  }
}

module.exports = connectToDB;
