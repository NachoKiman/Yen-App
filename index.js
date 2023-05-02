let cotizacionPesoDolar = 1;
let cotizacionPesoDolarMep = 1;
let cotizacionDolarYen = 1;

function updateCotizacionDolar() {
    return $.getJSON('https://mercados.ambito.com//dolarturista/variacion').then(data => {
        cotizacionPesoDolar = parseFloat(data.venta.replace(',', '.'));
    });
}

function updateCotizacionDolarMep() {
    return $.getJSON('https://mercados.ambito.com///dolarrava/mep/variacion').then(data => {
        cotizacionPesoDolarMep = parseFloat(data.venta.replace(',', '.'));
    });
}

function updateCotizacionYen() {
    return $.ajax({
        url: 'https://www.eleconomista.es/cruce/USDJPY'
    }).then(page => {
        const parser = new DOMParser();

        // parse the HTML string into a Document object
        const htmlDocument = parser.parseFromString(page, 'text/html');

        // get the span element with the "last-value" class
        const lastValueSpan = htmlDocument.querySelector('span.last-value');

        // get the text content of the span element
        const lastValueString = lastValueSpan.textContent;

        // use a regular expression to extract the number from the string
        const numberRegex = /[-+]?\d*[\.,]?\d+/g; // matches a number with optional sign, optional integer part, and optional fractional part with "." or ","
        const numberMatches = lastValueString.match(numberRegex);
        const numberString = numberMatches[0];

        cotizacionDolarYen = 1 / parseFloat(numberString.replace(',', '.'));
    })
}

function update() {
    Promise.all([updateCotizacionDolar(), updateCotizacionDolarMep(), updateCotizacionYen()]).then(() => {
        $('#actualizacion').val(new Date().toLocaleString('es'));
        $('#pesoDolar').val(toString(cotizacionPesoDolar, 5));
        $('#pesoDolarMep').val(toString(cotizacionPesoDolarMep, 5));
        $('#dolarYen').val(toString(cotizacionDolarYen, 5));
        $('#yen').trigger('input');
    });
}

function fromYen(yenValue) {

    return {
        dolar: yenValue * cotizacionDolarYen,
        peso: yenValue * cotizacionDolarYen * cotizacionPesoDolar,
        pesoMep: yenValue * cotizacionDolarYen * cotizacionPesoDolarMep
    };

}

function fromDolar(dolarValue) {

    return {
        yen: dolarValue / cotizacionDolarYen,
        peso: dolarValue * cotizacionPesoDolar,
        pesoMep: dolarValue * cotizacionPesoDolarMep
    };
}

function toString(num, decimal = 2) {
    const tenPow = Math.pow(10, decimal);
    return Math.round(num * tenPow) / tenPow;
}

function round(num, decimal = 2) {
    return num.toPrecision(decimal);
}

function toNumber(numberString) {
    return parseFloat(numberString.replaceAll(',', ''));
}

$('#yen').on('input', e => {
    e.stopPropagation();
    const { dolar, peso, pesoMep } = fromYen(toNumber($('#yen').val()));
    $('#dolar').val(toString(dolar, 3) || 0);
    $('#peso').val(toString(peso) || 0);
    $('#pesoMep').val(toString(pesoMep) || 0);
});

$('#dolar').on('input', e => {
    e.stopPropagation();
    const { yen, peso, pesoMep } = fromDolar(toNumber($('#dolar').val()));
    $('#yen').val(toString(yen) || 0);
    $('#peso').val(toString(peso) || 0);
    $('#pesoMep').val(toString(pesoMep) || 0);
});

Inputmask("decimal", {
    alias: 'currency',
    radixPoint: '.',
    groupSeparator: ',',
    inputtype: "text",
    unmaskAsNumber: true
}).mask("input.num");

update();