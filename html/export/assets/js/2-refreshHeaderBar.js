let lastRequest = null;

const refreshHeaderBar = (selectedYear, selectedMonth) => new Promise(async res => {
    while (imagesColumn.firstChild) { imagesColumn.removeChild(imagesColumn.firstChild) }

    while (yearColumn.firstChild) { yearColumn.removeChild(yearColumn.firstChild) }
    while (monthColumn.firstChild) { monthColumn.removeChild(monthColumn.firstChild) }


    if(lastRequest) {
        parseRequest(lastRequest, selectedYear, selectedMonth)
    } else {
        makeRequest(`${conf.req.http}://${conf.req.location}${conf.req.port ? `:${conf.req.port}` : ``}/getYears`).then(r => {
            lastRequest = r;
            parseRequest(lastRequest, selectedYear, selectedMonth)
        })
    }
})