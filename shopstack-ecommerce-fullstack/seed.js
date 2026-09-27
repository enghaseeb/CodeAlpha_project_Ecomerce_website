require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  {
    name: "Nova X Smartphone",
    description: "Fast 5G smartphone with a bright OLED display and 128GB storage.",
    price: 64999,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    stock: 15,
    rating: 4.7
  },
  {
    name: "ProBook Wireless Headphones",
    description: "Comfortable wireless headphones with active noise cancellation.",
    price: 12999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    stock: 25,
    rating: 4.6
  },
  {
    name: "Urban Classic Sneakers",
    description: "Everyday sneakers designed for comfort and casual style.",
    price: 7999,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    category: "Fashion",
    stock: 30,
    rating: 4.5
  },
  {
    name: "Minimal Backpack",
    description: "Water-resistant laptop backpack with multiple compartments.",
    price: 5499,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    category: "Fashion",
    stock: 18,
    rating: 4.4
  },
  {
    name: "Smart Fitness Watch",
    description: "Fitness tracker with heart-rate monitoring, GPS and notifications.",
    price: 15999,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    stock: 20,
    rating: 4.3
  },
  {
    name: "Mechanical Keyboard",
    description: "Compact mechanical keyboard with tactile switches and RGB lighting.",
    price: 8999,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    category: "Computers",
    stock: 22,
    rating: 4.8
  },
  {
    name: "Gaming Mouse",
    description: "Lightweight high-precision gaming mouse with programmable buttons.",
    price: 4499,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80",
    category: "Computers",
    stock: 40,
    rating: 4.6
  },
  {
    name: "Desk Lamp",
    description: "Adjustable LED desk lamp for study and work setups.",
    price: 2999,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    category: "Home",
    stock: 35,
    rating: 4.2
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("Products inserted successfully");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();
