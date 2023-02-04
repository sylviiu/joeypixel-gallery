const yearColumn = document.getElementById(`yearColumn`);
const yearButton = document.getElementById(`selectedYear`).cloneNode(true);

const monthColumn = document.getElementById(`monthColumn`);
const monthButton = document.getElementById(`selectedMonth`).cloneNode(true);

const imageColumn = document.getElementById(`imageColumn`).cloneNode(true);
const img = document.getElementById(`img`).cloneNode(true);
while (document.getElementById(`imagesRow`).firstChild) { document.getElementById(`imagesRow`).removeChild(document.getElementById(`imagesRow`).firstChild) }
const imagesRow = document.getElementById(`imagesRow`).cloneNode(true);
while (document.getElementById(`imagesColumn`).firstChild) { document.getElementById(`imagesColumn`).removeChild(document.getElementById(`imagesColumn`).firstChild) }
const imagesColumn = document.getElementById(`imagesColumn`);