// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

// get the Cat model
const Dog = models.Dog.DogModel;

// default fake data so that we have something to work with until we make a real Cat
const defaultData = {
  name: 'unknown',
  breed: 'unknown',
  age: 0,
};

// object for us to keep track of the last Cat we made and dynamically update it sometimes
let lastSearched = new Dog(defaultData);

// function to handle requests to the main page
// controller functions in Express receive the full HTTP request
// and a pre-filled out response object to send
const hostIndex = (req, res) => {
  // res.render takes a name of a page to render.
  // These must be in the folder you specified as views in your main app.js file
  // Additionally, you don't need .jade because you registered the
  // file type in the app.js as jade. Calling res.render('index')
  // actually calls index.jade. A second parameter of JSON can be passed
  // into the jade to be used as variables with #{varName}
  res.render('index', {
    currentName: lastSearched.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

// function to find all dogs on request.
// Express functions always receive the request and the response.
const readAllDogs = (req, res, callback) => {
  Dog.find(callback).lean();
};


// function to find a specific cat on request.
// Express functions always receive the request and the response.
const readDog = (req, res) => {
  const name1 = req.query.name;

  // function to call when we get objects back from the database.
  // With Mongoose's find functions, you will get an err and doc(s) back
  const callback = (err, doc) => {
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }

    // return success
    return res.json(doc);
  };

  // Call the static function attached to CatModels.
  // This was defined in the Schema in the Model file.
  // This is a custom static function added to the CatModel
  // Behind the scenes this runs the findOne method.
  // You can find the findByName function in the model file.
  Dog.findByName(name1, callback);
};

const hostPage1 = (req, res) => {
  // function to call when we get objects back from the database.
  // With Mongoose's find functions, you will get an err and doc(s) back
  const callback = (err, docs) => {
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }

    // return success
    return res.render('page1', { dogs: docs });
  };

  readAllDogs(req, res, callback);
};

// function to handle requests to the page2 page
// controller functions in Express receive the full HTTP request
// and a pre-filled out response object to send
const hostPage2 = (req, res) => {
  res.render('page2');
};

// function to handle requests to the page3 page
// controller functions in Express receive the full HTTP request
// and a pre-filled out response object to send
const hostPage3 = (req, res) => {
  res.render('page3');
};

// Handle page 4 requests
const hostPage4 = (req, res) => {
  const callback = (err, docs) => {
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }

    // return success
    return res.render('page4', { dogs: docs });
  };

  readAllDogs(req, res, callback);
};

// function to handle get request to send the name
// controller functions in Express receive the full HTTP request
// and a pre-filled out response object to send
const getName = (req, res) => {
  res.json({ name: lastSearched.name });
};

// function to handle a request to set the name
// controller functions in Express receive the full HTTP request
// and get a pre-filled out response object to send
// ADDITIONALLY, with body-parser we will get the
// body/form/POST data in the request as req.body
const createDog = (req, res) => {
  // check if the required fields exist
  if (!req.body.firstname || !req.body.lastname || !req.body.breed || !req.body.age) {
    // if not respond with a 400 error
    // (either through json or a web page depending on the client dev)
    return res.status(400).json({ error: 'firstname,lastname and age are all required' });
  }

  // if required fields are good, then set name
  const name = `${req.body.firstname} ${req.body.lastname}`;

  // dummy JSON to insert into database
  const dogData = {
    name,
    breed: req.body.breed,
    age: req.body.age,
  };

  // create a new object of DogModel with the object to save
  const newDog = new Dog(dogData);

  // create new save promise for the database
  const savePromise = newDog.save();

  savePromise.then(() => {
    // set the lastAdded dog to our newest dog object.
    // This way we can update it dynamically
    lastSearched = newDog;
    // return success
    res.json({ name: lastSearched.name, breed: lastSearched.breed, age: lastSearched.age });
  });

  // if error, return it
  savePromise.catch((err) => res.status(500).json({ err }));

  return res;
};

// function to handle a request to update the last added object
const updateSearched = (res) => {
  // give the user the ability to update our searched object
  lastSearched.age++;

  // create a new save promise for the database
  const savePromise = lastSearched.save();

  // send back the name as a success for now
  savePromise.then(() => res.json({ name: lastSearched.name, age: lastSearched.age }));

  // if save error, just return an error for now
  savePromise.catch((err) => res.status(500).json({ err }));
};

// function to handle requests search for a name and return the object
const searchName = (req, res) => {
  // check if there is a query parameter for name
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  // Call our Dogs's static findByName function.
  return Dog.findByName(req.query.name, (err, doc) => {
    // errs, handle them
    if (err) {
      return res.status(500).json({ err }); // if error, return it
    }

    // if no matches, let them know
    if (!doc) {
      return res.json({ error: 'No dogs found' });
    }

    lastSearched = doc;
    // if a match, send the match back
    return res.json({ name: doc.name, age: doc.age });
  });
};

// function to handle a request to any non-real resources (404)
const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

// export the relevant public controller functions
module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  readDog,
  getName,
  updateSearched,
  createDog,
  searchName,
  notFound,
};
