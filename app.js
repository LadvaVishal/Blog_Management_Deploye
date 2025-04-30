require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const session=require('express-session')
const path = require('path');
const sessionStore=require('connect-mongodb-session')(session)
const multer=require('multer')
const errorController=require('./controller/error')
const { storage } = require('./util/cloudinary');

 
const app=express()
const MONGO_URI= process.env.MONGO_URI


app.use(express.static(path.join(__dirname, 'public')));

app.use('/images', express.static(path.join(__dirname, 'images')));

const sessionDB= new sessionStore({
  uri:MONGO_URI,
  collection:'session', 
  ttl: 24 * 60 *60 // session delete from db after 1 day automtic
}); 
  
// const fileStorage=multer.diskStorage({
//   destination: (req,file,cb)=>{
//     cb(null, 'images');
//   },
//   filename:(req,file,cb)=>{
//   cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname); 
 
//   }
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === 'image/png' ||
//     file.mimetype === 'image/jpg' ||
//     file.mimetype === 'image/jpeg'
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };


app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(session({
  secret: 'blog management',
    resave: false,
    saveUninitialized: false,
    store:sessionDB
    ,cookie: { maxAge: 24 * 60 * 60 * 1000 }

}))

const userRouter=require('./routes/user');
const authRouter=require('./routes/auth')
const adminRouter=require('./routes/admin');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(cookieParser());


app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

 
// app.use(multer({storage: fileStorage,fileFilter: fileFilter}).single('image'))
app.use(multer({ storage }).single('image')); // This uses Cloudinary storage instead of local disk storage


app.use(authRouter)
app.use(userRouter)
app.use(adminRouter)

app.use(errorController.get404);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(3000);
    console.log("app run on 3000")
  })
  .catch(err => {
    console.log(err);
  });
