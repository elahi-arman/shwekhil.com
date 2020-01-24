const Airtable = require('airtable');

const DB = {
    instance: null,
    constants: {
        KEY: 'keyvYdwb9572vBKY8',
        BASE: 'appex9fA1wqbFfEO2',
        tables: {
            GUEST_LIST: 'Guest List',
            EVENTS: 'Events',
            RSVP: 'RSVPs'
        },
        MAX_GUESTS_PER_SEARCH_BY_NAME: 3,
        MAX_GUESTS_PER_SEARCH_BY_ID: 1,
        GUEST_LIST_TABLE_NAME_FIELD: "Name"
    },
    local: {
        events: new Map(),
        guestsByName: new Map(),
        guestsById: new Map(),
    },

    methods: {
        getEvents: () => DB.local.events,
        getGuestsByName: () => DB.local.guestsByName,
        getGuestsById: () => DB.local.guestsBydId,

        populateGuests: () => {
            return new Promise((resolve, reject) => {
                DB.instance(DB.constants.tables.GUEST_LIST)
                .select()
                .firstPage((err, events) => {
                    if (err) { 
                        console.error(err); 
                        reject(err); 
                    }

                    resolve(events)
                })                
            })
        },

        populateEvents: () => {
            return new Promise((resolve, reject) => {
                DB.instance(DB.constants.tables.EVENTS)
                .select()
                .firstPage((err, events) => {
                    if (err) { 
                        console.error(err); 
                        reject(err); 
                    }

                    resolve(events)
                })                
            })
        },

        searchGuestByName: (name) => DB.local.guestsByName.get(name.toLowerCase()),
        getConnectionsForGuest: (name) => {
            const connections = DB.methods.searchGuestByName(name).connections;
            return connections.map(connectionID => DB.local.guestsById.get(connectionID))
        },

        submitRSVP: (guest, reception = true, wedding = false) => {
            return new Promise((resolve, reject) => {
                DB.instance(DB.constants.tables.RSVP) 
                    .create(
                        [DB.helpers.createRSVPResponse(guest, reception, wedding)], 
                        { typecast: true }, 
                        (err, records) => {
                        if (err) {
                          reject(err);
                        }

                        resolve();
                    });
            })
        }
    },

    helpers: {
        createRSVPResponse: (guest, reception, wedding) => {
            return {
                fields: {
                    Name: guest.name,
                    Wedding: wedding,
                    Reception: reception,
                    GuestID: guest.id
                }
            }
        }
    },

    init: () => {
        DB.instance = new Airtable ({
            apiKey: DB.constants.KEY
        }).base(DB.constants.BASE)

        DB.methods.populateEvents()
            .then(events => {
                for (const event of events) {
                    DB.local.events.set(event.id, event.get('Name'))
                }
            });

        DB.methods.populateGuests()
            .then(guests => {
                for(const guest of guests) {
                    const g = {
                        id: guest.getId(),
                        name: guest.get("Name"),
                        events: guest.get('Events').map(event => DB.local.events.get(event)),
                        connections: guest.get('Connections'), 
                    }

                    DB.local.guestsByName.set(g.name.toLowerCase(), g)
                    DB.local.guestsById.set(g.id, g)
                }
            })
    }
}