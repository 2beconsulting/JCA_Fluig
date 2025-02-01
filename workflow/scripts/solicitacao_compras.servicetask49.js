function servicetask49(attempt, message){
    // log.info('servicetask49 excluir solicitacao de compras')
    // var EMPRESA = hAPI.getCardValue('EMPRESA')
    // var idSc = hAPI.getCardValue('idSc')
    // var campos = {
    //     "COMPRAS": [
    //         {
    //             "EMPRESA": EMPRESA,
    //             "NUMERO": idSc
    //         }
    //     ]
    // }
    // try {
    //     var constraints = [
    //         DatasetFactory.createConstraint("tipo", "excluir", "", ConstraintType.MUST),
    //         DatasetFactory.createConstraint("operacao", "solicitacao", "", ConstraintType.MUST),
    //         DatasetFactory.createConstraint("campos", JSONUtil.toJSON(campos), "", ConstraintType.MUST)
    //     ]
    //     log.dir(constraints)
    //     var ds_compras_protheus = DatasetFactory.getDataset("ds_compras_protheus", null, constraints, null)
    //     log.dir(ds_compras_protheus)
    //     if(ds_compras_protheus.rowsCount > 0){
    //         var errorCode = ds_compras_protheus.getValue(0, 'errorCode')
    //         log.info('errorCode: '+errorCode)
    //         var errorMessage = ds_compras_protheus.getValue(0, 'errorMessage')
    //         log.info('errorMessage: '+errorMessage)
    //         if(errorCode != undefined) throw "errorCode: "+ errorCode + ", errorMessage: " + errorMessage + ", constraints: " + constraints
    //     }
    // }catch(error){
    //     throw error
    // }
}