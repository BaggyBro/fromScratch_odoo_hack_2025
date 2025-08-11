import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // Use env var in production

// 📝 Signup function
export async function signupUser(req, res) {
  try {
    const { firstName, lastName, age, gender, city, country, email, description, password } = req.body;

    // Validation
    if (!firstName || !lastName || !age || !gender || !city || !country || !email || !password) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        age: parseInt(age),
        gender,
        city,
        country,
        email,
        passwordHash: hashedPassword,
        description
      }
    });

    // Remove passwordHash before returning
    const { passwordHash, ...userWithoutPassword } = newUser;
    return res.status(201).json({ success: true, user: userWithoutPassword });

  } catch (error) {
    console.error("Signup Error:", error.message);
    return res.status(500).json({ success: false, message: "Signup failed" });
  }
}

// 🔑 Login function
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove passwordHash before returning
    const { passwordHash, ...userWithoutPassword } = user;
    return res.status(200).json({ success: true, user: userWithoutPassword, token });

  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
}

export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
      }

      req.user = decoded; // { userId, email }
      next();
    });

  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
}
