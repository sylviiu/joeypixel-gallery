const pathExists = require(`../util/pathExists`);

module.exports = {
    path: `/web/:path(*+)`,
    disableCors: true,
    func: async (req, res) => {
        console.log(req.params.path)

        while(req.params.path.startsWith(`/`)) req.params.path = req.params.path.slice(1);

        if(!req.params.path) req.params.path = `index.html`

        const basePath = __dirname.split(`/`).slice(0, -1).join(`/`)

        console.log(`GOT WEB ENDPOINT.\n- params.path: ${req.params.path}\n- basePath: ${basePath}`);

        if(pathExists(basePath + `/override/${req.params.path}`)) {
            console.log(`Sending raw overriden file -- raw path was given, and override exists! [1] (${basePath + `/override/${req.params.path}`})`);
            res.sendFile(basePath + `/override/${req.params.path}`)
        } else if(pathExists(basePath + `/html/export/${req.params.path}`)) {
            console.log(`Sending raw HTML file [1] (${basePath + `/html/export/${req.params.path}`})`);
            res.sendFile(basePath + `/html/export/${req.params.path}`)
        } else {
            console.log(`no path exists for ${req.params.path}!`);
            res.send(null)
        }
    }
}