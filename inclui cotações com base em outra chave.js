/**
 * Snippets para regularizar orçamentos enviados pelo portal, quando duas filiais participam ao mesmo tempo, 
 * e o orçamento é salvo somente no registro de um fornecedor
 * 
 * @uso abrir a ficha de cotaçaõ no processo de cotação, editar, e executar as linhas a seguir
 */
/**
 * var fornecodores={
 * 'codigoLoja':[
 * {
 * linha:1
 * loja:1
 * produto:1
 * preco:1
 * quantidade:1
 * prazo:1
 * }]}
 */
var fornecedores = {}
$("input[id^='C8_FORNECE'][value='008674']").each((idx, elem) => {
    let linha = elem.id.split("___")[1]
    let loja = $("#C8_LOJA___" + linha).val()

    let chave = elem.value + "" + loja
    if (fornecedores[chave + ""] == undefined) {
        fornecedores[chave + ""] = []
    }

    fornecedores[chave + ""].push(
        {
            linha: linha,
            loja: loja,
            fornecedor: elem.value,
            produto: $("#C8_PRODUTO___" + linha).val(),
            preco: $("#C8_PRECO___" + linha).val(),
            quantidade: $("#C8_QUANT___" + linha).val(),
            prazo: $("#C8_PRAZO___" + linha).val(),
        }
    )
})

fornecedores["00867403"].forEach(element => {
    let index = fornecedores["00867402"].filter((value, index) => {
        return value.produto === element.produto
    })
    if (index.length > 0) {
        let linha = element.linha;
        item = index[0]
        $("#C8_PRECO___" + linha).val(item.preco)
        $("#C8_QUANT___" + linha).val(item.quantidade)
        $("#C8_PRAZO___" + linha).val(item.prazo)
    }
});

843284