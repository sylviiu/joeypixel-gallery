const button = document.getElementById(`sidebarButton`).cloneNode(true);
const div = document.getElementById(`buttonsDiv`)

div.removeChild(document.getElementById(`sidebarButton`));

buttons.forEach(btn => {
    const thisBtn = button.cloneNode(true);

    console.log(`appending button`, btn)

    thisBtn.href = btn.url;
    thisBtn.innerHTML = btn.text;

    div.appendChild(thisBtn)
})