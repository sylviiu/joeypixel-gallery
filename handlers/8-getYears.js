const fs = require('fs');
const time = require(`../util/time`);

let cached = null;

const cacheNow = () => new Promise(async res => {
    let toBeCached = {};

    console.log(`caching years`);

    let progress = 0;

    const parseFiles = (d) => new Promise(async r => {
        if(d.files && d.files.length > 0) {
            for (i in d.files) {
                let f = d.files[i];

                progress = i/d.files.length

                if(f) {
                    if(f.type == `directory`) {
                        //console.log(`parsing ${f.location} as directory`)
                        parseFiles(f)
                    } else {
                        //console.log(`parsing ${f.location} as file`)
                        const year = `${f.createdAt.utc.date.year}`;
                        if(!toBeCached[year]) toBeCached[year] = {};
                        
                        const month = `${f.createdAt.utc.date.month}`;
                        if(!toBeCached[year][month]) toBeCached[year][month] = [];

                        toBeCached[year][month].push(Object.assign({}, f, {
                            createdAt: f.createdAt.ms,
                            year, month
                        }))
                    };
                    await new Promise(r2 => setTimeout(r2, 5))
                };
            }
        }; r()
    })

    const fileStructure = await new Promise(async resp => require(`./8-fileStructure`).func({ }, { send: resp, }));
    
    for(f of fileStructure) {
        let timer = setInterval(() => console.log(`years parsing progress: ${Math.round(progress*100)}%`), 3000)
        await parseFiles(f);
        clearInterval(timer);
        await new Promise(r => setTimeout(r, 10))
    }

    cached = toBeCached

    console.log(`created cached years obj`);
    res(cached)
});

let currentFileStructure = null;

const timer = async () => {
    while(true) {
        await new Promise(async r => {
            currentFileStructure = cacheNow();

            await currentFileStructure;

            currentFileStructure = null;

            console.log(`caching years completed!`)

            setTimeout(r, 60000);
        })
    }
};

timer();

module.exports = {
    path: `/getYears`,
    func: async (req, res) => {
        if(currentFileStructure && !cached) await currentFileStructure;

        const fileList = Object.assign([], ...Object.values(cached).map(o => Object.values(o)[0]))

        cached.getFile = (str) => fileList.find(o => o.name == str || o.location == str);

        res.send(cached)
    }
}