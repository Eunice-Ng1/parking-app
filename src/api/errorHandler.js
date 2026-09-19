const { ErreurMetier } = require('../metier/erreurs');

/**
 * Traduit les erreurs métier (Partie 1) en réponses HTTP adaptées.
 * Toute erreur inattendue (bug, exception non prévue) renvoie un 500 générique
 * sans exposer de stack trace au client.
 */
const CODES_HTTP = {
  CATEGORIE_INVALIDE: 400,
  PARKING_COMPLET: 409,
  PLAQUE_DEJA_PRESENTE: 409,
  PLAQUE_INTROUVABLE: 404,
  TICKET_INTROUVABLE: 404
};

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ErreurMetier) {
    const statut = CODES_HTTP[err.code] || 400;
    return res.status(statut).json({ erreur: err.message, code: err.code });
  }

  console.error(err); // eslint-disable-line no-console
  return res.status(500).json({ erreur: 'Erreur interne du serveur', code: 'ERREUR_SERVEUR' });
}

module.exports = errorHandler;
