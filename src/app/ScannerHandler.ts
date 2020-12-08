document.addEventListener('keypress', keypressHandler);

function keypressHandler(e)
{
    const keypressoutput = document.getElementById('pressed_keys');
    if (e.keyCode == 13)    //  Enter key from DataWedge
        keypressoutput.innerHTML += "<BR>";
    else
        keypressoutput.innerHTML += e.key;
}
