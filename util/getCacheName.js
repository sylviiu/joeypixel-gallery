const fs = require('fs')

module.exports = (files) => {
    if(files.startsWith(`.`)) files = __dirname.split(`/`).slice(0, -1).join(`/`) + `/` + files.slice(1)
    if(files.startsWith(`files`)) files = __dirname.split(`/`).slice(0, -1).join(`/`) + `/` + files.replace(`files`, ``);
    if(fs.existsSync(`./files/${files}`)) files = __dirname.split(`/`).slice(0, -1).join(`/`) + `/files/` + files

    const cacheName = Buffer.from(files.split(``).reverse().join(``)).toString(`base64`).substring(0, 20) + `.png`

    //console.log(`base64 of ${files} - ${cacheName}`)
    return cacheName
}