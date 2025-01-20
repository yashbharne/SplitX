const User = require("../models/user.model.js");
const uploadOnCloudinary = require("../utils/cloudinary.utils.js");
const jwt = require("jsonwebtoken");

const validateEmailAndPhone = (email) => {
  console.log(email);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Invalid email format" };
  }

  return { isValid: true };
};

const generateAccessTokenAndRefreshToken = async (userId) => {
  console.log(userId);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Not a user" });
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

const registerUser = async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  console.log("file", req.file);
  const { countryCode, number } = JSON.parse(phoneNumber);
  console.log(countryCode, number);

  if ([name, email, password, phoneNumber].some((field) => field === "")) {
    return res.status(400).json({
      success: false,
      message: "All fields Are required",
    });
  }
  const existedUser = await User.findOne({
    email,
  });
  if (existedUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  const result = validateEmailAndPhone(email);
  console.log(result);

  if (!result.isValid) {
    return res.status(400).json({
      success: false,
      message: result.message,
    });
  }

  const profileLocalPath = await req.file?.path;
  console.log("File path", req.file?.path);

  if (!profileLocalPath) {
    return res.status(400).json({ message: "Avatar file is required 1" });
  }

  const profile = await uploadOnCloudinary(profileLocalPath);
  console.log(profile);

  if (!profile) {
    return res.status(400).json({ message: "Avatar file is required 2" });
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phoneNumber: {
      countryCode: countryCode,
      number: number,
    },
    profilePic: profile.url,
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong while registering user try again later",
    });
  }

  const createdUser = await User.findById(user._id).select("-password");
  return res
    .status(200)
    .json({ createdUser, message: "User Registered Successfully" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email && !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(400).json({ message: "User Not Found" });
  }

  const isPasswordCorrect = await user.comparePassword(password);
  console.log(isPasswordCorrect);

  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Invalid Password" });
  }
  console.log(user._id);

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);
  console.log(accessToken, refreshToken);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      loggedInUser,
      refreshToken,
      accessToken,
      message: "User logged In Successfully",
    });
};

const logoutUser = async (req, res) => {
  try {
    const refreshToken =
      req.cookie?.refreshToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!refreshToken) {
      res.status(400).json({ message: "No refresh token found" });
    }

    console.log(refreshToken);

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }

    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    const options = {
      httpOnly: true,
      secure: true,
    };

    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    return res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    return res.status(400).json({ message: `Something went wrong ${error}` });
  }
};
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = await req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        accessToken,
        refreshToken: newRefreshToken,
        message: "Tokens refreshed successfully",
      });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid refresh token", error: error.message });
  }
};

const getProfile = async (req, res) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decoded);
    const userId = decoded._id;
    console.log(userId);

    // Fetch the user profile from the database
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(403).json({ message: "Token is invalid or expired" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getProfile,
};
