const mongoose = require("mongoose");

if (process.argv.length < 3) {
    console.log(
        "Please provide the password as an argument: node mongo.js <password>"
    );
    process.exit(1);
}

const password = process.argv[2];
const nameArg = process.argv[3];
const numberArg = process.argv[4];

const url = `mongodb+srv://dee:${password}@cluster0.6y85y.mongodb.net/phonebook?retryWrites=true&w=majority`;

mongoose.connect(url);

const newId = () => Math.floor(Math.random() * 999999);

const personSchema = new mongoose.Schema({
    id: Number,
    name: String,
    number: String,
});

const Person = mongoose.model("Person", personSchema);

const person = new Person({
    id: newId(),
    name: nameArg,
    number: numberArg,
});

if (!nameArg || !numberArg) {
    Person.find({}).then((person) => {
        console.log(person);
        mongoose.connection.close();
    });
} else
    person.save().then((result) => {
        console.log(`added ${nameArg} number ${numberArg} to phonebook`);
        mongoose.connection.close();
    });
