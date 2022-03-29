const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(cors());

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(express.json());

app.use(
  morgan(function (tokens, req, res) {
    return [
      "time",
      tokens.date(req, res),
      "| ip",
      tokens["remote-addr"](req, res),
      "|",
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.put(req, res),
    ].join(" ");
  })
);

morgan.token("put", (req, res) => {
  return JSON.stringify(req.body);
});

app.get("/", (req, res) => {
  res.send("<h1>hey there ...</h1>");
});

app.get("/info", (req, res) => {
  date = new Date();
  res.send(`<h1>Phonebook has info for ${persons.length} people</h1>${date}`);
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  console.log(person);
  person ? res.send(person) : res.status(404).json({ error: "not found ..." });
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});

newId = () => Math.floor(Math.random() * 999999);

app.post("/api/persons/", (req, res) => {
  const person = req.body;

  if (!person.name || !person.number)
    return res.status(400).json("Fields can't be empty");

  if (persons.find((x) => x.name === person.name))
    return res.status(400).json("Name must be unique ...");

  const newPerson = {
    id: newId(),
    name: person.name,
    number: person.number,
  };

  persons = persons.concat(newPerson);
  res.json(newPerson);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
