const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

const USERS_FILE = "./database/users.json";
const BLOGS_FILE = "./database/blogs.json";

const readData = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

app.post("/register", (req, res) => {
  const { username, password, fullName, age, email, gender } = req.body;
  let users = readData(USERS_FILE);

  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }
  if (users.some((user) => user.email === email)) {
    return res.status(400).json({ message: "Email already registered" });
  }
  if (
    !username ||
    username.length < 3 ||
    !password ||
    password.length < 5 ||
    !email ||
    !age ||
    age < 10
  ) {
    return res.status(400).json({ message: "Invalid data" });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password,
    fullName: fullName || "",
    age,
    email,
    gender: gender || "",
  };

  users.push(newUser);
  writeData(USERS_FILE, users);
  res
    .status(201)
    .json({ message: "User registered successfully", user: newUser });
});

app.get("/profile/:identifier", (req, res) => {
  const { identifier } = req.params;
  const users = readData(USERS_FILE);
  const user = users.find(
    (u) => u.username === identifier || u.email === identifier
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

app.put("/profile/:identifier", (req, res) => {
  const { identifier } = req.params;
  const { username, password, fullName, age, email, gender } = req.body;
  let users = readData(USERS_FILE);
  const userIndex = users.findIndex(
    (u) => u.username === identifier || u.email === identifier
  );

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  if (
    username &&
    users.some(
      (user) => user.username === username && user.id !== users[userIndex].id
    )
  ) {
    return res.status(400).json({ message: "Username already exists" });
  }
  if (
    email &&
    users.some(
      (user) => user.email === email && user.id !== users[userIndex].id
    )
  ) {
    return res.status(400).json({ message: "Email already registered" });
  }

  users[userIndex] = {
    ...users[userIndex],
    username,
    password,
    fullName,
    age,
    email,
    gender,
  };
  writeData(USERS_FILE, users);
  res.json({ message: "Profile updated successfully", user: users[userIndex] });
});

app.delete("/profile/:identifier", (req, res) => {
  const { identifier } = req.params;
  let users = readData(USERS_FILE);
  const userIndex = users.findIndex(
    (u) => u.username === identifier || u.email === identifier
  );

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  users.splice(userIndex, 1);
  writeData(USERS_FILE, users);
  res.json({ message: "Profile deleted successfully" });
});

app.post("/blog", (req, res) => {
  const { title, slug, content, tags } = req.body;
  let blogs = readData(BLOGS_FILE);

  if (!title || !slug || !content || !Array.isArray(tags)) {
    return res.status(400).json({ message: "Invalid blog data" });
  }

  const newBlog = {
    id: blogs.length + 1,
    title,
    slug,
    content,
    tags,
    comments: [],
  };

  blogs.push(newBlog);
  writeData(BLOGS_FILE, blogs);
  res.status(201).json({ message: "Blog created successfully", blog: newBlog });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
