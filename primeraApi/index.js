import express from "express";
import fs from "fs";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Leer la data del archivo
const readData = () => {
  try {
    const data = fs.readFileSync("./db.json");
    return JSON.parse(data);
  } catch (error) {
    console.log("Error al leer el archivo:", error.message);
    return { books: [] };
  }
};

// Escribir en el archivo json
const writeData = (data) => {
  try {
    fs.writeFileSync("./db.json", JSON.stringify(data, null, 2));
  } catch (error) {
    console.log("Error al escribir en el archivo:", error.message);
  }
};

// Obtener el siguiente ID disponible
const getNextId = (books) => {
  if (books.length === 0) return 1;
  return Math.max(...books.map((b) => b.id)) + 1;
};

// Ruta principal
app.get("/", (req, res) => {
  res.send("Bienvenido a mi primera API Nodejs!");
});

// GET - Obtener todos los libros
app.get("/books", (req, res) => {
  const data = readData();
  res.json(data.books);
});

// GET - Obtener un libro por ID
app.get("/books/:id", (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const book = data.books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).json({ error: `Libro con id ${id} no encontrado` });
  }

  res.json(book);
});

// POST - Crear un nuevo libro
app.post("/books", (req, res) => {
  const data = readData();
  const { titulo, autor, año } = req.body;

  if (!titulo || !autor || !año) {
    return res.status(400).json({ error: "Los campos titulo, autor y año son obligatorios" });
  }

  const newBook = {
    id: getNextId(data.books),
    titulo,
    autor,
    año,
  };

  data.books.push(newBook);
  writeData(data);

  res.status(201).json(newBook);
});

// PUT - Actualizar un libro por ID
app.put("/books/:id", (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const bookIndex = data.books.findIndex((b) => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ error: `Libro con id ${id} no encontrado` });
  }

  const { titulo, autor, año } = req.body;

  if (!titulo || !autor || !año) {
    return res.status(400).json({ error: "Los campos titulo, autor y año son obligatorios" });
  }

  data.books[bookIndex] = {
    id,
    titulo,
    autor,
    año,
  };

  writeData(data);
  res.json(data.books[bookIndex]);
});

// DELETE - Eliminar un libro por ID  ✅ llave } eliminada
app.delete("/books/:id", (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const bookIndex = data.books.findIndex((b) => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ error: `Libro con id ${id} no encontrado` });
  }

  const deletedBook = data.books.splice(bookIndex, 1)[0];
  writeData(data);

  res.json({ mensaje: `Libro "${deletedBook.titulo}" eliminado correctamente`, libro: deletedBook });
});

// ✅ Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});