var tools = {
	validaTESNecessarias: function(form){
		log.info(">> tools.validaTESNecessarias");
		var TES = form.getChildrenIndexes("tabTES")
			.filter(function(idx){return form.getValue("TES_CODIGO___"+idx).trim() != ""})
			.map(function(idx){return {
				A2_COD 	: form.getValue("TES_A2_COD___"+idx),
        		A2_LOJA : form.getValue("TES_A2_LOJA___"+idx),
        		B1_COD 	: form.getValue("TES_B1_COD___"+idx),
        		CODIGO 	: form.getValue("TES_CODIGO___"+idx)
			}})
		log.info("--- TES")
		log.dir(TES)
			
		/*var cotacoes = form.getChildrenIndexes("tabCotacao")
			.filter(function(idx){
				return ["","null","0.00","0,00"].indexOf(""+form.getValue('C8_PRECO___'+idx).trim()) < 0
			})
			.map(function(idx){return {
			
				C8_FORNECE 	: form.getValue("C8_FORNECE___"+idx),
				C8_LOJA 	: form.getValue("C8_LOJA___"+idx),
				C8_PRODUTO 	: form.getValue("C8_PRODUTO___"+idx).substring(0,8),
				C8_PRECO	: form.getValue("C8_PRECO___"+idx)
			}})
		log.dir(cotacoes)*/
		
				var ds = DatasetFactory.getDataset(
					"DS_CONSULTA_AUXILIAR_COTACAO",
					null,
					[
						DatasetFactory.createConstraint("S_COTACAO",form.getValue("numeroSolicitacao"),form.getValue("numeroSolicitacao"),ConstraintType.MUST),
						DatasetFactory.createConstraint("IDEMPRESA",form.getValue("idEmpresa"),form.getValue("idEmpresa"),ConstraintType.MUST),
						DatasetFactory.createConstraint("S_COMPRA",form.getValue("solicitacao_compra"),form.getValue("solicitacao_compra"),ConstraintType.MUST)
					],
					null
				)
				
				var cotacoes = [];
				if(ds != null && ds.values.length > 0){
					for(var i = 0 ; i < ds.values.length ; i++){
						var valor = ds.getValue(i,"C8_PRECO").trim();
						if(valor != "" && valor != null && valor != "0.00" && valor != "0,00"){
							cotacoes.push({
								C8_FORNECE 	: ds.getValue(i,"C8_FORNECE"),
								C8_LOJA 	: ds.getValue(i,"C8_LOJA"),
								C8_PRODUTO 	: ds.getValue(i,"C8_PRODUTO").substring(0,8),
								C8_PRECO	: ds.getValue(i,"C8_PRECO")
							});
						}
					}
				}
				log.info("--- cotacoes")
				log.dir(cotacoes)
		
		var fil = cotacoes.filter(function(el){
			log.info("--- filfilfilfil")
			log.dir(el)
			var filTES = TES.filter(function(t){
				return t.A2_COD == el.C8_FORNECE && t.A2_LOJA == el.C8_LOJA && t.B1_COD == el.C8_PRODUTO
			})
			log.dir(filTES)
			return filTES.length < 1
		})
		
		log.dir(fil)
		log.info("<< tools.validaTESNecessarias")

		return fil.length > 0;
	}
}