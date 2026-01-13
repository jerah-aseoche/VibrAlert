import express from "express";
import cors from "cors";
import deviceRoutes from "./routes/device.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/device", deviceRoutes);

app.get("/", (req, res) => {
  res.send("VibrAlert backend running");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Backend running on port 3000");
});

