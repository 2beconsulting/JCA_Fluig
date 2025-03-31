teste = {
    "E2Num": "ZZZ005",
    "E2Fornece": "100016",
    "E2Loja": "01",
    "E2Emissao": "19/03/2025",
    "E2VENCTO": "25/03/2025",
    "E2Valor": "1000,50",
    "MultNaturezas": [
        {
            "EVNaturez": "1010",
            "EVValor": "3300,00",
            "CentroDeCusto": [
                {
                    "EZCCusto": "11000006FC001",
                    "EZValor": "2000,00"
                },
                {
                    "EZCCusto": "11000006FC002",
                    "EZValor": "1000,00"
                },
                {
                    "EZCCusto": "11000006FC002",
                    "EZValor": "300,00"
                }
            ]
        },
        {
            "EVNaturez": "1011",
            "EVValor": "400,20",
            "CentroDeCusto": [
                {
                    "EZCCusto": "11000006FC003",
                    "EZValor": "400,20"
                }
            ]
        }
    ]
}


exemploJson = {
    "E2Num": "ZZZ005",
    "E2Fornece": "100016",
    "E2Loja": "01",
    "E2Emissao": "19/03/2025",
    "E2VENCTO": "25/03/2025",
    "E2Valor": "1000,50",
    "MultNaturezas": []
}

dadosCentroDeCustos = []

tempNatureza = "";
totalNatureza = 0
objNatureza = {
    "EVNaturez": 0,
    "EVValor": 0,
    "CentroDeCusto": []
}

idxTabelaCentros = hAPI.getChildrenIndexes("tabCentros")
for (var index = 0; index < idxTabelaCentros.length; index++) {
    const idLinha = idxTabelaCentros[index];
    centroDeCusto = hAPI.getCardValue("centroCusto___" + idLinha)
    /**
     * ...
     */
}

dadosCentroDeCustos.forEach(function (elemento) {
    if (tempNatureza != elemento.natureza) {
        if (tempNatureza != "") {
            objNatureza["EVValor"] = totalNatureza
            objNatureza["EVNaturez"] = tempNatureza
            exemploJson['MultNaturezas'].push(objNatureza)
        }

        totalNatureza = 0
        tempNatureza = elemento.natureza
    }
    objNatureza["CentroDeCusto"].push({
        "EZCCusto": "" + elemento.codigoCentro,
        "EZValor": "" + elemento.valorCentro
    })
    totalNatureza += elemento.valorCentro
})
if (tempNatureza != "") {
    objNatureza["EVValor"] = totalNatureza
    objNatureza["EVNaturez"] = tempNatureza
    exemploJson['MultNaturezas'].push(objNatureza)
}
