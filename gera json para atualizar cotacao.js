base = {
    "DADOS": [
        {
            "STATUS": "N�o cotada",
            "C8_ITEM": "0001",
            "C8_PRODUTO": "01011007       ",
            "C8_UM": "PC",
            "C8_FORNECE": "000705",
            "C8_FORNOME": "ABRASEG COMERCIO ATACADISTA E IMPORTACAO                                        ",
            "C8_LOJA": "01",
            "C8_VALIDA": "12/03/2025",
            "C8_QUANT": 11,
            "C8_PRECO": 0,
            "C8_TOTAL": 0,
            "C8_PRAZO": 0,
            "C8_VALIPI": 0,
            "C8_VALICM": 0,
            "C8_VALISS": 0,
            "C8_NUM": "000023",
            "C8_NUMPRO": "01",
            "C8_ICMSCOM": 0,
            "C8_VALSOL": 0,
            "C8_COND": "   ",
            "C8_TPFRETE": " ",
            "C8_TOTFRE": 0,
            "C8_DESPESA": 0,
            "C8_SEGURO": 0,
            "C8_VLDESC": 0,
            "C8_QTDISP": 0,
            "C8_TES": "   "
        }]
};


base.DADOS.reduce((acc, elem) => {
    if (acc.filter(accElem => accElem.C8_PRODUTO.trim() == elem.C8_PRODUTO.trim()).lenght == 0) {
        acc.push({
            "C8_PRECO": "" + parseFloat(1 + Math.random()).toFixed(6),
            "C8_PRODUTO": "" + elem.C8_PRODUTO,
            "C8_QTDISP": "" + elem.C8_QUANT,
            "C8_TES": "001",
            "C8_PRAZO": "1"
        })
    }

    return acc
}, [])
function transformaPAtualizaCot(base, empresa, cotacao, quantidadeFornecedores = null) {
    let itens = []
    let fornecedorCount = 0
    let codFornecedor = base.DADOS[0].C8_FORNECE + "" + base.DADOS[0].C8_LOJA;
    return base.DADOS.reduce((acc, elem) => {
        let letForn = elem.C8_FORNECE + "" + elem.C8_LOJA;


        if (quantidadeFornecedores && quantidadeFornecedores == fornecedorCount)
            return acc;
        if (letForn != codFornecedor) {
            itemCotForn = {
                "ITEM": [],
                "C8_FORNECE": "" + codFornecedor,
                "C8_TPFRETE": "F",
                "C8_DESPESA": "0.00",
                "C8_COND": "010",
                "C8_TOTFRE": "10.00",
                "C8_VLDESC": "0.00",
                "C8_SEGURO": "0.00"
            };
            itemCotForn.ITEM = itens
            acc.COTACAO[0].FORNECE.push(itemCotForn);

            itens = []
            codFornecedor = letForn
            fornecedorCount++
        }
        itensFiltered = itens.filter(accElem => accElem.C8_PRODUTO.trim() == elem.C8_PRODUTO.trim())

        if (itensFiltered.length == 0) {
            itens.push({
                "C8_PRECO": "" + parseFloat(1 + Math.random()).toFixed(6),
                "C8_PRODUTO": "" + elem.C8_PRODUTO.trim(),
                "C8_QTDISP": "" + elem.C8_QUANT,
                "C8_TES": "001",
                "C8_PRAZO": "1"
            })
        }

        return acc
    }, {
        "COTACAO": [
            {
                "C8_NUMERO": "" + cotacao,
                "EMPRESA": "" + empresa,
                "FORNECE": []
            }]
    })
}











base.DADOS.reduce((acc, elem) => {
    acc.COTACAO[0].FORNECE
        .filter((elForn) => {
            return elForn.C8_FORNECE == (elem.C8_FORNECE + "" + elem.C8_LOJA)
        })

    return acc;

}, {
    "COTACAO": [
        {
            "C8_NUMERO": "000064",
            "EMPRESA": "00100289",
            "FORNECE": [
                {
                    "ITEM": [
                        {
                            "C8_PRECO": "10.00",
                            "C8_PRODUTO": "010000020003",
                            "C8_QTDISP": "11.00",
                            "C8_TES": "001",
                            "C8_PRAZO": "0"
                        }
                    ],
                    "C8_FORNECE": "00048101",
                    "C8_TPFRETE": "C",
                    "C8_DESPESA": "0.00",
                    "C8_COND": "010",
                    "C8_TOTFRE": "10.00",
                    "C8_VLDESC": "0.00",
                    "C8_SEGURO": "0.00"
                }
            ]
        }]
})