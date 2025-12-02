import express from "express";

const router = express.Router();

const users = [
  { username: "rohan", password: "012345", role: "admin" },
  { username: "user01", password: "abcde", role: "user" },
];

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    user: {
      username: user.username,
      role: user.role,
    },
    token: `mock-token-${user.username}`,
  });
});

export default router;


