const { LocalStorage } = require('node-localstorage');
const { Place } = require('../metier/Place');
const Ticket = require('../metier/Ticket');

const CLE_PLACES = 'parking_places';
const CLE_TICKETS = 'parking_tickets';

/**
 * Implémentation du repository basée sur node-localstorage : simule l'API
 * localStorage du navigateur mais persiste sur disque, dans le dossier passé
 * en paramètre (par défaut ./data). L'état complet (places, tickets) est
 * sérialisé en JSON.
 *
 * Cette couche est volontairement "bête" : aucune logique métier, seulement
 * de la lecture/écriture. La classe Parking ne connaît pas node-localstorage,
 * elle reçoit ce repository par injection de dépendance.
 */
class LocalStorageRepository {
  constructor(dossier = './data') {
    this.storage = new LocalStorage(dossier);
  }

  chargerPlaces() {
    const brut = this.storage.getItem(CLE_PLACES);
    if (!brut) return [];
    const donnees = JSON.parse(brut);
    return donnees.map((p) => Place.fromJSON(p));
  }

  sauvegarderPlaces(places) {
    this.storage.setItem(CLE_PLACES, JSON.stringify(places.map((p) => p.toJSON())));
  }

  chargerTickets() {
    const brut = this.storage.getItem(CLE_TICKETS);
    if (!brut) return [];
    const donnees = JSON.parse(brut);
    return donnees.map((t) => Ticket.fromJSON(t));
  }

  sauvegarderTicket(ticket) {
    const tickets = this.chargerTickets();
    tickets.push(ticket);
    this._ecrireTickets(tickets);
  }

  mettreAJourTicket(ticket) {
    const tickets = this.chargerTickets();
    const index = tickets.findIndex((t) => t.id === ticket.id);
    if (index !== -1) {
      tickets[index] = ticket;
    } else {
      tickets.push(ticket);
    }
    this._ecrireTickets(tickets);
  }

  _ecrireTickets(tickets) {
    this.storage.setItem(CLE_TICKETS, JSON.stringify(tickets.map((t) => t.toJSON())));
  }
}

module.exports = LocalStorageRepository;
