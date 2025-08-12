import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function signupAdmin(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1️⃣ Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // 2️⃣ Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create admin in User table
    const adminUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash: hashedPassword,
        age: 0, // temporary value unless made optional
        gender: "Not Specified",
        city: "N/A",
        country: "N/A",
        userRole: "admin"
      }
    });

    // 5️⃣ Issue JWT token
    const token = jwt.sign(
      { userId: adminUser.id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      token
    });

  } catch (error) {
    console.error("Admin Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

export async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // 2️⃣ Find admin user by email
    const admin = await prisma.user.findFirst({
      where: {
        email,
        userRole: "admin"
      }
    });

    // 3️⃣ Check if admin exists
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials"
      });
    }

    // 4️⃣ Verify password
    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials"
      });
    }

    // 5️⃣ Generate JWT token
    const token = jwt.sign(
      { userId: admin.id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6️⃣ Send success response
    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token,
      admin: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.userRole
      }
    });

  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}