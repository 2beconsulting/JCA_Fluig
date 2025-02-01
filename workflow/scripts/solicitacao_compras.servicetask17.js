function servicetask17(attempt, message) { // SOLICITAÇÃO DE COMPRAS
    log.info('servicetask17 solicitacao de compras')
    var EMPRESA = hAPI.getCardValue('idEmpresa')
    var SOLICITANTE = hAPI.getCardValue('nome')
    var TIPOSC = hAPI.getCardValue('tipoSc')
    var campos = {
        "COMPRAS": [
            {
                "EMPRESA"		: EMPRESA,
                "FILENT"		: hAPI.getCardValue("idEmpresaEntrega"),
                "SOLICITANTE"	: SOLICITANTE,
                "TIPOSC": TIPOSC,
                "ITEMSC": []
            }
        ]
    }
    var tabelaProduto = hAPI.getChildrenIndexes("tabelaProduto")
    for(var j = 0; j < tabelaProduto.length; j++){
        var codigoProduto = String(hAPI.getCardValue('codigoProduto___' + tabelaProduto[j]))
        var produto_qtd = String(hAPI.getCardValue('produto_qtd___' + tabelaProduto[j]))
        campos['COMPRAS'][0]['ITEMSC'].push(
            {
            	"C1_PRODUTO"	: codigoProduto,
            	"C1_QUANT"		: produto_qtd,
            	"C1_CC"			: hAPI.getCardValue("idCentroCusto"),
            	"C1_ZPRECAR"	: hAPI.getCardValue("C1_ZPRECAR")
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
        if(ds_compras_protheus.rowsCount > 0){
            var errorCode = ds_compras_protheus.getValue(0, 'errorCode')
            log.info('errorCode: '+errorCode)
            var errorMessage = ds_compras_protheus.getValue(0, 'errorMessage')
            log.info('errorMessage: '+errorMessage)
            if(errorCode != undefined) throw "errorCode: "+ errorCode + ", errorMessage: " + errorMessage + ", constraints: " + constraints
            var numeroSC = String(ds_compras_protheus.getValue(0, 'numero da sc'))
            log.info('numeroSC: '+numeroSC)
            hAPI.setCardValue('idSc', numeroSC)
            hAPI.setCardValue('numeroSC', numeroSC)
            hAPI.setCardValue('solicitanteSC', SOLICITANTE)
            hAPI.setCardValue('emissaoSC', tools.outros.getDataAtual())
            
            var SC = tools.carregaTabSC();
            
            if(!SC.ok) throw SC.error
        }
    }catch(error){
        throw error
    }
}
 