const fs = require('fs');
const time = require(`../util/time`)

module.exports = {
    path: `/fileStructure`,
    func: async (req, res) => {
        console.log(`fileStructure requested`);

        const parseDir = (dir) => {
            try {
                const read = typeof dir == `object` ? dir : fs.readdirSync(dir);
                return {
                    name: dir.split(`/`).slice(-1)[0],
                    location: dir.split(`/`).slice(2).join(`/`),
                    type: fs.existsSync(dir + `/`) ? `directory` : dir.split(`.`).slice(-1)[0],
                    files: read.map(f => parseDir(dir + `/` + f))
                }
            } catch(e) {
                //console.warn(`Couldn't readdir for ${dir} -- ${e}, attempting file`);

                try {
                    let name = dir.split(`/`).slice(-1)[0];

                    if(name.toLowerCase().startsWith(`spoiler_`)) name = name.slice(`spoiler_`.length)

                    let date = null;

                    if(name.startsWith(`VRChat_`)) {
                        if(name.split(`_`).length === 4) name = name.split(`_`).slice(1).join(`_`)
                        const day = name.split(`_`).slice(1, 2)[0].split(`-`);
                        const time = name.split(`_`).slice(2, 3)[0].split(`.`)[0].split(`-`);
                        date = (new Date(`${day.join(`-`)}T${time.join(`-`)}`)).getTime()
                    } else if(name[14] == `_`) {
                        const yr = name.slice(0, 4), month = name.slice(4, 6), day = name.slice(6, 8), h = name.slice(8, 10), m = name.slice(10, 12), s = name.slice(12, 14);
                        date = (new Date(`${yr}-${month}-${day}T${h}-${m}-${s}`)).getTime()
                    } else if(name[21] == `_`) {
                        name = name.slice(21 - 14);
                        const yr = name.slice(0, 4), month = name.slice(4, 6), day = name.slice(6, 8), h = name.slice(8, 10), m = name.slice(10, 12), s = name.slice(12, 14);
                        date = (new Date(`${yr}-${month}-${day}T${h}-${m}-${s}`)).getTime()
                    }

                    const fd = fs.openSync(dir), fstat = fs.fstatSync(fd);
                    const ms = date || Object.entries(fstat).filter(o => o[0].endsWith(`Ms`)).map(o => o[1]).sort()[0]
                    const utc = time(ms).utc;
    
                    return {
                        createdAt: { ms, utc },
                        name: dir.split(`/`).slice(-1)[0],
                        location: dir.split(`/`).slice(2).join(`/`),
                        type: dir.split(`/`).slice(-1)[0].split(`.`).slice(-1)[0]
                    }
                } catch(e2) {
                    console.warn(`Coudln't read directory OR file:\n- Directory: ${e}\n- File: ${e2}\nReturning null.`);
                    return null;
                }
            }
        }
        
        const f = fs.readdirSync(`./files`).map(f => parseDir(`./files/${f}`));

        res.send(f)
    }
}