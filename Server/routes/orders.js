// const { Order } = require("../models/orders");
// const { Product } = require("../models/products");
// const express = require("express");
// const router = express.Router();
// const mongoose = require("mongoose");

// router.get("/", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const perPage = 100;
//     const totalPosts = await Order.countDocuments();
//     const totalPages = Math.ceil(totalPosts / perPage);

//     if (page < 1 || page > totalPages) {
//       return res.status(404).json({ message: "Page not found" });
//     }

//     const orderList = await Order.find()
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .exec();

//     if (!orderList) {
//       res.status(500).json({ success: false });
//     }

//     return res.status(200).json({
//       orderList: orderList,
//       totalPages: totalPages,
//       page: page,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ success: false });
//   }
// });

// router.delete("/:id", async (req, res) => {
//   const order = await Order.findByIdAndDelete(req.params.id);
//   if (!order) {
//     res.status(404).json({
//       message: "Order not found",
//       success: false,
//     });
//   }
//   res.status(200).json({
//     success: true,
//     message: "Order is deleted",
//   });
// });

// router.post("/create", async (req, res) => {
//   try {
//     const productsWithSellerIds = await Promise.all(
//       req.body.products.map(async (product) => {
//         const fullProduct = await Product.findById(product.productId);
//         return {
//           ...product,
//           sellerId: fullProduct.sellerId, // Ensure sellerId is included
//         };
//       })
//     );

//     let order = new Order({
//       ...req.body,
//       products: productsWithSellerIds,
//     });

//     order = await order.save();
//     res.status(201).json(order);
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// router.put("/:id", async (req, res) => {
//   const order = await Order.findByIdAndUpdate(
//     req.params.id,
//     {
//       name: req.body.name,
//       phone: req.body.phone,
//       address: req.body.address,
//       pinCode: req.body.pinCode,
//       amount: req.body.amount,
//       paymentId: req.body.paymentId,
//       email: req.body.email,
//       userId: req.body.userId,
//       products: req.body.products,
//       status: req.body.status,
//     },
//     { new: true }
//   );
//   if (!order) {
//     return res.status(500).json({ message: "Order cannot be updated!" });
//   }
//   res.send(order);
// });

// module.exports = router;

// orders.js (API Route)
const { Order } = require("../models/orders");
const { Product } = require("../models/products");
const express = require("express");
const router = express.Router();

router.get("/seller/:sellerId", async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 50;

    // 1. First get all orders
    const allOrders = await Order.find()
      .sort({ date: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean()
      .exec();

    // 2. Process each order to check for seller's products
    const sellerOrders = [];

    for (const order of allOrders) {
      // Get all product IDs from the order
      const productIds = order.products.map((product) => product._id);

      // Fetch the actual products from Products collection
      const productsData = await Product.find({
        _id: { $in: productIds },
        sellerId: sellerId,
      }).lean();

      // If any products belong to this seller
      if (productsData.length > 0) {
        // Create a map of product data for quick lookup
        const productDataMap = productsData.reduce((acc, product) => {
          acc[product._id.toString()] = product;
          return acc;
        }, {});

        // Filter order products to only include seller's products
        const sellerProducts = order.products.filter(
          (orderProduct) => productDataMap[orderProduct._id.toString()]
        );

        // Calculate total amount for seller's products
        const sellerAmount = sellerProducts.reduce(
          (sum, product) => sum + product.price * product.quantity,
          0
        );

        // Add this order to seller's orders with only their products
        sellerOrders.push({
          ...order,
          products: sellerProducts,
          sellerAmount,
        });
      }
    }

    // 3. Get total count for pagination
    const totalOrders = await Order.countDocuments({
      "products._id": {
        $in: await Product.find({ sellerId: sellerId }).distinct("_id"),
      },
    });

    const totalPages = Math.ceil(totalOrders / perPage);

    return res.status(200).json({
      orderList: sellerOrders,
      totalPages,
      currentPage: page,
      totalOrders,
    });
  } catch (err) {
    console.error("Error in /seller/:sellerId route:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Updated order creation route to include complete product information
router.post("/create", async (req, res) => {
  try {
    // Fetch complete product details for each product in the order
    const productsWithDetails = await Promise.all(
      req.body.products.map(async (orderProduct) => {
        const product = await Product.findById(orderProduct._id);
        if (!product) {
          throw new Error(`Product not found with id: ${orderProduct._id}`);
        }
        return {
          _id: product._id,
          productName: product.name,
          price: product.price,
          quantity: orderProduct.quantity,
          image: product.images[0], // Assuming first image is main image
          total: product.price * orderProduct.quantity,
        };
      })
    );

    let order = new Order({
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      pinCode: req.body.pinCode,
      amount: req.body.amount,
      paymentId: req.body.paymentId,
      email: req.body.email,
      userId: req.body.userId,
      products: productsWithDetails,
      status: "pending",
      date: new Date(),
    });

    order = await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
