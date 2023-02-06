module.exports = (path) => {
    let exists = true;

    let suffix = ``

    path = (path.startsWith(`/`) ? path.slice(1) : path).split(`/`);

    /*while(!path.slice(-1)[0]) {
        path = path.slice(0, -1);
        suffix = `/`
    }*/

    let currentPath = ``;

    for (p of path) {
        currentPath = currentPath + `/${p}`

        if(exists && currentPath) {
            if(!require(`fs`).existsSync(currentPath + suffix)) exists = false;
        };
    };

    //console.log(`[EXISTS]\n- Exists? ${exists}\n- Full path: ${path.join(`/`)}${suffix}`);

    return exists;
}