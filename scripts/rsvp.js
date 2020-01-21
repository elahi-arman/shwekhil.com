function debounce(func, wait, immediate = true) {
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
};

const getMatches = matchFn => names => input => (max) => {
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
}

const isTolerableEditDistance = name1 => name2 => maxDistance => {
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
}

const isExactMatch = (str, substring) => str.includes(substring);
const isNearMatch = (str, substring) => isTolerableEditDistance(str)(substring)(2);

const getNearestMatches = names => input => {
    const MAX_MATCHES = 3;
    const exactMatches = getMatches(isExactMatch)(names)(input)(-1)

    if (exactMatches.length >= MAX_MATCHES) {
        return exactMatches
    } 

    const nearMatches = getMatches(isNearMatch)(names)(input)(MAX_MATCHES - exactMatches)
    return [...exactMatches, ...nearMatches]
}

const nameInput = document.getElementById('name-input');
const nameSubmitButton = nameInput.nextElementSibling;
const scrollContainer = document.querySelector('.parallax');
const morphButton = document.querySelector('.morph-button-fixed');
const rsvpButton = document.querySelector('.rsvp-button');
const closeButton = document.querySelector('.close-button');
const morphContent = document.querySelector('.morph-content');
const footer = document.querySelector('footer')

const ceremonySection = document.querySelector('.ceremony-section');
const ceremonySectionTitle = document.querySelector('.ceremony-section-title');

const receptionSection = document.querySelector('.reception-section');
const autocompleteList = document.querySelector('#autocomplete-list');
const autocompleteOpenSpots = document.querySelectorAll('.autocomplete-spot');
const autocompleteNoMatch = document.querySelector('#autocomplete-list-no-match');

const familySection = document.querySelector('.family-rsvp');
const familyMembers = document.querySelector('.family-members');

let rsvpEntrant;
let secondaryRsvpEntrant;

const morphRsvpForm = () => {
    morphButton.classList.toggle('active')
    morphButton.classList.toggle('open');
    scrollContainer.classList.toggle('rsvp-form-open')
    footer.classList.toggle('rsvp-form-open');

    if (morphButton.classList.contains('open')) {
        morphContent.style.top = scrollContainer.scrollTop 
    } 

    resetRSVPForm();
}

const setRSVPEntrant = (name) => {
    rsvpEntrant = name;

    nameInput.classList.add('filled')
    nameSubmitButton.classList.add('filled')
    nameInput.value = 'Hey'
    nameSubmitButton.textContent = rsvpEntrant.split(' ')[0];
    nameInput.disabled = true;
    ceremonySection.classList.add('visible');
    autocompleteList.classList.add('hidden')
} 

rsvpButton.onclick = morphRsvpForm;
closeButton.onclick = morphRsvpForm;

nameInput.onkeydown = event => {
    const value = event.target.value;

    if (value.length > 2) {
        const matches = getNearestMatches(ALL_GUESTS)(value);
        requestAnimationFrame(() => showAutocompleteDropdown(matches));
    } else {
        autocompleteList.classList.add('hidden')
    }

    if(event.key === "Enter") {
        setRSVPEntrant(nameInput.value);
    }
}

autocompleteOpenSpots.forEach(spot => {
    spot.onclick = () => setRSVPEntrant(spot.textContent)
})

const showAutocompleteDropdown = debounce((matches) => {
    autocompleteList.classList.remove('hidden')

    for (let i = 0; i < Math.min(2, matches.length); i++) {
        autocompleteOpenSpots[i].textContent = matches[i]
        autocompleteOpenSpots[i].classList.remove('hidden');
    }

    for (let i = matches.length; i < 2; i++) {
        autocompleteOpenSpots[i].classList.add('hidden');
    }

    if (matches.length === 0) {
        autocompleteNoMatch.classList.remove('hidden')
    } else {
        autocompleteNoMatch.classList.add('hidden')
    }
}, 2000)

nameSubmitButton.onclick = setRSVPEntrant;

const resetRSVPForm = () => {
    nameInput.value = "";
    nameInput.classList.remove('filled')
    nameSubmitButton.classList.remove('filled');
    nameSubmitButton.textContent = "That's Me!"
    nameInput.disabled = false;
    ceremonySection.classList.remove('visible')
    receptionSection.classList.remove('visible');
}

const showReceptionSection = () => {
    receptionSection.classList.add('visible');
}

const showFamilyRSVPSection = () => {
    const connections = GUEST_MAP.get(rsvpEntrant).connections;

    if (connections.length > 0) {
        familySection.classList.add('visible')   
        connections.forEach(connection => {
            const connectionElement = document.createElement('h3');
            connectionElement.textContent = connection;
            familyMembers.appendChild(connectionElement);
        })
    }
}

const setSecondaryRsvpEntrant = (name) => {
    secondaryRsvpEntrant = 
}

// RADIO INPUTS

const radioButtonFill = ['M15.833,24.334c2.179-0.443,4.766-3.995,6.545-5.359 c1.76-1.35,4.144-3.732,6.256-4.339c-3.983,3.844-6.504,9.556-10.047,13.827c-2.325,2.802-5.387,6.153-6.068,9.866 c2.081-0.474,4.484-2.502,6.425-3.488c5.708-2.897,11.316-6.804,16.608-10.418c4.812-3.287,11.13-7.53,13.935-12.905 c-0.759,3.059-3.364,6.421-4.943,9.203c-2.728,4.806-6.064,8.417-9.781,12.446c-6.895,7.477-15.107,14.109-20.779,22.608 c3.515-0.784,7.103-2.996,10.263-4.628c6.455-3.335,12.235-8.381,17.684-13.15c5.495-4.81,10.848-9.68,15.866-14.988 c1.905-2.016,4.178-4.42,5.556-6.838c0.051,1.256-0.604,2.542-1.03,3.672c-1.424,3.767-3.011,7.432-4.723,11.076 c-2.772,5.904-6.312,11.342-9.921,16.763c-3.167,4.757-7.082,8.94-10.854,13.205c-2.456,2.777-4.876,5.977-7.627,8.448 c9.341-7.52,18.965-14.629,27.924-22.656c4.995-4.474,9.557-9.075,13.586-14.446c1.443-1.924,2.427-4.939,3.74-6.56 c-0.446,3.322-2.183,6.878-3.312,10.032c-2.261,6.309-5.352,12.53-8.418,18.482c-3.46,6.719-8.134,12.698-11.954,19.203 c-0.725,1.234-1.833,2.451-2.265,3.77c2.347-0.48,4.812-3.199,7.028-4.286c4.144-2.033,7.787-4.938,11.184-8.072 c3.142-2.9,5.344-6.758,7.925-10.141c1.483-1.944,3.306-4.056,4.341-6.283c0.041,1.102-0.507,2.345-0.876,3.388 c-1.456,4.114-3.369,8.184-5.059,12.212c-1.503,3.583-3.421,7.001-5.277,10.411c-0.967,1.775-2.471,3.528-3.287,5.298 c2.49-1.163,5.229-3.906,7.212-5.828c2.094-2.028,5.027-4.716,6.33-7.335c-0.256,1.47-2.07,3.577-3.02,4.809']
const radioButtonAnimation = { speed : .8, easing : 'ease-in-out' }

const draw = el => {
    const paths = [];
    const svg = el.parentNode.querySelector( 'svg' ); 
    const pathDef = radioButtonFill;
    const animDef = radioButtonAnimation
    
    paths.push( document.createElementNS('http://www.w3.org/2000/svg', 'path' ) );

    for( var i = 0, len = paths.length; i < len; ++i ) {
        var path = paths[i];
        svg.appendChild( path );

        path.setAttributeNS( null, 'd', pathDef[i] );

        var length = path.getTotalLength();
        // Clear any previous transition
        //path.style.transition = path.style.WebkitTransition = path.style.MozTransition = 'none';
        // Set up the starting positions
        path.style.strokeDasharray = length + ' ' + length;
        if( i === 0 ) {
            path.style.strokeDashoffset = Math.floor( length ) - 1;
        }
        else path.style.strokeDashoffset = length;
        // Trigger a layout so styles are calculated & the browser
        // picks up the starting position before animating
        path.getBoundingClientRect();
        // Define our transition
        path.style.transition = path.style.WebkitTransition = path.style.MozTransition  = 'stroke-dashoffset ' + animDef.speed + 's ' + animDef.easing + ' ' + i * animDef.speed + 's';
        // Go!
        path.style.strokeDashoffset = '0';
    }
}

const createSVG = def => {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    if( def ) {
        svg.setAttributeNS( null, 'viewBox', def.viewBox );
        svg.setAttributeNS( null, 'preserveAspectRatio', def.preserveAspectRatio );
    }
    else {
        svg.setAttributeNS( null, 'viewBox', '0 0 100 100' );
    }
    
    svg.setAttribute( 'xmlns', 'http://www.w3.org/2000/svg' );
    return svg;
}

function resetRadio(name) {
    document.querySelectorAll(`form.ac-fill input[name="${name}"]`)
        .forEach(el => { 
            var path = el.parentNode.querySelector( 'svg > path' );
            if(path) {
                path.parentNode.removeChild(path);
            }
        } 
    );
}


const controlRadiobox = el => {
    var svg = createSVG();
    el.parentNode.appendChild(svg);
    el.addEventListener('change', function() {
        resetRadio(el.name);
        draw(el);

        //TODO: Gate on access privilege 
        if (el.name === 'ceremony') {
            showReceptionSection();
        } else if (el.name === 'reception') {
            showFamilyRSVPSection();
        }
    } );
}

document.querySelectorAll('form.ac-fill input[type="radio"]').forEach(el => controlRadiobox(el));
