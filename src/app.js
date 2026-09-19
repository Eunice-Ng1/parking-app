const path = require('path');
const Parking = require('./metier/Parking');
const LocalStorageRepository = require('./persistence/LocalStorageRepository');
const creerApp = require('./createApp');

const PORT = process.env.PORT || 3000;

// Service métier partagé par l'API et les vues, avec persistance node-localstorage.
const repository = new LocalStorageRepository(path.join(__dirname, '..', 'data'));
const parking = new Parking(repository);

const app = creerApp(parking);

app.listen(PORT, () => {
  console.log(`ParkEasy démarré sur http://localhost:${PORT}`); // eslint-disable-line no-console
});

module.exports = app;
