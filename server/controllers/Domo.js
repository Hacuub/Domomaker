const mongoDB = require('mongodb').MongoClient;
const mongodbID = require('mongodb');
const models = require('../models');

const dbURL = 'mongodb+srv://hacuub:Five85585@cluster0.twdhr.mongodb.net/Domomaker?retryWrites=true&w=majority';


const { Domo } = models;

const makerPage = (req, res) => {
  Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.render('app', { csrfToken: req.csrfToken(), domos: docs });
  });
};

const makeDomo = (req, res) => {
  if (!req.body.name || !req.body.age || !req.body.level) {
    return res.status(400).json({ error: 'RAWR! All fields are required' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    level: req.body.level,
    owner: req.session.account._id,
  };

  const newDomo = new Domo.DomoModel(domoData);

  const domoPromise = newDomo.save();

  domoPromise.then(() => res.json({ redirect: '/maker' }));

  domoPromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists' });
    }

    return res.status(400).json({ error: 'An error occurred' });
  });

  return domoPromise;
};

const deleteDomo = (req, res) => {
  mongoDB.connect(dbURL, (err, db) => {
    if (err) {
      console.log('Could not connect to database');
      throw err;
    }

    const dbo = db.db('Domomaker');
    const query = { _id: new mongodbID.ObjectID(req.body._id) };
    dbo.collection('domos').deleteOne(query, (err1) => {
      if (err1) {
        console.log('Could not delete from database');
        throw err1;
      }
      db.close();
      return res.status(204).json({ message: `Deleted entry with id ${req.body._id}` });
    });
  });
};

const getDomos = (request, response) => {
  const req = request;
  const res = response;

  return Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }
    return res.json({ domos: docs });
  });
};

module.exports.makerPage = makerPage;
module.exports.getDomos = getDomos;
module.exports.make = makeDomo;
module.exports.deleteDomo = deleteDomo;
