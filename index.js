import express from "express";
import pg from "pg";
import env from "dotenv";

//Setup the environment for our variables.
env.config();

// Creation of an express app and set the port number.
const app = express();
const port = 3000;

// Use the public folder for static files.
app.use(express.static("public"));    

// We will use the in-built parser from express and we set the view engine as ejs. 
app.use(express.urlencoded({extended: true})); 
app.set("view engine", "ejs");

//We create the connection to our PostgreSQL database
const db = new pg.Client({
  user:process.env.SESSION_USER ,
  host: process.env.SESSION_HOST ,
  database: process.env.SESSION_DATABASE ,
  password: process.env.SESSION_PASSWORD ,
  port: process.env.SESSION_PORT,
});
db.connect();

//Function to retrieve all the information from the *PERSONAL* TODOS from the database.
async function fetchpersonaltodos() {
  const result = await db.query("SELECT * FROM personal ORDER BY id ASC");
  return result.rows;
};

//Function to retrieve all the information from the *WORK* TODOS from the database.
async function fetchworktodos() {
  const result = await db.query("SELECT * FROM work ORDER BY id ASC");
  return result.rows;
};

const personalToDos = [];
const workToDos = [];

// **Personal** Routes

//Home page that displays PERSONAL to dos from the PERSONAL database
app.get("/", async (req, res) => {
  const personalToDos = await fetchpersonaltodos();
  console.log(personalToDos);
  res.render("index.ejs", {
    data: personalToDos
  })
});

//Route that adds a todo to the PERSONAL database
app.post("/createPersonalTODO", async (req, res) => {
  try {
    const newToDo = req.body.todoTask;
    await db.query(
        "INSERT INTO personal (todo) VALUES($1)",
        [newToDo]
      );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});
//Route that deletes a todo from the PERSONAL database
app.post("/personaldelete", async (req, res) => {
  try {
    var requestedtodoId = req.body.todoId; 
    await db.query(
        "DELETE FROM personal WHERE id = ($1)",
        [requestedtodoId]
      );
      res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// **WORK** Routes

//Home page that displays WORK to dos from the WORK database
app.get("/work", async (req, res) => {
  const workToDos = await fetchworktodos();
  console.log(workToDos);
  res.render("work.ejs", {
    data: workToDos
  })
});

//Route that adds a todo to the WORK database
app.post("/createworktodo", async (req, res) => {
  try {
    const newToDo = req.body.todoTask;
    await db.query(
        "INSERT INTO work (todo) VALUES($1)",
        [newToDo]
      );
    res.redirect("/work");
  } catch (err) {
    console.log(err);
  }
});

//Route that deletes a todo from the PERSONAL database
app.post("/workdelete", async (req, res) => {
  try {
    var requestedtodoId = req.body.todoId; 
    await db.query(
        "DELETE FROM work WHERE id = ($1)",
        [requestedtodoId]
      );
      res.redirect("/work");
  } catch (err) {
    console.log(err);
  }
});

//We set the listening port and we console log it so we can see where it's running.
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
