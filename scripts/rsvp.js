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
}