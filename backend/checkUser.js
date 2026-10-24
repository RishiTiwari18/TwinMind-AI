require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = process.argv[2]?.trim().toLowerCase();

    if (!email) {
      console.log(
        "Usage: node checkUser.js your-email@example.com"
      );
      return;
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.log("RESULT: User not found in this database.");
      return;
    }

    console.log("RESULT: User found.");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Password hash exists:", Boolean(user.password));

    console.log(
      "Password hash format:",
      user.password?.startsWith("$2") ? "bcrypt" : "unexpected"
    );
  } catch (error) {
    console.error("Diagnostic failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser();