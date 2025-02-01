function servicetask16(attempt, message) {
	log.info(">> servicetask16 <<");

	var WKNumProces = getValue("WKNumProces");
	log.info("-- WKNumProces: " + WKNumProces);
	var parentInstance = hAPI.getParentInstance(WKNumProces);
	log.info("-- parentInstance: " + parentInstance);
	//var map 			= hAPI.getCardData(parentInstance);
	var formPrincipal = tools.SQL.exec(
		"SELECT dataInicioSolicitacaoCotacao, dataTerminoSolicitacaoCotacao, numeroSolicitacao, compradorResponsavel, matCompradorResponsavel, matCompradorResponsavel, telCompradorResponsavel, obsComprador, especificacao_tecnica, ciclo_atual, idPastaGED, idEmpresa, descricaoEmpresa, cnpjEmpresa, cepEmpresaOrigem, estadoEmpresaOrigem, cidadeEmpresaOrigem, bairroEmpresaOrigem, enderecoEmpresaOrigem, telefone_empresa, idEmpresaEntrega, descricaoEmpresaEntrega, cnpjEmpresaEntrega, cepEmpresaEntrega, estadoEmpresaEntrega, cidadeEmpresaEntrega, bairroEmpresaEntrega, enderecoEmpresaEntrega, telefoneEmpresaEntrega, C8_NUM \
							FROM "+ hAPI.getAdvancedProperty("formPrincipal") + " ML \
							INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
							INNER JOIN PROCES_WORKFLOW PW ON PW.NR_DOCUMENTO_CARD = DOC.NR_DOCUMENTO \
							WHERE PW.NUM_PROCES = "+ parentInstance + " AND DOC.VERSAO_ATIVA = 1"
	)

	if (formPrincipal.length > 0) {
		var map = formPrincipal[0];
		log.dir(map);

		hAPI.setCardValue("cotacao_abertura", map["dataInicioSolicitacaoCotacao"]);
		hAPI.setCardValue("cotacao_encerramento", map["dataTerminoSolicitacaoCotacao"]);
		hAPI.setCardValue("solicitacao_compra", map["numeroSolicitacao"]);
		hAPI.setCardValue("numeroSolicitacao", getValue("WKNumProces").toString());
		hAPI.setCardValue("compradorResponsavel", map["compradorResponsavel"]);
		hAPI.setCardValue("matCompradorResponsavel", map["matCompradorResponsavel"]);
		hAPI.setCardValue("mailCompradorResponsavel", tools.getEmail(map["matCompradorResponsavel"]));
		hAPI.setCardValue("telCompradorResponsavel", map["telCompradorResponsavel"]);
		hAPI.setCardValue("obsComprador", map["obsComprador"]);
		hAPI.setCardValue("especificacao_tecnica", map["especificacao_tecnica"]);
		hAPI.setCardValue("ciclo_atual", map["ciclo_atual"]);
		hAPI.setCardValue("idPastaGED_SC", map["idPastaGED"]);
		hAPI.setCardValue("idPastaGED", anexos.criaPasta(getValue("WKNumProces").toString(), map["idPastaGED"]));

		hAPI.setCardValue("idEmpresa", map["idEmpresa"]);
		hAPI.setCardValue("descricaoEmpresa", map["descricaoEmpresa"]);
		hAPI.setCardValue("cnpjEmpresa", map["cnpjEmpresa"]);
		hAPI.setCardValue("cepEmpresaOrigem", map["cepEmpresaOrigem"]);
		hAPI.setCardValue("estadoEmpresaOrigem", map["estadoEmpresaOrigem"]);
		hAPI.setCardValue("cidadeEmpresaOrigem", map["cidadeEmpresaOrigem"]);
		hAPI.setCardValue("bairroEmpresaOrigem", map["bairroEmpresaOrigem"]);
		hAPI.setCardValue("enderecoEmpresaOrigem", map["enderecoEmpresaOrigem"]);
		hAPI.setCardValue("telefoneEmpresaOrigem", map["telefone_empresa"]);
		hAPI.setCardValue("idEmpresaEntrega", map["idEmpresaEntrega"]);
		hAPI.setCardValue("descricaoEmpresaEntrega", map["descricaoEmpresaEntrega"]);
		hAPI.setCardValue("cnpjEmpresaEntrega", map["cnpjEmpresaEntrega"]);
		hAPI.setCardValue("cepEmpresaEntrega", map["cepEmpresaEntrega"]);
		hAPI.setCardValue("estadoEmpresaEntrega", map["estadoEmpresaEntrega"]);
		hAPI.setCardValue("cidadeEmpresaEntrega", map["cidadeEmpresaEntrega"]);
		hAPI.setCardValue("bairroEmpresaEntrega", map["bairroEmpresaEntrega"]);
		hAPI.setCardValue("enderecoEmpresaEntrega", map["enderecoEmpresaEntrega"]);
		hAPI.setCardValue("telefoneEmpresaEntrega", map["telefoneEmpresaEntrega"]);

		var dataSource = "jdbc/AppDS";
		var newDataset = DatasetBuilder.newDataset();
		var ic = new javax.naming.InitialContext();
		var ds = ic.lookup(dataSource);

		try {
			var conn = ds.getConnection();
			var stmt = conn.createStatement();
			//var rs = stmt.executeQuery(query);

			var rsTES = stmt.executeQuery(
				"SELECT ML.* FROM " + hAPI.getAdvancedProperty("tabTES") + " ML \
	    			INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
	    			INNER JOIN PROCES_WORKFLOW PW ON PW.NR_DOCUMENTO_CARD = DOC.NR_DOCUMENTO \
	    			WHERE PW.NUM_PROCES = "+ parentInstance + " AND DOC.VERSAO_ATIVA = 1"
			);

			while (rsTES.next()) {
				var childData = new java.util.HashMap();
				childData.put("TES_A2_COD", "" + rsTES.getObject("TES_A2_COD") ? rsTES.getObject("TES_A2_COD") : "");
				childData.put("TES_A2_LOJA", "" + rsTES.getObject("TES_A2_LOJA") ? rsTES.getObject("TES_A2_LOJA") : "");
				childData.put("TES_A2_CGC", "" + rsTES.getObject("TES_A2_CGC") ? rsTES.getObject("TES_A2_CGC") : "");
				childData.put("TES_B1_COD", "" + rsTES.getObject("TES_B1_COD") ? rsTES.getObject("TES_B1_COD") : "");
				childData.put("TES_CODIGO", "" + rsTES.getObject("TES_CODIGO") ? rsTES.getObject("TES_CODIGO") : "");
				childData.put("TES_COMPRADOR", "" + rsTES.getObject("TES_COMPRADOR") ? rsTES.getObject("TES_COMPRADOR") : "");
				hAPI.addCardChild("tabTES", childData);
			}

			log.info("-- fim rsTES");

			var rsProduto = stmt.executeQuery(
				"SELECT ML.* FROM " + hAPI.getAdvancedProperty("tabProduto") + " ML \
	    			INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
	    			INNER JOIN PROCES_WORKFLOW PW ON PW.NR_DOCUMENTO_CARD = DOC.NR_DOCUMENTO \
	    			WHERE PW.NUM_PROCES = "+ parentInstance + " AND DOC.VERSAO_ATIVA = 1"
			);

			while (rsProduto.next()) {
				var childData = new java.util.HashMap();
				childData.put("B1_COD", "" + rsProduto.getObject("B1_COD") ? rsProduto.getObject("B1_COD") : "");
				childData.put("B1_DESC", "" + rsProduto.getObject("B1_DESC") ? rsProduto.getObject("B1_DESC") : "");
				childData.put("B1_GRUPO", "" + rsProduto.getObject("B1_GRUPO") ? rsProduto.getObject("B1_GRUPO") : "");
				childData.put("B1_LOCPAD", "" + rsProduto.getObject("B1_LOCPAD") ? rsProduto.getObject("B1_LOCPAD") : "");
				childData.put("B1_MSBLQL", "" + rsProduto.getObject("B1_MSBLQL") ? rsProduto.getObject("B1_MSBLQL") : "");
				childData.put("B1_TIPO", "" + rsProduto.getObject("B1_TIPO") ? rsProduto.getObject("B1_TIPO") : "");
				childData.put("B1_UM", "" + rsProduto.getObject("B1_UM") ? rsProduto.getObject("B1_UM") : "");
				childData.put("B1_ZMARCA", "" + rsProduto.getObject("B1_ZMARCA") ? rsProduto.getObject("B1_ZMARCA") : "");
				childData.put("ZPM_DESC", "" + rsProduto.getObject("ZPM_DESC") ? rsProduto.getObject("ZPM_DESC") : "");
				childData.put("B1_UPRC", "" + rsProduto.getObject("B1_UPRC") ? rsProduto.getObject("B1_UPRC") : "");
				childData.put("B1_PAI", "" + rsProduto.getObject("B1_PAI") ? rsProduto.getObject("B1_PAI") : "");
				hAPI.addCardChild("tabProduto", childData);
			}

			log.info("-- fim rsProduto");

			var rsFornProd = stmt.executeQuery(
				"SELECT ML.* FROM " + hAPI.getAdvancedProperty("tabFornecedorProduto") + " ML \
	    			INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
	    			INNER JOIN PROCES_WORKFLOW PW ON PW.NR_DOCUMENTO_CARD = DOC.NR_DOCUMENTO \
	    			WHERE PW.NUM_PROCES = "+ parentInstance + " AND DOC.VERSAO_ATIVA = 1"
			);

			while (rsFornProd.next()) {
				var childData = new java.util.HashMap();
				childData.put("A5_PRODUTO", "" + rsFornProd.getObject("A5_PRODUTO") ? rsFornProd.getObject("A5_PRODUTO") : "");
				childData.put("A5_NOMPROD", "" + rsFornProd.getObject("A5_NOMPROD") ? rsFornProd.getObject("A5_NOMPROD") : "");
				childData.put("A5_NOMEFOR", "" + rsFornProd.getObject("A5_NOMEFOR") ? rsFornProd.getObject("A5_NOMEFOR") : "");
				childData.put("A5_FORNECE", "" + rsFornProd.getObject("A5_FORNECE") ? rsFornProd.getObject("A5_FORNECE") : "");
				childData.put("A5_LOJA", "" + rsFornProd.getObject("A5_LOJA") ? rsFornProd.getObject("A5_LOJA") : "");
				hAPI.addCardChild("tabFornecedorProduto", childData);
			}

			log.info("-- fim rsFornProd");

			var rsFornecedor = stmt.executeQuery(
				"SELECT ML.* FROM " + hAPI.getAdvancedProperty("tabFornecedor") + " ML \
	    			INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
	    			INNER JOIN PROCES_WORKFLOW PW ON PW.NR_DOCUMENTO_CARD = DOC.NR_DOCUMENTO \
	    			WHERE PW.NUM_PROCES = "+ parentInstance + " AND DOC.VERSAO_ATIVA = 1 AND (ML.CICLO_REMOVIDO = '' OR ML.CICLO_REMOVIDO IS NULL)"
			);

			while (rsFornecedor.next()) {
				var childData = new java.util.HashMap();
				childData.put("A2_COD", "" + rsFornecedor.getObject("A2_COD") ? rsFornecedor.getObject("A2_COD") : "");
				childData.put("A2_LOJA", "" + rsFornecedor.getObject("A2_LOJA") ? rsFornecedor.getObject("A2_LOJA") : "");
				childData.put("A2_NOME", "" + rsFornecedor.getObject("A2_NOME") ? rsFornecedor.getObject("A2_NOME") : "");
				childData.put("A2_CGC", "" + rsFornecedor.getObject("A2_CGC") ? rsFornecedor.getObject("A2_CGC") : "");
				childData.put("A2_EST", "" + rsFornecedor.getObject("A2_EST") ? rsFornecedor.getObject("A2_EST") : "");
				childData.put("A2_COND", "" + rsFornecedor.getObject("A2_COND") ? rsFornecedor.getObject("A2_COND") : "");
				childData.put("A2_TPFRETE", "" + rsFornecedor.getObject("A2_TPFRETE") ? rsFornecedor.getObject("A2_TPFRETE") : "");
				childData.put("A2_VALFRE", "" + rsFornecedor.getObject("A2_VALFRE") ? rsFornecedor.getObject("A2_VALFRE") : "");
				childData.put("A2_VALIDA", "" + rsFornecedor.getObject("A2_VALIDA") ? rsFornecedor.getObject("A2_VALIDA") : "");
				hAPI.addCardChild("tabFornecedor", childData);
			}

			log.info("-- fim rsFornecedor");

			var rsSC = stmt.executeQuery(
				"SELECT ML.* FROM " + hAPI.getAdvancedProperty("tabSC") + " ML \
	    			INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
	    			INNER JOIN PROCES_WORKFLOW PW ON PW.NR_DOCUMENTO_CARD = DOC.NR_DOCUMENTO \
	    			WHERE PW.NUM_PROCES = "+ parentInstance + " AND DOC.VERSAO_ATIVA = 1"
			);

			while (rsSC.next()) {
				var childData = new java.util.HashMap();
				childData.put("C1_ITEM", "" + rsSC.getObject("C1_ITEM") ? rsSC.getObject("C1_ITEM") : "");
				childData.put("C1_PRODUTO", "" + rsSC.getObject("C1_PRODUTO") ? rsSC.getObject("C1_PRODUTO") : "");
				childData.put("C1_UM", "" + rsSC.getObject("C1_UM") ? rsSC.getObject("C1_UM") : "");
				childData.put("C1_DESCRI", "" + rsSC.getObject("C1_DESCRI") ? rsSC.getObject("C1_DESCRI") : "");
				childData.put("C1_QUANT", "" + rsSC.getObject("C1_QUANT") ? rsSC.getObject("C1_QUANT") : "");
				childData.put("C1_PRECO", "" + rsSC.getObject("C1_PRECO") ? rsSC.getObject("C1_PRECO") : "");
				childData.put("C1_TOTAL", "" + rsSC.getObject("C1_TOTAL") ? rsSC.getObject("C1_TOTAL") : "");
				hAPI.addCardChild("tabSC", childData);
			}

			log.info("-- fim rsSC");

			var rsCotacao = stmt.executeQuery(
				"SELECT COT.VENCEDOR, COT.VENCEDOR_COMPRADOR, COT.COMPRADOR, COT.QTD_COMPRADOR, COT.COMPRADOR_JUSTIFICATIVA, COT.C8_ITEM, COT.C8_PRODUTO, COT.C8_UM, COT.C8_FORNECE, COT.C8_LOJA, COT.C8_QUANT, COT.C8_PRECO, COT.C8_TOTAL, COT.C8_PRAZO, COT.C8_FILENT, COT.C8_VALIPI, COT.C8_VALICM, COT.C8_VALISS, COT.C8_DIFAL, COT.C8_VALSOL, COT.C8_VALIDA \
					 FROM "+ hAPI.getAdvancedProperty("mlFormCotacao") + " ML \
					INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
					INNER JOIN "+ hAPI.getAdvancedProperty("mlTabCotacao") + " COT ON COT.DOCUMENTID = ML.DOCUMENTID AND COT.VERSION = ML.VERSION \
				WHERE ML.C8_NUM = '"+ map["C8_NUM"] + "' AND ML.idEmpresa = '" + map["idEmpresa"] + "' AND ML.C8_CICLO = '" + map["ciclo_atual"] + "' AND DOC.VERSAO_ATIVA = 1"
			);
			/*
			var rsCotacao = stmt.executeQuery(
					"SELECT * FROM "+hAPI.getAdvancedProperty("tabCotacao")+" ML \
					INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
					INNER JOIN PROCES_WORKFLOW PW ON PW.NR_DOCUMENTO_CARD = DOC.NR_DOCUMENTO \
					WHERE PW.NUM_PROCES = "+parentInstance+" AND DOC.VERSAO_ATIVA = 1 AND ML.C8_CICLO = '"+map["ciclo_atual"]+"'"
			);
			*/

			/*
			while (rsCotacao.next()) {
				var childData = new java.util.HashMap();
				childData.put("C8_CICLO"	, map["ciclo_atual"]);
				childData.put("C8_ITEM"		, ""+rsCotacao.getObject("C8_ITEM") ? rsCotacao.getObject("C8_ITEM") : "");
				childData.put("C8_QUANT"	, ""+rsCotacao.getObject("C8_QUANT") ? tools.confirmaValor(rsCotacao.getObject("C8_QUANT")) : "");
				childData.put("C8_PRECO"	, ""+rsCotacao.getObject("C8_PRECO") ? tools.confirmaValor(rsCotacao.getObject("C8_PRECO")) : "");
				childData.put("C8_TOTAL"	, ""+rsCotacao.getObject("C8_TOTAL") ? tools.confirmaValor(rsCotacao.getObject("C8_TOTAL")) : "");
				childData.put("C8_PRAZO"	, ""+rsCotacao.getObject("C8_PRAZO") ? tools.confirmaValor(rsCotacao.getObject("C8_PRAZO")) : "");
				childData.put("C8_VALIPI"	, ""+rsCotacao.getObject("C8_VALIPI") ? tools.confirmaValor(rsCotacao.getObject("C8_VALIPI")) : "");
				childData.put("C8_VALICM"	, ""+rsCotacao.getObject("C8_VALICM") ? tools.confirmaValor(rsCotacao.getObject("C8_VALICM")) : "");
				childData.put("C8_VALISS"	, ""+rsCotacao.getObject("C8_VALISS") ? tools.confirmaValor(rsCotacao.getObject("C8_VALISS")) : "");
				childData.put("C8_VALIDA"	, ""+rsCotacao.getObject("C8_VALIDA") ? tools.confirmaValor(rsCotacao.getObject("C8_VALIDA")) : "");
				childData.put("C8_PRODUTO"	, ""+rsCotacao.getObject("C8_PRODUTO") ? rsCotacao.getObject("C8_PRODUTO") : "");
				childData.put("C8_UM"		, ""+rsCotacao.getObject("C8_UM") ? rsCotacao.getObject("C8_UM") : "");
				childData.put("C8_FORNECE"	, ""+rsCotacao.getObject("C8_FORNECE") ? rsCotacao.getObject("C8_FORNECE") : "");
				childData.put("C8_LOJA"		, ""+rsCotacao.getObject("C8_LOJA") ? rsCotacao.getObject("C8_LOJA") : "");
				childData.put("C8_PRAZO"	, ""+rsCotacao.getObject("C8_PRAZO") ? rsCotacao.getObject("C8_PRAZO") : "");
				childData.put("C8_FILENT"	, ""+rsCotacao.getObject("C8_FILENT") ? rsCotacao.getObject("C8_FILENT") : "");
				hAPI.addCardChild("tabCotacao", childData);
			}
			*/


			//preenche formualario de cotação


			log.info("-- rsCotacao");
			log.dir(rsCotacao)

			var cardCreated = integra.postFluig("/ecm-forms/api/v2/cardindex/" + hAPI.getAdvancedProperty("formCotacaoAux") + "/cards", {
				"values": [
					{
						"fieldId": "idEmpresa",
						"value": hAPI.getCardValue("idEmpresa")
					}
					,
					{
						"fieldId": "solCompras",
						"value": hAPI.getCardValue("solicitacao_compra")
					}
					,
					{
						"fieldId": "numeroSolicitacao",
						"value": hAPI.getCardValue("numeroSolicitacao")
					}

				]
			})

			log.info("-- cardCreated");
			log.dir(cardCreated);

			hAPI.setCardValue("numIdCot", cardCreated.retorno.cardId);

			var updateCotacoes = {};
			var idx = 1;
			while (rsCotacao.next()) {

				updateCotacoes["C8_CICLO" + "___" + idx] = map["ciclo_atual"];
				updateCotacoes["C8_ITEM" + "___" + idx] = rsCotacao.getObject("C8_ITEM") ? rsCotacao.getObject("C8_ITEM") : "";
				updateCotacoes["C8_PRODUTO" + "___" + idx] = rsCotacao.getObject("C8_PRODUTO") ? rsCotacao.getObject("C8_PRODUTO") : "";
				updateCotacoes["C8_UM" + "___" + idx] = rsCotacao.getObject("C8_UM") ? rsCotacao.getObject("C8_UM") : "";
				updateCotacoes["C8_FORNECE" + "___" + idx] = rsCotacao.getObject("C8_FORNECE") ? rsCotacao.getObject("C8_FORNECE") : "";
				updateCotacoes["C8_LOJA" + "___" + idx] = rsCotacao.getObject("C8_LOJA") ? rsCotacao.getObject("C8_LOJA") : "";

				updateCotacoes["C8_QUANT" + "___" + idx] = (rsCotacao.getObject("C8_QUANT") != null && rsCotacao.getObject("C8_QUANT") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_QUANT")) : "";
				updateCotacoes["C8_PRECO" + "___" + idx] = (rsCotacao.getObject("C8_PRECO") != null && rsCotacao.getObject("C8_PRECO") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_PRECO")) : "";
				updateCotacoes["C8_TOTAL" + "___" + idx] = (rsCotacao.getObject("C8_TOTAL") != null && rsCotacao.getObject("C8_TOTAL") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_TOTAL")) : "";
				updateCotacoes["C8_PRAZO" + "___" + idx] = (rsCotacao.getObject("C8_PRAZO") != null && rsCotacao.getObject("C8_PRAZO") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_PRAZO")) : "";
				updateCotacoes["C8_VALIPI" + "___" + idx] = (rsCotacao.getObject("C8_VALIPI") != null && rsCotacao.getObject("C8_VALIPI") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_VALIPI")) : "";
				updateCotacoes["C8_VALICM" + "___" + idx] = (rsCotacao.getObject("C8_VALICM") != null && rsCotacao.getObject("C8_VALICM") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_VALICM")) : "";
				updateCotacoes["C8_VALISS" + "___" + idx] = (rsCotacao.getObject("C8_VALISS") != null && rsCotacao.getObject("C8_VALISS") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_VALISS")) : "";
				updateCotacoes["C8_VALIDA" + "___" + idx] = (rsCotacao.getObject("C8_VALIDA") != null && rsCotacao.getObject("C8_VALIDA") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_VALIDA")) : "";

				updateCotacoes["C8_PRAZO" + "___" + idx] = (rsCotacao.getObject("C8_PRAZO") != null && rsCotacao.getObject("C8_PRAZO") != "null") ? rsCotacao.getObject("C8_PRAZO") : "";
				updateCotacoes["C8_FILENT" + "___" + idx] = (rsCotacao.getObject("C8_FILENT") != null && rsCotacao.getObject("C8_FILENT") != "null") ? rsCotacao.getObject("C8_FILENT") : "";

				idx++
			}

			log.info(">> updateCotacoes <<")
			log.dir(updateCotacoes);

			if (Object.keys(updateCotacoes).length > 0) {
				var cotacaoFields = { "values": [] };

				Object.keys(updateCotacoes).forEach(function (id) {
					if (updateCotacoes[id] != undefined) {
						cotacaoFields.values.push({
							"fieldId": id,
							"value": updateCotacoes[id]
						})
					}
				})

				log.info(">> cotacaoFields <<");
				log.dir(cotacaoFields);
			}

			var formAtualizado = tools.atualizaForm(cardCreated.retorno.cardId, cotacaoFields);
			if (!formAtualizado.ok) {
				throw "Erro na atualização do formulário > " + formAtualizado.error;
			}

			log.info("-- fim rsCotacao");

		} catch (e) {
			log.error("ERRO==============> " + e.message != undefined ? e.message : e);
		} finally {
			if (stmt != null) stmt.close();
			if (conn != null) conn.close();
		}

	}
	else {
		throw "Não foi localizado dados do processo principal!"
	}

	/*
	var iterator 		= map.keySet().iterator();
	
	while (iterator.hasNext()) {
		var id = "" + iterator.next();
		log.info("++ id: " + id);
		log.info("map.get " + id + " : " + map.get(id));
	    
		if(id.indexOf("produto___") == 0){
			var childData = new java.util.HashMap();
			childData.put("produto"				, ""+map.get("codigoProduto"+"___"+idx));
			childData.put("produto_desc"		, ""+map.get("produto"+"___"+idx));
			childData.put("produto_entrega"		, ""+map.get("produto_entrega"+"___"+idx));
			childData.put("produto_saldo"		, ""+map.get("produto_saldo"+"___"+idx));
			childData.put("produto_um"			, ""+map.get("unidadeMedidaProduto"+"___"+idx));
			childData.put("produto_qtd"			, ""+map.get("produto_qtd"+"___"+idx));
			childData.put("produto_marcas"		, ""+map.get("produto_marcas"+"___"+idx));
			childData.put("produto_observacao"	, ""+map.get("produto_observacao"+"___"+idx));
			hAPI.addCardChild("tabItens", childData);
		}
		else if(id.indexOf("TES_A2_COD___") == 0){
			log.info(">> id: " + id)
			var idx = id.replace("TES_A2_COD___","");
			log.info(">> idx: " + idx);
			
			var childData = new java.util.HashMap();
			childData.put("TES_A2_COD"	, ""+map.get("TES_A2_COD"+"___"+idx));
			childData.put("TES_A2_LOJA"	, ""+map.get("TES_A2_LOJA"+"___"+idx));
			childData.put("TES_A2_CGC"	, ""+map.get("TES_A2_CGC"+"___"+idx));
			childData.put("TES_B1_COD"	, ""+map.get("TES_B1_COD"+"___"+idx));
			childData.put("TES_CODIGO"	, ""+map.get("TES_CODIGO"+"___"+idx));
			childData.put("TES_COMPRADOR"	, ""+map.get("TES_COMPRADOR"+"___"+idx));
			hAPI.addCardChild("tabTES", childData);
			
		}
		else if(id.indexOf("A2_COD___") == 0){
			log.info(">> id: " + id)
			var idx = id.replace("A2_COD___","");
			log.info(">> idx: " + idx);
			
			if(map.get("CICLO_REMOVIDO"+"___"+idx) == ""){
				var childData = new java.util.HashMap();
				childData.put("A2_COD"		, ""+map.get("A2_COD"+"___"+idx));
				childData.put("A2_LOJA"		, ""+map.get("A2_LOJA"+"___"+idx));
				childData.put("A2_NOME"		, ""+map.get("A2_NOME"+"___"+idx));
				childData.put("A2_CGC"		, ""+map.get("A2_CGC"+"___"+idx));
				childData.put("A2_EST"		, ""+map.get("A2_EST"+"___"+idx));
				childData.put("A2_COND"		, ""+map.get("A2_COND"+"___"+idx));
				childData.put("A2_TPFRETE"	, ""+map.get("A2_TPFRETE"+"___"+idx));
				childData.put("A2_VALFRE"	, ""+map.get("A2_VALFRE"+"___"+idx));
				childData.put("A2_VALIDA"	, ""+map.get("A2_VALIDA"+"___"+idx));
				hAPI.addCardChild("tabFornecedor", childData);
			}
			
		}
	    
		else if(id.indexOf("B1_COD___") == 0){
			var idx = id.replace("B1_COD___","");
			
			var childData = new java.util.HashMap();
			childData.put("B1_COD"		, ""+map.get("B1_COD"+"___"+idx));
			childData.put("B1_DESC"		, ""+map.get("B1_DESC"+"___"+idx));
			childData.put("B1_GRUPO"	, ""+map.get("B1_GRUPO"+"___"+idx));
			childData.put("B1_LOCPAD"	, ""+map.get("B1_LOCPAD"+"___"+idx));
			childData.put("B1_MSBLQL"	, ""+map.get("B1_MSBLQL"+"___"+idx));
			childData.put("B1_TIPO"		, ""+map.get("B1_TIPO"+"___"+idx));
			childData.put("B1_UM"		, ""+map.get("B1_UM"+"___"+idx));
			childData.put("B1_ZMARCA"	, ""+map.get("B1_ZMARCA"+"___"+idx));
			childData.put("ZPM_DESC"	, ""+map.get("ZPM_DESC"+"___"+idx));
			childData.put("B1_UPRC"		, ""+map.get("B1_UPRC"+"___"+idx));
			childData.put("B1_PAI"		, ""+map.get("B1_PAI"+"___"+idx));
			hAPI.addCardChild("tabProduto", childData);
		}
	    
		else if(id.indexOf("A5_PRODUTO___") == 0){
			var idx = id.replace("A5_PRODUTO___","");
			
			var childData = new java.util.HashMap();
			childData.put("A5_PRODUTO"	, ""+map.get("A5_PRODUTO"+"___"+idx));
			childData.put("A5_NOMPROD"	, ""+map.get("A5_NOMPROD"+"___"+idx));
			childData.put("A5_NOMEFOR"	, ""+map.get("A5_NOMEFOR"+"___"+idx));
			childData.put("A5_FORNECE"	, ""+map.get("A5_FORNECE"+"___"+idx));
			childData.put("A5_LOJA"		, ""+map.get("A5_LOJA"+"___"+idx));
			hAPI.addCardChild("tabFornecedorProduto", childData);
		}
	    
		else if(id.indexOf("C1_ITEM___") == 0){
			var idx = id.replace("C1_ITEM___","");
			
			var childData = new java.util.HashMap();
			childData.put("C1_ITEM"		, ""+map.get("C1_ITEM"+"___"+idx));
			childData.put("C1_PRODUTO"	, ""+map.get("C1_PRODUTO"+"___"+idx));
			childData.put("C1_UM"		, ""+map.get("C1_UM"+"___"+idx));
			childData.put("C1_DESCRI"	, ""+map.get("C1_DESCRI"+"___"+idx));
			childData.put("C1_QUANT"	, ""+map.get("C1_QUANT"+"___"+idx));
			childData.put("C1_PRECO"	, ""+map.get("C1_PRECO"+"___"+idx));
			childData.put("C1_TOTAL"	, ""+map.get("C1_TOTAL"+"___"+idx));
			hAPI.addCardChild("tabSC", childData);
		}
	    
		else if(id.indexOf("C8_CICLO___") == 0){
			var idx = id.replace("C8_CICLO___","");
			
			if(map.get(id) == map.get("CICLO_ATUAL")){
				
				var childData = new java.util.HashMap();
				childData.put("C8_CICLO"	, ""+map.get("C8_CICLO"+"___"+idx));
				childData.put("BEN_FISCAL"	, ""+map.get("BEN_FISCAL"+"___"+idx));
				childData.put("C8_ITEM"		, ""+map.get("C8_ITEM"+"___"+idx));
				childData.put("C8_QUANT"	, ""+map.get("C8_QUANT"+"___"+idx));
				childData.put("C8_PRECO"	, ""+map.get("C8_PRECO"+"___"+idx));
				childData.put("C8_TOTAL"	, ""+map.get("C8_TOTAL"+"___"+idx));
				childData.put("C8_COND"		, ""+map.get("C8_COND"+"___"+idx));
				childData.put("C8_PRAZO"	, ""+map.get("C8_PRAZO"+"___"+idx));
				childData.put("C8_VALIPI"	, ""+map.get("C8_VALIPI"+"___"+idx));
				childData.put("C8_VALICM"	, ""+map.get("C8_VALICM"+"___"+idx));
				childData.put("C8_VALISS"	, ""+map.get("C8_VALISS"+"___"+idx));
				childData.put("C8_SEGURO"	, ""+map.get("C8_SEGURO"+"___"+idx));
				childData.put("C8_DESPESA"	, ""+map.get("C8_DESPESA"+"___"+idx));
				childData.put("C8_VALFRE"	, ""+map.get("C8_VALFRE"+"___"+idx));
				childData.put("C8_TPFRETE"	, ""+map.get("C8_TPFRETE"+"___"+idx));
				childData.put("C8_VALIDA"	, ""+map.get("C8_VALIDA"+"___"+idx));
				childData.put("BEN_FISCAL"	, ""+map.get("BEN_FISCAL"+"___"+idx));
				childData.put("C8_PRODUTO"	, ""+map.get("C8_PRODUTO"+"___"+idx));
				childData.put("C8_UM"		, ""+map.get("C8_UM"+"___"+idx));
				childData.put("C8_FORNECE"	, ""+map.get("C8_FORNECE"+"___"+idx));
				childData.put("C8_LOJA"		, ""+map.get("C8_LOJA"+"___"+idx));
				childData.put("C8_QUANT"	, ""+map.get("C8_QUANT"+"___"+idx));
				childData.put("C8_PRECO"	, ""+map.get("C8_PRECO"+"___"+idx));
				childData.put("C8_TOTAL"	, ""+map.get("C8_TOTAL"+"___"+idx));
				childData.put("C8_COND"		, ""+map.get("C8_COND"+"___"+idx));
				childData.put("C8_PRAZO"	, ""+map.get("C8_PRAZO"+"___"+idx));
				childData.put("C8_FILENT"	, ""+map.get("C8_FILENT"+"___"+idx));
				childData.put("C8_EMISSAO"	, ""+map.get("C8_EMISSAO"+"___"+idx));

				hAPI.addCardChild("tabCotacao", childData);
			}
			
		}
	}
	*/

}