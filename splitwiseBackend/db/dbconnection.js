const mongoose = require("mongoose");

const connectDB = async () => {
  try {
   
    const connectionInstance = await mongoose.connect(
      `${process.env.DB_URI}/${process.env.DB_NAME}`
    );
    console.log(
      "MongoDB connected Sucessfully",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("MongoDB connection Failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
