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
        guests: new Map(),
    },
    methods: {
        getEvents: () => DB.local.events,
        getGuests: () => DB.local.guests,

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

        getGuestsByName: () => DB.methods.getGuests().values().map(guest => guest.name),

        getGuestById: (id) => {
            return new Promise((resolve, reject) => {
                DB.instance(DB.constants.tables.GUEST_LIST)
                .select({
                    maxRecords: DB.constants.MAX_GUESTS_PER_SEARCH_BY_ID,
                    filterByFormula: `FIND("${id}", RECORD_ID())`
                })
                .firstPage((err, guests) => {
                    if (err) { 
                        reject(err)
                    }

                    const guest = guests[0];

                    // locally caching guests
                    DB.local.guests.set(guest.getId(), {
                        name: guest.get("Name"),
                        events: guest.get('Events').map(event => DB.local.events.get(event)),
                        connections: guest.get('Connections'),
                        
                    })
                    
                    resolve(guest)
                })
            })   
        },

        searchGuestByName: (guest) => {
            return new Promise((resolve, reject) => {
                DB.instance(DB.constants.tables.GUEST_LIST)
                .select({
                    maxRecords: DB.constants.MAX_GUESTS_PER_SEARCH_BY_NAME,
                    filterByFormula: `FIND("${guest}", {Name})`,
                    fields: [DB.constants.GUEST_LIST_TABLE_NAME_FIELD]
                })
                .firstPage((err, guests) => {
                    if (err) { 
                        reject(err)
                    }

                    resolve(guests)
                })
            })   
        },

        submitRSVP: (rsvps) => {
            return new Promise((resolve, reject) => {
                DB.instance(DB.constants.tables.RSVP) 
                    .create(rsvps, { typecast: true }, (err, records) => {
                        if (err) {
                          reject(err);
                        }
                    });
            })
        }
    },

    helpers: {
        createRSVPResponse: (guestID, reception = true, wedding = false) => {
            const { name } = DB.local.guests.get(guestID);

            return {
                fields: {
                    Name: name,
                    Wedding: wedding,
                    Reception: reception,
                    GuestID: guestID
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
                    DB.local.guests.set(guest.getId(), {
                        name: guest.get("Name"),
                        events: guest.get('Events').map(event => DB.local.events.get(event)),
                        connections: guest.get('Connections'),
                        
                    })
                }
            })
    }
}