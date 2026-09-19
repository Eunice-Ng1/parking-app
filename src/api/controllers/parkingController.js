const { TicketIntrouvableError } = require('../../metier/erreurs');

/**
 * Fabrique le contrôleur en lui injectant l'instance de Parking (service métier).
 * Les handlers restent de simples "adaptateurs" HTTP : aucune règle de gestion
 * n'est écrite ici, tout passe par parking.*.
 */
function creerParkingController(parking) {
  return {
    entrerVehicule(req, res, next) {
      try {
        const { plaque, categorie } = req.body;
        const ticket = parking.entrerVehicule(plaque.trim(), categorie);
        return res.status(201).json(ticket.toJSON());
      } catch (err) {
        return next(err);
      }
    },

    sortirVehicule(req, res, next) {
      try {
        const { plaque } = req.body;
        const ticket = parking.sortirVehicule(plaque.trim());
        return res.status(200).json(ticket.toJSON());
      } catch (err) {
        return next(err);
      }
    },

    obtenirPlaces(req, res, next) {
      try {
        const { categorie } = req.query;
        const etat = parking.etatPlaces(categorie || null);
        return res.status(200).json(etat);
      } catch (err) {
        return next(err);
      }
    },

    obtenirTicket(req, res, next) {
      try {
        const ticket = parking.trouverTicketParId(req.params.id);
        if (!ticket) {
          throw new TicketIntrouvableError(req.params.id);
        }
        return res.status(200).json(ticket.toJSON());
      } catch (err) {
        return next(err);
      }
    },

    obtenirHistorique(req, res, next) {
      try {
        const historique = parking.historiqueVehicule(req.params.plaque);
        return res.status(200).json(historique.map((t) => t.toJSON()));
      } catch (err) {
        return next(err);
      }
    }
  };
}

module.exports = creerParkingController;
