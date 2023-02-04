const fs = require('fs')

module.exports = (files) => {
    try {
        if(files.startsWith(`.`)) files = __dirname.split(`/`).slice(0, -1).join(`/`) + `/` + files.slice(1)
        if(files.startsWith(`files`)) files = __dirname.split(`/`).slice(0, -1).join(`/`) + `/` + files.replace(`files`, ``);
        if(fs.existsSync(`./files/${files}`)) files = __dirname.split(`/`).slice(0, -1).join(`/`) + `/files/` + files;
    
        let prefix = ``;
    
        if(!files.endsWith(`.png`) && !files.endsWith(`.jpg`)) {
            const probe = JSON.parse(require('child_process').spawnSync(`ffprobe`, [`-loglevel`, `0`, `-print_format`, `json`, `-show_format`, `-show_streams`, files]).stdout.toString());
    
            if(!probe || !probe.format || !probe.format.format_name) {
                const str = `NO PROBE FOR ${files}`
                console.log(`${`-`.repeat(str.length + 2)}\n ${str} \n${`-`.repeat(str.length + 2)}`);
                prefix = `${files.split(`.`).slice(-1)[0]}-`
            } else if(!probe.format.format_name.toLowerCase().includes(`image`)) {
                if(probe.streams.filter(o => o.codec_type !== `audio`).length > 0) probe.streams = probe.streams.filter(o => o.codec_type !== `audio`)

                const type = probe.streams.map(o => o.codec_type || `unk`).join(`-`);
                const name = probe.streams.map(o => o.codec_name || `unk`).join(`-`);
    
                prefix = `${type}-`
                
                //console.log(`Probed ${files} -- returned ${type} / ${name}. Prefixing ${files} with "${prefix}"`, probe.format);
            } else console.log(`Probed ${files} -- still image, ffprobe returned ${probe.format.format_name}`)
        }
    
        const rawName = files.split(`/`).slice(files.split(`/`).indexOf(`files`)+1).join(`/`)
        const cacheName = prefix + Buffer.from(rawName).toString(`base64url`) + `.png`;

        //console.log(`returning ${cacheName}`)
    
        //console.log(`base64 of ${rawName} - ${cacheName}`)
        return cacheName
    } catch(e) {
        console.error(e)
    }
}