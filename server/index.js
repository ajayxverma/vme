import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { register } from "./controller/auth.js";
import authRoutes from "./routes/auth-routes.js";
import userRoutes from "./routes/users-routes.js";
import { logger } from "./logger.js";
import { corsOptions } from "./middleware/core-middleware.js";
/* CONFIGURATION */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors(corsOptions));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
/* File Storage */
dotenv.config();
const storage = multer.diskStorage({
  distination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });
/* Routes */
app.post("/auth/register", upload.single("picture"), register);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
logger.info(
  `[Index] Port:: ${process.env.PORT}, MongoUrl :: ${process.env.MONGO_URL}`
);
/* MONGOOSE SETUP */
const mongooseUrl = process.env.MONGO_URL;
console.log(`${JSON.stringify(mongooseUrl)}`);
const port = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "vme",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, () => console.log(`server Running at Port: ${port}`));
  })
  .catch((error) => console.log(`Error ${error}`));
