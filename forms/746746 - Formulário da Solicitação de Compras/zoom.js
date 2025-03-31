function setSelectedZoomItem(selectedItem){
	if(selectedItem.inputId == 'displayEmpresa'){
		$("#idEmpresa").val(selectedItem['COD_EMPRES']);
		$("#descricaoEmpresa").val(selectedItem["DES_EMPRES"]);
		$("#cnpjEmpresa").val(selectedItem['CGC_EMPRES']);
		
		$("#cepEmpresaOrigem").val(selectedItem['CEP_EMPRES']);
		$("#estadoEmpresaOrigem").val(selectedItem['EST_EMPRES']);
		$("#cidadeEmpresaOrigem").val(selectedItem['CID_EMPRES']);
		$("#bairroEmpresaOrigem").val(selectedItem['BAIR_EMPRES']);
		$("#enderecoEmpresaOrigem").val(selectedItem['END_EMPRES']);
		$("#telefoneEmpresaOrigem").val(selectedItem['TEL_EMPRES']);
	}
	else if(selectedItem.inputId == 'displayEmpresaEntrega'){
		$("#idEmpresaEntrega").val(selectedItem['COD_EMPRES']);
		$("#descricaoEmpresaEntrega").val(selectedItem['DES_EMPRES']);
		$("#cnpjEmpresaEntrega").val(selectedItem['CGC_EMPRES'])
		
		$("#cepEmpresaEntrega").val(selectedItem['CEP_EMPRES']);
		$("#estadoEmpresaEntrega").val(selectedItem['EST_EMPRES']);
		$("#cidadeEmpresaEntrega").val(selectedItem['CID_EMPRES']);
		$("#bairroEmpresaEntrega").val(selectedItem['BAIR_EMPRES']);
		$("#enderecoEmpresaEntrega").val(selectedItem['END_EMPRES']);
		$("#telefoneEmpresaEntrega").val(selectedItem['TEL_EMPRES']);
	}
	else if(selectedItem.inputId == 'unidade'){
		reloadZoomFilterValues("diretoria_resposavel", "unidade," + selectedItem.unidade)
	}
	else if(selectedItem.inputId == 'descricaoCentroCusto'){
		$("#idCentroCusto").val(selectedItem['COD_CCUSTO'])
	}
	else if(selectedItem.inputId == 'contrato_area'){
		$("#CN9_DEPART").val(selectedItem['CXQ_CODIGO'])
	}
	else if(selectedItem.inputId == 'contrato_gestor'){
		$("#CN9_GESTC").val(selectedItem['USR_ID'])
	}
	else if(selectedItem.inputId.match(/___/)){
        let id = selectedItem.inputId.split("___")[0]
        let index = selectedItem.inputId.split("___")[1]
        if(id == 'descricaoEmpresaRateio'){
        	if(tools.rateio.validaDuplicidade(index,selectedItem['COD_EMPRES'])){
        		$("#codigoEmpresaRateio___"+index).val(selectedItem['COD_EMPRES'])
        	}
        	else{
        		window[selectedItem.inputId].clear();
    			FLUIGC.toast({
    				message: 'A empresa selecionada já foi inserida nesta solicitação!',
    				type: 'danger'
    			});
        	}
		}
        else if(id == 'produto'){
        	myLoading.show();
        	
        	setTimeout(()=>{
        		$("#tipoProduto___"+index).val(selectedItem['SERVICO'] == "S" ? "SERVICO" : "MATERIAL");
        		
        		if(tools.produtos.validaDuplicidade(index,selectedItem['B1_COD'])){
        			$("#codigoProduto___"+index).val(selectedItem['B1_COD']);
        			$("#unidadeMedidaProduto___"+index).val(selectedItem['B1_UM']);
        			let utlCompra = 0;
        			
        			if(selectedItem['SERVICO'] != "S"){
        				if(!tools.produtos.carregaFilhos(selectedItem,index)){
        					
        					$("#codigoProduto___"+index).val("");
                			$("#unidadeMedidaProduto___"+index).val("");
                			window[selectedItem.inputId].clear();
                			
        					FLUIGC.toast({
        						message: 'O produto '+selectedItem['B1_COD']+' - '+selectedItem['B1_DESC']+' não pode ser selecionado pois não foram encontradas marcas homologadas',
        						type: 'danger'
        					});
            			}
        			}else{
        				tools.produtos.carregaFilhos(selectedItem,index)
        			}
        			
        		}else{
        			window[selectedItem.inputId].clear();
        			FLUIGC.toast({
        				message: 'Produto selecionado já foi inserido nesta solicitação!',
        				type: 'danger'
        			});
        		}
    			
    			myLoading.hide();
        	},100)
			
		}
        else if(["A2_COD","A2_NOME","A2_CGC"].includes(id)){
        	if(tools.fornecedores.validaDuplicidade(index,selectedItem['CGC'] || selectedItem['A2_CGC'])){
        		if(id == "A2_COD"){
                	window["A2_NOME"+"___"+index].setValue(selectedItem.DESCRICAO);
                	window["A2_CGC"+"___"+index].setValue(selectedItem.CGC);
        			$("#A2_LOJA"+"___"+index).val(selectedItem.LOJA);
        			$("#A2_EST"+"___"+index).val(selectedItem.UF);
                }
                else if(id == "A2_NOME"){
                	window["A2_COD"+"___"+index].setValue(selectedItem.CODIGO);
                	window["A2_CGC"+"___"+index].setValue(selectedItem.CGC);
        			$("#A2_LOJA"+"___"+index).val(selectedItem.LOJA);
        			$("#A2_EST"+"___"+index).val(selectedItem.UF);
                }
                else if(id == "A2_CGC"){
                	window["A2_COD"+"___"+index].setValue(selectedItem.A2_COD);
                	window["A2_NOME"+"___"+index].setValue(selectedItem.A2_NOME);
                	$("#A2_LOJA"+"___"+index).val(selectedItem.A2_LOJA);
                	$("#A2_EST"+"___"+index).val(selectedItem.A2_EST);
                }
        		tools.fornecedores.habilitaAcoes();
        		tools.mapa.carregaBase();
        	}else{
        		window[selectedItem.inputId].clear();
    			FLUIGC.toast({
    				message: 'Fornecedor selecionado já foi inserido nesta solicitação!',
    				type: 'danger'
    			});
        	}
        	
        }

    }
	else if(selectedItem.inputId == 'condicaoSC'){
		$("#idCondicaoPagamento").val(selectedItem['E4_CODIGO'])
	}
	else if(selectedItem.inputId == 'condicaoPagto'){
		$("#cond_pagto").val(selectedItem['E4_CODIGO'])
	}
	else if(selectedItem.inputId == 'filialPEntregaSC'){
		$("#idFilialEntrega").val(selectedItem['ID_FILIAL'])
	}

}
function removedZoomItem(removedItem){
	if(removedItem.inputId == 'displayEmpresa'){
		$("#idEmpresa").val('');
		$("#descricaoEmpresa").val("");
		$("#cnpjEmpresa").val('');
		
		$("#cepEmpresaOrigem").val("");
		$("#estadoEmpresaOrigem").val("");
		$("#cidadeEmpresaOrigem").val("");
		$("#bairroEmpresaOrigem").val("");
		$("#enderecoEmpresaOrigem").val("");
		$("#telefoneEmpresaOrigem").val("");
	}
	else if(removedItem.inputId == 'displayEmpresaEntrega'){
		$("#idEmpresaEntrega").val("");
		$("#descricaoEmpresaEntrega").val("")
		$("#cnpjEmpresaEntrega").val("")
		
		$("#cepEmpresaEntrega").val("");
		$("#estadoEmpresaEntrega").val("");
		$("#cidadeEmpresaEntrega").val("");
		$("#bairroEmpresaEntrega").val("");
		$("#enderecoEmpresaEntrega").val("");
		$("#telefoneEmpresaEntrega").val("");
	}
	else if(removedItem.inputId == 'unidade'){
		window["diretoria_resposavel"].clear();
		$("#diretoria_resposavel option").remove();
		reloadZoomFilterValues("diretoria_resposavel", "unidade, ")
	}
	else if(removedItem.inputId == 'descricaoCentroCusto'){
		$("#idCentroCusto").val('')
	}
	else if(removedItem.inputId == 'contrato_area'){
		$("#CN9_DEPART").val("")
	}
	else if(removedItem.inputId == 'contrato_gestor'){
		$("#CN9_GESTC").val("")
	}
	else if(removedItem.inputId.match(/___/)){
        let id = removedItem.inputId.split("___")[0]
        let index = removedItem.inputId.split("___")[1]
        if(id == 'descricaoEmpresaRateio'){
			$("#codigoEmpresaRateio___"+index).val('')
		}
        else if(id == 'produto'){
        	myLoading.show();
        	
        	setTimeout(()=>{
        		tools.produtos.limpaFilhos($("#"+removedItem.inputId).closest("tr").find("[name*=codigoProduto___]").val());
        		$("#codigoProduto"+"___"+index).val('');
    			$("#unidadeMedidaProduto"+"___"+index).val('');
    			//$("#produto_entrega"+"___"+index).val('');
    			$("#produto_saldo"+"___"+index).val('');
    			$("#unidadeMedidaProduto"+"___"+index).val('');
    			$("#produto_qtd"+"___"+index).val('');
    			$("#produto_vlUnitario"+"___"+index).val('');
    			$("#produto_vlTotal"+"___"+index).val('');
    			$("#produto_marcas"+"___"+index).val('');
    			$("#produto_observacao"+"___"+index).val('');
    			somarValores();
    			
    			myLoading.hide();
        	},200)
			
		}
        else if(id == "A2_COD"){
        	window["A2_NOME"+"___"+index].clear();
        	window["A2_CGC"+"___"+index].clear();
    		$("#A2_LOJA"+"___"+index).val("");
        }
        else if(id == "A2_NOME"){
        	window["A2_COD"+"___"+index].clear();
        	window["A2_CGC"+"___"+index].clear();
    		$("#A2_LOJA"+"___"+index).val("");
        }
        else if(id == "A2_CGC"){
        	window["A2_COD"+"___"+index].clear();
        	window["A2_NOME"+"___"+index].clear();
        	$("#A2_LOJA"+"___"+index).val("");
        }
    }
	else if(removedItem.inputId == 'condicaoSC'){
		$("#idCondicaoPagamento").val("")
	}
	else if(removedItem.inputId == 'condicaoPagto'){
		$("#cond_pagto").val("")
	}
	else if(removedItem.inputId == 'filialPEntregaSC'){
		$("#idFilialEntrega").val("")
	}

}