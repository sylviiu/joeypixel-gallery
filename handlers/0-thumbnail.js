const fs = require('fs');
const jimp = require('jimp');
const sharp = require('sharp');
const cp = require('child_process');

let font;

const makeImage = ({ dir, width, height, getBuffer, mediaType, fileName }) => new Promise(async resolve => {
    const start = Date.now();

    if(!width) width = 432;
    if(!height) height = 243;
    if(getBuffer === undefined) getBuffer = true;

    console.log(`Setting size ${width}x${height}; dir: ${dir}; buffer: ${getBuffer}`);

    const generators = {
        sharpRun: () => new Promise(async (res2, rej) => {
            sharp(dir).resize({
                width,
                height,
                inside: true,
            }).toBuffer().then(res2).catch(rej)
        }),
        jimpFallback: async ({bufOverride, renderBuffer}) => new Promise(async (res2, rej) => {
            if(bufOverride) console.log(`[jimp] bufOverride was provided!`)
            if(typeof renderBuffer != `boolean`) renderBuffer = getBuffer
            try {
                const img = await jimp.read(bufOverride || dir);
                
                img.cover(width, height);
    
                if(renderBuffer) {
                    img.getBuffer(jimp.MIME_PNG, (e, buf) => {
                        if(e) {
                            rej(e)
                        } else {
                            res2(buf)
                        }
                    })
                } else return res2(img)
            } catch(e) {
                rej(e)
            }
        }),
        ffmpegVideoFallback: () => new Promise(async (res2, rej) => {
            // -i inputfile.mkv -vf "select=eq(n\,0)" -q:v 3 output_image.jpg
            const ff = cp.spawn(`ffmpeg`, [
                `-i`, dir,
                `-ss`, `00:00:3`,
                `-s`, `${width}x${height}`,
                `-vframes`, `1`,
                `-c:v`, `png`,
                `-f`, `image2pipe`,
                `-`,
            ]);
    
            let buf = null;
    
            ff.stdout.on(`data`, d => {
                if(!buf) {
                    buf = d
                } else {
                    buf = Buffer.concat([buf, d])
                }
                console.log(`Got ${d.length} size buffer, total: ${buf.length}`)
            });
    
            ff.on(`error`, (e) => {
                console.warn(`Failed to run FF: ${e}`);
                rej(e)
            })
            
            ff.on(`close`, (sig) => {
                console.log(`FF Closed with sig ${sig}`);
                if(getBuffer) {
                    res2(buf)
                } else {
                    jimpFallback(buf).then(res2).catch(rej)
                }
            });
        })
    }

    let img;

    for (gen of Object.entries(generators)) {
        console.log(`-- Attempting generator ${gen[0]}`);
        if(!img) img = await new Promise(r => {
            gen[1]({ 
                renderBuffer: true
            }).then(buf => {
                if(buf && buf.length && buf.length > 0) {
                    r(buf)
                } else r(null)
            }).catch(e => {
                console.warn(`-- [!] Failed to use generator ${gen[0]}: ${e}.`);
                r(null)
            })
        })
    };

    if(!img) {
        console.log(`Image buffer was not successfully created; creating blank canvas`);

        img = await new Promise(r => new jimp(width*2, height*2, `#575757`, (e, i) => {
            if(e) {
                console.error(e);
                r(null)
            } else if(i) {
                let txt = fileName || mediaType || dir ? dir.split(`/`).slice(-1) : null || `{ unknown file }`;

                if(txt.length > 64) txt = txt.slice(0, 60) + `...`
                
                i.print(font, 20, (height*2)-64, txt);

                i.resize(width, height);

                i.getBuffer(jimp.MIME_PNG, (e, buf) => {
                    if(e) {
                        console.error(e);
                        r(null)
                    } else {
                        r(buf)
                    }
                })
            } else r(null)
        }));

        if(!img) {
            console.warn(`Even after trying to create a canvas, there was STILL an error. Resolving with null`);
            return resolve(null);
        }
    } else console.log(`Image buffer was successfully created!`);

    const res = async (buf) => {
        if(getBuffer) {
            resolve(buf || img)
        } else {
            const jimpObj = await generators.jimpFallback({ renderBuffer: false, bufOverride: buf || img })
            resolve(jimpObj)
        }
    }

    if(mediaType) {
        let jimpObj = await generators.jimpFallback({ renderBuffer: false, bufOverride: img });

        let lowestRes = width > height ? height : width;

        let iconOverlay = null;

        if(mediaType == `video` || mediaType == `audio`) {
            iconOverlay = await jimp.read(dir.split(`/files`)[0] + `/icons/media.png`);
        } else {
            iconOverlay = await jimp.read(dir.split(`/files`)[0] + `/icons/file.png`);
        };

        if(iconOverlay) {
            const size = lowestRes/3

            iconOverlay.resize(size, size);
            iconOverlay.brightness(1);

            jimpObj.contrast(-.1);
            jimpObj.brightness(-.3);

            jimpObj.composite(iconOverlay, (width/2) - (size/2), (height/2) - (size/2));

            jimpObj.getBuffer(jimp.MIME_PNG, (e, buf) => {
                if(e) {
                    res();
                    console.warn(`Failed to get buffer of media file with icon overlay!`, e)
                } else {
                    res(buf)
                }
            })
        } else res()
    } else res()
})

const makeCollage = (...files) => new Promise(async res => {
    const start = Date.now();

    console.log(`makeCollage called with ${files.length} files`);

    if(files.length > 4) files = files.slice(0, 4);
    if(files.length == 3) files = files.slice(0, 2);
    if(files.length != 1 && files.length != 2 && files.length != 4) files = files.slice(0, 1)

    console.log(`Making collage with ${files.length} files`);

    if(files.length === 1) {
        return makeImage({ dir: files[0], getBuffer: true, }).then(res)
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
        if(!font) font = await jimp.loadFont(`./fonts/KlokanTechNotoSans/noto.fnt`)
        if(req.params.path) {
            let files = await new Promise(async resp => require(`./9-main`).func(req, Object.assign({}, res, {
                send: resp,
                sendFile: resp,
            })));

            console.log(files)

            const args = req.params.path.split(`/`);

            if(args[0] && args[1] && files[args[0]] && files[args[0]][args[1]]) files = __dirname.split(`/`).slice(0, -1).join(`/`) + `/files/` + files[args[0]][args[1]].location
            
            const fileName = require('../util/getCacheName')(files)

            const sendImg = async (dir) => new Promise(async resp => {
                const m = await makeImage({ dir, getBuffer: true, mediaType: fileName.includes(`-`) ? fileName.split(`-`).slice(0, -1).join(`-`) : null });

                if(m) {
                    res.set(`Content-Type`, `image/png`);
                    res.set(`Content-Length`, `${m.length}`);
    
                    res.send(m);
                    resp(m)
                } else {
                    res.send(null);
                    resp(null)
                }
            });

            if((files && fs.existsSync(files))) {
                if(!fs.existsSync(`./cache/${fileName}`)) {
                    sendImg(files).then(i => {
                        if(i) {
                            if(!fs.existsSync(`./cache/`)) fs.mkdirSync(`./cache`);
    
                            fs.writeFile(`./cache/${fileName}`, i, () => {
                                console.log(`Cached file ${files} as ${fileName}`)
                            })
                        }
                    })
                } else res.sendFile(__dirname.split(`/`).slice(0, -1).join(`/`) + `/cache/` + fileName)
            } else {
                if(typeof files.length !== `number`) files = Object.assign([], ...Object.values(files))
    
                console.log(`Thumbnail requested -- ${req.originalUrl} // typeof files response: ${typeof files} (length: ${files.length ? files.length : `--`})`);
        
                if(typeof files.length == `number` && files.length > 0) {
                    require(`../util/randomize`)(files); 
                    files = files.slice(0, 4)
                }
    
                console.log(files);

                makeCollage(...files.map(f => __dirname.split(`/`).slice(0, -1).join(`/`) + `/files/` + f.location)).then(i => {
                    res.set(`Content-Type`, `image/png`);
                    res.set(`Content-Length`, `${i.length}`);
    
                    res.send(i)
                })
            }
        } else return res.redirect(`https://i.nyx.bot/null.png`)
    }
}