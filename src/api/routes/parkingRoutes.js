const express = require('express');
const creerParkingController = require('../controllers/parkingController');
const { validerEntree, validerSortie } = require('../validation');

/**
 * Construit le routeur Express, avec le service métier (Parking) injecté.
 */
function creerParkingRoutes(parking) {
  const router = express.Router();
  const controller = creerParkingController(parking);

  router.post('/entrees', validerEntree, controller.entrerVehicule);
  router.post('/sorties', validerSortie, controller.sortirVehicule);
  router.get('/places', controller.obtenirPlaces);
  router.get('/tickets/:id', controller.obtenirTicket);
  router.get('/vehicules/:plaque/historique', controller.obtenirHistorique);

  return router;
}

module.exports = creerParkingRoutes;
