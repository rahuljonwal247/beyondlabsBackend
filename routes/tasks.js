const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// ─────────────────────────────────────────
// GET /api/tasks
// Fetch all tasks, newest first
// ─────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching tasks",
    });
  }
});

// ─────────────────────────────────────────
// POST /api/tasks
// Create a new task
// Body: { title: string }
// ─────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    // Validate title
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Task title is required and cannot be empty",
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Task title cannot exceed 200 characters",
      });
    }

    const task = new Task({ title: title.trim() });
    await task.save();

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    console.error("POST /api/tasks error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating task",
    });
  }
});

// ─────────────────────────────────────────
// PUT /api/tasks/:id
// Update task status (mark as completed)
// Body: { status: "completed" }
// ─────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    if (!status || !["pending", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'pending' or 'completed'",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Prevent re-completing an already completed task
    if (task.status === "completed" && status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Task is already marked as completed",
      });
    }

    task.status = status;
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID format",
      });
    }
    console.error("PUT /api/tasks/:id error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating task",
    });
  }
});

module.exports = router;