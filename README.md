# ParkEasy — Gestion d'un parking automobile

Application Node.js réalisée dans le cadre de l'examen Node.js (gestion d'un parking pour la société ParkEasy).

## Fonctionnalités

- Gestion des places de parking (50 places : 35 VOITURE, 10 MOTO, 5 PMR)
- Enregistrement des entrées / sorties de véhicules, avec attribution automatique de place
- Calcul automatique du tarif dû (demi-heure gratuite, puis arrondi à l'heure supérieure)
- API REST (Express.js)
- Interface graphique côté serveur (Express Handlebars)
- Persistance sur disque (node-localstorage)

## Architecture

```
parking-app/
├── src/
│   ├── metier/         # Logique métier pure (Place, Ticket, Parking, erreurs, config)
│   │                    #   -> aucune dépendance à Express ni au support de stockage
│   ├── persistence/     # Couche de persistance (repository), injectée dans Parking
│   │   ├── LocalStorageRepository.js   # implémentation node-localstorage (utilisée par l'app)
│   │   └── MemoryRepository.js         # implémentation en mémoire (utilisée par les tests Jest)
│   ├── api/             # Partie 2 : API REST
│   │   ├── routes/       # définition des routes Express
│   │   ├── controllers/  # adaptateurs HTTP <-> service métier
│   │   ├── validation.js # validation des entrées (400 Bad Request)
│   │   └── errorHandler.js # middleware centralisé de gestion des erreurs
│   ├── views/            # Partie 3 : interface graphique (Handlebars)
│   │   ├── layouts/main.handlebars   # layout commun + navigation
│   │   ├── helpers.js                # helpers Handlebars (formaterDate, badgeStatut)
│   │   └── viewRoutes.js             # routes qui rendent les vues
│   └── app.js            # point d'entrée : assemble métier + API + vues
├── tests/
│   └── parking.test.js   # 13 tests unitaires Jest (couche métier, repository en mémoire)
├── data/                  # fichiers de stockage node-localstorage (ignorés par git)
├── package.json
└── README.md
```

**Principe directeur** : la classe `Parking` (couche métier) ne connaît ni Express, ni
node-localstorage. Elle reçoit son mécanisme de stockage par injection de dépendance
(`new Parking(repository)`), ce qui permet de la tester unitairement avec un repository
en mémoire (`MemoryRepository`), rapide et isolé, tout en utilisant en production un
repository qui persiste réellement sur disque (`LocalStorageRepository`).

L'API REST et l'interface Handlebars partagent la **même instance** de `Parking`
(créée une fois dans `app.js`), ce qui garantit un état cohérent entre les deux. Les
vues appellent directement le service métier plutôt que de repasser par des requêtes
HTTP internes vers l'API — plus simple et sans aller-retour réseau inutile côté serveur.

## Choix de persistance : node-localstorage

Le module `node-localstorage` a été choisi plutôt que SQLite pour sa simplicité : il
suffit de sérialiser l'état complet (places et tickets) en JSON, sans avoir à définir de
schéma relationnel ni à gérer un driver SQL, ce qui convient bien au volume de données
très limité de ce projet (50 places). SQLite aurait été préférable pour des besoins de
requêtabilité plus poussée (jointures, agrégations SQL) ou pour anticiper une montée en
charge, mais ce n'est pas nécessaire ici.

## Installation et lancement

```bash
npm install
npm start        # démarre le serveur sur http://localhost:3000
```

## Tests

```bash
npm test
```

13 tests unitaires Jest couvrent : entrée d'un véhicule (attribution de place, refus si
parking complet, refus de doublon de plaque), calcul du tarif (plusieurs durées),
sortie d'un véhicule (libération de place, refus si plaque inconnue/déjà sortie),
décompte des places disponibles, et historique d'une plaque.

## API REST

| Méthode | Route                              | Description                                  |
|---------|-------------------------------------|-----------------------------------------------|
| POST    | `/api/entrees`                      | Entrée d'un véhicule (`{ plaque, categorie }`)|
| POST    | `/api/sorties`                      | Sortie d'un véhicule (`{ plaque }`)           |
| GET     | `/api/places`                       | État des places (filtrable par `?categorie=`) |
| GET     | `/api/tickets/:id`                  | Détail d'un ticket                            |
| GET     | `/api/vehicules/:plaque/historique` | Historique d'une plaque                       |

## Interface graphique

- `/` — Tableau de bord (places libres/occupées par catégorie)
- `/entree` — Formulaire d'entrée d'un véhicule
- `/sortie` — Formulaire de sortie d'un véhicule
- `/places` — Liste des places avec statut (badge LIBRE / OCCUPÉE)

## Difficultés rencontrées / points à signaler

- Le test d'intégration Supertest (bonus, non noté) n'a pas été implémenté par manque de temps.
- `node-localstorage` stocke chaque clé dans un fichier séparé (sans extension) plutôt
  que dans un seul fichier `.json` par défaut ; le `.gitignore` a été ajusté en
  conséquence (`data/*` ignoré, sauf `.gitkeep`).
