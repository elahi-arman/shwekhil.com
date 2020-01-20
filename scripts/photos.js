window.onload = () => {
    fetch('../assets/images/grid-photos').then((photoPaths) => {
        console.log(photoPaths)
    })
}

