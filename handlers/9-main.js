const fs = require('fs');
const time = require(`../util/time`)

module.exports = {
    path: `/:path(*+)`,
    func: async (req, res) => {
        const files = await new Promise(async resp => require(`./8-getYears`).func(req, Object.assign({}, res, { send: resp })));

        if(req.params.path.endsWith(`/`)) req.params.path = req.params.path.slice(0, -1)
        if(req.params.path.startsWith(`/`)) req.params.path = req.params.path.slice(1);

        const args = req.params.path.split(`/`);

        const rawFile = files.getFile(req.params.path)
        
        if(fs.existsSync(__dirname.split(`/`).slice(0, -1).join(`/`) + `/override/${req.params.path}`)) {
            console.log(`Sending raw overriden file -- raw path was given, and override exists! [1] (${__dirname.split(`/`).slice(0, -1).join(`/`) + `/override/${req.params.path}`})`);
            res.sendFile(__dirname.split(`/`).slice(0, -1).join(`/`) + `/override/${req.params.path}`)
        } else if(fs.existsSync(__dirname.split(`/`).slice(0, -1).join(`/`) + `/override/${rawFile}`)) {
            console.log(`Sending raw overriden file -- raw path was given, and override exists! [2] (${__dirname.split(`/`).slice(0, -1).join(`/`) + `/override/${req.params.path}`})`);
            res.sendFile(__dirname.split(`/`).slice(0, -1).join(`/`) + `/override/${rawFile}`)
        } else if(rawFile) {
            //console.log(`Sending raw file -- raw path was given!`);
            res.sendFile(__dirname.split(`/`).slice(0, -1).join(`/`) + `/files/` + rawFile.location)
        } else if(files[args[0]] && files[args[0]][args[1]] && files[args[0]][args[1]].find(o => o.name == args.slice(-1)[0])) {
            //console.log(`Sending processed file!`)
            res.sendFile(__dirname.split(`/`).slice(0, -1).join(`/`) + `/files/` + files[args[0]][args[1]].find(o => o.name == args.slice(-1)[0]).location)
        } else if(files[args[0]] && !files[args[0]][args[1]]) {
            //console.log(`Sending year directory of ${args[0]}`)
            res.send(files[args[0]])
        } else if(files[args[0]] && files[args[0]][args[1]]) {
            //console.log(`Sending month directory of ${args[0]}/${args[1]}`)
            res.send(files[args[0]][args[1]])
        } else if(!args[0] && (args.length === 0 || args.length === 1)) {
            //console.log(`Sending root dir`)
            res.send(files)
        } else {
            //console.log(`Sending absolutely nothing.`)
            res.send({})
        }
    }
}