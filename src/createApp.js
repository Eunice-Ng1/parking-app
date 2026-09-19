const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');

const creerParkingRoutes = require('./api/routes/parkingRoutes');
const creerViewRoutes = require('./views/viewRoutes');
const errorHandler = require('./api/errorHandler');
const handlebarsHelpers = require('./views/helpers');

/**
 * Construit l'application Express à partir d'une instance de Parking déjà
 * créée (et donc d'un repository déjà choisi). Séparé de app.js afin de
 * pouvoir être réutilisé tel quel par les tests d'intégration Supertest,
 * sans ouvrir de port réseau ni toucher au stockage disque réel.
 */
function creerApp(parking) {
  const app = express();

  app.engine('handlebars', engine({ helpers: handlebarsHelpers }));
  app.set('view engine', 'handlebars');
  app.set('views', path.join(__dirname, 'views'));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', creerParkingRoutes(parking));
  app.use('/', creerViewRoutes(parking));

  app.use(errorHandler);

  return app;
}

module.exports = creerApp;
