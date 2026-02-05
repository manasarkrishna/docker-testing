const express = require("express");
const router = express.Router();
const db = require("../db");
const { authMiddleware } = require("../middleware/auth");

// Validation helper
const validateIssue = (title, description, status) => {
  const errors = [];
  
  if (!title || typeof title !== 'string' || title.trim() === "") {
    errors.push("Title is required");
  } else if (title.trim().length > 200) {
    errors.push("Title cannot exceed 200 characters");
  }
  
  if (description && typeof description === 'string' && description.trim().length > 2000) {
    errors.push("Description cannot exceed 2000 characters");
  }
  
  if (status && !["open", "in_progress", "closed"].includes(status)) {
    errors.push("Invalid status. Must be one of: open, in_progress, closed");
  }
  
  return errors;
};

// CREATE issue (protected)
router.post("/", authMiddleware, (req, res) => {
  const { title, description } = req.body;
  const errors = validateIssue(title, description, "open");
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const now = new Date().toISOString();
  db.run(
    `INSERT INTO issues (title, description, status, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [title.trim(), description || "", "open", req.user.id, now, now],
    function (err) {
      if (err) {
        console.error("Database error:", err); // Debug log
        return res.status(500).json({ error: "Failed to create issue: " + err.message });
      }
      res.status(201).json({
        id: this.lastID,
        title: title.trim(),
        description: description || "",
        status: "open",
        user_id: req.user.id,
        created_at: now,
        updated_at: now
      });
    }
  );
});

// GET all issues with optional filtering (protected)
router.get("/", authMiddleware, (req, res) => {
  const { status } = req.query;
  let query = "SELECT * FROM issues ORDER BY created_at DESC";
  let params = [];

  if (status) {
    if (!["open", "in_progress", "closed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status filter" });
    }
    query = "SELECT * FROM issues WHERE status = ? ORDER BY created_at DESC";
    params.push(status);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch issues" });
    }
    res.json(rows || []);
  });
});

// GET issue by ID (protected)
router.get("/:id", authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid issue ID" });
  }

  db.get("SELECT * FROM issues WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch issue" });
    }
    if (!row) {
      return res.status(404).json({ error: "Issue not found" });
    }
    res.json(row);
  });
});

// UPDATE issue (protected)
router.put("/:id", authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, description, status } = req.body;
  
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid issue ID" });
  }

  // Validate at least one field is being updated
  if (title === undefined && description === undefined && status === undefined) {
    return res.status(400).json({ error: "At least one field (title, description, or status) is required for update" });
  }

  // Validate provided fields only (don't pass undefined values)
  const titleToValidate = title !== undefined ? title : "";
  const descriptionToValidate = description !== undefined ? description : "";
  const statusToValidate = status !== undefined ? status : "";
  const errors = [];
  
  if (title !== undefined) {
    if (!title || typeof title !== 'string' || title.trim() === "") {
      errors.push("Title is required");
    } else if (title.trim().length > 200) {
      errors.push("Title cannot exceed 200 characters");
    }
  }
  
  if (description !== undefined && typeof description === 'string' && description.trim().length > 2000) {
    errors.push("Description cannot exceed 2000 characters");
  }
  
  if (status !== undefined && !["open", "in_progress", "closed"].includes(status)) {
    errors.push("Invalid status. Must be one of: open, in_progress, closed");
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Build dynamic update query
  const updates = [];
  const params = [];

  if (title !== undefined) {
    updates.push("title = ?");
    params.push(title.trim());
  }
  if (description !== undefined) {
    updates.push("description = ?");
    params.push(description);
  }
  if (status !== undefined) {
    updates.push("status = ?");
    params.push(status);
  }

  updates.push("updated_at = ?");
  params.push(new Date().toISOString());
  params.push(id);

  const query = `UPDATE issues SET ${updates.join(", ")} WHERE id = ?`;

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({ error: "Failed to update issue" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // Return the updated issue
    db.get("SELECT * FROM issues WHERE id = ?", [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch updated issue" });
      }
      res.json(row);
    });
  });
});

// DELETE issue (optional but useful) (protected)
router.delete("/:id", authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid issue ID" });
  }

  db.run("DELETE FROM issues WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Failed to delete issue" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Issue not found" });
    }
    res.json({ message: "Issue deleted successfully" });
  });
});

module.exports = router;
