const fs = require('fs');
const time = require(`../util/time`);

let fileStructure = {};

const readFileStructure = (firstRun) => new Promise(async res => {
    console.log(`Reading structure...`)
    const parseDir = (dir) => new Promise(async res => {
        try {
            const read = typeof dir == `object` ? dir : fs.readdirSync(dir);

            let mapped = [];

            let parsedProgress = 0;

            let timer = setInterval(() => console.log(`progress of parseDir: ${Math.round(parsedProgress*100)}%`), 3000)

            for (i in read) {
                let f = read[i];
                parsedProgress = (Number(i)+1)/read.length
                const parsed = await parseDir(dir + `/` + f)
                mapped.push(parsed)
                if(!firstRun) await new Promise(r => setTimeout(r, 10))
            };

            clearInterval(timer)

            res({
                name: dir.split(`/`).slice(-1)[0],
                location: dir.split(`/`).slice(2).join(`/`),
                type: fs.existsSync(dir + `/`) ? `directory` : dir.split(`.`).slice(-1)[0],
                files: mapped
            })
        } catch(e) {
            //console.warn(`Couldn't readdir for ${dir} -- ${e}, attempting file`);

            try {
                let name = dir.split(`/`).slice(-1)[0];

                if(name.toLowerCase().startsWith(`spoiler_`)) name = name.slice(`spoiler_`.length)

                let date = null, datestr = null, noDateFound = false;

                if(name.startsWith(`VRChat_`) || name.startsWith(`vrchat_`)) {
                    if(name.split(`_`).length === 4 && !name.includes(`(`) && !name.split(`_`).slice(-1)[0].includes(`x`)) name = name.split(`_`).slice(1).join(`_`)
                    const day = name.split(`_`).slice(1, 2)[0].split(`-`);
                    const time = name.split(`_`).slice(2, 3)[0].split(`.`)[0].split(`-`);
                    datestr = `${day.map(s => s.split(`.`)[0]).join(`-`)}T${time.map(s => s.split(`.`)[0]).join(`:`)}`
                    date = (new Date(datestr)).getTime()
                } else if(name[14] == `_`) {
                    const yr = name.slice(0, 4), month = name.slice(4, 6), day = name.slice(6, 8), h = name.slice(8, 10), m = name.slice(10, 12), s = name.slice(12, 14);
                    datestr = `${yr}-${month}-${day.split(`.`)[0]}T${h}:${m}:${s.split(`.`)[0]}`
                    date = (new Date(datestr)).getTime()
                } else if(name[21] == `_`) {
                    name = name.slice(21 - 14);
                    const yr = name.slice(0, 4), month = name.slice(4, 6), day = name.slice(6, 8), h = name.slice(8, 10), m = name.slice(10, 12), s = name.slice(12, 14);
                    datestr = `${yr}-${month}-${day.split(`.`)[0]}T${h}:${m}:${s.split(`.`)[0]}`
                    date = (new Date(datestr)).getTime()
                } else {
                    noDateFound = true;
                };

                if(!date && noDateFound) console.log(dir.split(`/`).slice(-1)[0], datestr)

                const fd = fs.openSync(dir), fstat = fs.fstatSync(fd);
                const ms = date || Object.entries(fstat).filter(o => o[0].endsWith(`Ms`)).map(o => o[1]).sort()[0]
                const utc = time(ms).utc;

                const cachedImages = fs.existsSync(`./cache/`) ? fs.readdirSync(`./cache/`) : []

                const cachedImage = require('../util/getCacheName')(dir.split(`/`).slice(2).join(`/`));

                //console.log(`${dir.split(`/`).slice(-1)[0]} as ${cachedImage} exists? ${cachedImages.indexOf(cachedImage) != -1 ? true : false}`)

                const mediaType = cachedImage.includes(`-`) ? cachedImage.split(`-`).slice(0, -1).join(`-`) : null;
                
                /*if(mediaType && cachedImages.indexOf(cachedImage) != -1) {
                    let location = `./cache/${cachedImage}`
                    if(fs.existsSync(location)) {
                        console.log(`CACHED IMAGE FOR ${dir.split(`/`).slice(-1)[0]} WITH MEDIA TYPE ${mediaType} EXISTS AT ${location}; deleting...`);
                        fs.unlinkSync(location);
                        cachedImages.splice(cachedImages.indexOf(cachedImage), 1)
                    } else console.log(`NO CACHED IMAGE EXISTS FOR ${dir.split(`/`).slice(-1)[0]} W/ MEDIA TYPE ${mediaType} (${location})`)
                }*/

                const obj = {
                    createdAt: { ms, utc, noDateFound },
                    name: dir.split(`/`).slice(-1)[0],
                    location: dir.split(`/`).slice(2).join(`/`),
                    mediaType: mediaType || `image`,
                    type: dir.split(`/`).slice(-1)[0].split(`.`).slice(-1)[0],
                    cachedImage: {
                        file: cachedImage,
                        exists: cachedImages.indexOf(cachedImage) != -1 ? true : false
                    }
                }

                if(mediaType) console.log(`file ${dir} has cached name media type of ${mediaType}`)

                res(obj)
            } catch(e2) {
                console.warn(`Coudln't read directory OR file:\n- Directory: ${e}\n- File: ${e2}\nReturning null.`);
                res(null);
            }
        }
    })
    
    const files = fs.readdirSync(`./files`);

    let f = [];

    for (o of files) {
        const a = await parseDir(`./files/${o}`);
        f.push(a)
        if(!firstRun) await new Promise(r => setTimeout(r, 10))
    }

    fileStructure = f;
    res(f)
});

let currentFileStructure = null

const timer = async () => {
    while(true) {
        await new Promise(async r => {
            currentFileStructure = readFileStructure(currentFileStructure ? false : true);

            await currentFileStructure;

            currentFileStructure = null;

            console.log(`fileStructure completed!`)

            setTimeout(r, 60000);
        })
    }
};

timer();

module.exports = {
    path: `/fileStructure`,
    func: async (req, res) => {
        if(currentFileStructure && Object.keys(fileStructure || {}).length === 0) {
            console.log(`waiting`)
            await currentFileStructure
        }
        res.send(fileStructure)
    }
};