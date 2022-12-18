const fs = require('fs');
const jimp = require('jimp-native');

const makeImage = ({ dir, width, height, getBuffer }) => new Promise(async res => {
    const start = Date.now();

    if(!width) width = 256;
    if(!height) height = 256;
    if(getBuffer === undefined) getBuffer = true;

    console.log(`Setting size ${width}x${height}`)

    const img = await jimp.read(dir);

    img.cover(width, height);

    if(getBuffer) {
        img.getBuffer(jimp.MIME_PNG, (err, buffer) => {
            if(err) {
                console.error(err);
                res(null)
            } else {
                console.log(`Took ${Date.now() - start}ms to complete file ${dir}!`)
                res(buffer)
            }
        })
    } else return res(img)
})

const makeCollage = (...files) => new Promise(async res => {
    const start = Date.now();

    console.log(`makeCollage called with ${files.length} files`);

    if(files.length > 4) files = files.slice(0, 4);
    if(files.length == 3) files = files.slice(0, 2);
    if(files.length != 1 && files.length != 2 && files.length != 4) files = files.slice(0, 1)

    console.log(`Making collage with ${files.length} files`);

    if(files.length === 1) {
        return makeImage({ dir: files[0] }).then(res)
    } else if(files.length === 2) {
        const imgs = await Promise.all(files.map(f => makeImage({ dir: f, width: 128, height: 256, getBuffer: false })));

        new jimp(256, 256, (err, canvas) => {
            if(err) {
                return res.redirect(`https://i.nyx.bot/null.png`);
            } else {
                canvas.composite( imgs[0], 0, 0 )
                canvas.composite( imgs[1], 128, 0 )
        
                canvas.getBuffer(jimp.MIME_PNG, (err, buffer) => {
                    if(err) {
                        console.error(err);
                        res(null)
                    } else {
                        console.log(`Took ${Date.now() - start}ms to complete the 2 panel collage!`)
                        res(buffer)
                    }
                })
            }
        })
    } else if(files.length === 4) {
        let funcs = files.map(f => {
            return { 
                dir: f, 
                width: 128, 
                height: 128, 
                getBuffer: false ,
            }
        }); //funcs.unshift(Object.assign({}, funcs[0], { width: 256, height: 256 }))

        const imgs = await Promise.all(funcs.map(f => makeImage(f)));

        new jimp(256, 256, (err, canvas) => {
            if(err) {
                return res.redirect(`https://i.nyx.bot/null.png`);
            } else {
                canvas.composite( imgs[0], 0, 0 )
                canvas.composite( imgs[1], 128, 0 )
                canvas.composite( imgs[2], 0, 128 )
                canvas.composite( imgs[3], 128, 128 )
        
                canvas.getBuffer(jimp.MIME_PNG, (err, buffer) => {
                    if(err) {
                        console.error(err);
                        res(null)
                    } else {
                        console.log(`Took ${Date.now() - start}ms to complete the 4 panel collage!`)
                        res(buffer)
                    }
                })
            }
        })
    }
})

module.exports = {
    path: `/thumbnail/:path(*+)`,
    func: async (req, res) => {
        if(req.params.path) {
            if(req.params.path.endsWith(`/`)) req.params.path = req.params.path.slice(0, -1)
            if(req.params.path.startsWith(`/`)) req.params.path = req.params.path.slice(1)

            console.log(`Thumbnail requested -- ${req.originalUrl}`);
    
            const start = Date.now();
    
            const dir = `${__dirname.split(`/`).slice(0, -1).join(`/`)}/files/${req.params.path}`
    
            console.log(`Checking for dir ${dir}`)

            if(fs.existsSync(dir + `/`)) {
                const dir2 = fs.readdirSync(dir + `/`).filter(f => !fs.existsSync(dir + `/` + f + `/`) && fs.existsSync(dir + `/` + f));
                console.log(`${dir2.length} file(s) in ${dir}`)

                if(dir2.length === 0) {
                    return res.redirect(`https://i.nyx.bot/null.png`)
                } else {
                    const send = require(`../util/randomize`)(dir2.map(f => dir + `/` + f))
                    const buffer = await makeCollage(...send)
                    console.log(`Received buffer! (${Buffer.byteLength(buffer)*1e-6}mb)`)
                    res.set(`Content-Type`, `image/png`).set(`Content-Length`, buffer.length).send(buffer)
                }
            } else if(fs.existsSync(dir)) {
                let params = {  dir, };
                if(req.query.tiny) params.width = 64; params.height = 64

                const buffer = await makeImage(params)
                console.log(`Received buffer! (${Buffer.byteLength(buffer)*1e-6}mb)`)
                res.set(`Content-Type`, `image/png`).set(`Content-Length`, buffer.length).send(buffer)
            } else res.redirect(`https://i.nyx.bot/null.png`)
        } else return res.redirect(`https://i.nyx.bot/null.png`)
    }
}