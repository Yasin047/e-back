const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cloudinary = require("../utils/cloudinary");
const moment = require("moment");

const createUserController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "User already exists" });

    const profileImg = await cloudinary.v2.uploader.upload(req.file.path);
    if (!profileImg) {
      return res.status(500).json({ message: "Image is required" });
    }
    bcrypt.hash(password, 8, async (err, hash) => {
      const newUser = new User({
        name,
        email,
        password: hash,
        image: {
          public_id: profileImg.public_id,
          url: profileImg.url,
        },
      });
      await newUser.save();

      res.status(200).json({
        success: true,
        msg: "User is created Successfully",
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Error: " + error.message);
  }
};
const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image.url,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "2d",
    });

    return res.status(200).json({
      success: true,
      msg: "User is logged in successfuly!",
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Error: " + error.msg);
  }
};

const userDetailsController = async (req, res) => {
  const user = await User.findById(req.params._id);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found!",
    });
  }
  res.status(200).json({
    success: true,
    user,
  });
};

const userForgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not Found!",
      });

    const payload = {
      id: user._id,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "5min",
    });

    //Send Email
    const link =
      "http://" +
      req.hostname +
      ":e-front.vercel.app/resetpassword?token=" +
      token;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "yasinmahmud0047@gmail.com",
        pass: "xiswpidntubseglv",
      },
    });

    let mailOptions = {
      from: "yasinmahmud0047@gmail.com",
      to: user.email,
      subject: "Reset Password Mail!",
      html: `Please Reset Your Password  by Clicking <a href="${link}">here</a> <br/>
    This link will be valid for only 5 min`,
    };

    const sendMail = transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    return res.status(201).json({
      success: true,
      msg: "Check your Email!",
    });
  } catch (error) {
    console.log(error);
  }
};

const verifyTokenController = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

    if (!decodedToken)
      return res.status(404).json({
        success: false,
        message: "Invalid Token!",
      });
    const user = await User.findOne({ email: decodedToken.email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    res.status(200).json({
      success: true,
      message: "Token is verified!",
      data: decodedToken.email,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

const userResetPasswordController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please provide a strong password!!",
      });
    }
    if (!user)
      return res.status(400).json({
        success: false,
        message: "User not Found!",
      });

    bcrypt.hash(password, 8, async (error, hash) => {
      const updatedPassword = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            password: hash,
          },
        },
        {
          new: true,
        }
      );
      if (updatedPassword)
        return res.status(200).json({
          success: true,
          message: "Password updated successfully!",
          updatedPassword,
        });
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

const updateUserProfileController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    let updatedProfile;
    if (req.file) {
      await cloudinary.uploader.destroy(user.image.public_id);
      const profileImg = await cloudinary.v2.uploader.upload(req.file.path);
      updatedProfile = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            image: {
              public_id: profileImg.public_id,
              url: profileImg.url,
            },
          },
        },
        {
          new: true,
        }
      );
    } else {
      bcrypt.hash(password, 8, async (error, hash) => {
        updatedProfile = await User.findOneAndUpdate(
          { email },
          {
            $set: {
              password: hash,
            },
          },
          {
            new: true,
          }
        );
      });
    }
    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      updatedProfile,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

const userProfileDeleteController = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id)
      return res.status(404).json({ message: "Please provide your id" });
    const user = await User.findOne({ _id });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not Found!",
      });
    await cloudinary.uploader.destroy(user.image.public_id);
    const deletedProfile = await User.findOneAndDelete({ _id });
    res.status(200).json({
      success: true,
      message: "User is deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Product is not delete!" });
  }
};

const getAllUserController = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const perPage = req.query.perPage || 10;

    const allUser = await User.find()
      .skip((page - 1) * parseInt(perPage))
      .limit(parseInt(perPage));

    const totalUser = await User.countDocuments();
    res.status(200).json({
      success: true,
      allUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

const updateUserRoleController = async (req, res) => {
  try {
    const { _id, role } = req.body;
    const user = await User.findOne({ _id });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    const updateUserRole = await User.findOneAndUpdate(
      { _id },
      {
        $set: {
          role,
        },
      }
    );
    res.status(200).json({
      success: true,
      message: "User role updated successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

const deleteUserController = async (req, res) => {
  try {
    const { _id } = req.body;
    const user = await User.findOne({ _id });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    await cloudinary.uploader.destroy(user.image.public_id);
    await user.remove();
    res.status(200).json({
      success: true,
      message: "User is deleted Successfully!",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "User is not delete!" });
  }
};

const weeklyTrafficesController = async (req, res) => {
  try {
    const last7days = moment()
      .day(moment().day() - 7)
      .format("MMMM Do YYYY, h:mm:ss a");
    const user = await User.aggregate([
      {
        $match: { createdAt: { $gte: new Date(last7days) } },
      },
      {
        $project: {
          day: { $dayOfWeek: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$day",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({ success: true, info: user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Something went wrong!" });
  }
};

module.exports = {
  createUserController,
  loginUserController,
  userDetailsController,
  userForgotPasswordController,
  verifyTokenController,
  userResetPasswordController,
  updateUserProfileController,
  userProfileDeleteController,
  getAllUserController,
  updateUserRoleController,
  deleteUserController,
  weeklyTrafficesController,
};
