import { connectDB } from "../config/db.js";
import { Department } from "../models/department.model.js";

const departments = [
  {
    name: "General Medicine",
    description: "General medical consultations",
  },
  {
    name: "Cardiology",
    description: "Heart and cardiovascular care",
  },
  {
    name: "Neurology",
    description: "Brain and nervous system",
  },
  {
    name: "Orthopedics",
    description: "Bones and joints",
  },
  {
    name: "Dermatology",
    description: "Skin care and treatment",
  },
  {
    name: "Pediatrics",
    description: "Children's healthcare",
  },
  {
    name: "Gynecology",
    description: "Women's healthcare",
  },
  {
    name: "ENT",
    description: "Ear, Nose and Throat",
  },
  {
    name: "Ophthalmology",
    description: "Eye care",
  },
  {
    name: "Psychiatry",
    description: "Mental health",
  },
];

const seedDepartments = async () => {
  try {
    await connectDB();

    for (const department of departments) {
      await Department.updateOne(
        { name: department.name },
        { $set: department },
        { upsert: true }
      );
    }

    console.log("Departments seeded successfully.");

    process.exit(0);
  } catch (error) {
    console.error("Failed to seed departments:", error);
    process.exit(1);
  }
};

seedDepartments();