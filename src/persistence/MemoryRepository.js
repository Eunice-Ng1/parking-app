/**
 * Implémentation en mémoire du repository, utilisée pour les tests unitaires
 * (Partie 1.4) : aucune écriture sur disque, état réinitialisé à chaque
 * instanciation. Respecte la même interface que LocalStorageRepository afin
 * que Parking reste totalement agnostique du support de stockage.
 */
class MemoryRepository {
  constructor() {
    this._places = [];
    this._tickets = [];
  }

  chargerPlaces() {
    return this._places;
  }

  sauvegarderPlaces(places) {
    this._places = [...places];
  }

  chargerTickets() {
    return this._tickets;
  }

  sauvegarderTicket(ticket) {
    this._tickets.push(ticket);
  }

  mettreAJourTicket(ticket) {
    const index = this._tickets.findIndex((t) => t.id === ticket.id);
    if (index !== -1) {
      this._tickets[index] = ticket;
    } else {
      this._tickets.push(ticket);
    }
  }
}

module.exports = MemoryRepository;
