module.exports = () => new Promise((res, rej) => {
    console.log(`Checking for updates...`)
    if(global.sendPings) {
        cp.exec(`git reset --hard`, (err, out, stderr) => {
            if(!err) {
                cp.exec(`git pull`, (err, out, stderr) => {
                    if(err) {
                        console.warn(`Unable to pull files!`, err); res()
                    } else if(!`${out}`.toLowerCase().includes(`already up to date`)) {
                        console.log(`Updates were made; successfully pulled files -- rebuilding node_modules!`);
                        cp.exec(`npm i`, (e, out, stderr) => {
                            if(!err) {
                                console.log(`Successfully rebuilt node_modules! Restarting...`);
                                process.exit(0);
                            } else {
                                console.error(`Error occurred while rebuilding node_modules: ${e ? e : `-- no output --`}`, e);
                            }
                        })
                    } else {
                        console.log(`Up to date!`)
                        res()
                    }
                })
            }
        })
    } else res(console.log(`Did not fetch updates -- sendPings is disabled`))
});