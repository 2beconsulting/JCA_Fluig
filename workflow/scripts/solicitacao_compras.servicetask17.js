function servicetask17(attempt, message) { // SOLICITAÇÃO DE COMPRAS
    log.info('servicetask17 solicitacao de compras')
    var EMPRESA = hAPI.getCardValue('idEmpresa')
    var SOLICITANTE = hAPI.getCardValue('nome')
    var TIPOSC = hAPI.getCardValue('tipoSc');
    var idCentroCusto = hAPI.getCardValue('idCentroCusto');
    var WKNumProces = getValue("WKNumProces");
    var C1_ZPRECAR = hAPI.getCardValue("C1_ZPRECAR")
    var campos = {
        "COMPRAS": [
            {
                "EMPRESA": EMPRESA,
                "FILENT": hAPI.getCardValue("idEmpresaEntrega"),
                "SOLICITANTE": SOLICITANTE,
                "TIPOSC": TIPOSC,
                "ITEMSC": []
            }
        ]
    }
    var tableProduto = tools.getTableFilho(
        hAPI.getCardData(getValue("WKNumProces")),
        ["codigoProduto", "produto_qtd"]
    );
    for (var j = 0; j < tableProduto.length; j++) {
        var linha = tableProduto[j];
        var codigoProduto = String(linha.codigoProduto.value)
        var produto_qtd = String(linha.produto_qtd.value)
        campos['COMPRAS'][0]['ITEMSC'].push(
            {
                "C1_PRODUTO": codigoProduto,
                "C1_QUANT": produto_qtd,
                "C1_CC": "" + idCentroCusto,
                "C1_ZPRECAR": C1_ZPRECAR
            }
        )
    }
    try {
        var constraints = [
            DatasetFactory.createConstraint("tipo", "incluir", "", ConstraintType.MUST),
            DatasetFactory.createConstraint("operacao", "solicitacao", "", ConstraintType.MUST),
            DatasetFactory.createConstraint("campos", JSONUtil.toJSON(campos), "", ConstraintType.MUST),
            DatasetFactory.createConstraint("empresa", EMPRESA, "", ConstraintType.MUST)
        ]
        //log.dir(constraints)
        var ds_compras_protheus = DatasetFactory.getDataset("ds_compras_protheus", null, constraints, null)
        //log.dir(ds_compras_protheus)
        if (ds_compras_protheus.rowsCount > 0) {
            var errorCode = ds_compras_protheus.getValue(0, 'errorCode')
            log.info('errorCode: ' + errorCode)
            var errorMessage = ds_compras_protheus.getValue(0, 'errorMessage')
            log.info('errorMessage: ' + errorMessage)
            if (errorCode != undefined) throw "errorCode: " + errorCode + ", errorMessage: " + errorMessage + ", constraints: " + constraints
            var numeroSC = String(ds_compras_protheus.getValue(0, 'numero da sc'))
            log.info('numeroSC: ' + numeroSC)
            hAPI.setCardValue('idSc', numeroSC)
            hAPI.setCardValue('numeroSC', numeroSC)
            hAPI.setCardValue('solicitanteSC', SOLICITANTE)
            hAPI.setCardValue('emissaoSC', tools.outros.getDataAtual())

            var SC = tools.carregaTabSC();

            if (!SC.ok) throw SC.error
        }
    } catch (error) {
        throw error
    }
}
