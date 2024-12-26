import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/polling", (req, res) => {
  console.log(`Getting requests from ${req.ip} at ${new Date().toISOString()}`);

  const data = {
    message: "Hello world",
    timestamp: new Date().toISOString(),
  };

  res.json(data);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
