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
        "name": "Jose D.",
        "email": "yahirdeleon24@gmail.com",
        "password": "password",
        "fav_genre": "Fiction",
    },
];



app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.static("public"));
// Same thing as the one above ^
// app.use(express.static(path.join(import.meta.dirname, 'public')));
app.use(bodyParser.urlencoded({extended:true}));

// sdmflksdmflkmsdlkflksdmlkfmklsdmflkmlksdmlfkmdslfmldsmflsmdlkfmsdlkmfldskmflkdsmfdssdmflksdmflkmsdlkflksdmlkfmklsdmflkmlksdmlfkmdslfmldsmflsmdlkfmsdlkmfldskmflkdsmfds
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
// sdmflksdmflkmsdlkflksdmlkfmklsdmflkmlksdmlfkmdslfmldsmflsmdlkfmsdlkmfldskmflkdsmfdssdmflksdmflkmsdlkflksdmlkfmklsdmflkmlksdmlfkmdslfmldsmflsmdlkfmsdlkmfldskmflkdsmfds

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

passport.use(new Strategy({ usernameField: "email" }, async function verify(email, password, cb) {
  try {
    const foundUser = db_user.find((user) => user.email === email);

    if (!foundUser) {
      return cb(null, false, { message: "User not found." });
    }

    bcrypt.compare(password, foundUser.password, (err, result) => {
      if (err) {
        console.error("Error comparing passwords!", err);
        return cb(err);
      }
      
      if (result) {
        return cb(null, foundUser);
      } else {
        return cb(null, false);
      }
    });
  } catch (err) {
    console.error("Sorry! Something happened to passport.", err);
    return cb(err);
  }
}));

// Register Route
app.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name || "";         // Optional
  const fav_genre = req.body.fav_genre || ""; // Optional

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
      const nextId = db_user.length > 0 ? Math.max(...db_user.map((user) => user.user_id)) + 1 : 0;

      const newUser = {
        user_id: nextId,
        name: name,
        email: email.trim(),
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

// Login Route using passport.authenticate with custom callback
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send("Invalid credentials.");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.render("home.ejs");
    });
  })(req, res, next);
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