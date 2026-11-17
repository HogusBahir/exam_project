// GET for ALL BOOKS, ONE BOOK,
// and POST for NEW BOOK

import express from "express";

const router = express.Router();

function isGoodStringParam(param){
  return typeof param === "string" && param.trim().length > 0;
}



const books = [
  {
    "title": "Moby-Dick",
    "author": "Herman Melville",
    "genre": "Fiction",
    "imageurl": "https://placehold.co/400x600"
  },
  {
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "genre": "Fiction",
    "imageurl": "https://placehold.co/400x600"
  },
  {
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Fiction",
    "imageurl": "https://placehold.co/400x600"
  },
  {
    "title": "Sapiens: A Brief History of Humankind",
    "author": "Yuval Noah Harari",
    "genre": "NonFiction",
    "imageurl": "https://placehold.co/400x600"
  },
  {
    "title": "Educated",
    "author": "Tara Westover",
    "genre": "NonFiction",
    "imageurl": "https://placehold.co/400x600"
  },
  {
    "title": "Atomic Habits",
    "author": "James Clear",
    "genre": "NonFiction",
    "imageurl": "https://placehold.co/400x600"
  },
  {
    "title": "Dune",
    "author": "Frank Herbert",
    "genre": "Sci-Fi",
    "imageurl": "https://placehold.co/400x600"
  },
  {
    "title": "Neuromancer",
    "author": "William Gibson",
    "genre": "Sci-Fi",
    "imageurl": "https://placehold.co/400x600"
  },
  {
    "title": "Lonesome Dove",
    "author": "Larry McMurtry",
    "genre": "Western",
    "imageurl": "https://placehold.co/400x600"
  },
  {
    "title": "Blood Meridian",
    "author": "Cormac McCarthy",
    "genre": "Western",
    "imageurl": "https://placehold.co/400x600"
  }
];

// Get request for all books
router.get("/books", (req, res) => {
  res.status(200).json(books);
});

//Get request for a single book
router.get("/book/:title", (req, res) => {
  const title = String(req.params.title);
  const book = books.find((book) => book.title === title);

  if (!book) {
    return res.status(404).json({ message: "Book not found!" });
  }
  
  res.status(200).json(book);
});


//POST to add new book into database
router.post("/book", (req, res) => {
    const { title, author, genre } = req.body;
    if (!isGoodStringParam(title) || !isGoodStringParam(author) || !isGoodStringParam(genre)) {
        return res.status(400).json({
          message: "Title, Author, and Genre are required fields."
        });
    }

    const newBook ={
          title: title.trim(),
          author: author.trim(),
          genre: genre.trim(),
          imageurl: "https://placehold.co/400x600",
    }; 

    books.push(newBook);
    res.status(201).json(newBook);
});


export default router;
export { books };