/**
 * Erreurs métier. Le champ `code` est utilisé par la couche API (Partie 2)
 * pour traduire l'erreur en code HTTP adapté, sans coupler la Partie 1 à Express.
 */
class ErreurMetier extends Error {
  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

class CategorieInvalideError extends ErreurMetier {
  constructor(categorie) {
    super(`Catégorie invalide : "${categorie}"`, 'CATEGORIE_INVALIDE');
  }
}

class ParkingCompletError extends ErreurMetier {
  constructor(categorie) {
    super(`Aucune place disponible dans la catégorie ${categorie}`, 'PARKING_COMPLET');
  }
}

class PlaqueDejaPresenteError extends ErreurMetier {
  constructor(plaque) {
    super(`Le véhicule ${plaque} est déjà présent dans le parking`, 'PLAQUE_DEJA_PRESENTE');
  }
}

class PlaqueIntrouvableError extends ErreurMetier {
  constructor(plaque) {
    super(`Aucun véhicule actif trouvé pour la plaque ${plaque}`, 'PLAQUE_INTROUVABLE');
  }
}

class TicketIntrouvableError extends ErreurMetier {
  constructor(id) {
    super(`Ticket introuvable : ${id}`, 'TICKET_INTROUVABLE');
  }
}

module.exports = {
  ErreurMetier,
  CategorieInvalideError,
  ParkingCompletError,
  PlaqueDejaPresenteError,
  PlaqueIntrouvableError,
  TicketIntrouvableError
};
