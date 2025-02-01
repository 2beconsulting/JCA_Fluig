	function validateForm(form) {
    var WKNumState = parseInt(getValue("WKNumState"))
    var WKNextState = parseInt(getValue("WKNextState"))
    var msg = ""

    if(getValue("WKCompletTask") == "true"){
    	if(WKNumState == INICIO0 || WKNumState == INICIO1 || WKNumState == REVISAR_SOLICITACAO || WKNumState == TRATAR_ERRO || WKNumState == 260){
            
            if( form.getValue('unidade') == null || form.getValue('unidade') == ''){
                msg += 'O campo "Unidade" é obrigatório o preenchimento.<br>'
            }
            if( form.getValue('diretoria_resposavel') == null || form.getValue('diretoria_resposavel') == ''){
                msg += 'O campo "Diretoria Responsável" é obrigatório o preenchimento.<br>'
            }
            if( form.getValue('regional') == null || form.getValue('regional') == ''){
                msg += 'O campo "Regional" é obrigatório o preenchimento.<br>'
            }
            if( form.getValue('descricaoEmpresa') == null || form.getValue('descricaoEmpresa') == ''){
                msg += 'O campo "Empresa Origem" é obrigatório o preenchimento.<br>'
            }
            if( form.getValue('cnpjEmpresa') == null || form.getValue('cnpjEmpresa') == ''){
                msg += 'O campo "CNPJ" é obrigatório o preenchimento.<br>'
            }
            if( form.getValue('telefone_empresa') == null || form.getValue('telefone_empresa') == ''){
                msg += 'O campo "Telefone" é obrigatório o preenchimento.<br>'
            }
            if( form.getValue('ramal_empresa') == null || form.getValue('ramal_empresa') == ''){
                msg += 'O campo "Ramal" é obrigatório o preenchimento.<br>'
            }
            if( form.getValue('descricaoEmpresaEntrega') == null || form.getValue('descricaoEmpresa') == ''){
                msg += 'O campo "Empresa Entrega" é obrigatório o preenchimento.<br>'
            }
            if( form.getValue('tipoSc') == null || form.getValue('tipoSc') == ''){
                msg += 'O campo "Tipo Compra" é obrigatório o preenchimento.<br>'
            }
            else if( form.getValue('tipoSc') == "5"){ // Regularização
            	if( form.getValue('C1_ZPRECAR') == null || form.getValue('C1_ZPRECAR') == ''){
                    msg += 'O campo "Prefixo Carro" é obrigatório o preenchimento.<br>'
                }
            }
            else if( form.getValue('tipoSc') == "6"){ // VTR
            	if( form.getValue('C1_ZPRECAR') == null || form.getValue('C1_ZPRECAR') == ''){
                    msg += 'O campo "Prefixo Carro" é obrigatório o preenchimento.<br>'
                }
            }
            if( form.getValue('tipoSc') != "5"){ // Diferente de Regularização
                if( form.getValue('data_necessidade') == null || form.getValue('data_necessidade') == ''){
                    msg += 'O campo "Data Necessidade" é obrigatório o preenchimento.<br>'
                }
                if( form.getValue('data_entrega') == null || form.getValue('data_entrega') == ''){
                    msg += 'O campo "Data Entrega" é obrigatório o preenchimento.<br>'
                }  

                if( form.getValue('havera_rateio') == null || form.getValue('havera_rateio') == ''){
                    msg += 'O campo "Haverá Rateio?" é obrigatório o preenchimento.<br>'
                }
                else if(form.getValue('havera_rateio') == 'sim'){
                    var tabelaRateio = form.getChildrenIndexes("tabelaRateio")
                    if(tabelaRateio.length < 2){
                        msg += 'Incluir no mínimo 02 rateios.<br>'
                    }
                    else{
                        var totalRateio = 0;
                        for(var i = 0; i < tabelaRateio.length; i++){
                            var descricaoEmpresaRateio = String(form.getValue('descricaoEmpresaRateio___' + tabelaRateio[i]))
                            if( descricaoEmpresaRateio == null || descricaoEmpresaRateio == ''){
                                msg += 'O campo "Empresa" é obrigatório o preenchimento.<br>'
                            }
                            var percentualEmpresaRateio = String(form.getValue('percentualEmpresaRateio___' + tabelaRateio[i]))
                            
                            if( percentualEmpresaRateio == null || percentualEmpresaRateio == ''){
                                msg += 'O campo "Percentual" é obrigatório o preenchimento.<br>'
                            }else{
                                totalRateio += parseFloat(percentualEmpresaRateio.replace("%",""));
                            }
                        }
                        
                        if(totalRateio < 100){
                            msg += ("O total do rateio é menor do que 100%")
                        }
                        else if(totalRateio > 100){
                            msg += ("O total do rateio é maior do que 100%")
                        }
                    }
                    
                }
            }
            else{
                if( form.getValue('data_emissao') == null || form.getValue('data_emissao') == ''){
                    msg += 'O campo "Data Emissão" é obrigatório o preenchimento.<br>'
                }
                if( form.getValue('cond_pagto') == null || form.getValue('cond_pagto') == ''){
                    msg += 'O campo "Condição de Pagamento" é obrigatório o preenchimento.<br>'
                }
            }
            
            if( form.getValue('valor_total') == null || form.getValue('valor_total') == ''){
                msg += 'O campo "Valor Total" é obrigatório o preenchimento.<br>'
            }
            if( form.getValue('especificacao_tecnica_solic') == null || form.getValue('especificacao_tecnica_solic') == ''){
                msg += 'O campo "Especificação Técnica" é obrigatório o preenchimento.<br>'
            }
            if( form.getValue('descricaoCentroCusto') == null || form.getValue('descricaoCentroCusto') == ''){
                msg += 'O campo "Centro Custo" é obrigatório o preenchimento.<br>'
            }
            if( form.getValue('localRecebimento') == null || form.getValue('localRecebimento') == ''){
                msg += 'O campo "Local de recebimento / Visita técnica" é obrigatório o preenchimento.<br>'
            }
            if( form.getValue('responsavel_recebimento') == null || form.getValue('responsavel_recebimento') == ''){
                msg += 'O campo "Responsável Recebimento / Atendimento" é obrigatório o preenchimento.<br>'
            }
            

            if( form.getValue('justificativa_solicitacao') == null || form.getValue('justificativa_solicitacao') == ''){
                msg += 'O campo "Justificativa" é obrigatório o preenchimento.<br>'
            }

            var tabelaProduto = form.getChildrenIndexes("tabelaProduto")
            if(tabelaProduto.length == 0){
                msg += 'Incluir no mínimo 01 produto.<br>'
            }
            for(var i = 0; i < tabelaProduto.length; i++){
                var produto = String(form.getValue('produto___' + tabelaProduto[i]))
                if( produto == null || produto == ''){
                    msg += 'O campo "Produto" é obrigatório o preenchimento.<br>'
                }
                var produto_qtd = String(form.getValue('produto_qtd___' + tabelaProduto[i]))
                if( produto_qtd == null || produto_qtd == ''){
                    msg += 'O campo "Quantidade" é obrigatório o preenchimento.<br>'
                }
                var produto_vlUnitario = String(form.getValue('produto_vlUnitario___' + tabelaProduto[i]))
                if( produto_vlUnitario == null || produto_vlUnitario == ''){
                    msg += 'O campo "Valor Unitário" é obrigatório o preenchimento.<br>'
                }
            }
            
    	}
    	else if(WKNumState == 191 && WKNextState == 3){
    		if( form.getValue('observacoes') == null || form.getValue('observacoes') == ''){
                msg += 'O campo "Observações" é obrigatório o preenchimento.<br>'
            }
    	}
        else if(WKNumState == APROVAR_SOLICITACAO){
            if( form.getValue('decisaoAprovador') == null || form.getValue('decisaoAprovador') == ''){
                msg += 'O campo "Aprovação" é obrigatório o preenchimento.<br>'
            }
            if(form.getValue('decisaoAprovador') == 'nao' || form.getValue('decisaoAprovador') == 'retornar'){
                if( form.getValue('descReprovAprov') == null || form.getValue('descReprovAprov') == ''){
                    msg += 'O campo "Motivo" é obrigatório o preenchimento.<br>'
                }
            }
        }
        else if(WKNumState == PREENCHER_SC || WKNumState == 76 || WKNumState == 80 || WKNumState == 105 || WKNumState == 148){
        	
        	var decisao = form.getValue("decisaoComprador");
        	
        	if(decisao == ""){
                msg += 'O campo "Decisão?" é obrigatório o preenchimento.<br>'
        	}
        	else if(decisao == "Prosseguir"){ // Gerar Solicitação de Compra aprovado
        		if(form.getValue("tipoSc") != "5"){
        			if( form.getValue('especificacao_tecnica') == null || form.getValue('especificacao_tecnica') == ''){
                        msg += 'O campo "Especificação Técnica" é obrigatório o preenchimento.<br>'
                    }
        			if( form.getValue('validade_cotacao') == null || form.getValue('validade_cotacao') == ''){
                        msg += 'O campo "Validade (dias)" é obrigatório o preenchimento.<br>'
                    }
                    if( form.getValue('dataTerminoSolicitacaoCotacao') == null || form.getValue('dataTerminoSolicitacaoCotacao') == ''){
                        msg += 'O campo "Data término cotação" é obrigatório o preenchimento.<br>'
                    }
        		}
        		
        		var tabFornecedor = form.getChildrenIndexes("tabFornecedor");
                if(tabFornecedor.length == 0){
                	msg += "É necessário possuir ao menos 1 fornecedor incluído!<br>";
                }else{
                	if(tools.validaFornecedorVazio(form)){
                		msg += 'Não é permitido prosseguir com linha de fornecedor sem seleção.<br>';
                	}
                }

                if(form.getValue("tipoSc") == "5"){
                	var vldReg = tools.validaRegularizacao(form);
                	if(vldReg.problem){
                		msg += vldReg.msgError;
                	}
                	
                	if(tools.validaTESNecessarias(form)){
                		msg += "Existem TES pendente de definição <br>";
                	}
                }
        	}
        	else{ // Devolver para Solicitante ou Questionar Solicitante
        		if(decisao == "Prosseguir"){
        			if( form.getValue('novaDataVencCotacao') == null || form.getValue('novaDataVencCotacao') == ''){
                        msg += 'O campo "Vencimento Cotação" é obrigatório o preenchimento para Nova rodada.<br>'
                    }
        		}
        		if( form.getValue('decisaoComprador_motivo') == null || form.getValue('decisaoComprador_motivo') == ''){
                    msg += 'O campo "Justificativa" é obrigatório o preenchimento para "'+ (decisao == "Questionar" ? "Questionar Solicitante" : "Devolver ao Solicitante") +'".<br>'
                }
        	}

        }
        else if(WKNumState == RESPONDER_COMPRAS){ // Solicitante - Responder questionamento de Compras
        	if( form.getValue('data_necessidade') == null || form.getValue('data_necessidade') == ''){
                msg += 'O campo "Data necessidade" é obrigatório o preenchimento.<br>'
            }
        	if( form.getValue('especificacao_tecnica') == null || form.getValue('especificacao_tecnica') == ''){
                msg += 'O campo "Especificação técnica" é obrigatório o preenchimento.<br>'
            }
        	if( form.getValue('localRecebimento') == null || form.getValue('localRecebimento') == ''){
                msg += 'O campo "Local de recebimento / Visita técnica" é obrigatório o preenchimento.<br>'
            }
        	if( form.getValue('responsavel_recebimento') == null || form.getValue('responsavel_recebimento') == ''){
                msg += 'O campo "Responsável pelo recebimento / Atendimento" é obrigatório o preenchimento.<br>'
            }
        	if( form.getValue('justificativa_solicitacao') == null || form.getValue('justificativa_solicitacao') == ''){
                msg += 'O campo "Justificativa da Solicitação" é obrigatório o preenchimento.<br>'
            }
        	if( form.getValue('observacoes') == null || form.getValue('observacoes') == ''){
                msg += 'O campo "Observações" é obrigatório o preenchimento.<br>'
            }
        }
        else if(WKNumState == VALIDAR_TECNICAMENTE){
        	var pendencias = false;

        	form.getChildrenIndexes("tabValidacaoTecnica").forEach(function(idx,i,arr){
    			if(form.getValue("VT_DECISAO___"+idx) == ""){
    				pendencias = true;
    				arr.length = i
    			}

    		})
    		
    		if(pendencias) msg += "É necessário validar todos fornecedores antes de prosseguir!"
        }
        else if(WKNumState == ANALISAR_COTACAO_VENCEDORA){
        	if(form.getValue("validacao_tecnica_necessaria") == "true"){
            	if(form.getChildrenIndexes("tabValidacaoTecnica").length < 1){
            		msg += "É necessário preparar a Validação Técnica para prosseguir com esta decisão! <br>";
            	}
        	}
        	
        	if(tools.validaFornecedorVazio(form)){
        		msg += 'Não é permitido prosseguir com linha de fornecedor sem seleção.<br>'
        	}
        	
        	
        	if( form.getValue('ciclo_aprovado') == null || form.getValue('ciclo_aprovado') == ''){
        		if(!tools.validacaoPendente(form)){
        			msg += 'O campo "Decisão comprador" é obrigatório o preenchimento.<br>'
        		}
                
            }
            else if(form.getValue('ciclo_aprovado') == 'novo'){
            	if(form.getValue('novaDataVencCotacao') == ''){
            		msg += 'O campo "Vencimento Cotação" é obrigatório o preenchimento.<br>'
            	} 
            	if(form.getValue('obsComprador') == ''){
            		msg += 'O campo "Justificativa" é obrigatório o preenchimento.<br>'
            	} 
            	if(tools.validaFornecedorVazio(form)){
            		msg += 'Não é permitido prosseguir com linha de fornecedor sem seleção.<br>';
            	}
            }
            else if(form.getValue('ciclo_aprovado') == 'nao'){
            	if(form.getValue('obsComprador') == ''){
            		msg += 'O campo "Justificativa" é obrigatório o preenchimento.<br>'
            	} 
            }
            else if(form.getValue('ciclo_aprovado') == 'sim'){
            		if(!tools.validacaoPendente(form)){
            			if(form.getValue('tipo_pc_contrato') == ''){
                    		msg += 'O campo "Tipo" do painel "Histórico de cotação" é obrigatório o preenchimento.<br>'
                    	} 
                    	if(tools.validaFornecedorExcluidoCiclo(form)){
                    		msg += 'Não é permitido excluir fornecedor na rodada que está sendo aprovada.<br>'
                    	}
                    	/*if(tools.validaFornecedorVazio(form)){
                    		msg += 'Não é permitido prosseguir com linha de fornecedor sem seleção.<br>'
                    	}*/
                    	if(tools.validaTESNecessarias(form)){
                    		msg += 'Existem TES necessárias de preenchimento em aberto. Necessário verificar antes de prosseguir!<br>'
                    	}
                    	if(!tools.validaVencedorComprador(form)){
                    		msg += "Apenas serão efetivados o pedido para as cotações que tiverem sido definida como vencedor pelo comprador! É necessário selecionar ao menos um vencedor pelo comprador<br>"
                    	}
            		}
           	
            }
            
            var tabFornecedor = form.getChildrenIndexes("tabFornecedor");
            
            tabFornecedor.forEach(function(idx,i,arr){
            	if(form.getValue('A2_CGC___'+idx) == "" && form.getValue("CICLO_REMOVIDO___"+idx) == ""){
            		msg += "O fornecedor da linha " + (i+1) + " não está preenchido";
            	}
            })
        }

        else if(WKNumState == APROVAR_MENOR_VALOR){
            if( form.getValue('decisaoAprovadorValorMenor') == null || form.getValue('decisaoAprovadorValorMenor') == ''){
                msg += 'O campo "Aprovação" é obrigatório o preenchimento.<br>'
            }
            if(form.getValue('decisaoAprovadorValorMenor') == 'nao' || form.getValue('decisaoAprovadorValorMenor') == 'retornar' || form.getValue('decisaoAprovadorValorMenor') == 'compras'){
                if( form.getValue('descReprovAprovValorMenor') == null || form.getValue('descReprovAprovValorMenor') == ''){
                    msg += 'O campo "Motivo" é obrigatório o preenchimento.<br>'
                }
            }
        }

        else if(WKNumState == APROVAR_COTACAO){
            if( form.getValue('decisaoAprovadorCotacao') == null || form.getValue('decisaoAprovadorCotacao') == ''){
                msg += 'O campo "Aprovação" é obrigatório o preenchimento.<br>'
            }
            if(form.getValue('decisaoAprovadorCotacao') == 'nao' || form.getValue('decisaoAprovadorCotacao') == 'retornar'){
                if( form.getValue('descReprovAprovCotacao') == null || form.getValue('descReprovAprovCotacao') == ''){
                    msg += 'O campo "Motivo" é obrigatório o preenchimento.<br>'
                }
            }
        }
        else if(WKNumState == 224){ // Liberar Pedido
            if( form.getValue('decisaoLiberarPedido') == null || form.getValue('decisaoLiberarPedido') == ''){
                msg += 'O campo "Libera Pedido?" é obrigatório o preenchimento.<br>'
            }
            else if(form.getValue('decisaoLiberarPedido_obs') == 'nao'){
                if( form.getValue('decisaoLiberarPedido_obs') == null || form.getValue('decisaoLiberarPedido_obs') == ''){
                    msg += 'O campo "Motivo" é obrigatório o preenchimento.<br>'
                }
            }
        }
        else if(WKNumState == 110){ // Acompanhar Juridico
        	if(WKNextState == 112){
        		if(form.getValue("observacoes") == ""){
        			msg += "É necessário inserir uma Observação para encaminhar a solicitação para o Solicitante"
        		}
        	}
        }
        else if(WKNumState == 112){
        	if(WKNextState == 110){
        		if(form.getValue("observacoes") == ""){
        			msg += "É necessário inserir uma Observação para devolver a solicitação para o Comprador"
        		}
        	}
        }
        else if(WKNumState == 342){ // Inserir dados do contrato
        	if(form.getValue('tipo_pc_contrato') == 'contrato'){
        		if( form.getValue('CN9_DTINIC') == null || form.getValue('CN9_DTINIC') == ''){
                    msg += 'O campo "Início Vigência" é obrigatório o preenchimento.<br>'
                }
        		if( form.getValue('CN9_UNVIGE') == null || form.getValue('CN9_UNVIGE') == ''){
                    msg += 'O campo "Unidade de Vigência" é obrigatório o preenchimento.<br>'
                }
        		if( form.getValue('CN9_VIGE') == null || form.getValue('CN9_VIGE') == ''){
                    msg += 'O campo "Vigência" é obrigatório o preenchimento.<br>'
                }
        		if( form.getValue('CN9_NATURE') == null || form.getValue('CN9_NATURE') == ''){
                    msg += 'O campo "Natureza Financeira" é obrigatório o preenchimento.<br>'
                }
        		if( form.getValue('CN9_DEPART') == null || form.getValue('CN9_DEPART') == ''){
                    msg += 'O campo "Área Contratante" é obrigatório o preenchimento.<br>'
                }
        		/* Temporariamente sem validar pois não temos ainda uma consulta confiável*/
        		if( form.getValue('CN9_GESTC') == null || form.getValue('CN9_GESTC') == ''){
                    msg += 'O campo "Gestor" é obrigatório o preenchimento.<br>'
                }
        		
        		/*
        		if( form.getValue('CN9_TPCTO') == null || form.getValue('CN9_TPCTO') == ''){
                    msg += 'O campo "Tipo do Contrato" é obrigatório o preenchimento.<br>'
                }
        		
        		if( form.getValue('CNA_TIPPLA') == null || form.getValue('CNA_TIPPLA') == ''){
                    msg += 'O campo "Tipo da Planilha" é obrigatório o preenchimento.<br>'
                }
                */
        		if( form.getValue('contrato_primeira_medicao') == null || form.getValue('contrato_primeira_medicao') == ''){
                    msg += 'O campo "Primeira Medição" é obrigatório o preenchimento.<br>'
                }
        		if( form.getValue('contrato_competencia') == null || form.getValue('contrato_competencia') == ''){
                    msg += 'O campo "Competência Inicial" é obrigatório o preenchimento.<br>'
                }
        		if( form.getValue('contrato_financeiro') == null || form.getValue('contrato_financeiro') == ''){
                    msg += 'O campo "Gera Cronograma?" é obrigatório o preenchimento.<br>'
                }
        		else if( form.getValue('contrato_financeiro') == "1" ){
        			if( form.getValue('contrato_cronograma') == null || form.getValue('contrato_cronograma') == ''){
                        msg += 'O campo "Período" é obrigatório o preenchimento.<br>'
                    }
            		if( form.getValue('contrato_parcelas') == null || form.getValue('contrato_parcelas') == ''){
                        msg += 'O campo "Parcelas" é obrigatório o preenchimento.<br>'
                    }
        		}
        		
        	}
        }
    	
    }
   // throw "<br>" + msg;
    if (msg != '') {
        throw "<br>" + msg;
    }
}