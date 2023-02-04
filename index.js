const app = require("express")();

const corsWhitelist = [
    `http://127.0.0.1:8080`,
    `http://127.0.0.1:8000`,
    `http://localhost:8080`,
    `http://localhost:8000`,
]

const corsOptions = {
    origin: function (origin, callback) {
        if (corsWhitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(require('cors')());
const fs = require('fs');

let update = () => new Promise(res => res(console.log(`Not checking for updates.`)))

if(process.argv.indexOf(`production`) === -1 && !process.env.galleryProduction) {
    console.log(`This is not running in production! Will not check for updates.`)
} else {
    console.log(`This is running in production! Will check for updates.`);
    update = require(`./util/updateChecker`);
};

update().then(() => {
    setInterval(update, 60000)
    
    if(!fs.existsSync(`./files/`) || fs.readdirSync(`./files`).length === 0) {
        if(fs.existsSync(`./files`)) fs.rmSync(`./files`);
        fs.mkdirSync(`./files`)
        console.log(`There are no files! Upload some files in the "files" directory for it to show up on the webpage!`)
    }

    fs.readdirSync(`./handlers`).filter(f => f.endsWith(`.js`)).forEach(f => {
        try {
            console.log(`Adding handler ${f}`)
            const obj = require(`./handlers/${f}`);

            const reqType = obj.endpoint && typeof obj.endpoint == `string` && app[obj.endpoint.toLowerCase()] ? obj.endpoint.toLowerCase() : `get`

            console.log(`${f} / ${reqType} @ ${obj.path}`);

            const funcs = [obj.func];

            if(!obj.disableCors) funcs.unshift(require(`cors`)(corsOptions))

            app[reqType](obj.path, obj.func)
        } catch(e) {
            console.warn(`handler ${f} failed -- ${e}`)
        }
    })

    const server = app.listen(8080, async () => {
        console.log(`Server is online, listening @ port ${server._connectionKey.split(`:`).slice(-1)[0]}!`);

        require(`./util/thumbnailManagementCycle`)().then(async () => {
            console.log(`Completed thumbnail management!`)
            while(true) {
                await new Promise(r => setTimeout(r, 60000));
                await require(`./util/thumbnailManagementCycle`)()
                console.log(`Completed thumbnail management!`)
            }
        })
    })
})