const RSVPForm = {
    state: {
        hasEnteredPrimaryGuest: false,
        isCeremonySectionShown: false, 
        isReceptionSectionShown: false,
        isFamilySectionShown: false,
        primaryGuest: {
            name: '',
            connections: [],
            events: [],
            state: {
                isAttendingReception: false,
                isAttendingCeremony: false
            }
        },
        secondaryGuest: {
            name: '',
            connections: [],
            events: [],
            state: {
                isAttendingReception: false,
                isAttendingCeremony: false
            }
        }
    },
    elements: {
        outside: {
            scrollContainer: document.querySelector('.parallax'),
            morphButton: document.querySelector('.morph-button-fixed'),
            rsvpButton: document.querySelector('.rsvp-button'),
            closeButton: document.querySelector('.close-button'),
            formContainer: document.querySelector('.morph-content'),
            // footer: document.querySelector('footer')
        },
        primaryGuest: {
            input: document.getElementById('name-input'),
            submitButton: document.getElementById('name-input').nextElementSibling,
            autocompleteList: document.querySelector('#autocomplete-list'),
            autocompleteOpenSpots: document.querySelectorAll('.autocomplete-spot'),
            autocompleteNoMatch: document.querySelector('#autocomplete-list-no-match')
        },
        secondaryGuest: {
            section: document.querySelector('.secondary-rsvp'),
            title: document.querySelector('.secondary-rsvp-title')
        },
        ceremony: {
            section: document.querySelector('.ceremony-section'),
            title: document.querySelector('.ceremony-section-title'),
            radioOptions: document.querySelectorAll('form.ac-fill input[name="ceremony"]')
        },
        reception: {
            section: document.querySelector('.reception-section'),
            radioOptions: document.querySelectorAll('form.ac-fill input[name="reception"]')
        },
        family: {
            section: document.querySelector('.family-rsvp'),
            members: document.querySelector('.family-members')
        },
        autocomplete: {
            list: document.querySelector('#autocomplete-list'),
            openSpots: document.querySelectorAll('.autocomplete-spot'),
            noMatch: document.querySelector('#autocomplete-list-no-match'),
        }
    },
    handlers: {
        handleNameInputChange: event => {
            const value = event.target.value;

            if (value.length > 2) {
                const matches = getNearestMatches(DB.method.getGuestsByName())(value);
                RSVPForm.helpers.autocomplete.showAutocompleteDropdown()(matches);
            } else {
                RSVPForm.elements.autocomplete.list.classList.add('hidden')
            }

            if(event.key === "Enter") {
                const val = RSVPForm.elements.primaryGuest.value
                setPrimaryGuest();
            }
        },

        setPrimaryGuest: (guestID) => {
            const guest = DB.methods.getGuestById(guestID);
            RSVPForm.state.hasEnteredPrimaryGuest = true;
            RSVPForm.state.primaryGuest = {
                name: guest.name,
                connections: guest.connections,
                events: guest.events
            }
        },

        showCeremonySection: () => {
            RSVPForm.state.isCeremonySectionShown = true;
            RSVPForm.helpers.showElement(RSVPForm.elements.ceremony.section);
            const checkedOption = RSVPForm.elements.ceremony.radioOptions.querySelector("[checked=true]")

            console.log(checkedOption.value);
        },

        showReceptionSection: () => {
            RSVPForm.state.isReceptionSectionShown = true;
            RSVPForm.helpers.showElement(RSVPForm.elements.reception.section);
            const checkedOption = RSVPForm.elements.reception.radioOptions.querySelector("[checked=true]")

            console.log(checkedOption)
        },

        showFamilyRSVPSection: () => {
            if(RSVPForm.controller === null || RSVPForm.state.isFamilySectionShown) {
                return;
            }

            RSVPForm.state.isFamilySectionShown = true;
            const connections = RSVPForm.controller.getConnections(guest);
            if (connections.length > 0) {
                RSVPForm.helpers.showElement(RSVPForm.elements.family.section)
                RSVPForm.helpers.createFamilyMemberButtons()
            }
        },

        toggleRsvpForm: () => {
            const { morphButton, scrollContainer, footer, formContainer } = RSVPForm.elements.outside;
            
            morphButton.classList.toggle('active')
            morphButton.classList.toggle('open')
            scrollContainer.classList.toggle('rsvp-form-open')
            // footer.classList.toggle('rsvp-form-open')

            if (morphButton.classList.contains('open')) {
                formContainer.style.top = scrollContainer.scrollTop
            }

            RSVPForm.helpers.resetRSVPForm();

        }
    },
    helpers: {
        initializeRadioButtons: namespace => {
            RSVPForm.elements[namespace].radioOptions.forEach(element => {
                RSVPForm.helpers.attachSVG(element)
                element.addEventListener('change', () => {
                    RSVPForm.helpers.resetRadioOptions(namespace)
                    RSVPForm.helpers.fillRadioButton(element)
                    RSVPForm.helpers.revealNextSection(namespace)
                })
            })
        },

        showElement: element => {
            element.classList.add('hidden')
        },

        hideElement: element => {
            element.classList.remove('hidden');
        },

        createFamilyMemberButtons: connections => {
            for (let i = 0; i < connections.length; i++) {
                const familyMember = connections[i]
                const familyMemberButton = document.createElement('button');
                familyMemberButton.textContent = familyMember.name;
                familyMemberButton.onclick = () => setSecondaryRsvpEntrant(familyMember);
                RSVPForm.elements.family.members.append(familyMemberButton);
            }      
        },

        autocomplete: {
            showAutocompleteDropdown: () => RSVPForm.helpers.debounce((matches) => {
                const { list, openSpots, noMatch } = RSVPForm.elements.autocomplete;

                list.classList.remove('hidden')
            
                for (let i = 0; i < Math.min(2, matches.length); i++) {
                    openSpots[i].textContent = matches[i]
                    openSpots[i].classList.remove('hidden');
                }
            
                for (let i = matches.length; i < 2; i++) {
                    openSpots[i].classList.add('hidden');
                }
            
                if (matches.length === 0) {
                    noMatch.classList.remove('hidden')
                } else {
                    noMatch.classList.add('hidden')
                }
            }, 2000),

           getMatches: matchFn => names => input => (max) => {
                const matches = [];
            
                for (const name of names) {
                    const [ firstName, lastName ] = name.split(' ');
                    if (matchFn(firstName, input) || matchFn(lastName, input)) {
                        matches.push(name)
                    }
            
                    if (max > 0 && matches.length === max) {
                        return matches;
                    }
                }
            
                return matches;
            },
            
            isTolerableEditDistance: name1 => name2 => maxDistance => {
                let distance = 0; 
                const maxNameLength = Math.max(name1.length, name2.length)
                
                for (let i = 0; i < maxNameLength; i++) {
                    const name1Char = name1.charAt(i)
                    const name2Char = name2.charAt(i)
            
                    if (!name1Char || !name2Char || name1Char !== name2Char) {
                        distance += 1
                    }
            
                    if (distance > maxDistance) {
                        return false
                    }
                }
            
                return true;
            },
            
            isExactMatch: (str, substring) => str.includes(substring),
            isNearMatch: (str, substring) => isTolerableEditDistance(str)(substring)(4),
            
            getNearestMatches: names => input => {
                const MAX_MATCHES = 3;
                const exactMatches = getMatches(isExactMatch)(names)(input)(-1)
            
                if (exactMatches.length >= MAX_MATCHES) {
                    return exactMatches
                } 
            
                const nearMatches = getMatches(isNearMatch)(names)(input)(MAX_MATCHES - exactMatches)
                return [...exactMatches, ...nearMatches]
            }
        },

        debounce(func, wait, immediate = true) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        },

        attachSVG: element => {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttributeNS( null, 'viewBox', '0 0 100 100' );
            svg.setAttribute( 'xmlns', 'http://www.w3.org/2000/svg' );

            element.parentNode.appendChild(svg)
        },

        resetRadioOptions: namespace => {
            RSVPForm.elements[namespace].radioOptions.forEach(option => {
                const path = option.parentNode.querySelector('svg > path');

                if (path) {
                    path.parentNode.removeChild(path);
                    option.checked = false;
                }
            })
        },

        revealNextSection: namespace => {
            if (namespace === RSVPForm.constants.CEREMONY_RADIO_GROUP_NAME) {
                RSVPForm.handlers.showReceptionSection();
            } else if (namespace === RSVPForm.constants.RECEPTION_RADIO_GROUP_NAME) {
                RSVPForm.handlers.showFamilyRSVPSection();
            } else if (namespace === RSVPForm.constants.FAMILY_BUTTON_GROUP_NAME) {
                RSVPForm.handlers.showSecondaryRSVPSection();
            }
        },

        fillRadioButton: element => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path' );
            const svg = element.parentNode.querySelector( 'svg' ); 

            const { speed, easing } = RSVPForm.constants.RADIO_BUTTON_ANIMATION
            const pathTransition = `stroke-dashoffset ${speed}s ${easing}`
            
            svg.appendChild( path );
            path.setAttributeNS( null, 'd', RSVPForm.constants.RADIO_BUTTON_FILL);

            const length = path.getTotalLength();

            // set up starting position
            path.style.strokeDasharray = `${length} ${length}`;
            path.style.strokeDashoffset = Math.floor(length) - 1;

            // make sure browser picks up starting position before animating
            path.getBoundingClientRect();
            path.style.transition = pathTransition
            path.style.WebkitTransition = pathTransition
            path.style.MozTransition  = pathTransition
            
            // actually animate things
            path.style.strokeDashoffset = '0';
        },

        resetNameSubmitButton: () => {
            const { primaryGuest } = RSVPForm.elements;
            primaryGuest.submitButton.classList.remove('filled');
            primaryGuest.submitButton.textContent = "That's Me!"
        },

        resetNameInput: () => {
            const { primaryGuest } = RSVPForm.elements;
            primaryGuest.input.value = "";
            primaryGuest.input.classList.remove('filled')
            primaryGuest.input.disabled = false;
        },

        resetRSVPForm: () => {
            const { helpers } = RSVPForm;
            helpers.resetNameSubmitButton();
            helpers.resetNameInput();

            helpers.hideElement(RSVPForm.elements.ceremony.section)
            helpers.hideElement(RSVPForm.elements.reception.section)
            
            helpers.resetRadioOptions("ceremony")
            helpers.resetRadioOptions("reception")
        },
    },

    constants: {
        // from codrops SVG Checkbox fills
        RADIO_BUTTON_FILL: ['M15.833,24.334c2.179-0.443,4.766-3.995,6.545-5.359 c1.76-1.35,4.144-3.732,6.256-4.339c-3.983,3.844-6.504,9.556-10.047,13.827c-2.325,2.802-5.387,6.153-6.068,9.866 c2.081-0.474,4.484-2.502,6.425-3.488c5.708-2.897,11.316-6.804,16.608-10.418c4.812-3.287,11.13-7.53,13.935-12.905 c-0.759,3.059-3.364,6.421-4.943,9.203c-2.728,4.806-6.064,8.417-9.781,12.446c-6.895,7.477-15.107,14.109-20.779,22.608 c3.515-0.784,7.103-2.996,10.263-4.628c6.455-3.335,12.235-8.381,17.684-13.15c5.495-4.81,10.848-9.68,15.866-14.988 c1.905-2.016,4.178-4.42,5.556-6.838c0.051,1.256-0.604,2.542-1.03,3.672c-1.424,3.767-3.011,7.432-4.723,11.076 c-2.772,5.904-6.312,11.342-9.921,16.763c-3.167,4.757-7.082,8.94-10.854,13.205c-2.456,2.777-4.876,5.977-7.627,8.448 c9.341-7.52,18.965-14.629,27.924-22.656c4.995-4.474,9.557-9.075,13.586-14.446c1.443-1.924,2.427-4.939,3.74-6.56 c-0.446,3.322-2.183,6.878-3.312,10.032c-2.261,6.309-5.352,12.53-8.418,18.482c-3.46,6.719-8.134,12.698-11.954,19.203 c-0.725,1.234-1.833,2.451-2.265,3.77c2.347-0.48,4.812-3.199,7.028-4.286c4.144-2.033,7.787-4.938,11.184-8.072 c3.142-2.9,5.344-6.758,7.925-10.141c1.483-1.944,3.306-4.056,4.341-6.283c0.041,1.102-0.507,2.345-0.876,3.388 c-1.456,4.114-3.369,8.184-5.059,12.212c-1.503,3.583-3.421,7.001-5.277,10.411c-0.967,1.775-2.471,3.528-3.287,5.298 c2.49-1.163,5.229-3.906,7.212-5.828c2.094-2.028,5.027-4.716,6.33-7.335c-0.256,1.47-2.07,3.577-3.02,4.809'],
        RADIO_BUTTON_ANIMATION: { speed : .8, easing : 'ease-in-out' },
        CEREMONY_RADIO_GROUP_NAME: 'ceremony',
        RECEPTION_RADIO_GROUP_NAME: 'reception',
        FAMILY_BUTTON_GROUP_NAME: 'family'
    },

    init: () => {
        RSVPForm.elements.outside.rsvpButton.onclick = RSVPForm.handlers.toggleRsvpForm;
        RSVPForm.elements.outside.closeButton.onclick = RSVPForm.handlers.toggleRsvpForm;
        
        RSVPForm.elements.autocomplete.openSpots.forEach(spot => {
            spot.onclick = () => RSVPForm.handlers.setPrimaryGuest(spot.dataset.guest);
        });

        RSVPForm.elements.primaryGuest.input.onclick = RSVPForm.handlers.handleNameInputChange;
        RSVPForm.elements.primaryGuest.submitButton.onclick = RSVPForm.handlers.setPrimaryGuest

        RSVPForm.helpers.initializeRadioButtons(RSVPForm.constants.CEREMONY_RADIO_GROUP_NAME);
        RSVPForm.helpers.initializeRadioButtons(RSVPForm.constants.RECEPTION_RADIO_GROUP_NAME);
    }
}