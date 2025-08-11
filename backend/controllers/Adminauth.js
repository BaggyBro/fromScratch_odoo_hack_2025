import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function signupAdmin(req, res) {
  try {
    const { firstName, lastName, email, password, adminCode } = req.body;

    // 1️⃣ Validate required fields
    if (!firstName || !lastName || !email || !password || !adminCode) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 2️⃣ Check secret admin code
    if (adminCode !== process.env.ADMIN_SECRET_CODE) {
      return res.status(403).json({ success: false, message: "Invalid admin code" });
    }

    // 3️⃣ Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create admin
    const admin = await prisma.admin.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword
      }
    });

    // 6️⃣ Optionally issue JWT token
    const token = jwt.sign(
      { adminId: admin.admin_id, role: "admin" },
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
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
