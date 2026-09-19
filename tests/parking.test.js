const Parking = require('../src/metier/Parking');
const MemoryRepository = require('../src/persistence/MemoryRepository');
const {
  ParkingCompletError,
  PlaqueDejaPresenteError,
  PlaqueIntrouvableError,
  CategorieInvalideError
} = require('../src/metier/erreurs');

describe('Parking', () => {
  let parking;

  beforeEach(() => {
    // Nouveau repository en mémoire + nouveau Parking avant chaque test,
    // pour garantir un état propre (50 places, aucun ticket).
    parking = new Parking(new MemoryRepository());
  });

  describe('entrerVehicule', () => {
    test("attribue correctement une place libre de la bonne catégorie et crée un ticket", () => {
      const ticket = parking.entrerVehicule('DK-1234-AB', 'VOITURE');

      expect(ticket.plaque).toBe('DK-1234-AB');
      expect(ticket.categorie).toBe('VOITURE');
      expect(ticket.placeId).toMatch(/^VOITURE-/);
      expect(ticket.estActif()).toBe(true);
      expect(parking.placesDisponibles('VOITURE')).toBe(34);
    });

    test('refuse une entrée quand la catégorie est complète', () => {
      // Sature les 10 places MOTO
      for (let i = 0; i < 10; i += 1) {
        parking.entrerVehicule(`MOTO-PLAQUE-${i}`, 'MOTO');
      }
      expect(parking.placesDisponibles('MOTO')).toBe(0);
      expect(() => parking.entrerVehicule('MOTO-EXTRA', 'MOTO')).toThrow(ParkingCompletError);
    });

    test('refuse une entrée pour une plaque déjà présente dans le parking', () => {
      parking.entrerVehicule('DK-9999-XY', 'VOITURE');
      expect(() => parking.entrerVehicule('DK-9999-XY', 'VOITURE')).toThrow(PlaqueDejaPresenteError);
    });

    test('refuse une catégorie invalide', () => {
      expect(() => parking.entrerVehicule('DK-0001-ZZ', 'CAMION')).toThrow(CategorieInvalideError);
    });
  });

  describe('calculerTarif', () => {
    // VOITURE : 500 F CFA/heure, demi-heure gratuite, arrondi à l'heure supérieure
    test('20 minutes -> 0 F CFA (demi-heure gratuite)', () => {
      const entree = new Date('2026-01-01T10:00:00');
      const sortie = new Date('2026-01-01T10:20:00');
      expect(parking.calculerTarif('VOITURE', entree, sortie)).toBe(0);
    });

    test('45 minutes -> 500 F CFA (1 heure facturée)', () => {
      const entree = new Date('2026-01-01T10:00:00');
      const sortie = new Date('2026-01-01T10:45:00');
      expect(parking.calculerTarif('VOITURE', entree, sortie)).toBe(500);
    });

    test('2h10 -> 1500 F CFA (3 heures facturées)', () => {
      const entree = new Date('2026-01-01T10:00:00');
      const sortie = new Date('2026-01-01T12:10:00');
      expect(parking.calculerTarif('VOITURE', entree, sortie)).toBe(1500);
    });

    test('applique le tarif MOTO (250 F CFA/heure)', () => {
      const entree = new Date('2026-01-01T10:00:00');
      const sortie = new Date('2026-01-01T11:00:00');
      expect(parking.calculerTarif('MOTO', entree, sortie)).toBe(250);
    });
  });

  describe('sortirVehicule', () => {
    test('clôture le ticket, libère la place et renvoie le montant dû', () => {
      const entree = new Date('2026-01-01T08:00:00');
      parking.entrerVehicule('DK-5555-CD', 'VOITURE', entree);
      expect(parking.placesDisponibles('VOITURE')).toBe(34);

      const sortie = new Date('2026-01-01T09:30:00');
      const ticket = parking.sortirVehicule('DK-5555-CD', sortie);

      expect(ticket.estActif()).toBe(false);
      expect(ticket.montant).toBe(1000); // 1h30 -> 2h facturées * 500
      expect(parking.placesDisponibles('VOITURE')).toBe(35);
    });

    test('refuse la sortie pour une plaque inconnue', () => {
      expect(() => parking.sortirVehicule('INCONNUE-000')).toThrow(PlaqueIntrouvableError);
    });

    test('refuse la sortie pour une plaque déjà sortie', () => {
      parking.entrerVehicule('DK-7777-EF', 'PMR');
      parking.sortirVehicule('DK-7777-EF');
      expect(() => parking.sortirVehicule('DK-7777-EF')).toThrow(PlaqueIntrouvableError);
    });
  });

  describe('placesDisponibles', () => {
    test('décompte correctement les places libres, globalement et par catégorie', () => {
      expect(parking.placesDisponibles()).toBe(50);
      expect(parking.placesDisponibles('VOITURE')).toBe(35);
      expect(parking.placesDisponibles('MOTO')).toBe(10);
      expect(parking.placesDisponibles('PMR')).toBe(5);

      parking.entrerVehicule('DK-1111-AA', 'VOITURE');
      parking.entrerVehicule('DK-2222-BB', 'MOTO');

      expect(parking.placesDisponibles()).toBe(48);
      expect(parking.placesDisponibles('VOITURE')).toBe(34);
      expect(parking.placesDisponibles('MOTO')).toBe(9);
    });
  });

  describe('historiqueVehicule', () => {
    test("renvoie tous les tickets (passés et présent) d'une plaque, triés par date d'entrée", () => {
      const t1 = parking.entrerVehicule('DK-8888-GH', 'VOITURE', new Date('2026-01-01T08:00:00'));
      parking.sortirVehicule('DK-8888-GH', new Date('2026-01-01T09:00:00'));
      const t2 = parking.entrerVehicule('DK-8888-GH', 'VOITURE', new Date('2026-01-02T08:00:00'));

      const historique = parking.historiqueVehicule('DK-8888-GH');

      expect(historique).toHaveLength(2);
      expect(historique[0].id).toBe(t1.id);
      expect(historique[1].id).toBe(t2.id);
    });
  });
});
