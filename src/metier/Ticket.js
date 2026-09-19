let compteur = 0;

/**
 * Génère un identifiant unique de ticket.
 * Basé sur un timestamp + compteur incrémental pour éviter toute collision,
 * y compris lors de créations rapprochées dans les tests.
 */
function genererId() {
  compteur += 1;
  return `T-${Date.now()}-${compteur}`;
}

class Ticket {
  /**
   * @param {object} params
   * @param {string} params.plaque
   * @param {string} params.categorie
   * @param {string} params.placeId
   * @param {Date} params.dateEntree
   * @param {string} [params.id]
   * @param {Date|null} [params.dateSortie]
   * @param {number|null} [params.montant]
   */
  constructor({ plaque, categorie, placeId, dateEntree, id, dateSortie = null, montant = null }) {
    this.id = id || genererId();
    this.plaque = plaque;
    this.categorie = categorie;
    this.placeId = placeId;
    this.dateEntree = dateEntree instanceof Date ? dateEntree : new Date(dateEntree);
    this.dateSortie = dateSortie ? (dateSortie instanceof Date ? dateSortie : new Date(dateSortie)) : null;
    this.montant = montant;
  }

  estActif() {
    return this.dateSortie === null;
  }

  cloturer(dateSortie, montant) {
    this.dateSortie = dateSortie;
    this.montant = montant;
  }

  toJSON() {
    return {
      id: this.id,
      plaque: this.plaque,
      categorie: this.categorie,
      placeId: this.placeId,
      dateEntree: this.dateEntree.toISOString(),
      dateSortie: this.dateSortie ? this.dateSortie.toISOString() : null,
      montant: this.montant
    };
  }

  static fromJSON(obj) {
    return new Ticket({
      id: obj.id,
      plaque: obj.plaque,
      categorie: obj.categorie,
      placeId: obj.placeId,
      dateEntree: new Date(obj.dateEntree),
      dateSortie: obj.dateSortie ? new Date(obj.dateSortie) : null,
      montant: obj.montant
    });
  }
}

module.exports = Ticket;
