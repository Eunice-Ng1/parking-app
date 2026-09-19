const request = require('supertest');
const Parking = require('../src/metier/Parking');
const MemoryRepository = require('../src/persistence/MemoryRepository');
const creerApp = require('../src/createApp');

// Bonus (non noté) : quelques tests d'intégration de l'API avec Supertest,
// en s'appuyant sur le repository en mémoire pour rester isolé du disque.
describe('API REST /api', () => {
  let app;

  beforeEach(() => {
    const parking = new Parking(new MemoryRepository());
    app = creerApp(parking);
  });

  test('POST /api/entrees puis GET /api/places reflète la place occupée', async () => {
    const reponseEntree = await request(app)
      .post('/api/entrees')
      .send({ plaque: 'DK-0001-AA', categorie: 'VOITURE' });

    expect(reponseEntree.status).toBe(201);
    expect(reponseEntree.body.placeId).toMatch(/^VOITURE-/);

    const reponsePlaces = await request(app).get('/api/places?categorie=VOITURE');
    expect(reponsePlaces.status).toBe(200);
    expect(reponsePlaces.body[0]).toMatchObject({ categorie: 'VOITURE', total: 35, libres: 34, occupees: 1 });
  });

  test('POST /api/entrees avec categorie invalide renvoie 400', async () => {
    const reponse = await request(app).post('/api/entrees').send({ plaque: 'DK-0002-BB', categorie: 'CAMION' });
    expect(reponse.status).toBe(400);
  });

  test('POST /api/sorties sur une plaque inconnue renvoie 404', async () => {
    const reponse = await request(app).post('/api/sorties').send({ plaque: 'INCONNUE' });
    expect(reponse.status).toBe(404);
    expect(reponse.body.code).toBe('PLAQUE_INTROUVABLE');
  });

  test('flux complet entree -> sortie renvoie le montant du et libere la place', async () => {
    await request(app).post('/api/entrees').send({ plaque: 'DK-0003-CC', categorie: 'MOTO' });
    const reponseSortie = await request(app).post('/api/sorties').send({ plaque: 'DK-0003-CC' });

    expect(reponseSortie.status).toBe(200);
    expect(reponseSortie.body.dateSortie).not.toBeNull();
    expect(typeof reponseSortie.body.montant).toBe('number');

    const reponsePlaces = await request(app).get('/api/places?categorie=MOTO');
    expect(reponsePlaces.body[0].libres).toBe(10);
  });
});
