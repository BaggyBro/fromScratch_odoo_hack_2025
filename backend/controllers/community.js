import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createCommunityPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!title || !content) return res.status(400).json({ error: "Title and content are required" });

    const newPost = await prisma.communityPost.create({
      data: { userId, title, content },
    });

    return res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create post" });
  }
};

export const getCommunityPosts = async (req, res) => {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, city: true, country: true } },
      },
    });
    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
};
