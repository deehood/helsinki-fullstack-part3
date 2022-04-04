require("dotenv").config();
const Person = require("./models/mongo");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { response } = require("express");

const app = express();
app.use(cors());
app.use(express.static("build"));

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
        ].join(" ");
    })
);

// app.get("/", (req, res) => {
//     res.send("<h1>hey there ...</h1>");
// });

// app.get("/info", (req, res) => {
//     date = new Date();
//     res.send(`<h1>Phonebook has info for ${persons.length} people</h1>${date}`);
// });

// app.get("/api/persons", (req, res) => {
//     res.json(persons);
// });

app.get("/api/persons", (req, res) => {
    Person.find({}).then((people) => {
        res.json(people);
    });
});

app.get("/api/persons/:id", (req, res) => {
    Person.findById(req.params.id)
        .then((person) => {
            person
                ? res.json(person)
                : res.status(404).json({ error: "not found ..." });
        })
        .catch((error) => {
            console.log(error);
            res.status(400).send({ error: "bad id" });
        });
});

app.delete("/api/persons/:id", (req, res) => {
    Person.findByIdAndDelete(req.params.id)
        .then((result) => res.status(204).end())
        .catch((error) => res.status(400).end());
});

// app.put("/api/persons/:id", (req, res) => {
//     const id = Number(req.params.id);
//     const person = req.body;

//     res.json(person);

//     res.status(204).end();

//     // the logic for displaying is in frontend
// });

app.post("/api/persons/", (req, res) => {
    const person = req.body;

    if (!person.name || !person.number)
        return res.status(400).json("Fields can't be empty");

    // if (persons.find((x) => x.name === person.name))
    //     return res.status(400).json("Name must be unique ...");

    const newPerson = new Person({
        name: person.name,
        number: person.number,
    });

    newPerson.save().then((result) => {
        res.json(result);
        console.log("person saved!");
    });
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
