const fs = require('fs')

const create = (path) => new Promise(res => require(`../handlers/0-thumbnail`).func({
    params: {
        path
    },
    originalUrl: `[CREATETHUMBNAILS] / ${path}`
}, {
    set: () => {},
    redirect: () => res(),
    sendFile: () => res(),
    send: () => res(),
}));

module.exports = () => new Promise(async res => {
    const files = await new Promise(async res => require(`../handlers/8-getYears`).func({
        params: {
            path: `/`
        },
        originalUrl: `[thumbnail management cycle] / root dir`
    }, {
        set: () => {},
        redirect: res,
        sendFile: res,
        send: res,
    }));

    let thumbnails = []; Object.assign([], ...Object.values(files).map(o => Object.values(o))).forEach(o => thumbnails.push(...o))
    
    const thumbnailsToDelete = fs.readdirSync(`./cache/`).filter(f => thumbnails.filter(o => o.cachedImage.exists).find(o => o.cachedImage.exists === false));

    console.log(thumbnails.length + ` total thumbnails exist! deleting ${thumbnailsToDelete.length} that are not in this list...`);

    for(f of thumbnailsToDelete) {
        console.log(`${f} is not in the list.`);
        await new Promise(r => fs.unlink(`./cache/${f}`, r));
        console.log(`Removed ${f}`)
    };

    const toCache = thumbnails.filter(o => o.cachedImage.exists === false)

    for(i in toCache) {
        let f = toCache[i];
        await new Promise(async res => {
            console.log(`Creating thumbnail of ${f.location}`)
    
            let start = Date.now()
            await create(`${f.year}/${f.month}/${f.location}`);

            console.log(`Completed ${f.location} -- ${toCache.length - i} remaining!`)
            
            if(/*Date.now() - start > 200*/ false) {
                console.log(`It took more than 200ms to complete this image! (${Date.now() - start}ms) -- waiting for next one to keep cpu cycles clean`);
                await new Promise(r => setTimeout(res, 1000))
            } else {
                console.log(`It took only ${Date.now() - start}ms to complete this one; chances are it was cached! Starting next...`);
                res()
            }
        })
    };

    res()
})