 var dinamica = {
	init: function(){
		$("div.panel").hide();
		$("#dados_solicitante").show();
		$("#dados_solicitacao").show();
		$("#divTabelaProduto").show();
		$("#marcas_indicadas").show();
		$("#fornecedores_sugeridos").show();
		$("#dados_observacoes").show();
		$("#tabs4Intrack").hide();
		
		if($("#data_necessidade").get(0).tagName.toUpperCase() == "INPUT") FLUIGC.calendar("#data_necessidade");
		if($("#data_emissao").get(0).tagName.toUpperCase() == "INPUT") FLUIGC.calendar("#data_emissao");
		$("#data_necessidade").on("keydown",function(){return false})
		
		$('.hideInserir').hide()
		$('.hideLixeira').hide()
		$(".analisa-cotacao").hide();
		
		tools.solicitacao.carregaDados();
		tools.cotacao.init();

		switch(WKNumState){
		case 0:
		case 1: // Inicio
			$('.hideInserir').show();
			$('.hideLixeira').show();
			$("#telefone_empresa").on("keyup",tools.formata.mascara.phone)
			$("[name=havera_rateio]").on("change",tools.rateio.dinamica);
			$("[name=tipoSc]").on("change",()=>{tools.calculaPrazoEntrega();dinamica.tipoSC()});
			
			break;
		case 2: // Aprovar solicitação
			$("#aprovacao_inicial").show();
			tools.aprov1();
			$("[name=decisaoAprovador]").on("change",tools.aprov1);
			tools.rateio.dinamica();
			break;
		case 191: // Verificar Problema Aprovador
			tools.aprovacao.msgErro();
			break;
		case 3: // Solicitante - Revisar solicitação
			$("[name=havera_rateio]").on("change",tools.rateio);
			tools.rateio.dinamica();
			$("#aprovacao_inicial").show();
			$("[name^=produto_qtd___],[name^=produto_vlUnitario___]").on("keyup",somarValores);
			$(".hideLixeira").show()
			
			if($("[name='_decisaoAprovador']:checked,[name='decisaoAprovador']:checked").val() == "retornar"){
				$("a[href='#tabs-aprovHistory']").click()
				$("a[href='#tabs-aprovAtual']").closest("li").hide();
				$("#tabs-aprovAtual").hide();
			}else{
				$("#aprovacao_inicial").hide();
			}

			break;
		case 65:
		case 21:
		case 163:
			$("#panelSolicitacao").show();
			$("#validade_cotacao").on("change",tools.calculaTerminoCotacao);
			$("#validade_cotacao").on("keyup",tools.calculaTerminoCotacao);
			$("#panelFornecedores").show();
			$("#aprovacao_inicial").show();
			$("[href='#tabs-aprovAtual']").hide();
			dinamica.preencherDadosSC.init();
			
			break;
		case 83:
			break;
		case 26: //Analisar Cotação
		case 148:
		case 105:
		case 76:
		case 80:
			dinamica.analisarCotacao.init();
			tools.validacaoTecnica.init();
			dinamica.tipoDoc.init();
			if(usuarioCompras && $("[name=decisaoLiberarPedido]:checked,[name=_decisaoLiberarPedido]:checked").val() == "nao") $("#panelCompradores").show()
			if($("[name^=_aprovValorMenor_ciclo___]").length > 0){
				$("#aprovacao_ValorMenor").show();
				$("[href='#tabs-aprovValorMenor']").closest("li").hide();
				$("[href='#tabs-aprovHistoryValorMenor']").trigger("click")
			}
			break;
		case 35:
			$("#mapa_cotacao").show();
			break;
		case 40:
			$("#aprovacao_ValorMenor").show();
			$("#mapa_cotacao").show();
			tools.aprov2();
			$("[name=decisaoAprovador2]").on("change",tools.aprov2);
			
			break;
		case 121:
			$("#aprovacao_Cotacao").show();
			tools.aprov3();
			$("[name=decisaoAprovador3]").on("change",tools.aprov3);
			dinamica.analisarCotacao.init();
			break;
		case 134:
			$("#panelValidacaoTecnica").show();
			tools.validacaoTecnica.init();
			break;
		case 224: // Liberar Pedido
			tools.TES.carregaOptions()
			$("#panelCompradores").show();
			dinamica.analisarCotacao.init();
			$("#panelFornecedores").hide();
			if($("[name*=validacao_tecnica_necessaria]:checked").val() == "true") {
				tools.validacaoTecnica.view.read();
				$("#panelValidacaoTecnica").show();
			}
			
			break;
		case 71: //Avaliar solicitação
		case 70: //Fim
			if(usuarioCompras) $("#mapa_cotacao").show();
			dinamica.Avaliacao();
			$(".my-rating").on("click",dinamica.Avaliacao);
			if($("[name*=tipo_pc_contrato]:checked").val() == "contrato") $("[name*=pedidoProtheus]").siblings("label").html("Contratos")
			break;
		case 342:
			dinamica.tipoDoc.init();
			reloadZoomFilterValues("contrato_area", "CXQ_FILIAL," + $("#idEmpresa,#_idEmpresa").val());
			$("#historico_cotacao").hide();
			break;
		}
		
		dinamica.tipoSC();
		tools.produtos.habilitaBotao();
		tools.rateio.dinamica();
		//tools.solicitacao.carregaDados();
		//tools.cotacao.init();
		tools.TES.init();
		dinamica.tipoDoc.selecao();
		tools.mapa.init();
		tools.mapaCompradores.exibe();
		tools.pedidos.init();
		dinamica.ciclo.habilita();
		tools.fornecedores.habilitaAdicionar();
		tools.fSetHistorico();
		
		setTimeout(()=>{
			if($("#diretoria_resposavel").get(0).type == "select-multiple") reloadZoomFilterValues("diretoria_resposavel", "unidade,"+$("#unidade").get(0).value)
		},1000)
	},
	analisarCotacao:{
		init: function (){
			if($("[name=tipoSc]:checked,[name=_tipoSc]:checked").val() != "5") $("#historico_cotacao").show();
			$("#mapa_cotacao").show();
			$("#panelFornecedores").show();
			tools.fornecedores.habilitaAcoes();
			$("#novaDataVencCotacao").on("change",()=>{
				$("#dataTerminoSolicitacaoCotacao,#_dataTerminoSolicitacaoCotacao").val($("#novaDataVencCotacao,#_novaDataVencCotacao").val())
			})
		}
	},
	Avaliacao(){
		$('#atendimento').show();

		if($('.my-rating i').length == 0){
			FLUIGC.stars('.my-rating', {
				stars: 5,
				sizeClass: 'icon-md',
				value: parseFloat($('#avaliacao').val()),
			});
		}

		// Calcula o número de estrelas selecionadas
		var numEstrelasSelecionadas = $('.my-rating i.selected').length;

		$('#avaliacao').val(numEstrelasSelecionadas);

		if (numEstrelasSelecionadas == 0 || $('#avaliacao').val() == "") {
			$('#insatisfeito').hide();
			$('#satisfeito').hide();
		}
		else if (numEstrelasSelecionadas <= 2) {
			$('#satisfeito').hide();
			$('#insatisfeito').show();
		} else {
			$('#insatisfeito').hide();
			$('#satisfeito').show();
		}

	},
	ciclo:{
		aprovacao: function(){
			let decisao = $("[name=ciclo_aprovado]:checked").val();
			$("#obsComprador,#_obsComprador").closest(".row").hide();
			$("[name=tipo_pc_contrato],[name=_tipo_pc_contrato]").closest(".form-group").hide();
			$("#novaDataVencCotacao,#_novaDataVencCotacao").closest(".form-group").hide();

			
			if(decisao == "novo"){
				$("#obsComprador,#_obsComprador").closest(".row").show();
				$("#novaDataVencCotacao,#_novaDataVencCotacao").closest(".form-group").show();
			}else if(decisao == "nao"){
				$("#obsComprador,#_obsComprador").closest(".row").show();
			}else if(decisao == "sim"){
				$("[name=tipo_pc_contrato],[name=_tipo_pc_contrato]").closest(".form-group").show();
			}
			
			//if(aDados.validacaoTecnica != undefined && aDados.validacaoTecnica.associacoes != undefined) $("#panelValidacaoTecnica").show()
		},
		habilita: function(){
			dinamica.ciclo.aprovacao()
			$("[name=ciclo_aprovado]").on("change",dinamica.ciclo.aprovacao)
			FLUIGC.calendar("#novaDataVencCotacao")
		}
	},
	preencherDadosSC: {
		init(){
			if($("[name=tipoSc]:checked,[name=_tipoSc]:checked").val() == "5"){
				$("#especificacao_tecnica,#_especificacao_tecnica").closest(".form-group").hide();
				$("#validade_cotacao,#_validade_cotacao").closest(".form-group").hide();
				$("#dataTerminoSolicitacaoCotacao,#_dataTerminoSolicitacaoCotacao").closest(".form-group").hide();
			}
			tools.fornecedores.habilitaAcoes();
			tools.fornecedores.habilitaAdicionar();
		}
	},
	tipoDoc:{
		init(){
			dinamica.tipoDoc.selecao();
			$("[name*=tipo_pc_contrato],[name*=ciclo_aprovado]").on("change",dinamica.tipoDoc.selecao);
			FLUIGC.calendar("#CN9_DTINIC,#contrato_primeira_medicao")
			$("#CN9_DTINIC,#contrato_primeira_medicao").on("keydown",()=>{return false})
			dinamica.tipoDoc.cronograma()
			$("[name*=contrato_financeiro]").on("change",dinamica.tipoDoc.cronograma)
			
		},
		cronograma(){
			if($("[name*=contrato_financeiro]:checked").val() == "1"){
				$("#contrato_cronograma,#_contrato_cronograma").closest(".form-group").show();
				$("#contrato_parcelas,#_contrato_parcelas").closest(".form-group").show();
			}
			else{
				$("#contrato_cronograma,#_contrato_cronograma").closest(".form-group").hide();
				$("#contrato_parcelas,#_contrato_parcelas").closest(".form-group").hide();
			}
		},
		selecao(){
			let tipo_pc_contrato 	= $("[name*=tipo_pc_contrato]:checked").val();
			let ciclo_aprovado 		= $("[name*=ciclo_aprovado]:checked").val();
			if(tipo_pc_contrato == "contrato" && ciclo_aprovado == "sim" && WKNumState == 342){
				$("#historico_cotacao").show()
				$("#panelContrato").show()
			}else{
				$("#panelContrato").hide()
			}
		}
		
	},
	tipoSC(){
		if(
			$("[name=tipoSc]:checked,[name=_tipoSc]:checked").val() == "6" ||
			$("[name=tipoSc]:checked,[name=_tipoSc]:checked").val() == "5")
		{ // compraVTR || Regularização
			$("#C1_ZPRECAR,#_C1_ZPRECAR").closest(".form-group").show()
		}else{
			$("#C1_ZPRECAR,#_C1_ZPRECAR").closest(".form-group").hide()
		}

		if($("[name=tipoSc]:checked,[name=_tipoSc]:checked").val() == "5"){ // Regularização
			$("#data_necessidade,#_data_necessidade").closest("span").hide()
			$("#data_entrega,#_data_entrega").closest("span").hide()
			$("[name*='havera_rateio']").closest("span").hide()

			$("#data_emissao,#_data_emissao").closest("span").show()
			$("#cond_pagto,#_cond_pagto").closest("span").show()

		}
		else
		{
			$("#data_necessidade,#_data_necessidade").closest("span").show()
			$("#data_entrega,#_data_entrega").closest("span").show()
			$("[name*='havera_rateio']").closest("span").show()

			$("#data_emissao,#_data_emissao").closest("span").hide()
			$("#cond_pagto,#_cond_pagto").closest("span").hide()
		}
	}
 }