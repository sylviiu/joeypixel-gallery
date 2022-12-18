const app = require("express")();
app.use(require('cors')({
    origin: `http://127.0.0.1:8000`,
    optionsSuccessStatus: 200
}))
const fs = require('fs');

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

        console.log(`${f} / ${reqType} @ ${obj.path}`)
        app[reqType](obj.path, obj.func)
    } catch(e) {
        console.warn(`handler ${f} failed -- ${e}`)
    }
})

const server = app.listen(8080, async () => {
    console.log(`Server is online, listening @ port ${server._connectionKey.split(`:`).slice(-1)[0]}!`)
})