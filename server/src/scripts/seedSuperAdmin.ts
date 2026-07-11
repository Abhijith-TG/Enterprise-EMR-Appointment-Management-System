 // src/scripts/seedSuperAdmin.ts

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/user.model.js";
import { UserRole } from "../constants/roles.js";
import { hashPassword } from "../utils/bcrypt.js";

async function seed() {
  await connectDB();

  const admin = await User.findOne({
    role: UserRole.SUPER_ADMIN,
  });

  if (admin) {
    console.log("Super Admin already exists.");
    process.exit(0);
  }

  const password = await hashPassword("Admin@123");

  await User.create({
    firstName: "System",
    lastName: "Admin",
    email: "admin@hospital.com",
    password,
    role: UserRole.SUPER_ADMIN,
  });

  console.log("✅ Super Admin created.");

  process.exit(0);
}

seed();