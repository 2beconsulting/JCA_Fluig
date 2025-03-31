var tools = {
	carregaAprovadoresCompra: function(form){
		log.info("++ tools.carregaAprovadoresCompra");
		var ciclo_atual = form.getValue("ciclo_atual");
		var aprovs 		= [];
		var valorPedido = tools.valorTotal();
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
					"valorLimite" 	: tools.formataToFloat(ds.getValue(i,"valorLimite")),
					"documentId"	: ds.getValue(i,"metadata#id"),
					"version"		: ds.getValue(i,"metadata#version")
				})
			}
			
			pre_alcada = pre_alcada.filter(function(el){return el.valorLimite >= valorPedido}).sort(function(a,b){return a.valorLimite - b.valorLimite});
			log.info(">> pre_alcada")
			log.dir(pre_alcada)
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
						if(dsFilho.getValue(i,"aprovadorMatricula") == getValue("WKUser"))
							aprovs.push(dsFilho.getValue(i,"aprovadorMatricula"));
					}
				}else{
					for(var i = 0 ; i < dsFilho.rowsCount ; i++){
				        aprovs.push(dsFilho.getValue(i,"aprovadorMatricula"));
					}
				}

			})
			
		}
		if(aprovs.length < 2) aprovs.push("admin"); //Solução de contorno para quando o pedido for aprovado apenas pelo gerente
		form.setValue("matLiberaPedido",aprovs)
		log.info("-- tools.carregaAprovadoresCompra");
	},
	formataToFloat:function(oldValue){
		if(oldValue != ""){
			var newValue = oldValue;
			if(oldValue.indexOf(",") > 0) newValue = oldValue.replace(".","").replace(".","").replace(".","").replace(".","").replace(",",".");
			if(!isNaN(newValue)) return parseFloat(newValue);
		}
		return 0;
	},
	getAnexos: function(){
		var obj = [];
		var dsAttachments = DatasetFactory.getDataset(
			"processAttachment",
			["documentId"],
			[
				DatasetFactory.createConstraint("processAttachmentPK.processInstanceId",getValue("WKNumProces"),getValue("WKNumProces"),ConstraintType.MUST)
			],
			null
		)
		if(dsAttachments != null && dsAttachments.rowsCount > 0){
			for(var i = 0 ; i < dsAttachments.rowsCount ; i++){
				var documentId = dsAttachments.getValue(i,"documentId");
				obj.push({
					"documentId" : documentId,
					"documentDescription" : tools.getDocumentDescription(documentId)
				})
			}
		}
		return obj;
	},
	getDocumentDescription: function(documentId){
		var dsDocument = DatasetFactory.getDataset(
			"document",
			["documentDescription"],
			[
				DatasetFactory.createConstraint("documentPK.documentId",documentId,documentId,ConstraintType.MUST),
				DatasetFactory.createConstraint("activeVersion",true,true,ConstraintType.MUST)
			],
			null
		)
		
		return (dsDocument != null && dsDocument.rowsCount > 0) ? dsDocument.getValue(0,"documentDescription") : "";
	},
	identificaTipoContratacao: function(form){
		var tipo = "";
		form.getChildrenIndexes("tabelaProduto").forEach(function(idx){
			var tmpTipo = form.getValue("codigoProduto___"+idx).indexOf("S") == 0 ? "Serviço" : "Material";
			tipo = (tmpTipo == tipo || tipo == "" ? tmpTipo : "Ambos")
		})
		form.setValue("tipo_contratacao",tipo)
	},
	recuperaDocumentId: function(documentDescription){
		var dsAttach = DatasetFactory.getDataset(
				"processAttachment",
				["documentId"],
				[
					DatasetFactory.createConstraint("processAttachmentPK.attachmentSequence","1","1",ConstraintType.MUST_NOT),
					DatasetFactory.createConstraint("processAttachmentPK.processInstanceId",getValue("WKNumProces"),getValue("WKNumProces"),ConstraintType.MUST)
				],
				["documentId"]
			)
			
			if(dsAttach != null && dsAttach.rowsCount > 0){
				var c = [DatasetFactory.createConstraint("documentDescription",documentDescription,documentDescription,ConstraintType.MUST)]
				for(var i = 0 ; i < dsAttach.rowsCount ; i++){
					c.push(DatasetFactory.createConstraint("documentPK.documentId",dsAttach.getValue(i,"documentId"),dsAttach.getValue(i,"documentId"),ConstraintType.SHOULD))
				}

				var dsDoc = DatasetFactory.getDataset("document",null,c,["documentPK.documentId"])
				return dsDoc.getValue(dsDoc.rowsCount - 1,"documentPK.documentId");
			}
			return "";
	},
	usuario:{
		getTel: function(){
			var WKUser = getValue("WKUser");
			var ds = DatasetFactory.getDataset(
				"colleague",
				["extensionNr"],
				[
					DatasetFactory.createConstraint("colleaguePK.colleagueId",WKUser,WKUser,ConstraintType.MUST)
				],
				null
			)
			
			return ds != null && ds.rowsCount > 0 ? ds.getValue(0,"extensionNr") : ""
		}
	},
	usuarioCompras: function(){
		var WKUser = getValue("WKUser");
		var ds = DatasetFactory.getDataset(
			"colleagueGroup",
			null,
			[
				DatasetFactory.createConstraint("colleagueGroupPK.colleagueId",WKUser,WKUser,ConstraintType.MUST),
				DatasetFactory.createConstraint("colleagueGroupPK.groupId","COMPRAS_COMPRADORES","COMPRAS_COMPRADORES",ConstraintType.MUST)
			],
			null
		)
		return ds != null && ds.rowsCount > 0;
	},
	validaFornecedorExcluidoCiclo: function(form){
		var retorno = false;
		var ciclo_atual = form.getValue("ciclo_atual");
		var tabFornecedor = form.getChildrenIndexes("tabFornecedor");
        tabFornecedor.forEach(function(el,idx,arr){
        	if(form.getValue('CICLO_REMOVIDO___'+idx) == ciclo_atual){
        		var filtFornece = form.getChildrenIndexes("tabCotacao").filter(function(idx2){
        			return form.getValue('C8_CICLO___'+idx2) == ciclo_atual && form.getValue('C8_FORNECE___'+idx2) == form.getValue('A2_COD___'+idx) && form.getValue('C8_LOJA___'+idx2) == form.getValue('A2_LOJA___'+idx)})
        		if(filtFornece.length > 0){
        			retorno = true;
        			arr.length = idx
        		}
        	}
        })
		
        return retorno;
	},
	validaFornecedorVazio: function(form){
		var lRet = false;
		form.getChildrenIndexes("tabFornecedor").forEach(function(idx,i,arr){
			if(form.getValue("A2_COD___"+idx) == null || form.getValue("A2_COD___"+idx) == ""){
				lRet = true;
				arr.length = i;
			}
		})
		return lRet;
	},
	validaRegularizacao: function(form){
		var cotacoes = [];
		var objRet = {"problem":false};
		
		form.getChildrenIndexes("tabCotacao").forEach(function(idx){
			var C8_PRODUTO	= form.getValue("C8_PRODUTO___"+idx).substring(0,8);
			var C8_QUANT	= parseInt(form.getValue("C8_QUANT___"+idx));
			
			var filtCot = cotacoes.filter(function(cot){return cot.C8_PRODUTO == C8_PRODUTO});
			if(filtCot.length == 0){
				cotacoes.push({
					"C8_PRODUTO" 	: C8_PRODUTO,
					"C8_QUANT" 		: C8_QUANT
				});
			}else{
				filtCot[0].C8_QUANT += C8_QUANT;
			}
			
		})
		
		form.getChildrenIndexes("tabelaProduto").forEach(function(el,idx,arr){
			var filtCot = cotacoes.filter(function(cot){return cot.C8_PRODUTO == form.getValue("codigoProduto___"+el)})
			if(filtCot.length == 0){
				objRet.problem = true;
				objRet["msgError"] = "É necessário inserir valores para todos os produtos inseridos na solicitação inicial<br>"
				arr.length = idx;
			}else{
				if(filtCot[0].C8_QUANT != parseInt(form.getValue("produto_qtd___"+el))){
					objRet.problem = true;
					objRet["msgError"] = "É necessário que as quantidades dos produtos inseridos nesta atividade coincidam com os inseridos na solicitação inicial<br>"
					arr.length = idx;
				}
			}
		})
		 var filtForn = form.getChildrenIndexes("tabFornecedor").filter(function(idx){return form.getValue("A2_COND___"+idx) == ""});
		if(filtForn.length > 0){
			objRet.problem = true;
			objRet["msgError"] = "É necessário selecionar a Condição de Pagamento"
		}
		
		return objRet
	},
	validaTESNecessarias: function(form){
		var retorno = false;
		var ciclo_atual = form.getValue("ciclo_atual");
		
		var TES 	= form.getChildrenIndexes("tabTES").map(function(idx){return {
			A2_COD 	: form.getValue("TES_A2_COD___"+idx),
    		A2_LOJA : form.getValue("TES_A2_LOJA___"+idx),
    		B1_COD 	: form.getValue("TES_B1_COD___"+idx),
    		CODIGO 	: form.getValue("TES_CODIGO___"+idx)
		}});
		
		form.getChildrenIndexes("tabCotacao").forEach(function(idx,i,arr){
        	if(form.getValue('C8_CICLO___'+idx) == ciclo_atual && form.getValue('C8_PRECO___'+idx) != "" && form.getValue('C8_PRECO___'+idx) != "0.00" && form.getValue('C8_PRECO___'+idx) != "0.000000"){
        		var filtCot = TES.filter(function(t){return t.A2_COD == form.getValue('C8_FORNECE___'+idx) && t.A2_LOJA == form.getValue('C8_LOJA___'+idx) && t.B1_COD == form.getValue('C8_PRODUTO___'+idx).substring(0,8) && t.CODIGO != ""})
        		if(filtCot.length == 0){
        			retorno = true
        			i = arr.length
        		}
        	}
        })
		return retorno;
	},
	validaVencedorComprador: function(form){
		var ciclo_atual = form.getValue("ciclo_atual");
		var ret = false;
		var ds = DatasetFactory.getDataset(
			"DS_CONSULTA_COTACOES",
			null,
			[
				DatasetFactory.createConstraint("idEmpresa",form.getValue("idEmpresa"),"", ConstraintType.MUST),
				DatasetFactory.createConstraint("C8_NUM",form.getValue("C8_NUM"),"", ConstraintType.MUST),
				DatasetFactory.createConstraint("C8_CICLO",form.getValue("ciclo_atual"),"", ConstraintType.MUST)
			],
			null
		)
		log.info("-- ds")
		log.dir(ds)
		for(var i = 0 ; i < ds.rowsCount ; i++){
			if(ds.getValue(i,"C8_PRECO") != "" && ds.getValue(i,"VENCEDOR_COMPRADOR") == "true"){
				ret = true;
				i = ds.rowsCount;
			}
		}
		return ret
	},
	validacaoPendente: function(form){
		return form.getValue("validacao_tecnica_necessaria") == "true" && form.getChildrenIndexes("tabValidacaoTecnica").filter(function(idx){return form.getValue("VT_DECISAO___"+idx) == "" || form.getValue("VT_DECISAO___"+idx) == null}).length > 0
	},
	valorTotal: function(form){
		var valor = 0;
		var ciclo_atual = form.getValue("ciclo_atual");
		form.getChildrenIndexes("tabCotacao").forEach(function(idx){
			if(form.getValue("C8_CICLO___"+idx) == ciclo_atual && form.getValue("VENCEDOR_COMPRADOR___"+idx) == "true" && form.getValue("C8_NUMPED___"+idx) == ""){
				valor += ((tools.formataToFloat(form.getValue("C8_PRECO___"+idx)) * parseInt(form.getValue("QTD_COMPRADOR___"+idx))) + (tools.formataToFloat(form.getValue("C8_VALSOL___"+idx)) * parseInt(form.getValue("QTD_COMPRADOR___"+idx)) / parseInt(form.getValue("C8_QUANT___"+idx))) + (tools.formataToFloat(form.getValue("C8_DIFAL___"+idx)) * parseInt(form.getValue("QTD_COMPRADOR___"+idx)) / parseInt(form.getValue("C8_QUANT___"+idx))))
				
			}
		})
		log.info(">> valor: " + valor)
		return valor;
	}
}