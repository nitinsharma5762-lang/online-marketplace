import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing existing categories and products...");
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log("🌱 Seeding Categories & Subcategories...");

    // 1. Fruits & Vegetables
    const fruitsVeg = await Category.create({
      name: "Fruits & Vegetables",
      description: "Fresh fruits and daily vegetables",
      image: "https://example.com/images/fruits-vegetables.png",
    });
    const freshFruits = await Category.create({
      name: "Fresh Fruits",
      parentCategory: fruitsVeg._id,
      image: "https://example.com/images/fresh-fruits.png",
    });
    const freshVegetables = await Category.create({
      name: "Fresh Vegetables",
      parentCategory: fruitsVeg._id,
      image: "https://example.com/images/fresh-vegetables.png",
    });

    // 2. Dairy & Bread
    const dairyBread = await Category.create({
      name: "Dairy & Bread",
      description: "Milk, butter, cheese, and bread",
      image: "https://example.com/images/dairy-bread.png",
    });
    const milkCream = await Category.create({
      name: "Milk & Cream",
      parentCategory: dairyBread._id,
      image: "https://example.com/images/milk-cream.png",
    });
    const butterCheese = await Category.create({
      name: "Butter, Cheese & Paneer",
      parentCategory: dairyBread._id,
      image: "https://example.com/images/butter-cheese.png",
    });

    // 3. Spices & Masalas
    const spicesMasalas = await Category.create({
      name: "Spices & Masalas",
      description: "Aromatic whole and powdered Indian spices",
      image: "https://example.com/images/spices.png",
    });
    const wholeSpices = await Category.create({
      name: "Whole Spices",
      parentCategory: spicesMasalas._id,
    });
    const powderedSpices = await Category.create({
      name: "Powdered Spices",
      parentCategory: spicesMasalas._id,
    });

    // 4. Daily Needs / Household
    const dailyNeeds = await Category.create({
      name: "Daily Needs & Household",
      description: "Cleaning, home care, and daily essentials",
      image: "https://example.com/images/daily-needs.png",
    });
    const homeCleaning = await Category.create({
      name: "Home Cleaning",
      parentCategory: dailyNeeds._id,
    });
    const personalCare = await Category.create({
      name: "Personal Care",
      parentCategory: dailyNeeds._id,
    });

    console.log("✅ Categories seeded successfully!");

    const dummySellerId = "seller-uuid-12345";
    const products = [];

    // --- FRUITS (10 products) ---
    const fruitsData = [
      { name: "Alphonso Mangoes", price: 599, originalPrice: 799, unit: "kg", unitValue: 1, seasons: ["summer"], offerTag: "Seasonal Deal" },
      { name: "Shimla Apples", price: 180, originalPrice: 220, unit: "kg", unitValue: 1, seasons: ["winter", "all-season"] },
      { name: "Fresh Banana", price: 49, originalPrice: 49, unit: "piece", unitValue: 6 },
      { name: "Nagpur Oranges", price: 99, originalPrice: 120, unit: "kg", unitValue: 1, seasons: ["winter"] },
      { name: "Green Grapes", price: 80, originalPrice: 100, unit: "g", unitValue: 500, seasons: ["spring"] },
      { name: "Papaya Raw", price: 50, originalPrice: 50, unit: "piece", unitValue: 1 },
      { name: "Pomegranate (Anar)", price: 199, originalPrice: 249, unit: "kg", unitValue: 1, offerTag: "Super Saver" },
      { name: "Pineapple", price: 79, originalPrice: 90, unit: "piece", unitValue: 1 },
      { name: "Watermelon", price: 60, originalPrice: 80, unit: "piece", unitValue: 1, seasons: ["summer"] },
      { name: "Kiwi Fruit", price: 99, originalPrice: 130, unit: "pack", unitValue: 1, unitText: "3 pcs Pack" },
    ];
    fruitsData.forEach((p, idx) => {
      products.push({
        userId: dummySellerId,
        name: p.name,
        description: `Premium quality fresh ${p.name.toLowerCase()} sourced from local farms.`,
        categoryId: fruitsVeg._id,
        subCategoryId: freshFruits._id,
        brand: "FarmFresh",
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        stock: 50 + idx * 10,
        unit: p.unit,
        unitValue: p.unitValue,
        unitText: p.unitText || "",
        seasons: p.seasons || ["all-season"],
        offerTag: p.offerTag || "",
        images: [`https://example.com/images/fruits/${idx + 1}.jpg`],
        status: "approved",
      });
    });

    // --- VEGETABLES (10 products) ---
    const vegData = [
      { name: "Organic Potatoes", price: 35, originalPrice: 35, unit: "kg", unitValue: 1 },
      { name: "Hybrid Tomatoes", price: 29, originalPrice: 40, unit: "kg", unitValue: 1, offerTag: "Flat 27% Off" },
      { name: "Red Onions", price: 45, originalPrice: 45, unit: "kg", unitValue: 1 },
      { name: "Fresh Spinach (Palak)", price: 20, originalPrice: 30, unit: "g", unitValue: 250, seasons: ["winter", "monsoon"], offerTag: "Buy 1 Get 1 Free" },
      { name: "Green Chillies", price: 15, originalPrice: 15, unit: "g", unitValue: 100 },
      { name: "Coriander Leaves", price: 10, originalPrice: 12, unit: "g", unitValue: 100 },
      { name: "English Cucumber", price: 39, originalPrice: 49, unit: "g", unitValue: 500, seasons: ["summer"] },
      { name: "Ladies Finger (Bhindi)", price: 40, originalPrice: 50, unit: "g", unitValue: 500 },
      { name: "Cauliflower", price: 30, originalPrice: 35, unit: "piece", unitValue: 1, seasons: ["winter"] },
      { name: "Garlic (Lahsun)", price: 60, originalPrice: 70, unit: "g", unitValue: 200 },
    ];
    vegData.forEach((p, idx) => {
      products.push({
        userId: dummySellerId,
        name: p.name,
        description: `Clean and hygienic fresh ${p.name.toLowerCase()} for daily cooking.`,
        categoryId: fruitsVeg._id,
        subCategoryId: freshVegetables._id,
        brand: "FarmFresh",
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        stock: 100 + idx * 15,
        unit: p.unit,
        unitValue: p.unitValue,
        seasons: p.seasons || ["all-season"],
        offerTag: p.offerTag || "",
        images: [`https://example.com/images/veg/${idx + 1}.jpg`],
        status: "approved",
      });
    });

    // --- DAIRY (10 products) ---
    const dairyData = [
      { name: "Amul Taaza Toned Milk", price: 27, originalPrice: 27, unit: "ml", unitValue: 500, isMilk: true },
      { name: "Amul Gold Full Cream Milk", price: 66, originalPrice: 68, unit: "l", unitValue: 1, isMilk: true },
      { name: "Amul Butter Salted", price: 265, originalPrice: 275, unit: "g", unitValue: 500, offerTag: "Save ₹10" },
      { name: "Mother Dairy Paneer", price: 85, originalPrice: 90, unit: "g", unitValue: 200 },
      { name: "Amul Cheese Slices", price: 140, originalPrice: 150, unit: "g", unitValue: 200 },
      { name: "Amul Masti Spiced Buttermilk", price: 15, originalPrice: 15, unit: "ml", unitValue: 200, seasons: ["summer"] },
      { name: "Mother Dairy Classic Dahi", price: 35, originalPrice: 40, unit: "g", unitValue: 400 },
      { name: "Nestle a+ Greek Yogurt", price: 50, originalPrice: 60, unit: "g", unitValue: 100, offerTag: "Flat 16% Off" },
      { name: "Amul Fresh Cream", price: 62, originalPrice: 65, unit: "ml", unitValue: 250 },
      { name: "Gowardhan Pure Cow Ghee", price: 650, originalPrice: 700, unit: "ml", unitValue: 1000, offerTag: "Special Offer" },
    ];
    dairyData.forEach((p, idx) => {
      products.push({
        userId: dummySellerId,
        name: p.name,
        description: `Premium dairy product from trusted brand.`,
        categoryId: dairyBread._id,
        subCategoryId: p.isMilk ? milkCream._id : butterCheese._id,
        brand: p.name.split(" ")[0],
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        stock: 80 + idx * 8,
        unit: p.unit,
        unitValue: p.unitValue,
        seasons: p.seasons || ["all-season"],
        offerTag: p.offerTag || "",
        images: [`https://example.com/images/dairy/${idx + 1}.jpg`],
        status: "approved",
      });
    });

    // --- SPICES & MASALAS (10 products) ---
    const spicesData = [
      { name: "Catch Turmeric Powder (Haldi)", price: 28, originalPrice: 32, unit: "g", unitValue: 100, isWhole: false },
      { name: "Tata Sampann Coriander Powder", price: 34, originalPrice: 38, unit: "g", unitValue: 100, isWhole: false },
      { name: "MDH Kashmiri Mirch Powder", price: 85, originalPrice: 95, unit: "g", unitValue: 100, isWhole: false, offerTag: "Recommended" },
      { name: "Everest Garam Masala", price: 78, originalPrice: 85, unit: "g", unitValue: 100, isWhole: false },
      { name: "Whole Black Pepper (Kali Mirch)", price: 120, originalPrice: 150, unit: "g", unitValue: 100, isWhole: true, offerTag: "Flat 20% Off" },
      { name: "Green Cardamom (Elaichi)", price: 299, originalPrice: 350, unit: "g", unitValue: 50, isWhole: true },
      { name: "Cumin Seeds (Jeera)", price: 90, originalPrice: 110, unit: "g", unitValue: 200, isWhole: true },
      { name: "Cloves (Laung)", price: 80, originalPrice: 95, unit: "g", unitValue: 50, isWhole: true },
      { name: "Catch Hing (Asafoetida)", price: 55, originalPrice: 55, unit: "g", unitValue: 50, isWhole: false },
      { name: "MDH Kitchen King Masala", price: 82, originalPrice: 90, unit: "g", unitValue: 100, isWhole: false },
    ];
    spicesData.forEach((p, idx) => {
      products.push({
        userId: dummySellerId,
        name: p.name,
        description: `Authentic and aromatic spices to enrich your kitchen dishes.`,
        categoryId: spicesMasalas._id,
        subCategoryId: p.isWhole ? wholeSpices._id : powderedSpices._id,
        brand: p.name.includes("Tata") ? "Tata" : p.name.includes("MDH") ? "MDH" : p.name.includes("Catch") ? "Catch" : p.name.includes("Everest") ? "Everest" : "IndianSpices",
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        stock: 150 + idx * 5,
        unit: p.unit,
        unitValue: p.unitValue,
        seasons: ["all-season"],
        offerTag: p.offerTag || "",
        images: [`https://example.com/images/spices/${idx + 1}.jpg`],
        status: "approved",
      });
    });

    // --- DAILY NEEDS / HOUSEHOLD (10 products) ---
    const dailyNeedsData = [
      { name: "Vim Dishwash Liquid Gel", price: 115, originalPrice: 125, unit: "ml", unitValue: 500, isCleaning: true, brand: "Vim", offerTag: "Save ₹10" },
      { name: "Surf Excel Easy Wash Detergent", price: 140, originalPrice: 150, unit: "kg", unitValue: 1, isCleaning: true, brand: "Surf Excel" },
      { name: "Dettol Liquid Handwash Refill", price: 99, originalPrice: 119, unit: "ml", unitValue: 750, isCleaning: false, brand: "Dettol", offerTag: "Bestseller" },
      { name: "Lizol Disinfectant Floor Cleaner", price: 185, originalPrice: 205, unit: "ml", unitValue: 975, isCleaning: true, brand: "Lizol" },
      { name: "Harpic Power Blue Toilet Cleaner", price: 93, originalPrice: 99, unit: "ml", unitValue: 500, isCleaning: true, brand: "Harpic" },
      { name: "Colgate Strong Teeth Toothpaste", price: 110, originalPrice: 120, unit: "g", unitValue: 250, isCleaning: false, brand: "Colgate" },
      { name: "Dettol Antiseptic Liquid", price: 331, originalPrice: 349, unit: "ml", unitValue: 1000, isCleaning: false, brand: "Dettol", offerTag: "Flat 5% Off" },
      { name: "Pears Pure & Gentle Soap Bar", price: 145, originalPrice: 180, unit: "piece", unitValue: 3, isCleaning: false, brand: "Pears", unitText: "3 x 125g Pack", offerTag: "Super Value Pack" },
      { name: "Sunsilk Black Shine Shampoo", price: 199, originalPrice: 249, unit: "ml", unitValue: 350, isCleaning: false, brand: "Sunsilk" },
      { name: "Ariel All-in-One Pods", price: 340, originalPrice: 399, unit: "pack", unitValue: 1, unitText: "18 Pods Pack", isCleaning: true, brand: "Ariel", offerTag: "Special Offer" },
    ];
    dailyNeedsData.forEach((p, idx) => {
      products.push({
        userId: dummySellerId,
        name: p.name,
        description: `Essential home utility product for your daily comfort and hygiene.`,
        categoryId: dailyNeeds._id,
        subCategoryId: p.isCleaning ? homeCleaning._id : personalCare._id,
        brand: p.brand,
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        stock: 70 + idx * 12,
        unit: p.unit,
        unitValue: p.unitValue,
        unitText: p.unitText || "",
        seasons: ["all-season"],
        offerTag: p.offerTag || "",
        images: [`https://example.com/images/household/${idx + 1}.jpg`],
        status: "approved",
      });
    });

    console.log(`🌱 Inserting ${products.length} products...`);
    for (const prod of products) {
      await Product.create(prod);
    }

    console.log("✅ 50 Products seeded successfully!");
    console.log("🎉 Database seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
