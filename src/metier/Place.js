const STATUT = {
  LIBRE: 'LIBRE',
  OCCUPEE: 'OCCUPEE'
};

class Place {
  /**
   * @param {string} id identifiant unique de la place (ex: "VOITURE-01")
   * @param {string} categorie catégorie de véhicule (VOITURE, MOTO, PMR)
   * @param {string} statut LIBRE ou OCCUPEE
   */
  constructor(id, categorie, statut = STATUT.LIBRE) {
    this.id = id;
    this.categorie = categorie;
    this.statut = statut;
  }

  estLibre() {
    return this.statut === STATUT.LIBRE;
  }

  occuper() {
    this.statut = STATUT.OCCUPEE;
  }

  liberer() {
    this.statut = STATUT.LIBRE;
  }

  toJSON() {
    return { id: this.id, categorie: this.categorie, statut: this.statut };
  }

  static fromJSON(obj) {
    return new Place(obj.id, obj.categorie, obj.statut);
  }
}

module.exports = { Place, STATUT };
