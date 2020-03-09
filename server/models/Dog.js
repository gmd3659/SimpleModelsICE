const mongoose = require('mongoose');

// variable to hold our Model
let DogModel = {};

// A DB Schema to define our data structure
const DogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },

  breed: {
    type: String,
    required: true,
    trim: true,
  },

  age: {
    type: Number,
    min: 0,
    required: true,
  },

  createdData: {
    type: Date,
    default: Date.now,
  },

});

// Schema.statics are static methods attached to the Model or objects
// These DO NOT have their own instance. They are all the static function.
// They do not look at individual instance variables since there is
// no instance of them. Every static function
// only exists once and is called.
// In this case, findByName will be attached to the model and objects.
// They will be able to call this function, but they won't be able to
// reference any instance variables of that object (or at least accurately)
// These are used when you want a public function you can call to do a task,
// not a method that uses or returns instance variables
// That is, these are used when you don't need an object, just a function to call.
DogSchema.statics.findByName = (name, callback) => {
  const search = {
    name,
  };

  return DogModel.findOne(search, callback);
};

// Create the cat model based on the schema. You provide it with a custom discriminator
// (the name of the object type. Can be anything)
// and the schema to make a model from.
// Look at the model variable definition above for more details.
DogModel = mongoose.model('Dog', DogSchema);


// export our public properties
module.exports.DogModel = DogModel;
module.exports.DogSchema = DogSchema;
