const Shwekhil = {
    elements: {
        bookAccomodationsButton: document.querySelector('.accomodations-button')
    },
    handlers: {
        redirectToHotel: () => {
            window.open(Shwekhil.constants.BOOK_HOTEL_LINK, '_blank');            
        }
    },
    constants: {
        BOOK_HOTEL_LINK: 'https://www.marriott.com/event-reservations/reservation-link.mi?id=1577987940847&key=GRP&app=resvlink'
    },
    init() {
        Shwekhil.elements.bookAccomodationsButton.onclick = Shwekhil.handlers.redirectToHotel;

        if (!!DB) {
            DB.init();
        } else {
            console.error('No DB object found');
        }
        
        if (!!RSVPForm) {
            RSVPForm.init()
        } else {
            console.error('No RSVPForm object found')
        }
    }
}

Shwekhil.init()