# ParkEasy - Gestion de parking

Projet réalisé pour l'examen Node.js : une appli qui gère un parking (entrées/sorties
de véhicules, places, tarifs).

## Ce que fait l'appli

- Gère 50 places réparties en 3 catégories (35 VOITURE, 10 MOTO, 5 PMR)
- Enregistre l'entrée et la sortie des véhicules, avec attribution automatique d'une place
- Calcule le tarif à payer (demi-heure gratuite, puis on facture à l'heure entamée)
- Expose une API REST (Express)
- Propose une interface web simple avec Handlebars
- Sauvegarde les données sur le disque avec node-localstorage

## Organisation du code
parking-app/
├── src/
│ ├── metier/ # Place, Ticket, Parking, erreurs, config (tarifs/places)
│ ├── persistence/ # accès aux données (repository)
│ │ ├── LocalStorageRepository.js # sauvegarde réelle sur disque
│ │ └── MemoryRepository.js # version en mémoire, utilisée dans les tests
│ ├── api/ # partie API REST
│ │ ├── routes/
│ │ ├── controllers/
│ │ ├── validation.js
│ │ └── errorHandler.js
│ ├── views/ # partie interface graphique (Handlebars)
│ │ ├── layouts/main.handlebars
│ │ ├── helpers.js
│ │ └── viewRoutes.js
│ ├── createApp.js # construit l'appli Express (utilisé aussi par les tests)
│ └── app.js # démarre le serveur
├── tests/
│ ├── parking.test.js # tests unitaires sur la logique métier
│ └── api.test.js # tests sur l'API (bonus)
├── data/ # fichiers créés par node-localstorage (pas versionnés)
├── package.json
└── README.md

L'idée derrière cette organisation : la classe `Parking` ne sait pas comment les
données sont sauvegardées, elle reçoit juste un "repository" en paramètre
(`new Parking(repository)`). Du coup pour les tests on lui donne une version en
mémoire (rien n'est écrit sur le disque, c'est plus rapide), et pour l'appli réelle
on lui donne la version qui utilise node-localstorage.

L'API et les pages web utilisent le même objet `Parking` (créé une seule fois dans
`app.js`), donc les données restent cohérentes entre les deux. Les pages web
n'appellent pas l'API en HTTP, elles utilisent directement `parking.entrerVehicule()`
etc. - pas besoin de faire un aller-retour réseau pour rien.

## Pourquoi node-localstorage plutôt que SQLite

J'ai pris node-localstorage parce que c'est plus rapide à mettre en place : on
sauvegarde juste tout en JSON, pas besoin de créer des tables ni d'écrire de requêtes
SQL. Vu qu'on gère seulement 50 places, ça suffit largement. SQLite serait plus
adapté si on avait besoin de faire des recherches/filtres compliqués sur les données
ou si le volume devenait gros, mais ce n'est pas le cas ici.

## Lancer le projet

```bash
npm install
npm start
```

Le serveur démarre sur http://localhost:3000

## Lancer les tests

```bash
npm test
```

17 tests au total : 13 tests unitaires sur la classe Parking (entrée, sortie, calcul
du tarif, places disponibles, historique) + 4 tests d'intégration sur l'API (bonus,
avec Supertest).

## Routes de l'API

| Méthode | Route                              | Description                          |
|---------|-------------------------------------|----------------------------------------|
| POST    | `/api/entrees`                      | Entrée d'un véhicule (`plaque`, `categorie`) |
| POST    | `/api/sorties`                      | Sortie d'un véhicule (`plaque`)       |
| GET     | `/api/places`                       | État des places (`?categorie=` en option) |
| GET     | `/api/tickets/:id`                  | Détail d'un ticket                    |
| GET     | `/api/vehicules/:plaque/historique` | Historique d'une plaque               |

## Pages web

- `/` : tableau de bord (nombre de places libres/occupées par catégorie)
- `/entree` : formulaire pour enregistrer une entrée
- `/sortie` : formulaire pour enregistrer une sortie
- `/places` : liste de toutes les places avec leur statut

## Difficultés / remarques

- node-localstorage crée un fichier par clé (sans extension `.json`), pas un seul
  fichier comme je pensais au départ. J'ai adapté le `.gitignore` en conséquence
  (`data/*` ignoré, sauf `.gitkeep`).
- Le test Supertest était en bonus (non noté) mais je l'ai quand même fait, voir
  `tests/api.test.js`.
