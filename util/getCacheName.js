const fs = require('fs')

module.exports = (files) => {
    if(files.startsWith(`.`)) files = __dirname.split(`/`).slice(0, -1).join(`/`) + `/` + files.slice(1)
    if(files.startsWith(`files`)) files = __dirname.split(`/`).slice(0, -1).join(`/`) + `/` + files.replace(`files`, ``);
    if(fs.existsSync(`./files/${files}`)) files = __dirname.split(`/`).slice(0, -1).join(`/`) + `/files/` + files

    const rawName = files.split(`/`).slice(files.split(`/`).indexOf(`files`)+1).join(`/`)
    const cacheName = Buffer.from(rawName).toString(`base64url`) + `.png`

    //console.log(`base64 of ${rawName} - ${cacheName}`)
    return cacheName
}