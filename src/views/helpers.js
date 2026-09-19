/**
 * Helpers Handlebars personnalisés utilisés par les vues (Partie 3).
 */
module.exports = {
  /**
   * Formate une date (Date ou string ISO) en format lisible fr-FR.
   */
  formaterDate(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Affiche un badge coloré "LIBRE" / "OCCUPÉE" selon le statut d'une place.
   * Renvoie du HTML brut (utilisé avec {{{ }}} dans la vue).
   */
  badgeStatut(statut) {
    if (statut === 'LIBRE') {
      return '<span class="badge badge-libre">LIBRE</span>';
    }
    return '<span class="badge badge-occupee">OCCUPÉE</span>';
  }
};
