const express = require('express');
const { ErreurMetier } = require('../metier/erreurs');

/**
 * Construit le routeur des vues. On consomme ici directement la logique
 * métier (parking.*) plutôt que de repasser par l'API REST en HTTP interne :
 * c'est plus simple, évite un aller-retour réseau inutile côté serveur,
 * et les deux couches (API et vues) partagent de toute façon le même
 * service métier injecté depuis app.js.
 */
function creerViewRoutes(parking) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.render('home', { etat: parking.etatPlaces() });
  });

  router.get('/entree', (req, res) => {
    res.render('entree');
  });

  router.post('/entree', (req, res) => {
    const { plaque, categorie } = req.body;
    try {
      const ticket = parking.entrerVehicule((plaque || '').trim(), categorie);
      res.render('entree', { succes: true, ticket: ticket.toJSON() });
    } catch (err) {
      const message = err instanceof ErreurMetier ? err.message : 'Une erreur est survenue.';
      res.render('entree', { erreur: message });
    }
  });

  router.get('/sortie', (req, res) => {
    res.render('sortie');
  });

  router.post('/sortie', (req, res) => {
    const { plaque } = req.body;
    try {
      const ticket = parking.sortirVehicule((plaque || '').trim());
      res.render('sortie', { succes: true, ticket: ticket.toJSON() });
    } catch (err) {
      const message = err instanceof ErreurMetier ? err.message : 'Une erreur est survenue.';
      res.render('sortie', { erreur: message });
    }
  });

  router.get('/places', (req, res) => {
    res.render('places', { places: parking.trouverToutesLesPlaces() });
  });

  return router;
}

module.exports = creerViewRoutes;
