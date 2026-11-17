import express from "express";
// import path from "path";
import bookRoutes, { books } from "./bookroutes.js";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

const app = express();
const port = 4000;
const saltRounds = 10;

const db_user = [
    { 
        "user_id": 0,
        "name": "Non-Existent",
        "email": "Idontexist@gmail.com",
        "password": "SomethingToKeepTheDBopen",
        "fav_genre": "Fiction",
    },
];



app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.static("public"));
// Same thing as the one above ^
// app.use(express.static(path.join(import.meta.dirname, 'public')));
app.use(bodyParser.urlencoded({extended:true}));

const sessionMiddleware = ()=>{
  return {
    secret: "SECRET-KEY-BOOK",
    resave: false,     
    saveUninitialized: true
  }
};

app.use(session(
{
    secret: "SECRET-KEY-BOOK",
    resave: false,
    saveUninitialized: true
}
));

app.use(passport.initialize());
app.use(passport.session());


//Register the /api to have the database and functions there
app.use('/api', bookRoutes);

//Render Home page
app.get('/', (req, res)=>{
    res.render('home', {books});
});

//Render the books page that will have all books to search.
app.get('/books', (req, res) =>{
    res.render('books', { books });
});

// Render the Book Search page
app.get('/book_search', (req, res)=>{
    res.render('book_search', { books });
});

// Render the Login Page
app.get('/login', (req, res)=>{
    res.render('login');
});


// Render the Register Page
app.get('/register', (req, res)=>{
    res.render('register');
});

// Register Route for POST
app.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name || "";
  const fav_genre = req.body.fav_genre || ""; 

  try {
    const existingUser = db_user.find((user) => user.email === email);
    
    if (existingUser) {
      return res.send("Email already exists. Try logging in.");
    }

    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.error("Error while hashing password!", err);
        return res.status(500).send("Error registering user.");
      }

      // Automatically assign user_id as the next number after the maximum existing user_id
      const nextId = Math.max(...db_user.map((user) => user.user_id)) + 1;

      const email_new = String(email).trim();
      const newUser = {
        user_id: nextId,
        name: name,
        email: email_new,
        password: hash,
        fav_genre: fav_genre
      };

      db_user.push(newUser);

      req.login(newUser, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Login error after registration.");
        }
        console.log(db_user);
        res.render("home.ejs");
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error.");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const registeredUser = db_user.find((user) => user.email === email);
    
    if (registeredUser) {
      // Note: If testing with the initial static db objects where passwords aren't hashed, 
      // bcrypt.compare will return false unless you hash them or handle plaintext fallback. 
      // Assuming you use bcrypt for registered users:
      bcrypt.compare(password, registeredUser.password, (err, result) => {
        if (err) {
          console.error("Error comparing passwords!", err);
          return res.status(500).send("Server error.");
        }
        
        if (result) {
          res.render("home");
        } else {
          res.send("Incorrect Password!");
        }
      });
    } else {
      res.send("User not found. Please register.");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error.");
  }
});

passport.serializeUser((user, cb) => {
  cb(null, user.user_id);
});

passport.deserializeUser((id, cb) => {
  const user = db_user.find((u) => u.user_id === id);
  cb(null, user);
});

app.listen(port, ()=>{
    console.log(`Listening on http://localhost:${port}`);
});