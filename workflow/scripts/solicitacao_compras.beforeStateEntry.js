function beforeStateEntry(sequenceId) {
    var WKNumState = getValue('WKNumState')

    if (WKNumState != 1) hAPI.setCardValue("atividadeAtual", String(sequenceId))
    if (WKNumState != 1) hAPI.setCardValue("atividadeAnterior", String(WKNumState))

    if (sequenceId == 2) {
        hAPI.setCardValue("decisaoAprovador", "")
        hAPI.setCardValue("descReprovAprov", "")
        hAPI.setCardValue("aprovacaoProblemaAprovador", "")
    }
    else if (sequenceId == 40) { // Aprovar valor menor orçado
        if (hAPI.getCardValue("decisaoAprovadorValorMenor") != "retornar") {
            hAPI.setCardValue("decisaoAprovadorValorMenor", "")
            hAPI.setCardValue("descReprovAprovValorMenor", "")
        }
    }
    else if (sequenceId == 121) { // Homologar Compra
        hAPI.setCardValue("decisaoAprovadorCotacao", "")
        hAPI.setCardValue("descReprovAprovCotacao", "")
    }
    else if (sequenceId == 4) tools.historico.setAprovacao()
    else if (sequenceId == 26) tools.cotacao.analise.limparCampos()
    else if (sequenceId == 35 && WKNumState == 28) {
        var cardData = hAPI.getCardData(getValue("WKNumProces"));
        tools.aprovacao.carregaValorMenor(cardData);
    }
    else if (sequenceId == 97) hAPI.setCardValue('dataInicioSolicitacaoCotacao', String(tools.outros.getDataAtual()))
    else if (sequenceId == 234) tools.intrack.atualizaCiclo()
    else if (sequenceId == 224) {//Liberar Pedido
        hAPI.setCardValue("decisaoLiberarPedido", "");
        hAPI.setCardValue("decisaoLiberarPedido_obs", "");
    }
}

function setCotacao() {
    var tabCiclos = hAPI.getChildrenIndexes("tabCiclos")
    var quantidadeCiclos = parseInt(tabCiclos.length)

    var numeroSolicitacaoCotacao = hAPI.getCardValue('numeroSolicitacaoCotacao')
    var dataInicioSolicitacaoCotacao = hAPI.getCardValue('dataInicioSolicitacaoCotacao')

    var childData = new java.util.HashMap()
    childData.put("cotacao_ciclo", String(quantidadeCiclos + 1))
    childData.put("cotacao_solicitacao", String(numeroSolicitacaoCotacao))
    childData.put("cotacao_inicio", String(dataInicioSolicitacaoCotacao))
    childData.put("cotacao_termino", String(tools.outros.getDataAtual()))
    hAPI.addCardChild("tabCiclos", childData)
}