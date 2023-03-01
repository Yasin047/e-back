const Product = require("../models/product.model");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

const getProductController = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const perPage = req.query.perPage || 20;

    let getProduct;
    let match = {};
    if (req.query.filteredBy) {
      match.$or = [
        { productCategory: { $regex: req.query.filteredBy, $options: "i" } },
        // { productPrice: { $regex: req.query.filteredBy, $options: "i" } },
      ];
    }
    if (req.query.key) {
      match.$or = [{ productName: { $regex: req.query.key, $options: "i" } }];
    }
    if (req.query.sortBy) {
      const arr1 = req.query.sortBy.split(":")[1];
      let customsort;
      if (arr1 === "asce") {
        customsort = {
          productPrice: 1,
        };
      } else if (arr1 === "dsce") {
        customsort = {
          productPrice: -1,
        };
      }
      getProduct = await Product.find().sort(customsort);
    } else {
      getProduct = await Product.aggregate([{ $match: match }])
        .skip((page - 1) * parseInt(perPage))
        .limit(parseInt(perPage));
    }
    const totalProduct = await Product.countDocuments();
    res.status(200).json({
      getProduct,
      totalProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

const getAllProductController = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const perPage = req.query.perPage || 10;
    const allProduct = await Product.find()
      .skip((page - 1) * parseInt(perPage))
      .limit(parseInt(perPage));

    const totalProduct = await Product.countDocuments();

    res.status(200).json({
      success: true,
      allProduct,
      totalProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

const createProductController = async (req, res) => {
  try {
    const {
      productName,
      productDescription,
      productPrice,
      discountPrice,
      color,
      size,
      productCategory,
      productStock,
    } = req.body;
    var imageUrlList = [];
    var imagePublickId = [];

    for (var i = 0; i < req.files.length; i++) {
      var productFile = req.files[i].path;
      const uploadRes = await cloudinary.uploader.upload(productFile, {
        folder: "products",
      });
      imageUrlList.push(uploadRes.url);
      imagePublickId.push(uploadRes.public_id);
    }
    let newProduct = new Product({
      productName,
      productDescription,
      productPrice,
      discountPrice,
      color,
      size,
      productCategory,
      productStock,
      images: {
        public_id: imagePublickId,
        url: imageUrlList,
      },
    });
    newProduct = await newProduct.save();

    return res.status(200).json({
      success: true,
      message: "Product is created successfully!",
      newProduct,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

const updateProductController = async (req, res) => {
  try {
    const {
      _id,
      productName,
      productDescription,
      productPrice,
      discountPrice,
      color,
      size,
      productCategory,
      productStock,
    } = req.body;
    const product = await Product.findOne({ _id });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product is not Found!" });
    }

    let updatedProduct;

    if (req.files.length > 0) {
      for (var i = 0; i < product.images[0].public_id.length; i++) {
        await cloudinary.uploader.destroy(product.images[0].public_id[i]);
      }
      var imageUrlList = [];
      var imagePublickId = [];

      for (var i = 0; i < req.files.length; i++) {
        var productFile = req.files[i].path;
        const uploadRes = await cloudinary.uploader.upload(productFile, {
          folder: "products",
        });
        imageUrlList.push(uploadRes.url);
        imagePublickId.push(uploadRes.public_id);
      }
      updatedProduct = await Product.findOneAndUpdate(
        { _id },
        {
          $set: {
            productName,
            productDescription,
            productPrice,
            discountPrice,
            color,
            size,
            productCategory,
            productStock,
            images: {
              public_id: imagePublickId,
              url: imageUrlList,
            },
          },
        },
        { new: true }
      );
    } else {
      updatedProduct = await Product.findOneAndUpdate(
        { _id },
        {
          $set: {
            productName,
            productDescription,
            productPrice,
            discountPrice,
            color,
            size,
            productCategory,
            productStock,
          },
        },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Product is updated successfully!",
      updatedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({
      success: false,
      message: "Product is not updated successfully!",
    });
  }
};

const deleteProductController = async (req, res) => {
  try {
    const { _id } = req.body;
    const product = await Product.findOne({ _id });
    if (!product) {
      return res.status(404).json({
        message: "Product is not found!",
      });
    }
    for (var i = 0; i < product.images[0].public_id.length; i++) {
      await cloudinary.uploader.destroy(product.images[0].public_id[i]);
    }
    const deletedProduct = await Product.findOneAndDelete({ _id });
    res.status(200).json({
      success: true,
      message: "Product is deleted Successfully!",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Product is not delete!" });
  }
};

const singleProductController = async (req, res) => {
  try {
    const singleProduct = await Product.findById(req.params._id);
    if (!singleProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product is not Found!" });
    }
    res.status(200).json({
      success: true,
      singleProduct,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Product is not found!" });
  }
};

module.exports = {
  getProductController,
  getAllProductController,
  createProductController,
  updateProductController,
  deleteProductController,
  singleProductController,
};
