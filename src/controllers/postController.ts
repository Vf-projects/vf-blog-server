import { Request, Response } from "express";
import Post from "../models/Post.js";

// @desc Create post
export const createPost = async (req: any, res: Response) => {
  const { title, content } = req.body;

  try {
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Create post linked to logged-in user
    const post = await Post.create({
      title,
      content,
      user: req.user._id, // make sure req.user exists from your auth middleware
    });

    // Optionally populate user info if you want to display it on the frontend
    await post.populate("user", "name email"); 

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get all posts
export const getPosts = async (req: Request, res: Response) => {
  const posts = await Post.find().populate("user", "name email");
  res.json(posts);
};

// @desc Get single post
export const getPostById = async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.json(post);
};

// @desc Delete post
export const deletePost = async (req: any, res: Response) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Not authorized" });
  }

  await post.deleteOne();

  res.json({ message: "Post removed" });
};

// @desc Update Post
export const updatePost = async (req: any, res: Response) => {
  const { title, content } = req.body;

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    post.title = title || post.title;
    post.content = content || post.content;

    const updatedPost = await post.save();

    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};