const refreshStuff = () => makeRequest(`${conf.req.http}://${conf.req.location}${conf.req.port ? `:${conf.req.port}` : ``}${window.location.pathname}`).then(async res => {
    console.log(res)
});

refreshHeaderBar()