function resolve(process,colleague){

	return mecComprasLiberarPedido();

}

function mecComprasLiberarPedido(){
	log.info("++ mecComprasLiberarPedido");
	
	var userList = new java.util.ArrayList();
	var ciclo_atual = hAPI.getCardValue("ciclo_atual");
	var aprovs 		= [];
	var valorPedido = valorTotal();
	log.info("valorPedido: " + valorPedido);
	var pre_alcada 	= [];
	
	var ds = DatasetFactory.getDataset(
		"dsAprovadoresCompras",
		null,
		[
			DatasetFactory.createConstraint("metadata#active",true,true,ConstraintType.MUST)
		],
		null
	)

	if(ds != null && ds.rowsCount > 0){
		for(var i = 0 ; i < ds.rowsCount ; i++){
			pre_alcada.push({
				"nivel" 		: ds.getValue(i,"nivel"),
				"valorLimite" 	: toFloat(ds.getValue(i,"valorLimite")),
				"documentId"	: ds.getValue(i,"metadata#id"),
				"version"		: ds.getValue(i,"metadata#version")
			})
		}
		
		pre_alcada = pre_alcada.filter(function(el){return el.valorLimite >= valorPedido}).sort(function(a,b){return a.valorLimite - b.valorLimite});

		pre_alcada.forEach(function(el,idx,arr){
			var dsFilho = DatasetFactory.getDataset(
				"dsAprovadoresCompras",
				null,
				[
					DatasetFactory.createConstraint("metadata#id",el.documentId,el.documentId,ConstraintType.MUST),
					DatasetFactory.createConstraint("metadata#version",el.version,el.version,ConstraintType.MUST),
					DatasetFactory.createConstraint("tablename","tabAprovadores","tabAprovadores",ConstraintType.MUST)
				],
				null
			)

			if(el.nivel.toUpperCase() == "COMPRADORES"){
				for(var i = 0 ; i < dsFilho.rowsCount ; i++){
					if(dsFilho.getValue(i,"aprovadorMatricula") == getValue("WKUser")){
						userList.add(dsFilho.getValue(i,"aprovadorMatricula"));
					}
				}
			}else{
				for(var i = 0 ; i < dsFilho.rowsCount ; i++){
					userList.add(dsFilho.getValue(i,"aprovadorMatricula"));
				}
			}

		})
		
	}

	return userList;
	log.info("-- mecComprasLiberarPedido");
}

function toFloat(oldValue){
	if(oldValue != "" && oldValue != undefined){
		var newValue = oldValue;
		if(oldValue.indexOf(",") > 0) newValue = oldValue.replace(".","").replace(".","").replace(".","").replace(".","").replace(",",".");
		if(!isNaN(newValue)) return parseFloat(newValue);
	}
	return 0;
}

function valorTotal(){
	var valor = 0;
	var ciclo_atual = hAPI.getCardValue("ciclo_atual");
	hAPI.getChildrenIndexes("tabCotacao").forEach(function(idx){
		if(hAPI.getCardValue("C8_CICLO___"+idx) == ciclo_atual && hAPI.getCardValue("VENCEDOR_COMPRADOR___"+idx) == "true" && hAPI.getCardValue("C8_NUMPED___"+idx) == ""){
			valor += (toFloat(hAPI.getCardValue("C8_PRECO___"+idx)) * parseInt(hAPI.getCardValue("QTD_COMPRADOR___"+idx))) + (toFloat(hAPI.getCardValue("C8_DIFAL___"+idx)) * parseInt(hAPI.getCardValue("QTD_COMPRADOR___"+idx))) + (toFloat(hAPI.getCardValue("C8_VALSOL___"+idx)) * parseInt(hAPI.getCardValue("QTD_COMPRADOR___"+idx)))
		}
	})
	return valor;
}