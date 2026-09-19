/**
 * Configuration des catégories de véhicules du parking.
 * Toutes les valeurs monétaires sont en Francs CFA (XOF), entiers (pas de centimes).
 */
const CATEGORIES = {
  VOITURE: { nombrePlaces: 35, tarifHoraire: 500 },
  MOTO: { nombrePlaces: 10, tarifHoraire: 250 },
  PMR: { nombrePlaces: 5, tarifHoraire: 500 }
};

const DUREE_GRATUITE_MINUTES = 30;

function estCategorieValide(categorie) {
  return Object.prototype.hasOwnProperty.call(CATEGORIES, categorie);
}

module.exports = { CATEGORIES, DUREE_GRATUITE_MINUTES, estCategorieValide };
