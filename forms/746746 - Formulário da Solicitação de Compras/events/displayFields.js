function displayFields(form,customHTML){
	//form.setHideDeleteButton(true);
	form.setShowDisabledFields(true);
	form.setHidePrintLink(true);

	var WKNumState = getValue("WKNumState");
	var WKUser = fluigAPI.getUserService().getCurrent();
	var atividadeAnterior = form.getValue('atividadeAnterior');
	
	customHTML.append("<script>var WKNumState ="+WKNumState+";</script>");
	customHTML.append("<script>var usuarioCompras ="+tools.usuarioCompras()+";</script>");
	customHTML.append("<script>var usuarioAtual ='"+WKUser.getFullName()+"';</script>");
	
	form.setVisibleById("panelValidacaoTecnica", false);
	
	form.setVisibleById("divTabelaRateio", false);
	var havera_rateio = form.getValue('havera_rateio');
	if(havera_rateio == 'sim') form.setVisibleById("divTabelaRateio", true);
	
	form.setVisibleById("divMotivoReprovacaoAprovador", false);
	var decisaoAprovador = form.getValue('decisaoAprovador');
	if(decisaoAprovador == 'nao' || decisaoAprovador == 'retornar') form.setVisibleById("divMotivoReprovacaoAprovador", true);
	
	form.setVisibleById("divMotivoReprovacaoAprovadorValorMenor", false);
	var decisaoAprovadorValorMenor = form.getValue('decisaoAprovadorValorMenor');
	if(decisaoAprovadorValorMenor == 'nao' || decisaoAprovadorValorMenor == 'retornar') form.setVisibleById("divMotivoReprovacaoAprovadorValorMenor", true);

	form.setVisibleById("divMotivoReprovacaoAprovadorCotacao", false);
	var decisaoAprovadorCotacao = form.getValue('decisaoAprovadorCotacao');
	if(decisaoAprovadorCotacao == 'nao' || decisaoAprovadorCotacao == 'retornar') form.setVisibleById("divMotivoReprovacaoAprovadorCotacao", true);
	
	if(WKNumState == INICIO0 || WKNumState == INICIO1 || WKNumState == REVISAR_SOLICITACAO || WKNumState == TRATAR_ERRO || WKNumState == 260){
		setInitialData(form,WKUser)

		form.setVisibleById("aprovacao_inicial", false)
		form.setVisibleById("panelSolicitacao", false)
		form.setVisibleById("historico_cotacao", false)
		form.setVisibleById("mapa_cotacao", false)
		form.setVisibleById("aprovacao_Cotacao", false)
		form.setVisibleById("aprovacao_ValorMenor", false)
		form.setVisibleById("atendimento", false)
		form.setVisibleById("divTabelaFornecedor", false)
		
		form.setValue("solicitanteSC",WKUser.fullName)
		
		if(atividadeAnterior == '4'){
			form.setVisibleById("aprovacao_inicial", true)
		}
		
	}
	else if(WKNumState == APROVAR_SOLICITACAO){
		form.setVisibleById("panelSolicitacao", false)
		form.setVisibleById("historico_cotacao", false)
		form.setVisibleById("mapa_cotacao", false)
		form.setVisibleById("aprovacao_Cotacao", false)
		form.setVisibleById("aprovacao_ValorMenor", false)
		form.setVisibleById("atendimento", false)
		
		form.setValue("dtAprovacao",newDate())
		form.setValue("nomeAprovador",WKUser.getFullName())
		form.setValue("matriculaAprovador",WKUser.getCode())
	}
	else if(WKNumState == PREENCHER_SC || WKNumState == 76 || WKNumState == 80 || WKNumState == 105 || WKNumState == 148){
		form.setVisibleById("historico_cotacao", false)
		form.setVisibleById("mapa_cotacao", false)
		form.setVisibleById("aprovacao_Cotacao", false)
		form.setVisibleById("aprovacao_ValorMenor", false)
		form.setVisibleById("atendimento", false)

		form.setValue("compradorResponsavel",WKUser.fullName)
		form.setValue("matCompradorResponsavel",getValue("WKUser"))
		form.setValue("telCompradorResponsavel",tools.usuario.getTel())
	}
	else if(WKNumState == RESPONDER_COMPRAS){
		form.setVisibleById("historico_cotacao", false)
		form.setVisibleById("mapa_cotacao", false)
		form.setVisibleById("aprovacao_Cotacao", false)
		form.setVisibleById("aprovacao_ValorMenor", false)
		form.setVisibleById("atendimento", false)
	}
	else if(WKNumState == VALIDAR_TECNICAMENTE){ 
		form.setVisibleById("panelValidacaoTecnica", true)
	}
	else if(WKNumState == ANALISAR_COTACAO_VENCEDORA){
		form.setVisibleById("aprovacao_Cotacao", false)
		form.setVisibleById("aprovacao_ValorMenor", false)
		form.setVisibleById("atendimento", false)
		
		form.setValue("filtrar_mapa","");
		form.setValue("complem_mapa","");
	}
	else if(WKNumState == APROVAR_MENOR_VALOR){
		
		form.setVisibleById("aprovacao_Cotacao", false)
		form.setVisibleById("atendimento", false)

		form.setValue("dtAprovacaoValorMenor",newDate())
		form.setValue("nomeAprovadorValorMenor",WKUser.getFullName())
		form.setValue("matriculaAprovadorValorMenor",getValue("WKUser"))
	}
	else if(WKNumState == APROVAR_COTACAO){
		form.setVisibleById("atendimento", false)

		form.setValue("dtAprovacaoCotacao",newDate())
		form.setValue("nomeAprovadorCotacao",WKUser.getFullName())
		form.setValue("matriculaAprovadorCotacao",WKUser.getCode())
	}
	
}

function setInitialData(form,WKUser){
  var userName = WKUser.getFullName()
  var userId = WKUser.getCode()
  var userLogin = WKUser.getLogin()
  var userEmail = WKUser.getEmail()
  form.setValue("nome", userName )
  form.setValue("dataAbertura", newDate() )
  form.setValue("idSolicitante", userId )
  form.setValue("matriculaSolicitante", userId )
  form.setValue("loginSolicitante", userLogin )
  form.setValue("emailSolicitante", userEmail )
  var dataset = DatasetFactory.getDataset('DS_SRA',null,[DatasetFactory.createConstraint( 'RA_MAT', userId, userId, ConstraintType.MUST )],null)
  if(dataset.rowsCount > 0) form.setValue("cpfSolicitante", dataset.getValue(0, 'RA_CIC') )
}

function newDate() {
  return (new java.text.SimpleDateFormat('dd/MM/yyyy')).format(new Date())
}