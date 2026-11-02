
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Product = require("./models/Product");
const PurchaseRequest = require("./models/PurchaseRequest");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET is missing from your .env file!");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
    console.log("Connected database:", mongoose.connection.name);
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });

// Authentication middleware
const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please login first."
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired login. Please login again."
    });
  }
};

// Role authorization middleware
const allowRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        message: "You are not authorized to perform this action."
      });
    }

    next();
  };
};

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to UniMart Backend!");
});

// Register seller or purchaser
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Please fill in all fields."
      });
    }

    if (!["seller", "purchaser"].includes(role)) {
      return res.status(400).json({
        message: "Please select a valid role."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role
    });

    const token = jwt.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.log("Registration error:", error.message);

    res.status(500).json({
      message: "Unable to create account."
    });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.log("Login error:", error.message);

    res.status(500).json({
      message: "Unable to login."
    });
  }
});

// Get logged-in user's profile
app.get("/api/auth/me", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Add a product - sellers only
app.post(
  "/api/products",
  authenticateUser,
  allowRole("seller"),
  async (req, res) => {
    try {
      const {
        name,
        category,
        price,
        oldPrice,
        condition,
        image
      } = req.body;

      if (!name || !category || price === undefined || !condition) {
        return res.status(400).json({
          message: "Please provide all required product details."
        });
      }

      const product = new Product({
        name,
        category,
        price,
        oldPrice,
        condition,
        image,
        seller: req.user.name,
        sellerId: req.user.id,
        status: "Available"
      });

      const savedProduct = await product.save();

      res.status(201).json({
        message: "Product added successfully!",
        product: savedProduct
      });
    } catch (error) {
      console.log("Product error:", error.message);

      res.status(400).json({
        message: error.message
      });
    }
  }
);

// Get available marketplace products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({
      status: { $ne: "Sold" }
    }).sort({ _id: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Get products listed by logged-in seller
app.get(
  "/api/products/mine",
  authenticateUser,
  allowRole("seller"),
  async (req, res) => {
    try {
      const products = await Product.find({
        sellerId: req.user.id
      }).sort({ _id: -1 });

      res.json(products);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

// Seed sample products without duplicates
app.post("/api/products/seed", async (req, res) => {
  try {
    const sampleProducts = [
      {
        name: "PET",
        category: "Books",
        price: 250,
        oldPrice: 450,
        condition: "Good",
        image: "https://assets.cambridge.org/97811085/25213/large_cover/9781108525213i.jpg"
      },
      {
        name: "Scientific Calculator",
        category: "Electronics",
        price: 450,
        oldPrice: 800,
        condition: "Like New",
        image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTroS39Sop_kG8xbt4wcwwAC3TgrM6bAQXVPUectYrIu4xakDk9joGQ_AyUSIRjPzBiXFemSRROajguJPBQI_G02JqY4n5JxmaLH7fPwendFw_t_jYDG3TiQ45VdVHDYZ-79jTbND0&usqp=CAc"
      },
      {
        name: "Wireless Headphones",
        category: "Electronics",
        price: 699,
        oldPrice: 1200,
        condition: "Good",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
      },
      {
        name: "College Backpack",
        category: "Accessories",
        price: 399,
        oldPrice: 750,
        condition: "Like New",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"
      },
      {
        name: "Study Desk Lamp",
        category: "Essentials",
        price: 299,
        oldPrice: 500,
        condition: "Good",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600"
      },
      {
        name: "Laptop Stand",
        category: "Electronics",
        price: 349,
        oldPrice: 600,
        condition: "Like New",
        image: "https://m.media-amazon.com/images/I/61F20gXJS3L._AC_UF1000,1000_QL80_.jpg"
      },
      {
        name: "Notebook Set",
        category: "Essentials",
        price: 120,
        oldPrice: 200,
        condition: "New",
        image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600"
      },
      {
        name: "Wireless Mouse",
        category: "Electronics",
        price: 299,
        oldPrice: 550,
        condition: "Good",
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600"
      },
      {
        name: "Mechanical Keyboard",
        category: "Electronics",
        price: 899,
        oldPrice: 1500,
        condition: "Like New",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600"
      },
      {
        name: "Power Bank",
        category: "Electronics",
        price: 499,
        oldPrice: 850,
        condition: "Good",
        image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600"
      },
      {
        name: "Smart Watch",
        category: "Electronics",
        price: 799,
        oldPrice: 1400,
        condition: "Like New",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
      },
      {
        name: "Water Bottle",
        category: "Essentials",
        price: 199,
        oldPrice: 350,
        condition: "New",
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"
      },
      {
        name: "Wireless Earbuds",
        category: "Electronics",
        price: 599,
        oldPrice: 1000,
        condition: "Good",
        image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600"
      },
      {
        name: "Engineering Drafter",
        category: "Essentials",
        price: 180,
        oldPrice: 350,
        condition: "Good",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6HjVHeSUxHpfgeMg-_rsh9nwSJ30SJNCRQ-CzPCf8UA&s=10"
      },
      {
        name: "Lab Coat",
        category: "Accessories",
        price: 299,
        oldPrice: 500,
        condition: "Like New",
        image: "https://kewalson.com/cdn/shop/files/BlueCottonLabCoat_KS_COLABD.jpg?v=1758271247"
      }
    ];

    const operations = sampleProducts.map((item) => ({
      updateOne: {
        filter: { name: item.name },
        update: {
          $setOnInsert: {
            ...item,
            seller: "Student",
            status: "Available"
          }
        },
        upsert: true
      }
    }));

    const result = await Product.bulkWrite(operations);
    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      message: "Sample products processed successfully!",
      added: result.upsertedCount,
      totalProducts
    });
  } catch (error) {
    console.log("Seeding error:", error.message);

    res.status(500).json({
      message: error.message
    });
  }
});

// Create a purchase request - purchasers only
app.post(
  "/api/requests",
  authenticateUser,
  allowRole("purchaser"),
  async (req, res) => {
    try {
      const { product, message } = req.body;

      if (!product) {
        return res.status(400).json({
          message: "Please select a product."
        });
      }

      const existingProduct = await Product.findById(product);

      if (!existingProduct) {
        return res.status(404).json({
          message: "Product not found."
        });
      }

      // Prevent requests for sold products
      if (existingProduct.status === "Sold") {
        return res.status(400).json({
          message: "This product has already been sold."
        });
      }

      // Prevent requesting your own product
      if (
        existingProduct.sellerId &&
        existingProduct.sellerId.toString() === req.user.id
      ) {
        return res.status(400).json({
          message: "You cannot request your own product."
        });
      }

      // Prevent duplicate active purchase requests
      const existingRequest = await PurchaseRequest.findOne({
        product,
        buyerId: req.user.id,
        status: { $in: ["Pending", "Accepted", "Completed"] }
      });

      if (existingRequest) {
        return res.status(409).json({
          message: "You already have a request for this product."
        });
      }

      const request = new PurchaseRequest({
        product,
        buyerId: req.user.id,
        buyerName: req.user.name,
        buyerEmail: req.user.email,
        message: message || ""
      });

      const savedRequest = await request.save();

      res.status(201).json({
        message: "Purchase request submitted successfully!",
        request: savedRequest
      });
    } catch (error) {
      console.log("Purchase request error:", error);

      res.status(500).json({
        message: error.message
      });
    }
  }
);

// Get requests according to logged-in user's role
app.get(
  "/api/requests",
  authenticateUser,
  async (req, res) => {
    try {
      let requests;

      if (req.user.role === "seller") {
        const sellerProducts = await Product.find({
          sellerId: req.user.id
        }).select("_id");

        const productIds = sellerProducts.map((item) => item._id);

        requests = await PurchaseRequest.find({
          product: { $in: productIds }
        })
          .populate("product")
          .sort({ createdAt: -1 });
      } else {
        requests = await PurchaseRequest.find({
          buyerId: req.user.id
        })
          .populate("product")
          .sort({ createdAt: -1 });
      }

      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

// Update request status - only the product's seller
app.patch(
  "/api/requests/:id",
  authenticateUser,
  allowRole("seller"),
  async (req, res) => {
    try {
      const status = String(req.body.status || "")
        .trim()
        .toLowerCase();

      const allowedStatuses = {
        accepted: "Accepted",
        rejected: "Rejected",
        completed: "Completed"
      };

      const updatedStatus = allowedStatuses[status];

      if (!updatedStatus) {
        return res.status(400).json({
          message: "Invalid request status. Use Accepted, Rejected, or Completed."
        });
      }

      const request = await PurchaseRequest.findById(req.params.id)
        .populate("product");

      if (!request) {
        return res.status(404).json({
          message: "Purchase request not found."
        });
      }

      // Check whether this seller owns the product
      if (
        !request.product ||
        !request.product.sellerId ||
        request.product.sellerId.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message: "You cannot manage this purchase request."
        });
      }

      // Prevent changing rejected or completed requests
      if (["Rejected", "Completed"].includes(request.status)) {
        return res.status(400).json({
          message: "This request can no longer be changed."
        });
      }

      // Only accepted requests can be completed
      if (
        updatedStatus === "Completed" &&
        request.status !== "Accepted"
      ) {
        return res.status(400).json({
          message: "Only accepted requests can be marked as completed."
        });
      }

      // Prevent completing a product that is already sold
      if (
        updatedStatus === "Completed" &&
        request.product.status === "Sold"
      ) {
        return res.status(400).json({
          message: "This product has already been sold."
        });
      }

      // Update request status
      request.status = updatedStatus;
      await request.save();

      // Automatically mark the product as sold
      if (updatedStatus === "Completed") {
        await Product.findByIdAndUpdate(
          request.product._id,
          { status: "Sold" }
        );
      }

      return res.status(200).json({
        message: updatedStatus === "Completed"
          ? "Request completed and product marked as sold!"
          : `Request ${updatedStatus.toLowerCase()} successfully!`,
        request
      });
    } catch (error) {
      console.error("Request status update error:", error);

      return res.status(500).json({
        message: error.message
      });
    }
  }
);

// Delete a product - only its seller
app.delete(
  "/api/products/:id",
  authenticateUser,
  allowRole("seller"),
  async (req, res) => {
    try {
      const deletedProduct = await Product.findOneAndDelete({
        _id: req.params.id,
        sellerId: req.user.id
      });

      if (!deletedProduct) {
        return res.status(404).json({
          message: "Product not found in your listings."
        });
      }

      res.status(200).json({
        message: "Product deleted successfully!"
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`UniMart server running on port ${PORT}`);
});
