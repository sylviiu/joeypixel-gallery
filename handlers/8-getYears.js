const fs = require('fs');
const time = require(`../util/time`)

module.exports = {
    path: `/listFiles`,
    func: async (req, res) => {
        console.log(`listFiles requested`);

        const parseDir = (dir) => {
            try {
                const read = typeof dir == `object` ? dir : fs.readdirSync(dir);
                return {
                    name: dir.split(`/`).slice(-1)[0],
                    location: dir.split(`/`).slice(2).join(`/`),
                    files: read.map(f => parseDir(dir + `/` + f))
                }
            } catch(e) {
                //console.warn(`Couldn't readdir for ${dir} -- ${e}, attempting file`);

                try {
                    const fd = fs.openSync(dir), fstat = fs.fstatSync(fd);
                    const ms = Object.entries(fstat).filter(o => o[0].endsWith(`Ms`)).map(o => o[1]).sort()[0], utc = time(ms).utc;
    
                    return {
                        createdAt: { ms, utc },
                        name: dir.split(`/`).slice(-1)[0],
                        location: dir.split(`/`).slice(2).join(`/`)
                    }
                } catch(e2) {
                    console.warn(`Coudln't read directory OR file:\n- Directory: ${e}\n- File: ${e2}\nReturning null.`);
                    return null;
                }
            }
        }
        
        const f = fs.readdirSync(`./files`).map(f => parseDir(`./files/${f}`));

        console.log(f)

        res.send(f)
    }
}