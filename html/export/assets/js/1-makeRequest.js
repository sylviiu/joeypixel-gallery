const makeRequest = (location) => new Promise(async res => {
    const req = new XMLHttpRequest();
    
    req.addEventListener("load", function parse() {
        try {
            const j = JSON.parse(this.responseText);
            res(j)
        } catch(e) {
            console.warn(`Couldn't parse JSON: ${j}`);
            res(this.responseText)
        }
    });

    req.open("GET", location);

    req.send();
});