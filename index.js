require("dotenv").config();
const Person = require("./models/mongo");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

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

app.get("/api/persons", (req, res, next) => {
    Person.find({})
        .then((people) => {
            res.json(people);
        })
        .catch((error) => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
    Person.findById(req.params.id)
        .then((person) => res.json(person))
        .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then((result) => {
            result ? res.status(204).end() : res.status(500).json("oh no");
        })
        .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
    const newPerson = {
        name: req.body.name,
        number: req.body.number,
    };

    Person.findByIdAndUpdate(
        req.params.id,
        newPerson,

        {
            runValidators: true,
            new: true,
        }
    )
        .then((person) => {
            person ? res.json(newPerson) : res.status(500).json("oh no");
        })
        .catch((error) => next(error));
});

app.post("/api/persons/", (req, res, next) => {
    const person = req.body;

    Person.findOne({ name: person.name })
        .then((found) => {
            if (found) {
                return res.status(400).send({
                    error: `${found.name} already exists (refreshing DB). Try again ...`,
                });
            } else {
                console.log("into mongoose findone");

                const newPerson = new Person({
                    name: person.name,
                    number: person.number,
                });

                newPerson
                    .save()
                    .then((result) => {
                        res.json(result.toJSON());
                        console.log("person saved!");
                    })
                    .catch((error) => {
                        // res.status(400);
                        next(error);
                    });
            }
        })
        .catch((error) => next(error));
});

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
    console.log(error.name);
    if (error.name === "CastError") {
        return res.status(400).send({ error: "malformatted id" });
    } else if (error.name === "ValidationError") {
        return res.status(400).send({ error: error.message });
    }
    next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
