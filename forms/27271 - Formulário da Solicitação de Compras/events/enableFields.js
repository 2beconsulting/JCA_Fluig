function enableFields(form){
	//form.setEnhancedSecurityHiddenInputs(true);
	setEnable(form,false)
	var WKNumState = getValue("WKNumState");
	
	form.setEnabled('historico', true)
    form.setEnabled('ultimaAtualizacao', true)
    form.setEnabled('observacoes', true)
	
	if(WKNumState == INICIO0 || WKNumState == INICIO1 || WKNumState == REVISAR_SOLICITACAO || WKNumState == TRATAR_ERRO || WKNumState == 260){
		form.setEnabled("displayEmpresa",true)
		form.setEnabled("descricaoEmpresa",true)
		form.setEnabled("idEmpresa",true)
		form.setEnabled("cnpjEmpresa",true)
		form.setEnabled("cepEmpresaOrigem",true)
		form.setEnabled("estadoEmpresaOrigem",true)
		form.setEnabled("cidadeEmpresaOrigem",true)
		form.setEnabled("bairroEmpresaOrigem",true)
		form.setEnabled("enderecoEmpresaOrigem",true)
		form.setEnabled("telefoneEmpresaOrigem",true)
		
		form.setEnabled("displayEmpresaEntrega",true)
		form.setEnabled("descricaoEmpresaEntrega",true)
		form.setEnabled("idEmpresaEntrega",true)
		form.setEnabled("cnpjEmpresaEntrega",true)
		form.setEnabled("cepEmpresaEntrega",true)
		form.setEnabled("estadoEmpresaEntrega",true)
		form.setEnabled("cidadeEmpresaEntrega",true)
		form.setEnabled("bairroEmpresaEntrega",true)
		form.setEnabled("enderecoEmpresaEntrega",true)
		form.setEnabled("telefoneEmpresaEntrega",true)
		
		form.setEnabled("idCentroCusto",true)
		form.setEnabled("idLocalRecebimento",true)
		form.setEnabled("unidade",true)
		form.setEnabled("diretoria_resposavel",true)
		form.setEnabled("regional",true)
		form.setEnabled("telefone_empresa",true)
		form.setEnabled("ramal_empresa",true)
		form.setEnabled("tipoSc",true)
		form.setEnabled("C1_ZPRECAR",true)
		form.setEnabled("tipo_contratacao",true)
		form.setEnabled("data_necessidade",true)
		form.setEnabled("data_entrega",true)
		form.setEnabled("data_emissao",true)
		form.setEnabled("cond_pagto",true)
		form.setEnabled("condicaoPagto",true)
		form.setEnabled("valor_total",true)
		form.setEnabled("especificacao_tecnica_solic",true)
		form.setEnabled("descricaoCentroCusto",true)
		form.setEnabled("localRecebimento",true)
		form.setEnabled("responsavel_recebimento",true)
		form.setEnabled("havera_rateio",true)
		form.setEnabled("necessita_visita",true)
		form.setEnabled("justificativa_solicitacao",true)

		form.setEnabled("codigoEmpresaRateio",true)
		form.setEnabled("descricaoEmpresaRateio",true)
		form.setEnabled("percentualEmpresaRateio",true)
		var tabelaRateio = form.getChildrenIndexes("tabelaRateio")
        tabelaRateio.forEach(function(idx){
            form.setEnabled("codigoEmpresaRateio___" + idx, true)
            form.setEnabled("descricaoEmpresaRateio___" + idx, true)
            form.setEnabled("percentualEmpresaRateio___" + idx, true)
        })

		form.setEnabled("produto",true)
		form.setEnabled("codigoProduto",true)
		form.setEnabled("tipoProduto",true)
		form.setEnabled("produto_entrega",true)
		form.setEnabled("produto_saldo",true)
		form.setEnabled("unidadeMedidaProduto",true)
		form.setEnabled("produto_qtd",true)
		form.setEnabled("produto_vlUnitario",true)
		form.setEnabled("produto_dtUltCompra",true)
		form.setEnabled("produto_vlUltCompra",true)
		form.setEnabled("produto_vlTotal",true)
		form.setEnabled("produto_percRateio",true)
		form.setEnabled("produto_marcas",true)
		form.setEnabled("produto_observacao",true)
		var tabelaProduto = form.getChildrenIndexes("tabelaProduto")
		tabelaProduto.forEach(function(idx){
	            form.setEnabled("produto___" + idx, true)
	            form.setEnabled("codigoProduto___" + idx, true)
	            form.setEnabled("tipoProduto___" + idx, true)
	            form.setEnabled("produto_entrega___" + idx, true)
	            form.setEnabled("produto_saldo___" + idx, true)
	            form.setEnabled("unidadeMedidaProduto___" + idx, true)
	            form.setEnabled("produto_qtd___" + idx, true)
	            form.setEnabled("produto_vlUnitario___" + idx, true)
	            form.setEnabled("produto_dtUltCompra___" + idx, true)
	            form.setEnabled("produto_vlUltCompra___" + idx, true)
	            form.setEnabled("produto_vlTotal___" + idx, true)
	            form.setEnabled("produto_percRateio___" + idx, true)
	            form.setEnabled("produto_marcas___" + idx, true)
	            form.setEnabled("produto_observacao___" + idx, true)
		})
		
		form.setEnabled("B1_COD",true)
		form.setEnabled("B1_PAI",true)
		form.setEnabled("B1_DESC",true)
		form.setEnabled("B1_GRUPO",true)
		form.setEnabled("B1_LOCPAD",true)
		form.setEnabled("B1_MSBLQL",true)
		form.setEnabled("B1_TIPO",true)
		form.setEnabled("B1_UM",true)
		form.setEnabled("B1_ZMARCA",true)
		form.setEnabled("ZPM_DESC",true)
		form.setEnabled("B1_UPRC",true)
		form.setEnabled("B1_UCOM",true)
		var tabProduto = form.getChildrenIndexes("tabProduto")
        tabProduto.forEach(function(idx){
            form.setEnabled("B1_COD___" + idx, true)
            form.setEnabled("B1_PAI___" + idx, true)
            form.setEnabled("B1_DESC___" + idx, true)
            form.setEnabled("B1_GRUPO___" + idx, true)
            form.setEnabled("B1_LOCPAD___" + idx, true)
            form.setEnabled("B1_MSBLQL___" + idx, true)
            form.setEnabled("B1_TIPO___" + idx, true)
            form.setEnabled("B1_UM___" + idx, true)
            form.setEnabled("B1_ZMARCA___" + idx, true)
            form.setEnabled("ZPM_DESC___" + idx, true)
            form.setEnabled("B1_UPRC___" + idx, true)
            form.setEnabled("B1_UCOM___" + idx, true)
        })

		form.setEnabled("fornec_sugerido",true)
		var tabelaFornecedor = form.getChildrenIndexes("tabelaFornecedor")
        tabelaFornecedor.forEach(function(idx){
            form.setEnabled("fornec_sugerido___" + idx, true)
        })
	}
	else if(WKNumState == RESPONDER_COMPRAS){
		form.setEnabled("data_necessidade",true)
		form.setEnabled("especificacao_tecnica",true)
		form.setEnabled("localRecebimento",true)
		form.setEnabled("responsavel_recebimento",true)
		form.setEnabled("justificativa_solicitacao",true)
	}
	else if(WKNumState == APROVAR_SOLICITACAO){
		form.setEnabled("decisaoAprovador",true)
		form.setEnabled("descReprovAprov",true)
	}
	else if(WKNumState == PREENCHER_SC || WKNumState == 76 || WKNumState == 80 || WKNumState == 105 || WKNumState == 148){
		form.setEnabled("validade_cotacao",true)
		form.setEnabled("dataTerminoSolicitacaoCotacao",true)
		form.setEnabled("especificacao_tecnica",true)
		form.setEnabled("decisaoComprador",true)
		form.setEnabled("decisaoComprador_motivo",true)
		
		form.setEnabled("A2_COD",true);
		form.setEnabled("A2_LOJA",true);
		form.setEnabled("A2_NOME",true);
		form.setEnabled("A2_CGC",true);
		form.setEnabled("A2_EST",true);
		form.setEnabled("A2_COND",true);
		form.setEnabled("A2_TPFRETE",true);
		form.setEnabled("A2_VALFRE",true);

		var tabFornecedor = form.getChildrenIndexes("tabFornecedor")
        tabFornecedor.forEach(function(idx){
        	if(form.getValue("CICLO_INSERIDO___"+idx) == ""){
        		form.setEnabled("A2_COD___" + idx, true);
                form.setEnabled("A2_LOJA___" + idx, true);
                form.setEnabled("A2_NOME___" + idx, true);
                form.setEnabled("A2_CGC___" + idx, true);
                form.setEnabled("A2_EST___" + idx, true);
                form.setEnabled("A2_COND___" + idx, true);
                form.setEnabled("A2_TPFRETE___" + idx, true);
                form.setEnabled("A2_VALFRE___" + idx, true);
        	}
            form.setEnabled("CICLO_REMOVIDO___" 	+ idx, true)
            form.setEnabled("COMPRADOR_REMOCAO___" 	+ idx, true)
            form.setEnabled("MOTIVO_REMOCAO___" 	+ idx, true)
        })
        
        if(form.getValue("tipoSc") == "5"){ // Tipo Regularização precisa habilitar campos da tabela TabCotacao
        	form.setEnabled("VENCEDOR_COMPRADOR",true)
    		form.setEnabled("COMPRADOR",true)
    		form.setEnabled("QTD_COMPRADOR",true)
        	form.setEnabled("C8_CICLO",true)
    		form.setEnabled("C8_PRODUTO",true)
    		form.setEnabled("C8_UM",true)
    		form.setEnabled("C8_FORNECE",true)
			form.setEnabled("C8_LOJA",true)
			form.setEnabled("C8_QUANT",true)
			form.setEnabled("C8_PRECO",true)
			form.setEnabled("C8_TOTAL",true)
			form.setEnabled("C8_PRAZO",true)
			form.setEnabled("C8_FILENT",true)
			form.setEnabled("C8_VALIPI",true)
			form.setEnabled("C8_VALICM",true)
			form.setEnabled("C8_VALISS",true)
						
			form.getChildrenIndexes("tabCotacao").forEach(function(idx){
				form.setEnabled("VENCEDOR_COMPRADOR"+"___"+idx,true)
	    		form.setEnabled("COMPRADOR"+"___"+idx,true)
	    		form.setEnabled("QTD_COMPRADOR"+"___"+idx,true)
	        	form.setEnabled("C8_CICLO"+"___"+idx,true)
	    		form.setEnabled("C8_PRODUTO"+"___"+idx,true)
	    		form.setEnabled("C8_UM"+"___"+idx,true)
	    		form.setEnabled("C8_FORNECE"+"___"+idx,true)
				form.setEnabled("C8_LOJA"+"___"+idx,true)
				form.setEnabled("C8_QUANT"+"___"+idx,true)
				form.setEnabled("C8_PRECO"+"___"+idx,true)
				form.setEnabled("C8_TOTAL"+"___"+idx,true)
				form.setEnabled("C8_PRAZO"+"___"+idx,true)
				form.setEnabled("C8_FILENT"+"___"+idx,true)
				form.setEnabled("C8_VALIPI"+"___"+idx,true)
				form.setEnabled("C8_VALICM"+"___"+idx,true)
				form.setEnabled("C8_VALISS"+"___"+idx,true)
			})
			
			form.setEnabled("pedidoId",true)
			form.setEnabled("fornecedorCNPJ",true)
			form.setEnabled("fornecedorId",true)
			form.setEnabled("fornecedorLoja",true)
			form.setEnabled("pedidoTipo",true)
			form.setEnabled("pedidoTotal",true)
			form.setEnabled("pedidoDifal",true)
			form.setEnabled("pedidoFrete",true)
			form.setEnabled("pedidoDespesas",true)
			form.setEnabled("pedidoDesconto",true)
			form.setEnabled("pedidoTotalGeral",true)
			
	        form.getChildrenIndexes("tabPedidos").forEach(function(idx){
	    		form.setEnabled("pedidoId" 	+ "___" + idx, true)
	            form.setEnabled("fornecedorCNPJ" 	+ "___" + idx, true)
	            form.setEnabled("fornecedorId" 	+ "___" + idx, true)
	            form.setEnabled("fornecedorLoja" 	+ "___" + idx, true)
	        	form.setEnabled("pedidoTipo" 	+ "___" + idx, true)
	        	form.setEnabled("pedidoTotal" 	+ "___" + idx, true)
	            form.setEnabled("pedidoDifal" 	+ "___" + idx, true)
	            form.setEnabled("pedidoFrete" 	+ "___" + idx, true)
	            form.setEnabled("pedidoDespesas" 	+ "___" + idx, true)
	        	form.setEnabled("pedidoDesconto" 	+ "___" + idx, true)
	            form.setEnabled("pedidoTotalGeral" + "___" + idx, true)
	        })
        }
        
        form.setEnabled("TES_A2_COD",true)
		form.setEnabled("TES_A2_LOJA",true)
		form.setEnabled("TES_A2_CGC",true)
		form.setEnabled("TES_B1_COD",true)
		form.setEnabled("TES_CODIGO",true)
		form.setEnabled("TES_COMPRADOR",true)
		
        var tabTES = form.getChildrenIndexes("tabTES")
        tabTES.forEach(function(idx){
    		form.setEnabled("TES_A2_COD" 	+ "___" + idx, true)
            form.setEnabled("TES_A2_LOJA" 	+ "___" + idx, true)
            form.setEnabled("TES_A2_CGC" 	+ "___" + idx, true)
            form.setEnabled("TES_B1_COD" 	+ "___" + idx, true)
        	form.setEnabled("TES_CODIGO" 	+ "___" + idx, true)
            form.setEnabled("TES_COMPRADOR" + "___" + idx, true)
        })
	}
	else if(WKNumState == ANALISAR_COTACAO_VENCEDORA){
		form.setEnabled("obsComprador",true);
		form.setEnabled("ciclo_aprovado",true)
		form.setEnabled("ciclo_mapa",true)
		form.setEnabled("filtrar_mapa",true)
		form.setEnabled("complem_mapa",true)
		form.setEnabled("tipo_pc_contrato",true)
		form.setEnabled("validacao_tecnica_necessaria",true)
		form.setEnabled("intrack_necessario",true)
		form.setEnabled("dataTerminoSolicitacaoCotacao",true)
		form.setEnabled("novaDataVencCotacao",true)
		
		var indexes = form.getChildrenIndexes("tabCotacao");
		indexes.forEach(function(idx){
			form.setEnabled("VENCEDOR_COMPRADOR___"+idx,true);
			form.setEnabled("QTD_COMPRADOR___"+idx,true);
			form.setEnabled("COMPRADOR___"+idx,true);
			form.setEnabled("COMPRADOR_JUSTIFICATIVA___"+idx,true);
		})
		
		form.setEnabled("A2_COD",true)
		form.setEnabled("A2_LOJA",true)
		form.setEnabled("A2_NOME",true)
		form.setEnabled("A2_CGC",true)
		form.setEnabled("A2_EST",true)
		form.setEnabled("CICLO_INSERIDO",true)

		var ciclo_atual = form.getValue("ciclo_atual");
		var tabFornecedor = form.getChildrenIndexes("tabFornecedor")
        tabFornecedor.forEach(function(idx){
        	if(form.getValue("CICLO_INSERIDO___"+idx) == ""){
        		form.setEnabled("A2_COD___" + idx, true)
                form.setEnabled("A2_LOJA___" + idx, true)
                form.setEnabled("A2_NOME___" + idx, true)
                form.setEnabled("A2_CGC___" + idx, true)
                form.setEnabled("A2_EST___" + idx, true)
                form.setEnabled("CICLO_INSERIDO___" + idx, true)
        	}
        	else if(form.getValue("CICLO_REMOVIDO___"+idx) == "" || form.getValue("CICLO_REMOVIDO___"+idx) == ciclo_atual){
        		form.setEnabled("CICLO_REMOVIDO___" 	+ idx, true)
                form.setEnabled("COMPRADOR_REMOCAO___" 	+ idx, true)
                form.setEnabled("MOTIVO_REMOCAO___" 	+ idx, true)
        	}
        })
        
        form.setEnabled("TES_A2_COD",true)
		form.setEnabled("TES_A2_LOJA",true)
		form.setEnabled("TES_A2_CGC",true)
		form.setEnabled("TES_B1_COD",true)
		form.setEnabled("TES_CODIGO",true)
		form.setEnabled("TES_COMPRADOR",true)
		
        var tabTES = form.getChildrenIndexes("tabTES")
        tabTES.forEach(function(idx){
    		form.setEnabled("TES_A2_COD" 	+ "___" + idx, true)
            form.setEnabled("TES_A2_LOJA" 	+ "___" + idx, true)
            form.setEnabled("TES_A2_CGC" 	+ "___" + idx, true)
            form.setEnabled("TES_B1_COD" 	+ "___" + idx, true)
        	form.setEnabled("TES_CODIGO" 	+ "___" + idx, true)
            form.setEnabled("TES_COMPRADOR" + "___" + idx, true)
        })
        
        form.setEnabled("FILE_DESCRIPTION",true)
		form.setEnabled("FILE_ID",true)
		form.setEnabled("FILE_IDX",true)
		form.setEnabled("FILE_NAME",true)
		
        form.getChildrenIndexes("tabAnexosValidacao").forEach(function(idx){
    		form.setEnabled("FILE_DESCRIPTION" 	+ "___" + idx, true)
            form.setEnabled("FILE_ID" 			+ "___" + idx, true)
            form.setEnabled("FILE_IDX" 			+ "___" + idx, true)
            form.setEnabled("FILE_NAME" 			+ "___" + idx, true)
        })
        
        form.setEnabled("VT_A2CGC",true)
		form.setEnabled("VT_B1COD",true)
		form.setEnabled("VT_FILEIDX",true)
		form.setEnabled("VT_DETALHAMENTO",true)
		
        form.getChildrenIndexes("tabValidacaoTecnica").forEach(function(idx){
    		form.setEnabled("VT_A2CGC" 			+ "___" + idx, true)
            form.setEnabled("VT_B1COD" 			+ "___" + idx, true)
            form.setEnabled("VT_FILEIDX" 		+ "___" + idx, true)
            form.setEnabled("VT_DETALHAMENTO" 	+ "___" + idx, true)
        })
        
	}
	else if(WKNumState == VALIDAR_TECNICAMENTE){ 
		form.getChildrenIndexes("tabValidacaoTecnica").forEach(function(idx){
			form.setEnabled("VT_DECISAO___"+idx,true);
			form.setEnabled("VT_DECISAOOBS___"+idx,true);
			form.setEnabled("VT_DATA_HORA___"+idx,true);
		})
		
		form.getChildrenIndexes("tabFornecedor").forEach(function(idx){
			form.setEnabled("VALIDACAO_DECISAO___"+idx,true);
			form.setEnabled("VALIDACAO_OBS___"+idx,true);
		})
	}
	else if(WKNumState == APROVAR_MENOR_VALOR){
		form.setEnabled("decisaoAprovadorValorMenor",true)
		form.setEnabled("descReprovAprovValorMenor",true)
	}
	else if(WKNumState == APROVAR_COTACAO){
		form.setEnabled("decisaoAprovadorCotacao",true)
		form.setEnabled("descReprovAprovCotacao",true)
	}
	else if(WKNumState == 224){
		form.setEnabled("decisaoLiberarPedido",true)
		form.setEnabled("decisaoLiberarPedido_obs",true)
	}
	else if(WKNumState == 71){ //Avaliar solicitação
		form.setEnabled('checkRadio', true);
		form.setEnabled('checkInsatisfacao', true);
		form.setEnabled('comentariosAvaliacao', true);
		form.setEnabled('avaliacao', true);
	}
	else if(WKNumState == 342){ //Inserir dados do contrato
		form.setEnabled("CN9_DTINIC",true)
		form.setEnabled("CN9_UNVIGE",true)
		form.setEnabled("CN9_VIGE",true)
		form.setEnabled("CN9_TPCTO",true)
		form.setEnabled("CN9_NATURE",true)
		form.setEnabled("CN9_DEPART",true)
		form.setEnabled("CN9_GESTC",true)
		form.setEnabled("CNA_TIPPLA",true)
		form.setEnabled("contrato_area",true)
		form.setEnabled("contrato_gestor",true)
		form.setEnabled("contrato_primeira_medicao",true)
		form.setEnabled("contrato_competencia",true)
		form.setEnabled("contrato_financeiro",true)
		form.setEnabled("contrato_financeiro",true)
		form.setEnabled("contrato_cronograma",true)
		form.setEnabled("contrato_parcelas",true)
	}
}