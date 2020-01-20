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

const morphRsvpForm = () => {
    morphButton.classList.toggle('active')
    morphButton.classList.toggle('open');
    scrollContainer.classList.toggle('rsvp-form-open')
    footer.classList.toggle('rsvp-form-open');

    if (morphButton.classList.contains('open')) {
        morphContent.style.top = scrollContainer.scrollTop 
    } 

    nameInput.value = "";
    nameInput.classList.remove('filled')
    nameSubmitButton.classList.remove('filled');
    nameInput.disabled = false;
}

rsvpButton.onclick = morphRsvpForm;
closeButton.onclick = morphRsvpForm;

nameInput.onkeydown = event => {
    const value = event.target.value;

    if (value.length > 2) {
        const matches = getNearestMatches(ALL_GUESTS)(value);
        console.log(matches)
    }

}

nameSubmitButton.onclick = () => {
    nameInput.classList.add('filled')
    nameSubmitButton.classList.add('filled')
    nameInput.value = 'Thank You, '
    nameInput.disabled = true;
}