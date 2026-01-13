import express from "express";
import cors from "cors";
import deviceRoutes from "./routes/device.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/device", deviceRoutes);

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
