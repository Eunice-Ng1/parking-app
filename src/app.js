const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');

const Parking = require('./metier/Parking');
const LocalStorageRepository = require('./persistence/LocalStorageRepository');
const creerParkingRoutes = require('./api/routes/parkingRoutes');
const creerViewRoutes = require('./views/viewRoutes');
const errorHandler = require('./api/errorHandler');
const handlebarsHelpers = require('./views/helpers');

const PORT = process.env.PORT || 3000;

// Service métier partagé par l'API et les vues, avec persistance node-localstorage.
const repository = new LocalStorageRepository(path.join(__dirname, '..', 'data'));
const parking = new Parking(repository);

const app = express();

// Vue moteur : Express Handlebars
app.engine('handlebars', engine({ helpers: handlebarsHelpers }));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middlewares globaux
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Partie 2 — API REST
app.use('/api', creerParkingRoutes(parking));

// Partie 3 — Interface graphique
app.use('/', creerViewRoutes(parking));

// Middleware d'erreurs centralisé (doit être déclaré en dernier)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ParkEasy démarré sur http://localhost:${PORT}`); // eslint-disable-line no-console
});

module.exports = app;
