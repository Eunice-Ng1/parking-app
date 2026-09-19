const { estCategorieValide, CATEGORIES } = require('../metier/config');

/**
 * Middleware de validation pour POST /api/entrees.
 * Renvoie un 400 avec message clair en cas de plaque vide ou catégorie invalide.
 */
function validerEntree(req, res, next) {
  const { plaque, categorie } = req.body || {};

  if (!plaque || typeof plaque !== 'string' || plaque.trim() === '') {
    return res.status(400).json({ erreur: 'Le champ "plaque" est requis et ne peut pas être vide.' });
  }
  if (!categorie || !estCategorieValide(categorie)) {
    return res.status(400).json({
      erreur: `Le champ "categorie" doit être l'une des valeurs suivantes : ${Object.keys(CATEGORIES).join(', ')}.`
    });
  }
  return next();
}

/**
 * Middleware de validation pour POST /api/sorties.
 */
function validerSortie(req, res, next) {
  const { plaque } = req.body || {};

  if (!plaque || typeof plaque !== 'string' || plaque.trim() === '') {
    return res.status(400).json({ erreur: 'Le champ "plaque" est requis et ne peut pas être vide.' });
  }
  return next();
}

module.exports = { validerEntree, validerSortie };
