const fs = require('fs');
const time = require(`../util/time`)

module.exports = {
    path: `/:path(*+)`,
    func: async (req, res) => {
        console.log(`Main requested -- ${req.originalUrl}`)

        if(req.params.path.endsWith(`/`)) req.params.path = req.params.path.slice(0, -1)
        if(req.params.path.startsWith(`/`)) req.params.path = req.params.path.slice(1)
        
        if(fs.existsSync(`./files/${req.params.path}/`)) {
            const dir = fs.readdirSync(`./files/${req.params.path}`);

            const dirs = dir.filter(f => fs.existsSync(`./files/${req.params.path}/${f}/`));
            const files = dir.filter(f => dirs.indexOf(f) === -1);

            console.log(`${dirs.length} dirs, ${files.length} files`);

            const parse = (f, type) => {
                const fd = fs.openSync(f), fstat = fs.fstatSync(fd);
                const ms = Object.entries(fstat).filter(o => o[0].endsWith(`Ms`)).map(o => o[1]).sort()[0], utc = time(ms).utc;

                return {
                    type,
                    name: f.split(`/`).slice(-1)[0],
                    files: type == `directory` ? fs.readdirSync(f) : null,
                    created: { ms, utc, },
                    location: f.split(`/`).slice(2).join(`/`)
                }
            }

            res.send([...dirs.map(d => parse(`./files/${req.params.path}/${d}`, `directory`)), ...files.map(f => parse(`./files/${req.params.path}/${f}`, f.split(`.`).slice(-1)[0]))])
        } else if(fs.existsSync(`./files/${req.params.path}`)) {
            res.sendFile(`${__dirname.split(`/`).slice(0, -1).join(`/`)}/files/${req.params.path}`)
        } else return res.redirect(`/`)
    }
}