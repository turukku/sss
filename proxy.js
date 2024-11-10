const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const port = 3000;

// Sisanya sama seperti kode sebelumnya


app.use(express.json());

app.post("/bulk-shorten", async (req, res) => {
  const urls = req.body.urls; // Menerima array URL dari klien
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "Please provide an array of URLs." });
  }

  try {
    // Memproses setiap URL secara berurutan
    const promises = urls.map(async (url) => {
      const response = await fetch("https://clcr.me/api/v1/action/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.API_KEY}`
        },
        body: JSON.stringify({ url: url })
      });
      const data = await response.json();
      return { original: url, shortUrl: data.shortUrl || null, error: data.message || null };
    });

    // Tunggu hingga semua permintaan selesai
    const results = await Promise.all(promises);

    // Kirimkan hasilnya kembali ke klien
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong while processing URLs." });
  }
});

app.listen(port, () => {
  console.log(`Proxy server is running at http://localhost:${port}`);
});
