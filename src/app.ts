import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./middleware/error.middleware";


const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());


app.use("/api/v1/auth", authRoutes);
app.use(errorHandler);


app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

export default app;