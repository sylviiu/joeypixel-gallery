const render = (list) => {
    console.log(`render called, with list:`, list);

    const rows = [];

    let n = 0;

    for (file of list) {
        if(n % 4 === 0) rows.push(imagesRow.cloneNode(true))

        n++;

        const a = document.createElement(`a`);
        const i = img.cloneNode(true);

        a.style.cssText = i.style.cssText;
        i.style.width = `100%`;
        i.style[`margin-bottom`] = `0px`
        i.style[`margin-top`] = `0px`

        a.href = `${conf.req.http}://${conf.req.location}${conf.req.port ? `:${conf.req.port}` : ``}/${file.year}/${file.month}/${file.name}`;
        i.src = `${conf.req.http}://${conf.req.location}${conf.req.port ? `:${conf.req.port}` : ``}/thumbnail/${file.year}/${file.month}/${file.name}`;

        scaleImageAnim(a, file)

        a.appendChild(i)

        console.log(`set src as ${i.src}`)

        rows[rows.length-1].appendChild(a)
    };

    console.log(`appending ${rows.length} row(s) for ${list.length} image(s)`)

    //rows.forEach(row => imagesColumn.appendChild(row))

    imagesColumn.appendChild(rows[0])

    for (row of rows) {
        imagesColumn.appendChild(row)
    }
}

const parseRequest = async (r, selectedYear, selectedMonth) => {
    const years = Object.entries(r).map(o => {
        return {
            year: o[0],
            months: Object.keys(o[1])
        }
    })

    console.log(`years`, years);

    if(!r[selectedYear]) {
        console.log(`Selected year cannot be found! (selected: ${selectedYear}, but ${Object.keys(r).join(`, `)} is available!)`)
        selectedYear = null;
        selectedMonth = null;
    } else if(!r[selectedYear] || !r[selectedYear][selectedMonth]) {
        console.log(`Selected year cannot be found! (selected: ${selectedMonth})`)
        selectedMonth = null;
    }

    years.forEach(({year, months}, index) => {
        const yr = yearButton.cloneNode(true);
        const mn = monthButton.cloneNode(true);

        yr.innerHTML = `${year}`;

        yr.onclick = () => refreshHeaderBar(`${year}`)

        scaleAnim(yr)

        let monthButtons = [];

        if((!selectedYear && index === years.length-1) || (selectedYear === year)) {
            console.log(`Setting ${year} as selected year, because ${!selectedYear ? `of index ${index} & no selected year!` : `the selected year is set as ${selectedYear}!`}`);
            selectedYear = year;
            console.log(`Adding month buttons: ${months.join(`, `)}`);
            monthButtons = months.sort((a,b) => {
                a = Number(a), b = Number(b); return a > b ? -1 : a < b ? 1 : 0
            }).map((str, i) => {
                const m = mn.cloneNode(true);
                m.innerHTML = str;

                m.onclick = () => refreshHeaderBar(selectedYear, str)

                scaleAnim(m)

                if((!selectedMonth && i === 0) || (selectedMonth === str)) {
                    console.log(`Setting ${str} as selected month, because ${!selectedMonth ? `of index ${i} & no selected month!` : `the selected month is set as ${selectedMonth}!`}`);
                    selectedMonth = str;
                } else {
                    //console.log(`Removing color from month button ${str}`)
                    m.style.background = `rgba(0,0,0,0)`;
                };

                return m;
            }).reverse()
        } else {
            //console.log(`Removing color from year button ${year}`);
            yr.style.background = `rgba(0,0,0,0)`;
        };

        yearColumn.appendChild(yr);
        if(monthButtons.length > 0) monthButtons.forEach(o => monthColumn.appendChild(o))
    });

    render(r[selectedYear][selectedMonth])
}