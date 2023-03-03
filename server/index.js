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
import { register,login } from "./controllers/auth.js"
import authRoutes from "./Routes/auth.js"
import { getUser } from "./controllers/users.js"
import userRoutes from "./Routes/users.js"

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
app.post("auth/login",login);
app.use("/users/getUser", getUser);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

// mongoose set up
const port = process.env.PORT || 6001
mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser : true,
        useUnifiedTopology : true
    })
    .then(()=> {
        app.listen(port,()=>console.log(`Server Port : ${port}`))
    })
    .catch((error)=>console.log(`${error} did not connected`))