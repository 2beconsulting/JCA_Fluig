function inputFields(form){
	setEnable(form,true)
	var WKNumState = getValue("WKNumState");
	if(WKNumState == 1 || WKNumState == 3){ // Início
		tools.identificaTipoContratacao(form);
	}
	else if(WKNumState == 26 || WKNumState == 148 || WKNumState == 105 || WKNumState == 76 || WKNumState == 80){ //Analisar cotação vencedora
		if(form.getValue("ciclo_aprovado") == "sim" ){
			//tools.carregaAprovadoresCompra(form)
		}
		
		if(form.getValue("validacao_tecnica_necessaria") == "true"){
			var anexos = tools.getAnexos();
			form.getChildrenIndexes("tabAnexosValidacao").filter(function(idx){return form.getValue("FILE_ID___"+idx) == ""}).forEach(function(idx){
				var documentFilter = anexos.filter(function(el){return el.documentDescription == (form.getValue("FILE_DESCRIPTION___"+idx)+"_"+form.getValue("FILE_IDX___"+idx))})
				form.setValue("FILE_ID___"+idx,documentFilter.length > 0 ? documentFilter[0]["documentId"]:"")
			})
		}
	}
	else if(WKNumState == 134){ // Validar Tecnicamente
		form.getChildrenIndexes("tabValidacaoTecnica").forEach(function(idx){
			if(form.getValue("VT_DECISAO"+"___"+idx) != ""){
				form.setValue("VT_EXECUTADA___"+idx,"true")
			}
		})
	}
	else if(WKNumState == 40){ //Aprovar valor menor orçado
    	var ciclo_atual = form.getValue("ciclo_atual");
    	if(form.getValue("decisaoAprovadorValorMenor") != "retornar"){
    		var aprovacaoProxAprovador = "";
    		form.getChildrenIndexes("tabAprovacoesValorMenor").forEach(function(idx,i,arr){
    			if(form.getValue("aprovValorMenor_ciclo___"+idx) == ciclo_atual && form.getValue("aprovValorMenor_matAprovador___"+idx) == getValue("WKUser") && form.getValue("aprovValorMenor_decisao___"+idx) == ""){
    				form.setValue("aprovValorMenor_decisao___"+idx, (form.getValue("decisaoAprovadorValorMenor") == "sim" ? "Aprovou" : "Reprovou"));
    				form.setValue("aprovValorMenor_data___"+idx,form.getValue("dtAprovacaoValorMenor"))
    				form.setValue("aprovValorMenor_motivo___"+idx,form.getValue("descReprovAprovValorMenor"))
    				aprovacaoProxAprovador = (arr[(i+1)] != undefined ? form.getValue("aprovValorMenor_matAprovador___"+arr[(i+1)]) : "");
    				arr.length = i;
    			}
    		})
    		form.setValue("aprovacaoProxAprovador",aprovacaoProxAprovador)
    	}
    }
	else if(WKNumState == 121){ //InTrack
    	var ciclo_atual = form.getValue("ciclo_atual");
		var aprovacaoProxAprovador = "";
		form.getChildrenIndexes("tabAprovacoesIntrack").forEach(function(idx,i,arr){
			if(form.getValue("aprovIntrack_ciclo___"+idx) == ciclo_atual && form.getValue("aprovIntrack_matAprovador___"+idx) == getValue("WKUser") && form.getValue("aprovIntrack_decisao___"+idx) == ""){
				form.setValue("aprovIntrack_decisao___"+idx, (form.getValue("decisaoAprovadorIntrack") == "sim" ? "Aprovou" : "Reprovou"));
				form.setValue("aprovIntrack_data___"+idx, form.getValue("dtAprovacaoIntrack"));
				aprovacaoProxAprovador = (arr[(i+1)] != undefined ? form.getValue("aprovIntrack_matAprovador___"+arr[(i+1)]) : "");
				arr.length = i;
			}
		})
		form.setValue("aprovacaoProxComprador",aprovacaoProxAprovador);
    }
	else if(WKNumState == 224){ //Liberar Pedido
    	var ciclo_atual = form.getValue("ciclo_atual");
		var aprovacaoProxAprovador = "";
		form.getChildrenIndexes("tabAprovacoesCotacao").forEach(function(idx,i,arr){
			if(form.getValue("aprovCotacao_ciclo___"+idx) == ciclo_atual && form.getValue("aprovCotacao_matAprovador___"+idx) == getValue("WKUser") && form.getValue("aprovCotacao_decisao___"+idx) == ""){
				form.setValue("aprovCotacao_decisao___"+idx, (form.getValue("decisaoAprovadorCotacao") == "sim" ? "Aprovou" : "Reprovou"));
				form.setValue("aprovCotacao_data___"+idx, form.getValue("dtAprovacaoCotacao"));
				aprovacaoProxAprovador = (arr[(i+1)] != undefined ? form.getValue("aprovCotacao_matAprovador___"+arr[(i+1)]) : "");
				arr.length = i;
			}
		})
		form.setValue("aprovacaoProxComprador",aprovacaoProxAprovador);
    }
}