const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

mongoose
    .connect(url)
    // eslint-disable-next-line no-unused-vars
    .then((result) => {
        console.log("connected to MongoDB");
    })
    .catch((error) => {
        console.log("error connecting to MongoDB:", error.message);
    });

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true,
    },

    number: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^(\d{1,2}[-]{1}\d{6,})$/.test(v);
            },
        },
    },
});

personSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Person", personSchema);
