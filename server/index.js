import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./Routes/auth.js"
import userRoutes from "./Routes/users.js"
import postRoutes from "./Routes/post.js"
import { register,login } from "./controllers/auth.js"
// import { getUser } from "./controllers/users.js"
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
// import { users, posts } from "./data/index.js";

// Configurations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy : "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit:"30mb",extended: true}));
app.use(bodyParser.urlencoded({limit:"30mb",extended: true}));
app.use(cors());
app.use("/assets",express.static(path.join(__dirname,"public/assets")));


//File Storage
const storage = multer.diskStorage({
    destination : function(req,file, cb){
        cb(null,"public/assets")
    },
    filename: function(req,file,cb){
        cb(null,file.originalname)
    }
})

const upload = multer({ storage });

// Routes With File
app.post("auth/register",upload.single("picture"),register);
// app.post("auth/login",login);
// app.use("/users/getUser", getUser);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

// mongoose set up
const port = process.env.PORT || 6001
mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser : true,
        useUnifiedTopology : true
    })
    .then(()=> {
        app.listen(port,()=>console.log(`Server Port : ${port}`))

        // ADD DATA ONE TIME */
        // User.insertMany(users);
        // Post.insertMany(posts);
    })
    .catch((error)=>console.log(`${error} did not connected`))