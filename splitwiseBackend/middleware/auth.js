const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");

const verifyJwt = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    console.log("AccessToken");

    if (!token) {
      return res.status(401).json({ message: "Unauthorized Request" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expired" });
        }
        return res.status(401).json({ message: "Invalid access token" });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res
      .status(401)
      .json({ message: error?.message || "Invalid access token" });
  }
};
module.exports = verifyJwt;
