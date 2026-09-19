const { Place } = require('./Place');
const Ticket = require('./Ticket');
const { CATEGORIES, DUREE_GRATUITE_MINUTES, estCategorieValide } = require('./config');
const {
  CategorieInvalideError,
  ParkingCompletError,
  PlaqueDejaPresenteError,
  PlaqueIntrouvableError
} = require('./erreurs');

class Parking {
  /**
   * @param {object} repository Couche de persistance injectée (voir persistence/).
   *   Doit exposer : chargerPlaces, sauvegarderPlaces, chargerTickets,
   *   sauvegarderTicket, mettreAJourTicket.
   */
  constructor(repository) {
    this.repository = repository;
    this.places = [];
    this.tickets = [];
    this._initialiser();
  }

  /**
   * Recharge l'état existant depuis le repository, ou initialise les places
   * selon la répartition imposée si aucun état n'existe encore.
   */
  _initialiser() {
    const placesExistantes = this.repository.chargerPlaces();
    if (placesExistantes && placesExistantes.length > 0) {
      this.places = placesExistantes.map((p) => (p instanceof Place ? p : Place.fromJSON(p)));
    } else {
      this.places = this._genererPlacesInitiales();
      this.repository.sauvegarderPlaces(this.places);
    }

    const ticketsExistants = this.repository.chargerTickets();
    this.tickets = (ticketsExistants || []).map((t) => (t instanceof Ticket ? t : Ticket.fromJSON(t)));
  }

  _genererPlacesInitiales() {
    const places = [];
    Object.entries(CATEGORIES).forEach(([categorie, { nombrePlaces }]) => {
      for (let i = 1; i <= nombrePlaces; i += 1) {
        const numero = String(i).padStart(2, '0');
        places.push(new Place(`${categorie}-${numero}`, categorie));
      }
    });
    return places;
  }

  /**
   * Enregistre l'entrée d'un véhicule : attribue une place libre de la catégorie
   * demandée et crée un ticket.
   */
  entrerVehicule(plaque, categorie, dateEntree = new Date()) {
    if (!estCategorieValide(categorie)) {
      throw new CategorieInvalideError(categorie);
    }

    const dejaPresent = this.tickets.some((t) => t.plaque === plaque && t.estActif());
    if (dejaPresent) {
      throw new PlaqueDejaPresenteError(plaque);
    }

    const place = this.places.find((p) => p.categorie === categorie && p.estLibre());
    if (!place) {
      throw new ParkingCompletError(categorie);
    }

    place.occuper();
    const ticket = new Ticket({ plaque, categorie, placeId: place.id, dateEntree });

    this.tickets.push(ticket);
    this.repository.sauvegarderPlaces(this.places);
    this.repository.sauvegarderTicket(ticket);

    return ticket;
  }

  /**
   * Clôture le ticket actif d'une plaque, libère la place et calcule le montant dû.
   */
  sortirVehicule(plaque, dateSortie = new Date()) {
    const ticket = this.tickets.find((t) => t.plaque === plaque && t.estActif());
    if (!ticket) {
      throw new PlaqueIntrouvableError(plaque);
    }

    const montant = this.calculerTarif(ticket.categorie, ticket.dateEntree, dateSortie);
    ticket.cloturer(dateSortie, montant);

    const place = this.places.find((p) => p.id === ticket.placeId);
    if (place) {
      place.liberer();
    }

    this.repository.sauvegarderPlaces(this.places);
    this.repository.mettreAJourTicket(ticket);

    return ticket;
  }

  /**
   * Calcule le tarif dû en Francs CFA (entier) : demi-heure gratuite,
   * puis arrondi à l'heure supérieure.
   */
  calculerTarif(categorie, dateEntree, dateSortie) {
    if (!estCategorieValide(categorie)) {
      throw new CategorieInvalideError(categorie);
    }

    const dureeMs = new Date(dateSortie).getTime() - new Date(dateEntree).getTime();
    const dureeMinutes = Math.max(0, dureeMs / (1000 * 60));

    if (dureeMinutes <= DUREE_GRATUITE_MINUTES) {
      return 0;
    }

    const heuresFacturees = Math.ceil(dureeMinutes / 60);
    const { tarifHoraire } = CATEGORIES[categorie];
    return heuresFacturees * tarifHoraire;
  }

  /**
   * Nombre de places libres, globalement ou pour une catégorie donnée.
   */
  placesDisponibles(categorie = null) {
    if (categorie !== null) {
      if (!estCategorieValide(categorie)) {
        throw new CategorieInvalideError(categorie);
      }
      return this.places.filter((p) => p.categorie === categorie && p.estLibre()).length;
    }
    return this.places.filter((p) => p.estLibre()).length;
  }

  /**
   * Résumé de l'état des places par catégorie (libres/occupées/total).
   */
  etatPlaces(categorie = null) {
    const categories = categorie ? [categorie] : Object.keys(CATEGORIES);
    return categories.map((cat) => {
      if (!estCategorieValide(cat)) {
        throw new CategorieInvalideError(cat);
      }
      const placesCat = this.places.filter((p) => p.categorie === cat);
      const libres = placesCat.filter((p) => p.estLibre()).length;
      return {
        categorie: cat,
        total: placesCat.length,
        libres,
        occupees: placesCat.length - libres
      };
    });
  }

  /**
   * Historique complet (tickets passés et présent) d'une plaque donnée.
   */
  historiqueVehicule(plaque) {
    return this.tickets
      .filter((t) => t.plaque === plaque)
      .sort((a, b) => a.dateEntree.getTime() - b.dateEntree.getTime());
  }

  trouverTicketParId(id) {
    return this.tickets.find((t) => t.id === id) || null;
  }

  trouverToutesLesPlaces() {
    return [...this.places];
  }
}

module.exports = Parking;
