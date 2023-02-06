# joeypixel-gallery
this is just the source code to the service running joey's photo gallery website thingy

----

### to run

just make a `files` directory and upload your vrchat screenshots to there. this api will organize them without touching your files!

to run the api, install dependencies through `npm i` and run the server via `node index.js production`

> sidenote: adding "production" to the command lets the api automatically check for updates and updates the server when there are updates! this is especially useful if you want to just leave the server running without any intervention. THIS WILL ONLY WORK IF YOU CLONED THE REPOSITORY THROUGH THE COMMANDLINE VIA `git clone https://github.com/sylviiu/joeypixel-gallery` (or the ssh equivalent).

----

### configuration

there is a singular config.json file for configuration, and it only includes one key: `fileMode` -- if this is enabled, this server will act as a file host, and the year / month buttons will be read out as the first and second folder respectively. if this is disabled, the server will go off of parsed dates from filenames.