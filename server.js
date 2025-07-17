require("dotenv").config();
console.log("ENV:", {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GITHUB_OWNER: process.env.GITHUB_OWNER,
  GITHUB_REPO: process.env.GITHUB_REPO,
  GITHUB_FOLDER: process.env.GITHUB_FOLDER,
});
const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const port = 3000;

const {
  GITHUB_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_FOLDER,
} = process.env;

app.use(express.static("public"));

// API: proxy đến GitHub để lấy ảnh
app.get("/api/images", async (req, res) => {
  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FOLDER}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!Array.isArray(response.data)) {
      console.error("GitHub response:", response.data);
      return res.status(400).json({ error: "Unexpected response format", data: response.data });
    }

    const imageUrls = response.data
      .filter((item) => item.type === "file" && item.download_url)
      .map((item) => ({
        name: item.name,
        url: item.download_url,
      }));

    res.json(imageUrls);
  } catch (error) {
    console.error("❌ Error from GitHub API:", error.response?.status, error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch images", details: error.response?.data || error.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});