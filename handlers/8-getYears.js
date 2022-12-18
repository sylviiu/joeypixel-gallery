const fs = require('fs');
const time = require(`../util/time`);

let cached = null;

module.exports = {
    path: `/getYears`,
    func: async (req, res) => {
        console.log(`getYears requested`);

        let files = {};

        if(cached) {
            console.log(`using cached files`)
            files = cached
        } else {
            const parseFiles = (d) => {
                if(d.files && d.files.length > 0) {
                    d.files.forEach(f => {
                        if(f) {
                            if(f.type == `directory`) {
                                parseFiles(f)
                            } else {
                                const year = `${f.createdAt.utc.date.year}`;
                                if(!files[year]) files[year] = {};
                                
                                const month = `${f.createdAt.utc.date.month}`;
                                if(!files[year][month]) files[year][month] = [];
        
                                files[year][month].push(Object.assign({}, f, {
                                    createdAt: f.createdAt.ms,
                                    year, month
                                }))
                            }
                        }
                    })
                }
            }
    
            const fileStructure = await new Promise(async res => require(`./8-fileStructure`).func(req, Object.assign({}, res, { send: res })));
    
            fileStructure.forEach(parseFiles);

            cached = files;
            console.log(`created cached years obj`)
            setTimeout(() => {
                console.log(`deleting cached years obj`)
                cached = null;
            }, 60000)
        };

        const fileList = Object.assign([], ...Object.values(files).map(o => Object.values(o)[0]))

        files.getFile = (str) => fileList.find(o => o.name == str || o.location == str);

        res.send(files)
    }
}