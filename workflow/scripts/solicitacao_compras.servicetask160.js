function servicetask160(attempt, message) {
	try{
		if(hAPI.getCardValue("tipoSc") != "5"){ //Para solicitações do tipo Regularização não serão carregados os fornecedores
			var prods 		= hAPI.getChildrenIndexes("tabProduto");
			var fornProd 	= hAPI.getChildrenIndexes("tabFornecedorProduto");
			var forns 		= hAPI.getChildrenIndexes("tabFornecedor");
			
			if(fornProd.length < 1 && forns.length < 1){
			
				var dadosProtheus = {"PRODUTO": prods.map(function(idx){return {"CODIGO" : ""+hAPI.getCardValue("B1_COD___"+idx).trim()}})}
				
				if(dadosProtheus.PRODUTO.length > 0){
					var fornecedor_produto = integra.postProtheus("/JWSSA503",dadosProtheus);
					
					if(fornecedor_produto.ok && fornecedor_produto.retorno.length > 0){
						if(fornecedor_produto.retorno[0].PRODUTOS.length > 0){
							var arrProdForn = [];
							fornecedor_produto.retorno[0].PRODUTOS.forEach(function(el){
								var filt = arrProdForn.filter(function(a){return a.A5_PRODUTO == el.A5_PRODUTO && a.A5_FORNECE == el.A5_FORNECE && a.A5_LOJA == el.A5_LOJA})
								if(filt.length == 0){
									arrProdForn.push({
										"A5_PRODUTO"	: ""+el.A5_PRODUTO,
										"A5_NOMPROD"	: ""+el.A5_NOMPROD,
										"A5_NOMEFOR"	: ""+el.A5_NOMEFOR,
										"A5_FORNECE"	: ""+el.A5_FORNECE,
										"A5_LOJA"		: ""+el.A5_LOJA
									})
								}
							})
							
							arrProdForn.forEach(function(el){
								var childData = new java.util.HashMap();
						        childData.put("A5_PRODUTO"	, el.A5_PRODUTO);
						        childData.put("A5_NOMPROD"	, el.A5_NOMPROD);
						        childData.put("A5_NOMEFOR"	, el.A5_NOMEFOR);
						        childData.put("A5_FORNECE"	, el.A5_FORNECE);
						        childData.put("A5_LOJA"		, el.A5_LOJA);
						        hAPI.addCardChild("tabFornecedorProduto", childData);
							})
						}
						
						if(fornecedor_produto.retorno[1].FORNECEDOR.length > 0){
							fornecedor_produto.retorno[1].FORNECEDOR.sort(function(a,b){return a.A2_NOME - b.A2_NOME});
							
							fornecedor_produto.retorno[1].FORNECEDOR.forEach(function(el){
								var childData = new java.util.HashMap();
						        childData.put("A2_COD"	, ""+el.A2_COD);
						        childData.put("A2_LOJA"	, ""+el.A2_LOJA);
						        childData.put("A2_NOME"	, ""+el.A2_NOME);
						        childData.put("A2_CGC"	, ""+el.A2_CGC);
						        childData.put("A2_EST"	, ""+el.A2_EST);
						        childData.put("A2_PROD"	, "true");
						        childData.put("CICLO_INSERIDO"	, "1");//Teste para poder excluir fornecedores inseridos automaticamente para depois poder reinseri-lo
						        hAPI.addCardChild("tabFornecedor", childData);
							})
						}
					}
				}
			}
		}
		else{
			var indexes = hAPI.getChildrenIndexes("tabFornecedor");
			
			if(indexes.length > 1){
				for (var i = indexes.length-1; i >= 0; i--){ 
					hAPI.removeCardChild("tabFornecedor", indexes[i]);
				}
			}
			
			var idxTES = hAPI.getChildrenIndexes("tabTES");
			if(idxTES.length > 0){
				for (var i = idxTES.length-1; i >= 0; i--){ 
					hAPI.removeCardChild("tabTES", idxTES[i]);
				}
			}
		}
	}catch(e){
		throw e.message != undefined ? e.message : e
	}
	
}