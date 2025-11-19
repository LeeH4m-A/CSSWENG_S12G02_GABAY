// src/model/db.js
import mongoose from "mongoose";

const MONGO_URI = encodeURI(process.env.MONGODB_URI || "mongodb://localhost:27017/gabayDB");

async function connect() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB (Mongoose) successfully");
    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
}

export default { connect, mongoose };
