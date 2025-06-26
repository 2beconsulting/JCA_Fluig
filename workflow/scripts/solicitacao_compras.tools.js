var tools = {
	log: function (mensagem) {
		var WKNumProces = getValue("WKNumProces")

		log.info(WKNumProces + ": " + mensagem);
	},
	aprovacao: {
		buscaFluig: function (cardData) {
			var ciclo_aprov = hAPI.getCardValue("aprovacaoCiclo");
			var aprovsCiclo = [];
			var tabAprovacoes = tools.getTableFilho(
				cardData || hAPI.getCardData(getValue("WKNumProces")),
				["aprov_ciclo", "aprov_matAprovador", "aprov_decisao"]
			);
			tabAprovacoes.forEach(function (linha) {
				var idx = linha.aprov_ciclo.index;
				if (linha["aprov_ciclo"].value == ciclo_aprov) {
					aprovsCiclo.push({
						"aprov_matAprovador": linha["aprov_matAprovador"].value,
						"aprov_decisao": linha["aprov_decisao"].value
					})
				}
			})
			return aprovsCiclo;
		},
		buscaProtheus: function () {
			var obj = integra.getProtheus("/JWSZPX01/1/" + hAPI.getCardValue("idEmpresa") + "/" + hAPI.getCardValue("idCentroCusto"));
			if (obj.ok) {
				var objRetorno = { "alcada": [] };
				var seq = 0;
				for (var nivel in obj.retorno[0]) {
					var jsonNivel = {};
					var tipo = (nivel.indexOf("Aprovador") == 0) ? "Aprovador" : (nivel.indexOf("Superior") == 0) ? "Superior" : ""
					var tipo_nivel = parseInt(nivel.replace(tipo, ""))

					obj.retorno[0][nivel].forEach(function (aprov) {
						objRetorno.alcada.push({
							"tipo": tipo,
							"tipo_nivel": tipo_nivel,
							"seq": seq,
							"ZPX_COLABO": aprov.ZPX_COLABO,
							"ZPX_NOME": aprov.ZPX_NOME,
							"ZPX_VALOR": parseFloat(aprov.ZPX_VALOR)
						})
						seq++;
					})

				}
				objRetorno["ok"] = true;
				return objRetorno;
			} else {
				return obj;
			}

		},
		buscaAlcadaComprasProtheus: function () {
			var obj = integra.getProtheus("/JWSSCP01/");
			if (obj.ok) {
				var objRetorno = [];
				var seq = 0;
				obj.retorno.DADOS.forEach(function (aprov) {
					var filtNivel = objRetorno.filter(function (el) { el.AL_PERFIL == aprov.AL_PERFIL })

					if (filtNivel.length > 0) {

					} else {
						objRetorno.push({
							"AL_COD": aprov.AL_COD,
							"AL_DESC": aprov.AL_DESC,
							"AL_PERFIL": aprov.AL_PERFIL,
							"AL_NIVEL": aprov.AL_NIVEL,
							"AL_TPLIBER": aprov.AL_TPLIBER,
							"DHL_LIMMIN": tools.formata.toFloat(aprov.DHL_LIMMIN),
							"DHL_LIMMAX": tools.formata.toFloat(aprov.DHL_LIMMAX),
							"APROVS": [{
								"AL_USER": aprov.AL_USER,
								"RA_MAT": aprov.RA_MAT != undefined ? aprov.RA_MAT : aprov.AL_USER
							}]
						})
					}
					obj.retorno[0][nivel].forEach(function (aprov) {
						objRetorno.alcada.push({
							"tipo": tipo,
							"tipo_nivel": tipo_nivel,
							"seq": seq,
							"ZPX_COLABO": aprov.ZPX_COLABO,
							"ZPX_NOME": aprov.ZPX_NOME,
							"ZPX_VALOR": parseFloat(aprov.ZPX_VALOR)
						})
						seq++;
					})

				})
				objRetorno["ok"] = true;
				return objRetorno;
			} else {
				return obj;
			}
		},
		carrega: function (etapa) {

			var aprovadores = integra.getProtheus("/JWSSCP01/" + tools.aprovacao.tipoCompra() + "/" + tools.formata.toProtheus(hAPI.getCardValue("valor_total")) + "/" + hAPI.getCardValue("idCentroCusto"));
			if (aprovadores.ok) {
				var aprovs = tools.aprovacao.processa(aprovadores.retorno, etapa);
			} else if (aprovadores.code == 404 && aprovadores.errorCode == 5) {
				var aprovadoresPadrao = integra.getProtheus("/JWSSCP01/" + tools.aprovacao.tipoCompra() + "/" + tools.formata.toProtheus(hAPI.getValue("valor_total_compra")) + "/" + hAPI.getAdvancedProperty("centroCustoPadrao"));
				if (aprovadoresPadrao.ok) {
					var aprovs = tools.aprovacao.processa(aprovadoresPadrao.retorno, etapa);
				}
			}

		},
		carregaValorMenor: function (cardData) {
			var valorPedido = tools.pedido.valorTotal(cardData);
			var primeiraMatricula = "";
			var protheus = tools.aprovacao.buscaProtheus();

			if (protheus.ok) {
				var txtErro = "";
				var vlrAnt = 0;

				protheus.alcada.forEach(function (el, i, arr) {
					if (vlrAnt < valorPedido) {
						if (tools.outros.usuarioAtivo(el.ZPX_COLABO)) {
							primeiraMatricula = primeiraMatricula != "" ? primeiraMatricula : el.ZPX_COLABO;
							var childData = new java.util.HashMap();
							childData.put("aprovValorMenor_ciclo", hAPI.getCardValue("ciclo_atual"));
							childData.put("aprovValorMenor_matAprovador", el.ZPX_COLABO);
							childData.put("aprovValorMenor_aprovador", tools.outros.getColleagueName(el.ZPX_COLABO));
							hAPI.addCardChild("tabAprovacoesValorMenor", childData);
							vlrAnt = parseFloat(el.ZPX_VALOR)
						} else {
							txtErro += "O usuário " + el.ZPX_COLABO + " - " + el.ZPX_NOME + " não foi encontrado ativo na plataforma </br>";
						}
					} else {
						arr.length = i
					}
				})

				if (txtErro != "") {
					throw txtErro
				} else {
					hAPI.setCardValue("aprovacaoProxAprovador", primeiraMatricula);
				}
			} else {
				throw protheus.error;
			}
		},
		carregaCompradores: function (cardData) {
			log.info("++ tools.aprovacao.carregaCompradores");
			var ciclo_atual = hAPI.getCardValue("ciclo_atual");
			var aprovs = [];
			var valorPedido = tools.pedido.valorTotal(cardData);
			log.info("valorPedido: " + valorPedido);
			var pre_alcada = [];

			var ds = DatasetFactory.getDataset(
				"dsAprovadoresCompras",
				null,
				[
					DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST)
				],
				null
			)
			//log.info(">> ds")
			//log.dir(ds)
			if (ds != null && ds.rowsCount > 0) {
				for (var i = 0; i < ds.rowsCount; i++) {
					pre_alcada.push({
						"nivel": ds.getValue(i, "nivel"),
						"valorLimite": tools.formata.toFloat(ds.getValue(i, "valorLimite")),
						"documentId": ds.getValue(i, "metadata#id"),
						"version": ds.getValue(i, "metadata#version")
					})
				}

				pre_alcada = pre_alcada.filter(function (el) { return el.valorLimite >= valorPedido }).sort(function (a, b) { return a.valorLimite - b.valorLimite });
				log.info(">> pre_alcada")
				log.dir(pre_alcada)
				pre_alcada.forEach(function (el, idx, arr) {
					var dsFilho = DatasetFactory.getDataset(
						"dsAprovadoresCompras",
						null,
						[
							DatasetFactory.createConstraint("metadata#id", el.documentId, el.documentId, ConstraintType.MUST),
							DatasetFactory.createConstraint("metadata#version", el.version, el.version, ConstraintType.MUST),
							DatasetFactory.createConstraint("tablename", "tabAprovadores", "tabAprovadores", ConstraintType.MUST)
						],
						null
					)
					//log.info(">> dsFilho idx:"+idx)
					//log.dir(dsFilho)
					if (el.nivel.toUpperCase() == "COMPRADORES") {
						for (var i = 0; i < dsFilho.rowsCount; i++) {
							if (dsFilho.getValue(i, "aprovadorMatricula") == getValue("WKUser"))
								aprovs.push(dsFilho.getValue(i, "aprovadorMatricula"));
						}
					} else {
						for (var i = 0; i < dsFilho.rowsCount; i++) {
							aprovs.push(dsFilho.getValue(i, "aprovadorMatricula"));
						}
					}

				})

			}
			//if(aprovs.length < 2) aprovs.push("admin"); //Solução de contorno para quando o pedido for aprovado apenas pelo gerente
			hAPI.setCardValue("matLiberaPedido", aprovs)
			log.info("-- tools.aprovacao.carregaCompradores");
		},
		/**
		 * Carrega os aprovadores de compras do Intrack
		 * @warning em desevolvimento/ alinhamento com a área da necessidade
		 */
		carregaIntrack: function (cardData) {
			log.info("++ tools.aprovacao.carregaIntrack");
			var ciclo_atual = hAPI.getCardValue("ciclo_atual");
			tableAprovacoesIntrack = tools.getTableFilho(
				cardData || hAPI.getCardData(getValue("WKNumProces")),
				["aprovIntrack_ciclo", "aprovIntrack_matAprovador", "aprovIntrack_decisao"]
			);
			var aprovsForm = tableAprovacoesIntrack.filter(function (linha) {
				var idx = linha.aprovIntrack_ciclo.index;
				return linha.aprovIntrack_ciclo.value == ciclo_atual
			}).map(function (linha) {
				var idx = linha.aprovIntrack_ciclo.index;
				return {
					"matAprovador": linha["aprovIntrack_matAprovador"].value,
					"decisao": linha["aprovIntrack_decisao"].value
				}
			})
			//log.info(">> aprovsForm")
			//log.dir(aprovsForm)
			if (aprovsForm.length == 0) {
				var valorPedido = tools.pedido.valorTotal(cardData);
				var pre_alcada = [];
				var alcada = [];
				var proxAprovadorComprador = "";

				var ds = DatasetFactory.getDataset(
					"dsAprovadoresIntrack",
					null,
					[
						DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST)
					],
					null
				)
				//log.info(">> ds")
				//log.dir(ds)
				if (ds != null && ds.rowsCount > 0) {
					for (var i = 0; i < ds.rowsCount; i++) {
						pre_alcada.push({
							"nivel": ds.getValue(i, "nivel"),
							"valorLimite": tools.formata.toFloat(ds.getValue(i, "valorLimite")),
							"documentId": ds.getValue(i, "metadata#id"),
							"version": ds.getValue(i, "metadata#version")
						})
					}

					pre_alcada.sort(function (a, b) { return a.valorLimite - b.valorLimite });
					//log.info(">> pre_alcada")
					//log.dir(pre_alcada)
					var valorAnterior = 0;
					pre_alcada.forEach(function (el, idx, arr) {
						//log.info(">> pre_alcada idx:"+idx)
						//log.dir(el)
						if (valorAnterior < valorPedido) {
							if (idx == 0) { // primeiro nivel (compradores)
								var dsFilho = DatasetFactory.getDataset(
									"dsAprovadoresIntrack",
									null,
									[
										DatasetFactory.createConstraint("metadata#id", el.documentId, el.documentId, ConstraintType.MUST),
										DatasetFactory.createConstraint("metadata#version", el.version, el.version, ConstraintType.MUST),
										DatasetFactory.createConstraint("tablename", "tabAprovadores", "tabAprovadores", ConstraintType.MUST)
									],
									null
								)
								//log.info(">> dsFilho idx:"+idx)
								//log.dir(dsFilho)
								for (var i = 0; i < dsFilho.rowsCount; i++) {
									if (dsFilho.getValue(i, "aprovadorMatricula") == getValue("WKUser")) {
										var childData = new java.util.HashMap();
										childData.put("aprovIntrack_ciclo", ciclo_atual);
										childData.put("aprovIntrack_matAprovador", dsFilho.getValue(i, "aprovadorMatricula"));
										childData.put("aprovIntrack_aprovador", dsFilho.getValue(i, "aprovadorNome"));
										hAPI.addCardChild("tabAprovacoesIntrack", childData);
										proxAprovadorComprador = (proxAprovadorComprador == "" ? dsFilho.getValue(i, "aprovadorMatricula") : proxAprovadorComprador);
										i = dsFilho.rowsCount;
									}
								}
							} else {
								var dsFilho = DatasetFactory.getDataset(
									"dsAprovadoresIntrack",
									null,
									[
										DatasetFactory.createConstraint("metadata#id", el.documentId, el.documentId, ConstraintType.MUST),
										DatasetFactory.createConstraint("metadata#version", el.version, el.version, ConstraintType.MUST),
										DatasetFactory.createConstraint("tablename", "tabAprovadores", "tabAprovadores", ConstraintType.MUST)
									],
									null
								)
								//log.info(">> dsFilho idx:"+idx)
								//log.dir(dsFilho)
								for (var i = 0; i < dsFilho.rowsCount; i++) {
									var childData = new java.util.HashMap();
									childData.put("aprovIntrack_ciclo", ciclo_atual);
									childData.put("aprovIntrack_matAprovador", dsFilho.getValue(i, "aprovadorMatricula"));
									childData.put("aprovIntrack_aprovador", dsFilho.getValue(i, "aprovadorNome"));
									hAPI.addCardChild("tabAprovacoesIntrack", childData);
									proxAprovadorComprador = (proxAprovadorComprador == "" ? dsFilho.getValue(i, "aprovadorMatricula") : proxAprovadorComprador);
								}
							}
						}
					})
					hAPI.setCardValue("aprovacaoProxComprador", proxAprovadorComprador)
				}
				log.info("-- tools.aprovacao.carregaCompradores");
			}
		},
		processa: function (aprovadores, etapa) {
			if (etapa == "Inicial") {
				aprovadores.forEach(function (el) {
					var childData = new java.util.HashMap();
					childData.put("aprov_ciclo", hAPI.getCardValue("aprovacaoCiclo"));
					childData.put("aprov_matAprovador", el.AL_USER);
					childData.put("aprov_aprovador", tools.outros.getColleagueName(el.AL_USER));
					hAPI.addCardChild("tabSC", childData);
				})
			}
			else if (etapa == "ValorMenor") {
				aprovadores.forEach(function (el) {
					var childData = new java.util.HashMap();
					childData.put("aprovValorMenor_ciclo", hAPI.getCardValue("ciclo_atual"));
					childData.put("aprovValorMenor_matAprovador", el.AL_USER);
					childData.put("aprovValorMenor_aprovador", tools.outros.getColleagueName(el.AL_USER));
					hAPI.addCardChild("tabAprovacoesValorMenor", childData);
				})
			}
		},
		solicitacao: {
			getTotal: function () {
				return tools.formata.toFloat(hAPI.getCardValue("valor_total"));
			},
			proximoAprovador: function (cardData) {
				log.info(">> tools.aprovacao.solicitacao.proximoAprovador");
				var aprovProtheus = tools.aprovacao.buscaProtheus();
				//log.dir(aprovProtheus);
				var objRetorno;

				if (aprovProtheus.ok) {
					if (aprovProtheus.alcada.length > 0) {
						log.info(">> proximoAprovador if 01")
						var idSolicitante = hAPI.getCardValue("idSolicitante");
						var ultimoAprovador = hAPI.getCardValue("aprovacaoProxAprovador");
						var valorSolicitacao = hAPI.getCardValue("valor_total");
						var valorAprovacao = hAPI.getCardValue("aprovacaoValor");
						log.info("\
							\n idSolicitante: "+ idSolicitante + "\
							\n ultimoAprovador: "+ ultimoAprovador + "\
							\n valorSolicitacao: "+ valorSolicitacao + "\
							\n valorAprovacao: "+ valorAprovacao)
						if (valorAprovacao != valorSolicitacao) { // Inicia alçada de aprovação
							log.info(">> proximoAprovador if 01 if 01")
							var filtAprovSolicitante = aprovProtheus.alcada.filter(function (el) { return el.ZPX_COLABO == idSolicitante });
							//log.dir(filtAprovSolicitante)
							if (filtAprovSolicitante.length == 0) { // Solicitante não participa da alçada de aprovação
								log.info(">> proximoAprovador if 01 if 01 if 01")
								var ciclo = hAPI.getCardValue("aprovacaoCiclo");
								hAPI.setCardValue("aprovacaoCiclo", ciclo == "" ? "1" : (parseInt(ciclo) + 1));
								hAPI.setCardValue("aprovacaoValor", valorSolicitacao);

								aprovProtheus.alcada.forEach(function (el, idx, arr) {
									//log.info("idx: " + idx);
									//log.dir(el)
									log.info(">> proximoAprovador if 01 if 01 if 01 forEach if 01")
									if (tools.outros.usuarioAtivo(el.ZPX_COLABO)) {
										log.info(">> proximoAprovador if 01 if 01 if 01 forEach if 01 if 01")
										hAPI.setCardValue("aprovacaoProxAprovador", el.ZPX_COLABO);
										hAPI.setCardValue("aprovacaoProblemaAprovador", "");
										arr.length = idx;
										objRetorno = true;
									} else {
										log.info(">> proximoAprovador if 01 if 01 if 01 forEach if 01 else  if 01")
										hAPI.setCardValue("aprovacaoProxAprovador", "");
										hAPI.setCardValue("aprovacaoProblemaAprovador", "O usuário " + el.ZPX_COLABO + " > " + el.ZPX_NOME + " não foi encontrado ativo na plataforma");
										arr.length = idx;
										objRetorno = false;
									}
								})
							} else {
								log.info(">> proximoAprovador if 01 if 01 else if 01")
								if (filtAprovSolicitante[(filtAprovSolicitante.length - 1)].ZPX_VALOR >= tools.formata.toFloat(valorSolicitacao)) { // Solicitante possui alçada para aprovar valor superior ao que ele está solicitando
									log.info(">> proximoAprovador if 01 if 01 else if 01 if 01")
									hAPI.setCardValue("aprovacaoProxAprovador", "");
									hAPI.setCardValue("aprovacaoProblemaAprovador", "");
									hAPI.setTaskComments(
										getValue("WKUser"),
										getValue("WKNumProces"),
										getValue("WKActualThread"),
										"A solicitação não passou por aprovação, pois o solicitante possui alçada para aprovar o valor da Solicitação"
									)
								} else {
									log.info(">> proximoAprovador if 01 if 01 else if 01 else if 01")
									var seq_ult = filtAprovSolicitante[(filtAprovSolicitante.length - 1)].seq;
									//log.info("seq_ult: " + seq_ult)
									var filProxAprov = aprovProtheus.alcada.filter(function (ap) { return ap.seq == (seq_ult + 1) });
									//log.dir(filProxAprov)
									if (filProxAprov.length > 0) {
										log.info(">> proximoAprovador if 01 if 01 else if 01 else if 01 if 01")
										if (tools.outros.usuarioAtivo(el.ZPX_COLABO)) {
											log.info(">> proximoAprovador if 01 if 01 else if 01 else if 01 if 01 if 01")
											hAPI.setCardValue("aprovacaoProxAprovador", filProxAprov[0].ZPX_COLABO);
											hAPI.setCardValue("aprovacaoProblemaAprovador", "");
											objRetorno = true;
										} else {
											log.info(">> proximoAprovador if 01 if 01 else if 01 else if 01 if 01 else if 01")
											hAPI.setCardValue("aprovacaoProxAprovador", "");
											hAPI.setCardValue("aprovacaoProblemaAprovador", "O usuário " + el.ZPX_COLABO + " > " + el.ZPX_NOME + " não foi encontrado ativo na plataforma");
											objRetorno = false;
										}
									} else {
										log.info(">> proximoAprovador if 01 if 01 else if 01 else if 01 else if 01")
										hAPI.setCardValue("aprovacaoProxAprovador", "");
										hAPI.setCardValue("aprovacaoProblemaAprovador", "O solicitante é o último na alçada de aprovação, porém não possui alçada para aprovar o valor da Solicitação");
										objRetorno = false;
									}
								}
							}
						} else {
							log.info(">> proximoAprovador if 01 else if 01")
							var aprovFluig = tools.aprovacao.buscaFluig(cardData);
							//log.dir(aprovFluig);

							//if(hAPI.getCardValue("decisaoAprovador") != "retornar"){
							aprovProtheus.alcada.forEach(function (el, idx, arr) {
								//log.info("idx: " + idx)
								if (el.ZPX_COLABO != idSolicitante) {
									log.info(">> proximoAprovador if 01 else if 01 forEach if 01")
									var filtAprov = aprovFluig.filter(function (ap) { return ap.aprov_matAprovador == el.ZPX_COLABO && ap.aprov_decisao == "Aprovado" })
									if (filtAprov.length == 0) {
										log.info(">> proximoAprovador if 01 else if 01 forEach if 01 if 01")
										if (idx != 0) {
											log.info("-- aprovProtheus.alcada[(idx-1)].ZPX_VALOR : " + aprovProtheus.alcada[(idx - 1)].ZPX_VALOR + (aprovProtheus.alcada[(idx - 1)].ZPX_VALOR < tools.formata.toFloat(valorSolicitacao)) + "\n idx: " + idx)
											if (aprovProtheus.alcada[(idx - 1)].ZPX_VALOR < tools.formata.toFloat(valorSolicitacao)) {
												if (tools.outros.usuarioAtivo(el.ZPX_COLABO)) {
													log.info(">> proximoAprovador if 01 else if 01 forEach if 01 if 01 if 01")
													hAPI.setCardValue("aprovacaoProxAprovador", el.ZPX_COLABO);
													hAPI.setCardValue("aprovacaoProblemaAprovador", "");
													arr.length = idx;
													objRetorno = true;
												} else {
													log.info(">> proximoAprovador if 01 else if 01 forEach if 01 if 01 else if 01")
													hAPI.setCardValue("aprovacaoProxAprovador", "");
													hAPI.setCardValue("aprovacaoProblemaAprovador", "O usuário " + el.ZPX_COLABO + " > " + el.ZPX_NOME + " não foi encontrado ativo na plataforma");
													arr.length = idx;
													objRetorno = false;
												}
											} else {
												arr.length = idx;
											}
										}
										else {
											if (tools.outros.usuarioAtivo(el.ZPX_COLABO)) {
												log.info(">> proximoAprovador if 01 else if 01 forEach if 01 else if 01 if 01")
												hAPI.setCardValue("aprovacaoProxAprovador", el.ZPX_COLABO);
												hAPI.setCardValue("aprovacaoProblemaAprovador", "");
												arr.length = idx;
												objRetorno = true;
											} else {
												log.info(">> proximoAprovador if 01 else if 01 forEach if 01 else if 01 else if 01")
												hAPI.setCardValue("aprovacaoProxAprovador", "");
												hAPI.setCardValue("aprovacaoProblemaAprovador", "O usuário " + el.ZPX_COLABO + " > " + el.ZPX_NOME + " não foi encontrado ativo na plataforma");
												arr.length = idx;
												objRetorno = false;
											}
										}
									} else {
										log.info(">> proximoAprovador if 01 else if 01 forEach if 01 else if 01")
										if (el.ZPX_VALOR >= tools.formata.toFloat(valorSolicitacao)) { // Encerrou a alçada no nível anterior
											log.info(">> proximoAprovador if 01 else if 01 forEach if 01 else if 01 if 01")
											arr.length = idx;
										}
									}
								}
							})
							//}
							if (objRetorno == undefined) {
								log.info(">> proximoAprovador 1 <<")
								hAPI.setCardValue("aprovacaoProxAprovador", "");
								hAPI.setCardValue("aprovacaoProblemaAprovador", "");
								objRetorno = false;
							}
						}
					} else {
						log.info(">> proximoAprovador else if 01")
						hAPI.setCardValue("aprovacaoProblemaAprovador", "Não foi encontrado aprovador para o cento de custo " + hAPI.getCardValue("descricaoCentroCusto") + " na empresa " + hAPI.getCardValue("idEmpresa") + " | " + hAPI.getCardValue("displayEmpresaEntrega"))
						objRetorno = false;
					}
				} else {
					hAPI.setCardValue("aprovacaoProxAprovador", "")
					hAPI.setCardValue("aprovacaoProblemaAprovador", aprovProtheus.error)
					objRetorno = false;
				}
				log.info("++++++ objRetorno" + objRetorno)
				return objRetorno;
			}
		},
		valorPreAprovadoMenor: function () {
			/**@todo */
			//return false; //Incluido enquanto não estiver implementado a tratativa da homologação
			var valorAtual = tools.pedido.valorTotal(hAPI.getCardData(getValue("WKNumProces")));
			var valorInicial = tools.formata.toFloat(hAPI.getCardValue("valor_total"));

			hAPI.setCardValue("valor_total_compra", tools.formata.toFluig(valorAtual));

			return valorInicial < valorAtual

		}
	},
	atualizaHistorico: function (usuario) {
		var obsHistorico = hAPI.getCardValue("observacoes")
		var historico = hAPI.getCardValue("historico")
		if (obsHistorico != "") {
			if (historico != "") {
				var obsHistoricoTemp = obsHistorico.replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>')
				var json = JSON.parse(historico)
				json.push({
					"data": tools.outros.getDataAtual(),
					"usuario": usuario,
					"observacao": obsHistoricoTemp
				})
				hAPI.setCardValue("historico", JSONUtil.toJSON(json))
			} else {
				var obsHistoricoTemp = obsHistorico.replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>')
				var json = [{
					"data": tools.outros.getDataAtual(),
					"usuario": usuario,
					"observacao": obsHistoricoTemp
				}]
				hAPI.setCardValue("historico", JSONUtil.toJSON(json))
			}
			hAPI.setCardValue("observacoes", "")
		}
	},
	atualizaHistoricoDecisao: function (usuario) {
		log.info(">> tools.atualizaHistoricoDecisao " + getValue("WKNumState"));
		if (getValue("WKNumState") == 65) { // Preencher dados da SC
			var obsHistorico = hAPI.getCardValue("decisaoComprador_motivo")
			var historico = hAPI.getCardValue("historico")
			var ciclo = hAPI.getCardValue("ciclo_atual")
			var decisao = hAPI.getCardValue("decisaoComprador")
			decisao = decisao == "Prosseguir" ? "Prosseguir" : decisao == "Devolver" ? "Devolver ao Solicitante" : decisao == "Questionar" ? "Questionar Solicitante" : "";
			log.info("\n obsHistorico: " + obsHistorico + "\n historico: " + historico + "\n ciclo: " + ciclo + "\n decisao: " + decisao)
			if (obsHistorico != "") {
				if (historico != "") {
					var obsHistoricoTemp = obsHistorico.split('\r\n').join('<br>');
					var json = JSON.parse(historico)
					json.push({
						"data": tools.outros.getDataAtual(),
						"usuario": usuario,
						"ciclo": ciclo,
						"decisao": decisao,
						"observacao": obsHistoricoTemp
					})
					hAPI.setCardValue("historico", JSONUtil.toJSON(json))
				} else {
					var obsHistoricoTemp = obsHistorico.split('\r\n').join('<br>');
					var json = [{
						"data": tools.outros.getDataAtual(),
						"usuario": usuario,
						"ciclo": ciclo,
						"decisao": decisao,
						"observacao": obsHistoricoTemp
					}]
					hAPI.setCardValue("historico", JSONUtil.toJSON(json))
				}
			}
		} else if (getValue("WKNumState") == 28) { // Cotação aprovada?
			var obsHistorico = hAPI.getCardValue("obsComprador")
			var historico = hAPI.getCardValue("historico")
			var ciclo = hAPI.getCardValue("ciclo_atual")
			var decisao = hAPI.getCardValue("ciclo_aprovado")
			decisao = decisao == "sim" ? "Aprovou" : decisao == "nao" ? "Reprovou" : decisao == "validar" ? "Validação técnica" : "Novo Ciclo";

			if (obsHistorico != "") {
				if (historico != "") {
					var obsHistoricoTemp = obsHistorico.replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>')
					var json = JSON.parse(historico)
					json.push({
						"data": tools.outros.getDataAtual(),
						"usuario": usuario,
						"ciclo": ciclo,
						"decisao": decisao,
						"observacao": obsHistoricoTemp
					})
					hAPI.setCardValue("historico", JSONUtil.toJSON(json))
				} else {
					var obsHistoricoTemp = obsHistorico.replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>').replace('\r\n', '<br>')
					var json = [{
						"data": tools.outros.getDataAtual(),
						"usuario": usuario,
						"ciclo": ciclo,
						"decisao": decisao,
						"observacao": obsHistoricoTemp
					}]
					hAPI.setCardValue("historico", JSONUtil.toJSON(json))
				}
			}
		}

	},
	carregaTabSC: function () {
		var obj = {
			"ok": false,
			"error": ""
		}
		var SC = integra.getProtheus("/JWSSC102/" + hAPI.getCardValue("idEmpresa") + "/" + hAPI.getCardValue("idSc"))
		log.dir(SC)
		if (SC.ok) {
			SC.retorno.DADOS.forEach(function (el) {
				var childData = new java.util.HashMap();
				childData.put("C1_ITEM", "" + el.C1_ITEM);
				childData.put("C1_PRODUTO", "" + el.C1_PRODUTO.trim());
				childData.put("C1_UM", "" + el.C1_UM.trim());
				childData.put("C1_DESCRI", "" + el.C1_DESCRI.trim());
				childData.put("C1_QUANT", "" + el.C1_QUANT);
				hAPI.addCardChild("tabSC", childData);
			})

			obj.ok = true;
		} else {
			obj.error = SC.error;
		}

		return obj;
	},
	cotacao: {
		analise: {
			limparCampos: function () {
				hAPI.setCardValue("ciclo_aprovado", "");
				hAPI.setCardValue("obsComprador", "");
				hAPI.setCardValue("tipo_pc_contrato", "");
				hAPI.setCardValue("novaDataVencCotacao", "");
			}
		},
		atualizaCotacao: function (cotacaoFields) {
			log.info(">> tools.cotacao.atualizaCotacao");
			log.dir(cotacaoFields);
			var obj = { "ok": false, "error": "" };
			var dadosProtheus = integra.getProtheus("/JWSSC803/3/" + hAPI.getCardValue("idEmpresa") + "/" + hAPI.getCardValue("C8_NUM"));
			log.dir(dadosProtheus);

			if (dadosProtheus.ok) {
				if (dadosProtheus.retorno.message == undefined) {
					if (dadosProtheus.retorno.length > 0) {
						var cotacoes = tools.cotacao.getForm();
						log.info(">> cotacoes")
						log.dir(cotacoes)
						var WKCardId = "";
						for (var i = 0; i < cotacoes.rowsCount; i++) {
							var idx = 1 * cotacoes.getValue(i, "idx");
							var filtered = dadosProtheus.retorno.filter(function (el) { return el.C8_FORNECE == cotacoes.getValue(i, "C8_FORNECE") && el.C8_LOJA == cotacoes.getValue(i, "C8_LOJA") && el.C8_PRODUTO == cotacoes.getValue(i, "C8_PRODUTO").trim() })
							log.dir(filtered);
							if (filtered.length > 0) {
								WKCardId = cotacoes.getValue(i, "documentid");
								cotacaoFields.values.filter(function (el) { return el.fieldId == "C8_DIFAL" + "___" + idx })[0]["value"] = filtered[0]["C8_ICMSCOM"];
								cotacaoFields.values.filter(function (el) { return el.fieldId == "C8_VALICM" + "___" + idx })[0]["value"] = filtered[0]["C8_VALICM"];
								cotacaoFields.values.filter(function (el) { return el.fieldId == "C8_VALIPI" + "___" + idx })[0]["value"] = filtered[0]["C8_VALIPI"];
								cotacaoFields.values.filter(function (el) { return el.fieldId == "C8_VALISS" + "___" + idx })[0]["value"] = filtered[0]["C8_VALISS"];
								cotacaoFields.values.filter(function (el) { return el.fieldId == "C8_VALSOL" + "___" + idx })[0]["value"] = filtered[0]["C8_VALSOL"];
								cotacaoFields.values.filter(function (el) { return el.fieldId == "C8_TOTAL" + "___" + idx })[0]["value"] = filtered[0]["C8_TOTAL"];
								cotacaoFields.values.filter(function (el) { return el.fieldId == "VENCEDOR" + "___" + idx })[0]["value"] = filtered[0]["C8_STATUS"].toString();
							}
						}
					}
					log.info(">> tools.cotacao.atualizaCotacao [#688]");
					log.dir(cotacaoFields);
					obj = integra.putFluig("/ecm-forms/api/v2/cardindex/" + hAPI.getAdvancedProperty("formCotacao") + "/cards/" + WKCardId, cotacaoFields);

				} else {
					obj.ok = false;
					obj.error = dadosProtheus.retorno.message;
				}

			}
			return obj;
		},
		atualizaForm: function (formFields) {
			log.info(">> tools.cotacao.atualizaForm"); //Atualiza o formulário da solicitação
			var obj = { "ok": false, "error": "" };

			obj = integra.putFluig("/ecm-forms/api/v2/cardindex/" + getValue("WKFormId") + "/cards/" + getValue("WKCardId"), formFields);

			return obj;
		},
		atualizaProtheus: function (dadosFluig) {
			log.info(">> tools.cotacao.atualizaProtheus [#155]")
			log.dir(dadosFluig)
			var obj = { "ok": false }
			var dadosProtheus = {
				"COTACAO": [{
					"EMPRESA": hAPI.getCardValue("idEmpresa"),
					"C8_NUMERO": hAPI.getCardValue("C8_NUM"),
					"FORNECE": []
				}]
			}

			dadosFluig.fornec.forEach(function (el) {
				dadosProtheus.COTACAO[0].FORNECE.push({
					"C8_FORNECE": "" + el.A2_COD + el.A2_LOJA,
					"C8_COND": el.A2_COND != "" ? el.A2_COND : "001",
					"C8_TPFRETE": el.A2_TPFRETE,
					"C8_TOTFRE": el.A2_VALFRE != "" ? el.A2_VALFRE : "0.00",
					"C8_DESPESA": "0.00",
					"C8_SEGURO": "0.00",
					"C8_VLDESC": "0.00",
					"ITEM": []
				})
			})

			var TESPADRAO = tools.getDataset("DS_COMPRAS_PRAZOS_ENTREGA",
				null, null, true)
			TESPADRAO = TESPADRAO[0]["tesPadrao"];
			dadosFluig.dados = dadosFluig.dados.sort(function (a, b) {
				return parseInt(a.C8_ITEM.trim()) - parseInt(b.C8_ITEM.trim())
			})
			dadosFluig.dados.forEach(function (el) {
				var tmpFornece = "" + el.C8_FORNECE + el.C8_LOJA;
				log.info(">> tmpFornece : " + tmpFornece);
				var filtered = dadosProtheus.COTACAO[0].FORNECE.filter(function (it) { return it.C8_FORNECE == tmpFornece });

				if (tools.formata.toBranco(el.C8_PRECO) != ""
					&& tools.formata.toBranco(el.C8_QUANT) != ""
					&& tools.formata.toBranco(el.C8_PRAZO) != "") {
					if (filtered.length > 0) {
						filtered[0]["ITEM"].push({
							"C8_PRODUTO": el.C8_PRODUTO.trim(),
							"C8_ITEM": el.C8_ITEM.trim(),
							"C8_PRECO": tools.formata.toProtheus(el.C8_PRECO),
							"C8_QTDISP": el.C8_QUANT != "" ? el.C8_QUANT : "0",
							"C8_PRAZO": el.C8_PRAZO != "" ? el.C8_PRAZO : "1",
							"C8_TES": tools.tes.get(dadosFluig.TES,
								el.C8_FORNECE,
								el.C8_LOJA,
								el.C8_PRODUTO, TESPADRAO)
						})
					}
				} /*else {
					if (filtered.length > 0) {
						filtered[0]["ITEM"].push({
							"C8_PRODUTO": el.C8_PRODUTO.trim(),
							"C8_PRECO": "0.00",
							"C8_QTDISP": "0.00",
							"C8_PRAZO": "0",
							"C8_TES": "001"
						})
					}
				}*/

			})

			//log.dir(dadosProtheus)
			dadosProtheus.COTACAO[0].FORNECE = dadosProtheus.COTACAO[0].FORNECE.map(function (el) {
				el.ITEM = el.ITEM.sort(function (a, b) {
					return parseInt(a.C8_ITEM) - parseInt(b.C8_ITEM)
				})
				return el
			})
			var protheusFilter = {
				"COTACAO": [{
					"C8_NUMERO": dadosProtheus.COTACAO[0].C8_NUMERO,
					"EMPRESA": dadosProtheus.COTACAO[0].EMPRESA,
					"FORNECE": dadosProtheus.COTACAO[0].FORNECE.filter(function (el) {
						return el.ITEM.filter(function (it) { return it.C8_PRECO != "0.00" && it.C8_PRECO != "0.000000" }).length > 0
					})
				}]
			}

			log.info(">> protheusFilter <<");
			log.dir(protheusFilter);

			if (protheusFilter.COTACAO[0].FORNECE.length > 0) {
				var protheus = integra.postProtheus("/JWSSC802/2", protheusFilter);
				log.info(">> tools.cotacao.atualizaProtheus [#238]")
				if (protheus.ok) {
					obj.ok = true;
				} else {
					obj.ok = false;
					obj.error = protheus.error;
				}

			} else {
				obj.ok = false;
				obj["error"] = "Não foi encontrado dados para atualizar o Protheus"
			}

			return obj;
		},
		cancelaProtheus: function () {
			var obj = { ok: false }
			try {
				obj = integra.postProtheus("/JWSSC802/3", {
					"COTACAO": [{
						"EMPRESA": hAPI.getCardValue("idEmpresa"),
						"C8_NUMERO": hAPI.getCardValue("C8_NUM")
					}]
				})
			} catch (e) {
				obj["error"] = e.message != undefined ? e.message : e
			}

			return obj;
		},
		geraCicloInicial: function (cotacao_numero, cardData) {
			tools.log(">> tools.cotacao.geraCicloInicial [#550]")
			var obj = {
				"ok": false,
				"errorMessage": ""
			}
			var ciclo_atual = "1";

			tools.fornecedores.incluiCotacao(ciclo_atual, cardData);
			tools.log(">> tools.cotacao.geraCicloInicial [#788]")
			var cotacao = integra.getProtheus("/JWSSC803/1/" + hAPI.getCardValue("idEmpresa") + "/" + cotacao_numero);

			if (cotacao.ok) {
				var cardCreated = integra.postFluig("/ecm-forms/api/v2/cardindex/" + hAPI.getAdvancedProperty("formCotacao") + "/cards", {
					"values": [
						{
							"fieldId": "idEmpresa",
							"value": hAPI.getCardValue("idEmpresa")
						},
						{
							"fieldId": "C8_NUM",
							"value": cotacao_numero
						},
						{
							"fieldId": "C8_CICLO",
							"value": ciclo_atual
						}
					]
				})

				if (cardCreated.ok) {
					var formFields = { "values": [] };
					tools.log("JWSSC803 Length: " + cotacao.retorno.DADOS.length);
					cotacao.retorno.DADOS.forEach(function (el, idx, arr) {
						formFields.values.push({ "fieldId": "C8_ITEM" + "___" + (idx + 1), "value": "" + el.C8_ITEM });
						formFields.values.push({ "fieldId": "C8_PRODUTO" + "___" + (idx + 1), "value": "" + el.C8_PRODUTO.trim() });
						formFields.values.push({ "fieldId": "C8_UM" + "___" + (idx + 1), "value": "" + el.C8_UM });
						formFields.values.push({ "fieldId": "C8_FORNECE" + "___" + (idx + 1), "value": "" + el.C8_FORNECE });
						formFields.values.push({ "fieldId": "C8_LOJA" + "___" + (idx + 1), "value": "" + el.C8_LOJA });
						formFields.values.push({ "fieldId": "C8_VALIDA" + "___" + (idx + 1), "value": "" + el.C8_VALIDA });
					})

					var filhos = integra.putFluig("/ecm-forms/api/v2/cardindex/" + hAPI.getAdvancedProperty("formCotacao") + "/cards/" + cardCreated.retorno.cardId, formFields);

					obj.ok = filhos.ok;
					obj.errorMessage = filhos.error;

				}
				else {
					obj.ok = false;
					obj.errorMessage = cardCreated.error;
				}

			} else {
				obj.errorMessage = cotacao.error;
			}

			return obj;
		},
		geraCicloNovo: function (ciclo_atual, cardData) {
			log.info(">> tools.cotacao.geraCicloNovo " + ciclo_atual)
			var obj = {
				"ok": false,
				"errorMessage": ""
			}

			var ciclo_anterior = (ciclo_atual - 1).toString();

			obj_inclui = tools.fornecedores.incluiCotacao(ciclo_atual, cardData);
			log.info("++ obj_inclui");
			log.dir(obj_inclui);

			if (obj_inclui.ok) {

				obj = tools.fornecedores.excluiCotacao(ciclo_anterior, cardData);
				log.info("++ obj > tools.fornecedores.excluiCotacao");
				log.dir(obj);

				if (obj.ok) {

					var fornecedoresAtivo = tools.cotacao.getTabFornecedor(cardData, false)

					log.info(">> fornecedoresAtivo");
					log.dir(fornecedoresAtivo);

					var cardId = "";
					var dsCotacoes = tools.cotacao.getFormCiclo(ciclo_anterior);
					//for(var i = 0 ; i < dsCotacoes.rowsCount ; i++){
					log.info("-- dsCotacoes");
					log.dir(dsCotacoes);

					if (dsCotacoes.rowsCount > 0) {
						var jsonCotacoes = tools.outros.datasetToJson(dsCotacoes);
						var filtFornecedores = fornecedoresAtivo
							.filter(function (el) { return jsonCotacoes.filter(function (cot) { return cot.C8_FORNECE == el.A2_COD && cot.C8_LOJA == el.A2_LOJA }).length > 0 })

						if (filtFornecedores.length > 0) {
							if (cardId == "") {
								var cardCreated = integra.postFluig("/ecm-forms/api/v2/cardindex/" + hAPI.getAdvancedProperty("formCotacao") + "/cards", {
									"values": [
										{
											"fieldId": "idEmpresa",
											"value": hAPI.getCardValue("idEmpresa")
										},
										{
											"fieldId": "C8_NUM",
											"value": hAPI.getCardValue("C8_NUM")
										},
										{
											"fieldId": "C8_CICLO",
											"value": ciclo_atual
										}
									]
								})

								log.info("-- cardCreated");
								log.dir(cardCreated);

								if (cardCreated.ok) {
									var formFields = { "values": [] };
									var seq = 0;
									for (var i = 0; i < dsCotacoes.rowsCount; i++) {
										var idx = dsCotacoes.getValue(i, "idx");
										seq = idx * 1;

										log.info("TESTE ERRO E " + dsCotacoes.getValue(i, "C8_QUANT"))

										formFields.values.push({ "fieldId": "C8_ITEM" + "___" + idx, "value": "" + (dsCotacoes.getValue(i, "C8_ITEM") != null && dsCotacoes.getValue(i, "C8_ITEM") != "null") ? dsCotacoes.getValue(i, "C8_ITEM") : "" });
										formFields.values.push({ "fieldId": "C8_PRODUTO" + "___" + idx, "value": "" + (dsCotacoes.getValue(i, "C8_PRODUTO").trim() != null && dsCotacoes.getValue(i, "C8_PRODUTO").trim() != "null") ? dsCotacoes.getValue(i, "C8_PRODUTO").trim() : "" });
										formFields.values.push({ "fieldId": "C8_UM" + "___" + idx, "value": "" + (dsCotacoes.getValue(i, "C8_UM") != null && dsCotacoes.getValue(i, "C8_UM") != "null") ? dsCotacoes.getValue(i, "C8_UM") : "" });
										formFields.values.push({ "fieldId": "C8_FORNECE" + "___" + idx, "value": "" + (dsCotacoes.getValue(i, "C8_FORNECE") != null && dsCotacoes.getValue(i, "C8_FORNECE") != "null") ? dsCotacoes.getValue(i, "C8_FORNECE") : "" });
										formFields.values.push({ "fieldId": "C8_LOJA" + "___" + idx, "value": "" + (dsCotacoes.getValue(i, "C8_LOJA") != null && dsCotacoes.getValue(i, "C8_LOJA") != "null") ? dsCotacoes.getValue(i, "C8_LOJA") : "" });
										formFields.values.push({ "fieldId": "C8_VALIDA" + "___" + idx, "value": "" + (dsCotacoes.getValue(i, "C8_VALIDA") != null && dsCotacoes.getValue(i, "C8_VALIDA") != "null") ? dsCotacoes.getValue(i, "C8_VALIDA") : "" });
										formFields.values.push({ "fieldId": "C8_QUANT" + "___" + idx, "value": "" + (dsCotacoes.getValue(i, "C8_QUANT") != null && dsCotacoes.getValue(i, "C8_QUANT") != "null") ? dsCotacoes.getValue(i, "C8_QUANT") : "" });
										formFields.values.push({ "fieldId": "C8_PRECO" + "___" + idx, "value": "" + (dsCotacoes.getValue(i, "C8_PRECO") != null && dsCotacoes.getValue(i, "C8_PRECO") != "null") ? dsCotacoes.getValue(i, "C8_PRECO") : "" });
										formFields.values.push({ "fieldId": "C8_TOTAL" + "___" + idx, "value": "" + (dsCotacoes.getValue(i, "C8_TOTAL") != null && dsCotacoes.getValue(i, "C8_TOTAL") != "null") ? dsCotacoes.getValue(i, "C8_TOTAL") : "" });
										formFields.values.push({ "fieldId": "C8_PRAZO" + "___" + idx, "value": "" + (dsCotacoes.getValue(i, "C8_PRAZO") != null && dsCotacoes.getValue(i, "C8_PRAZO") != "null") ? dsCotacoes.getValue(i, "C8_PRAZO") : "" });
										formFields.values.push({ "fieldId": "C8_VALIPI" + "___" + idx, "value": "" + (dsCotacoes.getValue(i, "C8_VALIPI") != null && dsCotacoes.getValue(i, "C8_ITEM") != "null") ? dsCotacoes.getValue(i, "C8_VALIPI") : "" });
										formFields.values.push({ "fieldId": "C8_VALICM" + "___" + idx, "value": "" + (dsCotacoes.getValue(i, "C8_VALICM") != null && dsCotacoes.getValue(i, "C8_ITEM") != "null") ? dsCotacoes.getValue(i, "C8_VALICM") : "" });
										formFields.values.push({ "fieldId": "C8_VALISS" + "___" + idx, "value": "" + (dsCotacoes.getValue(i, "C8_VALISS") != null && dsCotacoes.getValue(i, "C8_ITEM") != "null") ? dsCotacoes.getValue(i, "C8_VALISS") : "" });
										formFields.values.push({ "fieldId": "C8_ITEM" + "___" + idx, "value": "" + (dsCotacoes.getValue(i, "C8_ITEM") != null && dsCotacoes.getValue(i, "C8_ITEM") != "null") ? dsCotacoes.getValue(i, "C8_ITEM") : "" });
									}

									obj_inclui.obj.forEach(function (el) {
										seq++;
										formFields.values.push({ "fieldId": "C8_ITEM" + "___" + seq, "value": "" + el["C8_ITEM"] });
										formFields.values.push({ "fieldId": "C8_PRODUTO" + "___" + seq, "value": "" + el["C8_PRODUTO"].trim() });
										formFields.values.push({ "fieldId": "C8_UM" + "___" + seq, "value": "" + el["C8_UM"] });
										formFields.values.push({ "fieldId": "C8_FORNECE" + "___" + seq, "value": "" + el["C8_FORNECE"] });
										formFields.values.push({ "fieldId": "C8_LOJA" + "___" + seq, "value": "" + el["C8_LOJA"] });
										formFields.values.push({ "fieldId": "C8_VALIDA" + "___" + seq, "value": "" + el["C8_VALIDA"] });
										/*formFields.values.push({ "fieldId": "C8_QUANT"+"___"+seq	, "value": ""+el["C8_QUANT"] });
										formFields.values.push({ "fieldId": "C8_PRECO"+"___"+seq	, "value": ""+el["C8_PRECO"] });
										formFields.values.push({ "fieldId": "C8_TOTAL"+"___"+seq	, "value": ""+el["C8_TOTAL"] });
										formFields.values.push({ "fieldId": "C8_PRAZO"+"___"+seq	, "value": ""+el["C8_PRAZO"] });
										formFields.values.push({ "fieldId": "C8_VALIPI"+"___"+seq	, "value": ""+el["C8_VALIPI"] });
										formFields.values.push({ "fieldId": "C8_VALICM"+"___"+seq	, "value": ""+el["C8_VALICM"] });
										formFields.values.push({ "fieldId": "C8_VALISS"+"___"+seq	, "value": ""+el["C8_VALISS"] });
										*/
									})

									log.info("-- formFields");
									log.dir(formFields);

									var filhos = integra.putFluig("/ecm-forms/api/v2/cardindex/" + hAPI.getAdvancedProperty("formCotacao") + "/cards/" + cardCreated.retorno.cardId, formFields);

									log.info("-- filhos");
									log.dir(filhos);

									obj.ok = filhos.ok;
									obj.errorMessage = filhos.error;

								}
								else {
									obj.ok = false;
									obj.errorMessage = cardCreated.error;
								}
							}
						}

					}
				}
			}
			log.info("<< tools.cotacao.geraCicloNovo " + ciclo_atual)
			return obj;
		},
		geraCotacao: function (cardData) {
			var obj = {
				"ok": false,
				"numero": "",
				"errorMessage": ""
			}

			var itensCotacao = tools.cotacao.getItensCotacao(cardData);

			var param = {
				"SOLICITA": [
					{
						"EMPRESA": hAPI.getCardValue("idEmpresa"),
						"VALIDADE": hAPI.getCardValue("validade_cotacao") != "" ? hAPI.getCardValue("validade_cotacao") : "1",
						"C8_TPDOC": "1",
						"ITEM": itensCotacao
					}
				]
			};

			tools.log("-- param --");
			log.dir(param);
			tools.log("JWSSC801 Length: " + itensCotacao.length);


			var retCotacao = integra.postProtheus(
				"/JWSSC801/1",
				param
			)

			if (retCotacao.ok) {

				var tableFornecedores = tools.getTableFilho(
					cardData || hAPI.getCardData(getValue("WKNumProces")),
					["CICLO_INSERIDO"]
				);
				tableFornecedores.forEach(function (linha) {
					hAPI.setCardValue(linha["CICLO_INSERIDO"].name, "1");
				})

				if (retCotacao.retorno.data[0] != undefined && retCotacao.retorno.data[0].cotacao != undefined) {
					obj.ok = true;
					obj.numero = retCotacao.retorno.data[0].cotacao;
				} else {
					obj.errorMessage = "Problema no retorno do serviço";
				}

			} else {
				obj.errorMessage = retCotacao.error;
			}

			return obj;

		},
		getCardId: function () {
			var ds = integra.getDBFluig(
				"SELECT DISTINCT ML.DOCUMENTID FROM " + hAPI.getAdvancedProperty("mlFormCotacao") + " ML \
					  INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
					  WHERE ML.idEmpresa = '"+ hAPI.getCardValue("idEmpresa") + "' AND ML.C8_NUM = '" + hAPI.getCardValue("C8_NUM") + "' AND ML.C8_CICLO = '" + hAPI.getCardValue("ciclo_atual") + "'"
			)

			return ds != null && ds.rowsCount > 0 ? ds.getValue(0, "documentid") : 0
		},
		getData: function (cardData) {
			tools.log(">> tools.cotacao.getData [#1049]");
			var obj = { "ok": false, "dados": [], "TES": [], "fornec": [] };

			try {
				var numProcess = getValue("WKNumProces");
				var CICLO_ATUAL = hAPI.getCardValue("ciclo_atual");
				var childrenProcess = hAPI.getChildrenInstances(numProcess);
				var mapProces = cardData || hAPI.getCardData(numProcess);
				var iteratorProc = mapProces.keySet().iterator();
				var solicFilha = childrenProcess.get(childrenProcess.size() - 1);
				var mapChildren = hAPI.getCardData(solicFilha);
				var iteratorChild = mapChildren.keySet().iterator();

				if (hAPI.getCardValue("tipoSc") != "5") { // Tipo de Solicitação diferente de regularização 
					while (iteratorChild.hasNext()) {
						var id = "" + iteratorChild.next(); if (id.indexOf("TES_A2_COD___") == 0) {
							var idx = id.replace("TES_A2_COD___", "");
							var hasTES = (mapChildren.get("TES_CODIGO" + "___" + idx) != null && mapChildren.get("TES_CODIGO" + "___" + idx) != "null") ? mapChildren.get("TES_CODIGO" + "___" + idx) : ""
							hasTES = hasTES != "";
							if (hasTES)
								obj.TES.push({
									"TES_A2_COD": "" + (mapChildren.get("TES_A2_COD" + "___" + idx) != null && mapChildren.get("TES_A2_COD" + "___" + idx) != "null") ? mapChildren.get("TES_A2_COD" + "___" + idx) : "",
									"TES_A2_LOJA": "" + (mapChildren.get("TES_A2_LOJA" + "___" + idx) != null && mapChildren.get("TES_A2_LOJA" + "___" + idx) != "null") ? mapChildren.get("TES_A2_LOJA" + "___" + idx) : "",
									"TES_A2_CGC": "" + (mapChildren.get("TES_A2_CGC" + "___" + idx) != null && mapChildren.get("TES_A2_CGC" + "___" + idx) != "null") ? mapChildren.get("TES_A2_CGC" + "___" + idx) : "",
									"TES_B1_COD": "" + (mapChildren.get("TES_B1_COD" + "___" + idx) != null && mapChildren.get("TES_B1_COD" + "___" + idx) != "null") ? mapChildren.get("TES_B1_COD" + "___" + idx) : "",
									"TES_CODIGO": "" + (mapChildren.get("TES_CODIGO" + "___" + idx) != null && mapChildren.get("TES_CODIGO" + "___" + idx) != "null") ? mapChildren.get("TES_CODIGO" + "___" + idx) : "",
									"TES_COMPRADOR": "" + (mapChildren.get("TES_COMPRADOR" + "___" + idx) != null && mapChildren.get("TES_COMPRADOR" + "___" + idx) != "null") ? mapChildren.get("TES_COMPRADOR" + "___" + idx) : ""
								})
						}
						else if (id.indexOf("A2_COD___") == 0) {
							var idx = id.replace("A2_COD___", "");

							obj.fornec.push({
								"A2_COD": "" + (mapChildren.get("A2_COD" + "___" + idx) != null && mapChildren.get("A2_COD" + "___" + idx) != "null") ? mapChildren.get("A2_COD" + "___" + idx) : "",
								"A2_LOJA": "" + (mapChildren.get("A2_LOJA" + "___" + idx) != null && mapChildren.get("A2_LOJA" + "___" + idx) != "null") ? mapChildren.get("A2_LOJA" + "___" + idx) : "",
								"A2_CGC": "" + (mapChildren.get("A2_CGC" + "___" + idx) != null && mapChildren.get("A2_CGC" + "___" + idx) != "null") ? mapChildren.get("A2_CGC" + "___" + idx) : "",
								"A2_COND": "" + (mapChildren.get("A2_COND" + "___" + idx) != null && mapChildren.get("A2_COND" + "___" + idx) != "null") ? mapChildren.get("A2_COND" + "___" + idx) : "",
								"A2_TPFRETE": "" + (mapChildren.get("A2_TPFRETE" + "___" + idx) != null && mapChildren.get("A2_TPFRETE" + "___" + idx) != "null") ? mapChildren.get("A2_TPFRETE" + "___" + idx) : "",
								"A2_VALFRE": "" + (mapChildren.get("A2_VALFRE" + "___" + idx) != null && mapChildren.get("A2_VALFRE" + "___" + idx) != "null") ? mapChildren.get("A2_VALFRE" + "___" + idx) : "",
								"A2_VALIDA": "" + (mapChildren.get("A2_VALIDA" + "___" + idx) != null && mapChildren.get("A2_VALIDA" + "___" + idx) != "null") ? mapChildren.get("A2_VALIDA" + "___" + idx) : ""
							})
						}
					}

					var ds = DatasetFactory.getDataset(
						"DS_CONSULTA_AUXILIAR_COTACAO",
						null,
						[
							DatasetFactory.createConstraint("S_COTACAO", solicFilha, solicFilha, ConstraintType.MUST),
							DatasetFactory.createConstraint("IDEMPRESA", hAPI.getCardValue("idEmpresa"), hAPI.getCardValue("idEmpresa"), ConstraintType.MUST),
							DatasetFactory.createConstraint("S_COMPRA", hAPI.getCardValue("numeroSolicitacao"), hAPI.getCardValue("numeroSolicitacao"), ConstraintType.MUST)
						],
						null
					)
					tools.log('-- DS_CONSULTA_AUXILIAR_COTACAO')

					if (ds != null && ds.values.length > 0) {
						for (var i = 0; i < ds.values.length; i++) {

							obj.dados.push({
								"C8_CICLO": "" + (ds.getValue(i, "C8_CICLO") != null && ds.getValue(i, "C8_CICLO") != "null") ? ds.getValue(i, "C8_CICLO") : "",
								"C8_ITEM": "" + (ds.getValue(i, "C8_ITEM") != null && ds.getValue(i, "C8_ITEM") != "null") ? ds.getValue(i, "C8_ITEM") : "",
								"C8_PRODUTO": "" + (ds.getValue(i, "C8_PRODUTO") != null && ds.getValue(i, "C8_PRODUTO") != "null") ? ds.getValue(i, "C8_PRODUTO") : "",
								"C8_UM": "" + (ds.getValue(i, "C8_UM") != null && ds.getValue(i, "C8_UM") != "null") ? ds.getValue(i, "C8_UM") : "",
								"C8_FORNECE": "" + (ds.getValue(i, "C8_FORNECE") != null && ds.getValue(i, "C8_FORNECE") != "null") ? ds.getValue(i, "C8_FORNECE") : "",
								"C8_LOJA": "" + (ds.getValue(i, "C8_LOJA") != null && ds.getValue(i, "C8_LOJA") != "null") ? ds.getValue(i, "C8_LOJA") : "",
								"C8_QUANT": "" + (ds.getValue(i, "C8_QUANT") != null && ds.getValue(i, "C8_QUANT") != "null") ? ds.getValue(i, "C8_QUANT") : "",
								"C8_PRECO": "" + (ds.getValue(i, "C8_PRECO") != null && ds.getValue(i, "C8_PRECO") != "null") ? ds.getValue(i, "C8_PRECO") : "",
								"C8_TOTAL": "" + (ds.getValue(i, "C8_TOTAL") != null && ds.getValue(i, "C8_TOTAL") != "null") ? ds.getValue(i, "C8_TOTAL") : "",
								"C8_PRAZO": "" + (ds.getValue(i, "C8_PRAZO") != null && ds.getValue(i, "C8_PRAZO") != "null") ? ds.getValue(i, "C8_PRAZO") : "",
								"C8_FILENT": "" + (ds.getValue(i, "C8_FILENT") != null && ds.getValue(i, "C8_FILENT") != "null") ? ds.getValue(i, "C8_FILENT") : "",
								"C8_VALIPI": "" + (ds.getValue(i, "C8_VALIPI") != null && ds.getValue(i, "C8_VALIPI") != "null") ? ds.getValue(i, "C8_VALIPI") : "",
								"C8_VALICM": "" + (ds.getValue(i, "C8_VALICM") != null && ds.getValue(i, "C8_VALICM") != "null") ? ds.getValue(i, "C8_VALICM") : "",
								"C8_VALISS": "" + (ds.getValue(i, "C8_VALISS") != null && ds.getValue(i, "C8_VALISS") != "null") ? ds.getValue(i, "C8_VALISS") : "",
								"C8_DIFAL": "" + (ds.getValue(i, "C8_DIFAL") != null && ds.getValue(i, "C8_DIFAL") != "null") ? ds.getValue(i, "C8_DIFAL") : "",
								"C8_VALSOL": "" + (ds.getValue(i, "C8_VALSOL") != null && ds.getValue(i, "C8_VALSOL") != "null") ? ds.getValue(i, "C8_VALSOL") : "",
								"C8_VALIDA": "" + (ds.getValue(i, "C8_VALIDA") != null && ds.getValue(i, "C8_VALIDA") != "null") ? ds.getValue(i, "C8_VALIDA") : "",
								"VENCEDOR": "" + (ds.getValue(i, "VENCEDOR") != null && ds.getValue(i, "VENCEDOR") != "null") ? ds.getValue(i, "VENCEDOR") : ""
							})
						}
					}

					tools.log("++ obj");
					log.dir(obj);
					tools.log(">> tools.cotacao.getData [#1159]");
					obj.dados.sort(function (a, b) {
						return parseInt(a.C8_ITEM) - parseInt(b.C8_ITEM)
					})
					if (obj.dados.length > 0) {

						var updateFields = {};
						var updateCotacoes = {};

						var cotacoes = tools.cotacao.getForm();
						log.dir(cotacoes)
						for (var i = 0; i < cotacoes.rowsCount; i++) {
							var idx = 1 * cotacoes.getValue(i, "idx");
							log.info(">> indexesChildren linha: " + idx)
							log.info(" || C8_PRODUTO: " + cotacoes.getValue(i, "C8_PRODUTO") + " || C8_FORNECE: " + cotacoes.getValue(i, "C8_FORNECE") + " || C8_LOJA: " + cotacoes.getValue(i, "C8_LOJA"))
							var dataFiltered = obj.dados.filter(function (el) { return el.C8_PRODUTO == cotacoes.getValue(i, "C8_PRODUTO") && el.C8_FORNECE == cotacoes.getValue(i, "C8_FORNECE") && el.C8_LOJA == cotacoes.getValue(i, "C8_LOJA") });
							if (dataFiltered.length > 0 /*&& dataFiltered[0]["C8_PRECO"] != "" && dataFiltered[0]["C8_PRECO"] != "0.00 && dataFiltered[0]["C8_PRECO"] != "0.000000"*/) {
								log.info(">> dataFiltered <<");
								log.dir(dataFiltered);
								updateCotacoes["C8_ITEM" + "___" + idx] = (dataFiltered[0]["C8_ITEM"] != null && dataFiltered[0]["C8_ITEM"] != "null") ? dataFiltered[0]["C8_ITEM"] : "";
								updateCotacoes["C8_PRODUTO" + "___" + idx] = (dataFiltered[0]["C8_PRODUTO"] != null && dataFiltered[0]["C8_PRODUTO"] != "null") ? dataFiltered[0]["C8_PRODUTO"] : "";
								updateCotacoes["C8_UM" + "___" + idx] = (dataFiltered[0]["C8_UM"] != null && dataFiltered[0]["C8_UM"] != "null") ? dataFiltered[0]["C8_UM"] : "";
								updateCotacoes["C8_FORNECE" + "___" + idx] = (dataFiltered[0]["C8_FORNECE"] != null && dataFiltered[0]["C8_FORNECE"] != "null") ? dataFiltered[0]["C8_FORNECE"] : "";
								updateCotacoes["C8_LOJA" + "___" + idx] = (dataFiltered[0]["C8_LOJA"] != null && dataFiltered[0]["C8_LOJA"] != "null") ? dataFiltered[0]["C8_LOJA"] : "";
								updateCotacoes["C8_QUANT" + "___" + idx] = (dataFiltered[0]["C8_QUANT"] != null && dataFiltered[0]["C8_QUANT"] != "null") ? dataFiltered[0]["C8_QUANT"] : "";
								updateCotacoes["C8_PRECO" + "___" + idx] = (dataFiltered[0]["C8_PRECO"] != null && dataFiltered[0]["C8_PRECO"] != "null") ? tools.formata.toProtheus(dataFiltered[0]["C8_PRECO"]) : "";
								updateCotacoes["C8_TOTAL" + "___" + idx] = (dataFiltered[0]["C8_TOTAL"] != null && dataFiltered[0]["C8_TOTAL"] != "null") ? dataFiltered[0]["C8_TOTAL"] : "";
								updateCotacoes["C8_PRAZO" + "___" + idx] = (dataFiltered[0]["C8_PRAZO"] != null && dataFiltered[0]["C8_PRAZO"] != "null") ? dataFiltered[0]["C8_PRAZO"] : "";
								updateCotacoes["C8_FILENT" + "___" + idx] = (dataFiltered[0]["C8_FILENT"] != null && dataFiltered[0]["C8_FILENT"] != "null") ? dataFiltered[0]["C8_FILENT"] : "";
								updateCotacoes["C8_VALIPI" + "___" + idx] = (dataFiltered[0]["C8_VALIPI"] != null && dataFiltered[0]["C8_VALIPI"] != "null") ? dataFiltered[0]["C8_VALIPI"] : "";
								updateCotacoes["C8_VALICM" + "___" + idx] = (dataFiltered[0]["C8_VALICM"] != null && dataFiltered[0]["C8_VALICM"] != "null") ? dataFiltered[0]["C8_VALICM"] : "";
								updateCotacoes["C8_VALISS" + "___" + idx] = (dataFiltered[0]["C8_VALISS"] != null && dataFiltered[0]["C8_VALISS"] != "null") ? dataFiltered[0]["C8_VALISS"] : "";
								updateCotacoes["C8_DIFAL" + "___" + idx] = (dataFiltered[0]["C8_DIFAL"] != null && dataFiltered[0]["C8_DIFAL"] != "null") ? dataFiltered[0]["C8_DIFAL"] : "";
								updateCotacoes["C8_VALSOL" + "___" + idx] = (dataFiltered[0]["C8_VALSOL"] != null && dataFiltered[0]["C8_VALSOL"] != "null") ? dataFiltered[0]["C8_VALSOL"] : "";
								updateCotacoes["C8_VALIDA" + "___" + idx] = (dataFiltered[0]["C8_VALIDA"] != null && dataFiltered[0]["C8_VALIDA"] != "null") ? dataFiltered[0]["C8_VALIDA"] : "";
								updateCotacoes["VENCEDOR" + "___" + idx] = (dataFiltered[0]["VENCEDOR"] != null && dataFiltered[0]["VENCEDOR"] != "null") ? dataFiltered[0]["VENCEDOR"] : "";
							} else {
								updateCotacoes["C8_ITEM" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_ITEM"));
								updateCotacoes["C8_PRODUTO" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_PRODUTO"));
								updateCotacoes["C8_UM" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_UM"));
								updateCotacoes["C8_FORNECE" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_FORNECE"));
								updateCotacoes["C8_LOJA" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_LOJA"));
								updateCotacoes["C8_QUANT" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_QUANT"));
								updateCotacoes["C8_PRECO" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_PRECO"));
								updateCotacoes["C8_TOTAL" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_TOTAL"));
								updateCotacoes["C8_PRAZO" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_PRAZO"));
								updateCotacoes["C8_FILENT" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_FILENT"));
								updateCotacoes["C8_VALIPI" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_VALIPI"));
								updateCotacoes["C8_VALICM" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_VALICM"));
								updateCotacoes["C8_VALISS" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_VALISS"));
								updateCotacoes["C8_DIFAL" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_DIFAL"));
								updateCotacoes["C8_VALSOL" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_VALSOL"));
								updateCotacoes["C8_VALIDA" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "C8_VALIDA"));
								updateCotacoes["VENCEDOR" + "___" + idx] = tools.formata.toBranco(cotacoes.getValue(i, "VENCEDOR"));

							}
						}


						var tableTES = tools.getTableFilho(
							cardData || hAPI.getCardData(getValue("WKNumProces")),
							["TES_A2_COD", "TES_A2_LOJA", "TES_B1_COD"]
						);
						var tabTES = tableTES.map(function (linha) {
							var idx = linha["TES_A2_COD"].index;
							return {
								"idx": idx,
								"TES_A2_COD": "" + linha["TES_A2_COD"].value,
								"TES_A2_LOJA": "" + linha["TES_A2_LOJA"].value,
								"TES_B1_COD": "" + linha["TES_B1_COD"].value
							}
						})


						obj.TES.forEach(function (el) {
							var filtTES = tabTES.filter(function (t) {
								return t.TES_A2_COD == el.TES_A2_COD
									&& t.TES_A2_LOJA == el.TES_A2_LOJA
							});

							if (filtTES.length > 0) {
								updateFields["TES_A2_COD" + "___" + filtTES[0].idx] = el["TES_A2_COD"];
								updateFields["TES_A2_LOJA" + "___" + filtTES[0].idx] = el["TES_A2_LOJA"];
								updateFields["TES_A2_CGC" + "___" + filtTES[0].idx] = el["TES_A2_CGC"];
								updateFields["TES_B1_COD" + "___" + filtTES[0].idx] = el["TES_B1_COD"];
								updateFields["TES_CODIGO" + "___" + filtTES[0].idx] = el["TES_CODIGO"];
								updateFields["TES_COMPRADOR" + "___" + filtTES[0].idx] = el["TES_COMPRADOR"];
							}
						})
						obj.TES.forEach(function (el) {
							var filtTES = tabTES.filter(function (t) {
								return t.TES_B1_COD == el.TES_B1_COD
							});

							if (filtTES.length > 0) {
								updateFields["TES_A2_COD" + "___" + filtTES[0].idx] = el["TES_A2_COD"];
								updateFields["TES_A2_LOJA" + "___" + filtTES[0].idx] = el["TES_A2_LOJA"];
								updateFields["TES_A2_CGC" + "___" + filtTES[0].idx] = el["TES_A2_CGC"];
								updateFields["TES_B1_COD" + "___" + filtTES[0].idx] = el["TES_B1_COD"];
								updateFields["TES_CODIGO" + "___" + filtTES[0].idx] = el["TES_CODIGO"];
								updateFields["TES_COMPRADOR" + "___" + filtTES[0].idx] = el["TES_COMPRADOR"];
							}
						})

						var tableFornecedores = tools.getTableFilho(
							cardData || hAPI.getCardData(getValue("WKNumProces")),
							["A2_COD", "A2_LOJA", "A2_CGC", "A2_COND", "A2_TPFRETE", "A2_VALFRE", "A2_VALIDA"]
						);
						var tabFornecedor = tableFornecedores.map(function (linha) {

							return {
								"idx": idx,
								"A2_COD": linha["A2_COD"].value,
								"A2_LOJA": linha["A2_LOJA"].value,
								"A2_CGC": linha["A2_CGC"].value,
								"A2_COND": linha["A2_COND"].value,
								"A2_TPFRETE": linha["A2_TPFRETE"].value,
								"A2_VALFRE": linha["A2_VALFRE"].value,
								"A2_VALIDA": linha["A2_VALIDA"].value
							}
						})

						obj.fornec.forEach(function (el) {
							var filtFornec = tabFornecedor.filter(function (t) { return t.A2_COD == el.A2_COD && t.A2_LOJA == el.A2_LOJA });

							if (filtFornec.length > 0) {
								updateFields["A2_COD" + "___" + filtFornec[0].idx] = el["A2_COD"];
								updateFields["A2_LOJA" + "___" + filtFornec[0].idx] = el["A2_LOJA"];
								updateFields["A2_CGC" + "___" + filtFornec[0].idx] = el["A2_CGC"];
								updateFields["A2_COND" + "___" + filtFornec[0].idx] = el["A2_COND"];
								updateFields["A2_TPFRETE" + "___" + filtFornec[0].idx] = el["A2_TPFRETE"];
								updateFields["A2_VALFRE" + "___" + filtFornec[0].idx] = el["A2_VALFRE"];
								updateFields["A2_VALIDA" + "___" + filtFornec[0].idx] = el["A2_VALIDA"];
							}
						})

						if (Object.keys(updateFields).length > 0) {
							var formFields = { "values": [] };

							while (iteratorProc.hasNext()) {
								var id = "" + iteratorProc.next();

								if (updateFields[id] != undefined) {
									formFields.values.push({
										"fieldId": id,
										"value": updateFields[id]
									})
								} else {
									formFields.values.push({
										"fieldId": id,
										"value": mapProces.get(id)
									})
								}
							}

							obj["ok"] = true;
							obj["formFields"] = formFields;
						}

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
							tools.log(cotacaoFields);

							obj["ok"] = true;
							obj["cotacaoFields"] = cotacaoFields;
						}

					} else {
						hAPI.setTaskComments(
							getValue("WKUser"),
							getValue("WKNumProces"),
							getValue("WKActualThread"),
							"Não foi encontrado nenhum dado de cotação para recuperar da solicitação filha " + solicFilha
						);
					}
				} else { // Para regularização apenas carregará os dados da própria C8 da solicitação atual

					var tableCotacoes = tools.getTableFilho(
						cardData || hAPI.getCardData(getValue("WKNumProces")),
						["C8_CICLO", "C8_ITEM", "C8_PRODUTO", "C8_UM", "C8_FORNECE", "C8_LOJA",
							"C8_QUANT", "C8_PRECO", "C8_TOTAL", "C8_PRAZO", "C8_FILENT", "C8_VALIPI",
							"C8_VALICM", "C8_VALISS", "C8_DIFAL", "C8_VALSOL", "C8_VALIDA"]
					);
					tableCotacoes.forEach(function (linha) {

						if (linha["C8_CICLO___"].value == CICLO_ATUAL) {
							log.info(" || C8_PRODUTO: " + linha["C8_PRODUTO"].value
								+ " || C8_FORNECE: " + linha["C8_FORNECE"].value
								+ " || C8_LOJA: " + linha["C8_LOJA"].value)
							obj.dados.push({
								"C8_QUANT": linha["C8_QUANT"].value,
								"C8_PRECO": linha["C8_PRECO"].value,
								"C8_TOTAL": linha["C8_TOTAL"].value,
								"C8_PRAZO": linha["C8_PRAZO"].value,
								"C8_FILENT": linha["C8_FILENT"].value,
								"C8_VALIPI": linha["C8_VALIPI"].value,
								"C8_VALICM": linha["C8_VALICM"].value,
								"C8_VALISS": linha["C8_VALISS"].value,
								"C8_DIFAL": linha["C8_DIFAL"].value,
								"C8_VALSOL": linha["C8_VALSOL"].value,
								"C8_VALIDA": linha["C8_VALIDA"].value
							})
						}
					})

					var tableTES = tools.getTableFilho(
						cardData || hAPI.getCardData(getValue("WKNumProces")),
						["TES_A2_COD", "TES_A2_LOJA", "TES_B1_COD", "TES_CODIGO"]
					);
					obj.TES = tableTES.filter(function (linha) {
						return linha["TES_CODIGO"].value != ""
					}).map(function (linha) {
						return {
							"idx": linha["TES_A2_COD"].index,
							"TES_A2_COD": "" + linha["TES_A2_COD"].value,
							"TES_A2_LOJA": "" + linha["TES_A2_LOJA"].value,
							"TES_B1_COD": "" + linha["TES_B1_COD"].value
						}
					})
					var tableFornecedores = tools.getTableFilho(
						cardData || hAPI.getCardData(getValue("WKNumProces")),
						["A2_COD", "A2_LOJA", "A2_CGC", "A2_COND", "A2_TPFRETE", "A2_VALFRE", "A2_VALIDA"]
					);

					obj.fornec = tableFornecedores.filter(function (linha) {
						return linha["CICLO_REMOVIDO"].value == ""
					}).map(function (linha) {
						return {
							"A2_COD": linha["A2_COD"].value,
							"A2_LOJA": linha["A2_LOJA"].value,
							"A2_CGC": linha["A2_CGC"].value,
							"A2_COND": linha["A2_COND"].value,
							"A2_TPFRETE": linha["A2_TPFRETE"].value,
							"A2_VALFRE": linha["A2_VALFRE"].value,
							"A2_VALIDA": linha["A2_VALIDA"].value
						}
					})
				}
				tools.log(">> tools.cotacao.getData [#333]")
				obj.ok = true;
			} catch (e) {
				obj.ok = false;
				obj["error"] = (e.message != undefined ? e.message : e);
			}

			return obj;
		},
		getDataForm: function (cardData) {
			var obj = { dados: [], TES: [], fornec: [] };

			var tableCotacoes = tools.getTableFilho(
				cardData || hAPI.getCardData(getValue("WKNumProces")),
				["C8_CICLO", "C8_ITEM", "C8_PRODUTO", "C8_UM", "C8_FORNECE", "C8_LOJA",
					"C8_QUANT", "C8_PRECO", "C8_TOTAL", "C8_PRAZO", "C8_FILENT", "C8_VALIPI",
					"C8_VALICM", "C8_VALISS", "C8_DIFAL", "C8_VALSOL", "C8_VALIDA", "BEN_FISCAL"]
			);
			tableCotacoes.forEach(function (linha) {

				obj.dados.push({
					"C8_CICLO": linha["C8_CICLO"].value,
					"C8_ITEM": linha["C8_ITEM"].value,
					"C8_PRODUTO": linha["C8_PRODUTO"].value,
					"C8_UM": linha["C8_UM"].value,
					"C8_FORNECE": linha["C8_FORNECE"].value,
					"C8_LOJA": linha["C8_LOJA"].value,
					"C8_QUANT": linha["C8_QUANT"].value,
					"C8_PRECO": linha["C8_PRECO"].value,
					"C8_TOTAL": linha["C8_TOTAL"].value,
					"C8_PRAZO": linha["C8_PRAZO"].value,
					"C8_FILENT": linha["C8_FILENT"].value,
					"C8_VALIPI": linha["C8_VALIPI"].value,
					"C8_VALICM": linha["C8_VALICM"].value,
					"C8_VALISS": linha["C8_VALISS"].value,
					"C8_DIFAL": linha["C8_DIFAL"].value,
					"C8_VALSOL": linha["C8_VALSOL"].value,
					"C8_VALIDA": linha["C8_VALIDA"].value,
					"BEN_FISCAL": linha["BEN_FISCAL"].value,
				})
			})

			var tableTES = tools.getTableFilho(
				cardData || hAPI.getCardData(getValue("WKNumProces")),
				["TES_A2_COD", "TES_A2_LOJA", "TES_A2_CGC", "TES_B1_COD", "TES_CODIGO", "TES_COMPRADOR"]
			);
			obj.TES = tableTES.filter(function (linha) {

				return linha["TES_CODIGO"].value != ""
			}).map(function (linha) {
				return {
					"idx": linha["TES_A2_COD"].index,
					"TES_A2_COD": "" + linha["TES_A2_COD"].value,
					"TES_A2_LOJA": "" + linha["TES_A2_LOJA"].value,
					"TES_A2_CGC": "" + linha["TES_A2_CGC"].value,
					"TES_B1_COD": "" + linha["TES_B1_COD"].value,
					"TES_CODIGO": "" + linha["TES_CODIGO"].value,
					"TES_COMPRADOR": "" + linha["TES_COMPRADOR"].value
				}
			})

			var tableFornecedores = tools.getTableFilho(
				cardData || hAPI.getCardData(getValue("WKNumProces")),
				["A2_COD", "A2_LOJA", "A2_CGC", "A2_COND", "A2_TPFRETE", "A2_VALFRE", "A2_VALIDA", "CICLO_REMOVIDO"]
			);

			obj.fornec = tableFornecedores.filter(function (linha) {
				return linha["CICLO_REMOVIDO"].value == ""
			}).map(function (idx) {
				return {
					"A2_COD": linha["A2_COD"].value,
					"A2_LOJA": linha["A2_LOJA"].value,
					"A2_CGC": linha["A2_CGC"].value,
					"A2_COND": linha["A2_COND"].value,
					"A2_TPFRETE": linha["A2_TPFRETE"].value,
					"A2_VALFRE": linha["A2_VALFRE"].value,
					"A2_VALIDA": linha["A2_VALIDA"].value,
				}
			})

			return obj;
		},
		getForm: function () {
			return DatasetFactory.getDataset(
				"DS_CONSULTA_COTACOES",
				null,
				[
					DatasetFactory.createConstraint("idEmpresa", hAPI.getCardValue("idEmpresa"), hAPI.getCardValue("idEmpresa"), ConstraintType.MUST),
					DatasetFactory.createConstraint("C8_NUM", hAPI.getCardValue("C8_NUM"), hAPI.getCardValue("C8_NUM"), ConstraintType.MUST),
					DatasetFactory.createConstraint("C8_CICLO", hAPI.getCardValue("ciclo_atual"), hAPI.getCardValue("ciclo_atual"), ConstraintType.MUST)
				],
				null
			)
		},
		getFormCiclo: function (ciclo) {
			return DatasetFactory.getDataset(
				"DS_CONSULTA_COTACOES",
				null,
				[
					DatasetFactory.createConstraint("idEmpresa", hAPI.getCardValue("idEmpresa"), hAPI.getCardValue("idEmpresa"), ConstraintType.MUST),
					DatasetFactory.createConstraint("C8_NUM", hAPI.getCardValue("C8_NUM"), hAPI.getCardValue("C8_NUM"), ConstraintType.MUST),
					DatasetFactory.createConstraint("C8_CICLO", ciclo, ciclo, ConstraintType.MUST)
				],
				null
			)
		},
		getItensCotacao: function (cardData) {
			var obj = [];

			var tabFornecedor = tools.cotacao.getTabFornecedor(cardData, false);
			var tabSC = tools.cotacao.getTabSC(cardData);

			log.dir(tabFornecedor)
			log.dir(tabSC)

			tabFornecedor.forEach(function (el) {
				tabSC.forEach(function (it) {
					if (it.C1_PRODUTO.length > 8 || it.C1_PRODUTO.indexOf("S") == 0) {
						obj.push({
							"C1_NUM": hAPI.getCardValue("idSc"),
							"C1_ITEM": it.C1_ITEM,
							"FORNECE": el.A2_COD + el.A2_LOJA
						})
					}
				})

			})

			return obj;
		},
		getTabFornecedor: function (cardData, isInserido) {
			var tableFornecedores = tools.getTableFilho(
				cardData || hAPI.getCardData(getValue("WKNumProces")),
				["A2_COD", "A2_CGC", "A2_LOJA", "A2_NOME", "CICLO_REMOVIDO", "A2_COND",
					"A2_TPFRETE", "A2_VALFRE", "CICLO_INSERIDO"]
			);
			tools.log("tableFornecedores");
			log.dir(tableFornecedores);

			return tableFornecedores
				.filter(function (linha) {
					if (isInserido) {
						return linha["CICLO_INSERIDO"].value == ""
					}
					return linha["CICLO_REMOVIDO"].value == ""
				})
				.map(function (linha) {
					return {
						"idx": linha["A2_COD"].index,
						"A2_COD": linha["A2_COD"].value,
						"A2_LOJA": linha["A2_LOJA"].value,
						"A2_NOME": linha["A2_NOME"].value,
						"A2_CGC": linha["A2_CGC"].value,
						"A2_COND": linha["A2_COND"].value,
						"A2_TPFRETE": linha["A2_TPFRETE"].value,
						"A2_VALFRE": linha["A2_VALFRE"].value
					}
				});
		},
		getTabFornecedorProduto: function (cardData) {
			var tableFornecedorProduto = tools.getTableFilho(
				cardData || hAPI.getCardData(getValue("WKNumProces")),
				["A5_PRODUTO", "A5_FORNECE", "A5_LOJA"]
			);
			return tableFornecedorProduto
				.map(function (linha) {
					return {
						"A5_PRODUTO": linha["A5_PRODUTO"].value,
						"A5_FORNECE": linha["A5_FORNECE"].value,
						"A5_LOJA": linha["A5_LOJA"].value
					}
				});
		},
		getTabSC: function (cardData) {
			var tableSC = tools.getTableFilho(
				cardData || hAPI.getCardData(getValue("WKNumProces")),
				["C1_ITEM", "C1_PRODUTO"]
			);
			return tableSC
				.map(function (linha) {
					return {
						"C1_ITEM": "" + linha["C1_ITEM"].value,
						"C1_PRODUTO": "" + linha["C1_PRODUTO"].value
					}
				});
		},
		necessitaAtualizar: function (cotacao) {
			return cotacao.dados.filter(function (el) { return el.C8_PRECO != "" && el.C8_PRECO != "0" && el.C8_PRECO != "0.00" && el.C8_PRECO != "0,00" && el.C8_PRECO != "0.000000" && el.C8_PRECO != "0,000000" }).length > 0
		}
	},
	formata: {
		toBranco: function (oldValue) {

			if (oldValue == undefined
				|| oldValue == "undefined"
				|| oldValue == null
				|| oldValue == "null"
				|| oldValue == ""
			)
				return ""
			return oldValue

		},
		toFloat: function (oldValue) {
			if (oldValue != "") {
				var newValue = oldValue;
				if (oldValue.indexOf(",") > 0) newValue = oldValue.replace(".", "").replace(".", "").replace(".", "").replace(".", "").replace(",", ".");
				if (!isNaN(newValue)) return parseFloat(newValue);
			}
			return 0;
		},
		toFluig: function (oldValue) {

			return oldValue;
		},
		toProtheus: function (oldValue) {

			var newValue = oldValue != "" ? oldValue : "0.00";
			if (oldValue.indexOf(",") > -1) newValue = oldValue.replace(".", "").replace(".", "").replace(".", "").replace(",", ".");

			return newValue;
		}
	},
	fornecedores: {
		excluiCotacao: function (ciclo_atual, cardData) {
			log.info(">> tools.fornecedores.excluiCotacao [#1479]")
			var retorno = { ok: true }
			var tableFornecedores = tools.getTableFilho(
				cardData || hAPI.getCardData(getValue("WKNumProces")),
				["A2_COD", "A2_LOJA", "CICLO_REMOVIDO"]
			)
			var fornecedores = tableFornecedores
				.filter(function (linha) {
					return linha["CICLO_REMOVIDO"].value == ciclo_atual
				})
				.map(function (linha) {

					return {
						"idx": idx,
						"A2_COD": linha["A2_COD"].value,
						"A2_LOJA": linha["A2_LOJA"].value,
						"A2_CGC": linha["A2_CGC"].value
					}
				})

			if (fornecedores.length > 0) {
				var obj = {
					"COTACAO": [{
						"EMPRESA": hAPI.getCardValue("idEmpresa"),
						"C8_NUMERO": hAPI.getCardValue("C8_NUM"),
						"FORNECE": tools.fornecedores.getProdutosExcluir(fornecedores, ciclo_atual)
					}]
				}
				log.info(">> tools.fornecedores.excluiCotacao [#405]")
				retorno = integra.postProtheus("/JWSSC802/3", obj);
			}

			return retorno;
		},
		getProdutosExcluir: function (fornecedores, ciclo_anterior) {
			var obj = [];
			var dsCotacoes = tools.cotacao.getFormCiclo(ciclo_anterior);

			for (var i = 0; i < dsCotacoes.rowsCount; i++) {
				var C8_FORNECE = dsCotacoes.getValue(i, "C8_FORNECE");
				var C8_LOJA = dsCotacoes.getValue(i, "C8_LOJA");

				if (fornecedores.filter(function (forn) { return forn.A2_COD == C8_FORNECE && forn.A2_LOJA == C8_LOJA }).length > 0) {
					var filtFornecedor = obj.filter(function (el) { return el.C8_FORNECE == "" + C8_FORNECE + C8_LOJA });

					if (filtFornecedor.length > 0) {
						filtFornecedor[0].ITEM.push({
							"C8_PRODUTO": dsCotacoes.getValue(i, "C8_PRODUTO")
						})
					} else {
						obj.push({
							"C8_FORNECE": "" + C8_FORNECE + C8_LOJA,
							"ITEM": [{
								"C8_PRODUTO": dsCotacoes.getValue(i, "C8_PRODUTO")
							}]
						})
					}
				}
			}
			//})

			return obj;
		},
		getProdutosIncluir: function (cardData) {
			var tableSC = tools.getTableFilho(
				cardData || hAPI.getCardData(getValue("WKNumProces")),
				["C1_ITEM", "C1_PRODUTO"]
			);
			return tableSC
				.map(function (linha) { return { "C8_PRODUTO": "" + linha["C1_PRODUTO"].value + "".trim() } })
				.filter(function (el) { return el.C8_PRODUTO.length > 8 });
		},
		incluiCotacao: function (ciclo_atual, cardData) {
			log.info(">> tools.fornecedores.incluiCotacao [#1329]")
			var retorno = { ok: true, obj: [] };

			var fornecedores = tools.cotacao.getTabFornecedor(cardData, true)
			log.dir(fornecedores);

			if (fornecedores.length > 0) {
				if (ciclo_atual != "1") {
					var obj = {
						"COTACAO": [{
							"EMPRESA": hAPI.getCardValue("idEmpresa"),
							"C8_NUMERO": hAPI.getCardValue("C8_NUM"),
							"FORNECE": []
						}]
					}
					log.info(">> tools.fornecedores.incluiCotacao [#1353]");
					var produtos = tools.fornecedores.getProdutosIncluir(cardData);

					fornecedores.forEach(function (fornecedor) {
						obj.COTACAO[0].FORNECE.push({
							"C8_FORNECE": fornecedor.A2_COD + fornecedor.A2_LOJA,
							"C8_COND": "001",
							"ITEM": produtos
						})
					})
					log.info(">> tools.fornecedores.incluiCotacao obj");
					log.dir(obj);

					retorno = integra.postProtheus("/JWSSC802/1", obj)
					log.info(">> tools.fornecedores.incluiCotacao [#1366]")
				}

				if (retorno.ok) {
					cotacao = integra.getProtheus("/JWSSC803/1/" + hAPI.getCardValue("idEmpresa") + "/" + hAPI.getCardValue("C8_NUM"));
					log.info(">> tools.fornecedores.incluiCotacao [#1371]")
					if (cotacao.ok) {
						retorno["obj"] = [];
						fornecedores.forEach(function (f) {
							log.dir(f)
							var filtCotacao = cotacao.retorno.DADOS.filter(function (el) { return "" + el.C8_FORNECE == f.A2_COD && "" + el.C8_LOJA == f.A2_LOJA })
							log.dir(filtCotacao)
							//var cardId = tools.cotacao.getCardId();

							filtCotacao.forEach(function (el) {
								retorno.obj.push({
									C8_ITEM: el["C8_ITEM"],
									C8_PRODUTO: el["C8_PRODUTO"],
									C8_UM: el["C8_UM"],
									C8_FORNECE: el["C8_FORNECE"],
									C8_LOJA: el["C8_LOJA"],
									C8_VALIDA: el["C8_VALIDA"],
									C8_QUANT: el["C8_QUANT"],
									C8_PRECO: el["C8_PRECO"],
									C8_TOTAL: el["C8_TOTAL"],
									C8_PRAZO: el["C8_PRAZO"],
									C8_VALIPI: el["C8_VALIPI"],
									C8_VALICM: el["C8_VALICM"],
									C8_VALISS: el["C8_VALISS"],
									C8_ITEM: el["C8_ITEM"],
								})
							})

						})

						fornecedores.forEach(function (el) {
							hAPI.setCardValue("CICLO_INSERIDO___" + el.idx, ciclo_atual)
						})
					}
					else {
						retorno = cotacao;
						retorno["obj"] = []
					}

				}

			}

			return retorno;
		}
	},
	historico: {
		setAprovacao: function () {
			var decisaoAprovador = hAPI.getCardValue('decisaoAprovador')
			decisaoAprovador = decisaoAprovador == 'sim' ? decisaoAprovador = 'Aprovado' : decisaoAprovador == 'nao' ? 'Reprovado' : 'Ajuste'
			var descReprovAprov = hAPI.getCardValue('descReprovAprov')
			var childData = new java.util.HashMap()
			childData.put("aprov_ciclo", String(hAPI.getCardValue("aprovacaoCiclo")))
			childData.put("aprov_data", String(tools.outros.getDataAtual()))
			childData.put("aprov_matAprovador", getValue("WKUser"))
			childData.put("aprov_aprovador", String(fluigAPI.getUserService().getCurrent().getFullName()) + (getValue("WKUser") != String(fluigAPI.getUserService().getCurrent().getCode()) ? " em nome de " + tools.outros.usuarioNome() : ""))
			childData.put("aprov_decisao", String(decisaoAprovador))
			childData.put("aprov_motivo", String(descReprovAprov))
			hAPI.addCardChild("tabAprovacoes", childData)
		},
		setAprovacaoCotacao: function () {
			var tabAprovacoesCotacao = hAPI.getChildrenIndexes("tabAprovacoesCotacao")
			var quantidadeAprovacoes = parseInt(tabAprovacoesCotacao.length)
			var decisaoAprovadorCotacao = hAPI.getCardValue('decisaoAprovadorCotacao')
			if (decisaoAprovadorCotacao == 'sim') decisaoAprovadorCotacao = 'Aprovado'
			if (decisaoAprovadorCotacao == 'nao') decisaoAprovadorCotacao = 'Reprovado'
			if (decisaoAprovadorCotacao == 'retornar') decisaoAprovadorCotacao = 'Ajuste'
			var descReprovAprovCotacao = hAPI.getCardValue('descReprovAprovCotacao')
			var childData = new java.util.HashMap()
			childData.put("aprovCotacao_ciclo", String(quantidadeAprovacoes + 1))
			childData.put("aprovCotacao_data", String(tools.outros.getDataAtual()))
			childData.put("aprovCotacao_matAprovador", String(fluigAPI.getUserService().getCurrent().getCode()))
			childData.put("aprovCotacao_aprovador", String(fluigAPI.getUserService().getCurrent().getFullName()))
			childData.put("aprovCotacao_decisao", String(decisaoAprovadorCotacao))
			childData.put("aprovCotacao_motivo", String(descReprovAprovCotacao))
			hAPI.addCardChild("tabAprovacoesCotacao", childData)
		}
	},
	intrack: {
		atualizaCiclo: function () {
			var ciclo_aprovado = hAPI.getCardValue("ciclo_aprovado");
			ciclo_aprovado = ciclo_aprovado == "" ? 1 : (parseInt(ciclo_aprovado) + 1);
			hAPI.setCardValue("ciclo_aprovado", ciclo_aprovado);
		}
	},
	outros: {
		datasetToJson: function (ds) {
			var obj = [];
			for (var i = 0; i < ds.rowsCount; i++) {
				var tmp = {};
				for (var f = 0; f < ds.columnsName.length; f++) {
					tmp[ds.columnsName[f]] = ds.getValue(i, ds.columnsName[f])
				}
				obj.push(tmp);
			}
			return obj;
		},
		getCNPJFornecedor: function (A2_COD, A2_LOJA) {
			var ds = DatasetFactory.getDataset(
				"ds_consulta_fornecedor",
				null,
				[
					DatasetFactory.createConstraint("tipoConsulta", "codigo", "codigo", ConstraintType.MUST),
					DatasetFactory.createConstraint("CODIGO", A2_COD, A2_COD, ConstraintType.MUST),
					DatasetFactory.createConstraint("LOJA", A2_LOJA, A2_LOJA, ConstraintType.MUST)
				],
				null
			)

			return ds != null && ds.rowsCount > 0 ? ds.getValue(0, "CGC") : ""
		},
		getDadosFornecedor: function (A2_COD, A2_LOJA) {
			return DatasetFactory.getDataset(
				"ds_consulta_fornecedor",
				null,
				[
					DatasetFactory.createConstraint("tipoConsulta", "codigo", "codigo", ConstraintType.MUST),
					DatasetFactory.createConstraint("CODIGO", A2_COD, A2_COD, ConstraintType.MUST),
					DatasetFactory.createConstraint("LOJA", A2_LOJA, A2_LOJA, ConstraintType.MUST)
				],
				null
			)
		},
		getColleagueName: function (colleagueId) {
			var ds = DatasetFactory.getDataset(
				"colleague",
				null,
				[
					DatasetFactory.createConstraint("colleaguePK.colleagueId", colleagueId, colleagueId, ConstraintType.MUST)
				],
				null
			)

			if (ds == null || ds.rowsCount == 0) {
				return "Usuário " + colleagueId + " não encontrado"
			}
			else if (ds.getValue(0, "active") == "false") {
				return "Usuário " + ds.getValue(0, "colleagueName") + " está desativado"
			} else {
				return ds.getValue(0, "colleagueName")
			}
		},
		getDataAtual: function () {
			return (new java.text.SimpleDateFormat('dd/MM/yyyy')).format(new Date())
		},
		getDataTermino: function () {
			var dataTerminoSolicitacaoCotacao = hAPI.getCardValue("dataTerminoSolicitacaoCotacao");
			if (dataTerminoSolicitacaoCotacao == "") {
				var dias = isNaN(hAPI.getCardValue("validade_cotacao")) ? hAPI.getCardValue("validade_cotacao") * 1 : 10;
				var dt = new Date();
				dt.setDate(dt.getDate() + dias);
				return (new java.text.SimpleDateFormat('dd/MM/yyyy')).format(dt);
			} else {
				return dataTerminoSolicitacaoCotacao
			}

		},
		usuarioAtivo: function (colleagueId) {
			var ds = DatasetFactory.getDataset(
				"colleague",
				null,
				[
					DatasetFactory.createConstraint("active", "true", "true", ConstraintType.MUST),
					DatasetFactory.createConstraint("colleaguePK.colleagueId", colleagueId, colleagueId, ConstraintType.MUST)
				],
				null
			)
			return ds != null && ds.rowsCount > 0;
		},
		usuarioNome: function () {
			var ds = DatasetFactory.getDataset(
				"colleague",
				null,
				[
					DatasetFactory.createConstraint("colleaguePK.colleagueId", getValue("WKUser"), getValue("WKUser"), ConstraintType.MUST)
				],
				null
			)
			return (ds != null && ds.rowsCount > 0) ? ds.getValue(0, "colleagueName") : getValue("WKUser");
		},
		valorPreenchido: function (valor) {
			var newValue = tools.formata.toFloat(valor);

			return newValue != 0;
		}
	},
	pedido: {
		decisao: {
			aprovar: function () {
				var obj = { ok: false }
				var pedidos = hAPI.getCardValue("pedidoProtheus");
				log.info("pedidospedidospedidos " + pedidos)
				if (pedidos != "") {
					log.info("getAprovadorgetAprovador")
					var aprovador = tools.pedido.getAprovador();
					var dadosProtheus = {
						"PEDIDO": pedidos.split(",")
							.map(function (pedido) {
								return {
									"EMPRESA": hAPI.getCardValue("idEmpresa"),
									"NUMERO": pedido,
									"LIBERAR": "S",
									"APROVADOR": aprovador
								}
							})
					}

					obj = integra.postProtheus("/JWSSC703", dadosProtheus);
				}
				else {
					obj["error"] = "Não foi encontrado nenhum pedido gerado para esta solicitação"
				}

				return obj;
			},
			registrar: function (decisao, cardData) {
				var tablePedidos = tools.getTableFilho(
					cardData || hAPI.getCardData(getValue("WKNumProces")),
					["C7_STATUS"]
				);
				tablePedidos.forEach(function (linha) {
					if (linha["C7_STATUS"].value == "")
						hAPI.setCardValue(linha["C7_STATUS"].name, decisao)
				})
			},
			reprovar: function () {
				var obj = { ok: false }
				var pedidos = hAPI.getCardValue("pedidoProtheus");

				if (pedidos != "") {
					var aprovador = tools.pedido.getAprovador();
					var dadosProtheus = {
						"PEDIDO": pedidos.split(",")
							.map(function (pedido) {
								return {
									"EMPRESA": hAPI.getCardValue("idEmpresa"),
									"NUMERO": pedido,
									"LIBERAR": "N",
									"APROVADOR": aprovador
								}
							})
					}

					obj = integra.postProtheus("/JWSSC703", dadosProtheus);
				}
				else {
					obj["error"] = "Não foi encontrado nenhum pedido gerado para esta solicitação"
				}

				return obj;
			}
		},
		getAprovador: function () {
			log.info("getAprovadorgetAprovadorgetAprovador 2")
			var dsHist = DatasetFactory.getDataset(
				"processHistory",
				["processHistoryPK.movementSequence"],
				[
					DatasetFactory.createConstraint("stateSequence", "224", "224", ConstraintType.MUST),
					DatasetFactory.createConstraint("processHistoryPK.processInstanceId", getValue("WKNumProces"), getValue("WKNumProces"), ConstraintType.MUST)
				],
				["processHistoryPK.movementSequence"]
			)

			log.info("dsHistdsHistdsHistdsHistdsHist")
			log.dir(dsHist)

			if (dsHist != null && dsHist.rowsCount > 0) {
				var movementSequence = dsHist.getValue((dsHist.rowsCount - 1), "processHistoryPK.movementSequence");

				var dsTask = DatasetFactory.getDataset(
					"processTask",
					["processTaskPK.colleagueId"],
					[
						DatasetFactory.createConstraint("processTaskPK.processInstanceId", getValue("WKNumProces"), getValue("WKNumProces"), ConstraintType.MUST),
						DatasetFactory.createConstraint("processTaskPK.movementSequence", movementSequence, movementSequence, ConstraintType.MUST),
						DatasetFactory.createConstraint("status", "2", "2", ConstraintType.MUST)
					],
					null
				)

				if (dsTask != null && dsTask.rowsCount > 0) {
					return tools.outros.getColleagueName(dsTask.getValue(0, "processTaskPK.colleagueId"));
				}
			}

			return "";
		},
		getItens: function (cardData) {

			var ciclo_atual = hAPI.getCardValue("ciclo_atual");
			var tipo_pc_contrato = hAPI.getCardValue("tipo_pc_contrato");
			log.info(">> tools.pedido.getItens \n ciclo_atual: " + ciclo_atual + "\n tipo_pc_contrato: " + tipo_pc_contrato)

			if (hAPI.getCardValue("tipoSc") != "5") {
				var dsItens = integra.getDBFluig(
					"SELECT COT.C8_ITEM, COT.C8_FORNECE, COT.C8_LOJA FROM " + hAPI.getAdvancedProperty("mlFormCotacao") + " ML \
						INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
						INNER JOIN "+ hAPI.getAdvancedProperty("mlTabCotacao") + " COT ON COT.DOCUMENTID = ML.DOCUMENTID AND COT.VERSION = ML.VERSION \
					WHERE ML.C8_NUM = '"+ hAPI.getCardValue("C8_NUM") + "' AND ML.idEmpresa = '" + hAPI.getCardValue("idEmpresa") + "' AND ML.C8_CICLO = '" + hAPI.getCardValue("ciclo_atual")
					+ "' AND COT.VENCEDOR_COMPRADOR = 'true' AND DOC.VERSAO_ATIVA = 1"
				)
				dsItens = dsItens.map(function (item) {
					return {
						"C8_ITEM": item["C8_ITEM"],
						"C8_FORNECE": item["C8_FORNECE"] + item["C8_LOJA"]
					}
				})
			}
			else {
				var tableCotacao = tools.getTableFilho(
					cardData || hAPI.getCardData(getValue("WKNumProces")),
					["C8_ITEM", "C8_FORNECE", "C8_LOJA"]
				);
				var dsItens = tableCotacao.map(function (linha) {
					return {
						"C8_ITEM": linha["C8_ITEM"],
						"C8_FORNECE": linha["C8_FORNECE"] + linha["C8_LOJA"]
					}
				})
			}

			var itens = dsItens
			log.dir(itens)

			if (tipo_pc_contrato == "contrato") {
				log.info("++ contrato ++");
				var contratos = [];
				itens.forEach(function (it) {
					var filterFornece = contratos.filter(function (c) { return c.CNA_FORNECE == it.C8_FORNECE });

					if (filterFornece.length == 0) {
						var dias = hAPI.getCardValue("contrato_cronograma") == "1" ? "30" : hAPI.getCardValue("contrato_cronograma") == "1" ? "15" : "7";
						var fornecedor = it.C8_FORNECE;

						contratos.push({
							"CN9_DTINIC": hAPI.getCardValue("CN9_DTINIC"),
							"CN9_UNVIGE": hAPI.getCardValue("CN9_UNVIGE"),
							"CN9_VIGE": hAPI.getCardValue("CN9_VIGE"),
							"CN9_TPCTO": "023",//hAPI.getCardValue("CN9_TPCTO"),
							"CN9_NATURE": hAPI.getCardValue("CN9_NATURE"),
							"CN9_DEPART": hAPI.getCardValue("CN9_DEPART"),
							"CN9_GESTC": hAPI.getCardValue("CN9_GESTC"),
							"CNA_TIPPLA": "029",//hAPI.getCardValue("CNA_TIPPLA"),
							"CNA_FORNECE": fornecedor,
							"FINANCEIRO": hAPI.getCardValue("contrato_financeiro"),
							"PERIODO": hAPI.getCardValue("contrato_financeiro") == 1 ? hAPI.getCardValue("contrato_cronograma") : "",
							"DIAS": dias,
							"COMPETENCIA": hAPI.getCardValue("contrato_competencia"),
							"MEDICAO": hAPI.getCardValue("contrato_primeira_medicao"),
							"PARCELA": hAPI.getCardValue("contrato_financeiro") == 1 ? hAPI.getCardValue("contrato_parcelas") : ""
						})
					}
				})
				log.dir(contratos)
				log.info("++ retorno contrato")
				return {
					"itens": itens,
					"contratos": contratos
				}
			} else {
				log.info("++ retorno itens")
				return itens;
			}

		},
		atualizaCotacao: function (cardData) {
			var retorno = { ok: true };
			var ciclo_atual = cardData.get("ciclo_atual");
			var tabFornecedor = tools.cotacao.getTabFornecedor(cardData, false);

			var tableTES = tools.getTableFilho(
				cardData || hAPI.getCardData(getValue("WKNumProces")),
				["TES_A2_COD", "TES_A2_LOJA", "TES_B1_COD", "TES_CODIGO"]
			);
			var tabTES = tableTES.map(function (linha) {
				var idx = linha["TES_A2_COD"].index;
				return {
					"idx": idx,
					"TES_A2_COD": "" + linha["TES_A2_COD"].value,
					"TES_A2_LOJA": "" + linha["TES_A2_LOJA"].value,
					"TES_B1_COD": "" + linha["TES_B1_COD"].value,
					"TES_CODIGO": "" + linha["TES_CODIGO"].value
				}
			})
			log.info("--- tabTES");
			log.dir(tabTES);

			var FORNECE = [];
			if (hAPI.getCardValue("tipoSc") != "5") {
				var cotacoes = tools.getDataset("DS_CONSULTA_COTACOES", null, [
					{ field: "C8_NUM", value: cardData.get("C8_NUM") },
					{ field: "idEmpresa", value: cardData.get("idEmpresa") },
					{ field: "C8_CICLO", value: ciclo_atual }
				], false);
				cotacoes = cotacoes.filter(function (cot) {
					return tabFornecedor.filter(function (f) { return f.A2_COD == cot.C8_FORNECE && f.A2_LOJA == cot.C8_LOJA }).length > 0
				})
			}
			else {
				var tableCotacao = tools.getTableFilho(
					cardData || hAPI.getCardData(getValue("WKNumProces")),
					["C8_PRODUTO", "C8_FORNECE", "C8_LOJA", "QTD_COMPRADOR",
						"C8_QUANT", "C8_PRECO", "C8_PRAZO"]
				);
				var cotacoes = tableCotacao.map(function (linha) {
					return {
						C8_PRODUTO: linha["C8_PRODUTO"].value,
						C8_FORNECE: linha["C8_FORNECE"].value,
						C8_LOJA: linha["C8_LOJA"].value,
						QTD_COMPRADOR: linha["QTD_COMPRADOR"].value,
						C8_QUANT: linha["C8_QUANT"].value,
						C8_PRECO: linha["C8_PRECO"].value,
						C8_PRAZO: linha["C8_PRAZO"].value
					}
				})
			}

			var TESPADRAO = tools.getDataset("DS_COMPRAS_PRAZOS_ENTREGA",
				null, null, true)
			TESPADRAO = TESPADRAO[0]["tesPadrao"];
			cotacoes.forEach(function (cotacao) {
				if (tools.formata.toBranco(cotacao["C8_PRECO"]) != ""
					&& tools.formata.toBranco(cotacao["C8_QUANT"]) != ""
					&& tools.formata.toBranco(cotacao["C8_PRAZO"]) != ""
					&& cotacao["C8_PRECO"] != "0.00"
					&& cotacao["C8_PRECO"] != "0.000000") {
					var filterFORNECE = FORNECE.filter(function (el) { return el.C8_FORNECE == (cotacao["C8_FORNECE"] + cotacao["C8_LOJA"]) })
					if (filterFORNECE.length > 0) {
						filterFORNECE[0].ITEM.push({
							"C8_PRODUTO": cotacao["C8_PRODUTO"],
							"C8_PRECO": tools.formata.toProtheus(cotacao["C8_PRECO"]),
							"C8_QTDISP": cotacao["QTD_COMPRADOR"] != "" ? cotacao["QTD_COMPRADOR"] : (cotacao["C8_QUANT"] != "" ? cotacao["C8_QUANT"] : "0"),
							"C8_PRAZO": cotacao["C8_PRAZO"] != "" ? cotacao["C8_PRAZO"] : "0",
							"C8_TES": tools.tes.get(tabTES,
								cotacao["C8_FORNECE"],
								cotacao["C8_LOJA"],
								cotacao["C8_PRODUTO"],
								TESPADRAO)
						})
					} else {
						var fForn = tabFornecedor.filter(function (el) { { return el.A2_COD == cotacao["C8_FORNECE"] && el.A2_LOJA == cotacao["C8_LOJA"] } })
						FORNECE.push({
							"C8_FORNECE": cotacao["C8_FORNECE"] + cotacao["C8_LOJA"],
							"C8_COND": fForn.length > 0 ? (fForn[0].A2_COND != "" ? fForn[0].A2_COND : "001") : "001",
							"C8_TPFRETE": fForn.length > 0 ? fForn[0].A2_TPFRETE : "",
							"C8_TOTFRE": fForn.length > 0 ? fForn[0].A2_VALFRE : "",
							"C8_DESPESA": "0.00",
							"C8_SEGURO": "0.00",
							"C8_VALDESC": "0.00",
							"ITEM": [{
								"C8_PRODUTO": cotacao["C8_PRODUTO"],
								"C8_PRECO": tools.formata.toProtheus(cotacao["C8_PRECO"]),
								"C8_QTDISP": cotacao["QTD_COMPRADOR"] != "" ? cotacao["QTD_COMPRADOR"] : (cotacao["C8_QUANT"] != "" ? cotacao["C8_QUANT"] : "0"),
								"C8_PRAZO": cotacao["C8_PRAZO"] != "" ? cotacao["C8_PRAZO"] : "0",
								"C8_TES": tools.tes.get(tabTES,
									cotacao["C8_FORNECE"],
									cotacao["C8_LOJA"],
									cotacao["C8_PRODUTO"],
									TESPADRAO)
							}]
						})
					}
				}
			})

			if (FORNECE.length > 0) {
				var COTACAO = [{
					"EMPRESA": hAPI.getCardValue("idEmpresa"),
					"C8_NUMERO": hAPI.getCardValue("C8_NUM"),
					"FORNECE": FORNECE
				}]
				retorno = integra.postProtheus("/JWSSC802/2", { "COTACAO": COTACAO })
			}

			return retorno;
		},
		limpaCotacao: function (cardData) {
			var retorno = { ok: true };
			var ciclo_atual = hAPI.getCardValue("ciclo_atual");
			var tipoSc = hAPI.getCardValue("tipoSc");
			var FORNECE = [];

			if (tipoSc != "5") {
				var cotacoes = integra.getDBFluig(
					"SELECT COT.C8_FORNECE,COT.C8_LOJA,COT.C8_PRODUTO FROM " + hAPI.getAdvancedProperty("mlFormCotacao") + " ML \
						INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
						INNER JOIN "+ hAPI.getAdvancedProperty("mlTabCotacao") + " COT ON COT.DOCUMENTID = ML.DOCUMENTID AND COT.VERSION = ML.VERSION \
					WHERE ML.C8_NUM = '"+ hAPI.getCardValue("C8_NUM")
					+ "' AND ML.idEmpresa = '" + hAPI.getCardValue("idEmpresa")
					+ "' AND ML.C8_CICLO = '" + ciclo_atual
					+ "' AND COT.C8_PRECO IN ('','0.00','0.000000') AND DOC.VERSAO_ATIVA = 1"
				)
				cotacoes.forEach(function (cotacao) {
					var filterFORNECE = FORNECE.filter(function (el) { return el.C8_FORNECE == cotacao["C8_FORNECE"] + cotacao["C8_LOJA"] })
					if (filterFORNECE.length > 0) {
						filterFORNECE[0].ITEM.push({
							"C8_PRODUTO": cotacao["C8_PRODUTO"]
						})
					} else {
						FORNECE.push({
							"C8_FORNECE": cotacao["C8_FORNECE"] + cotacao["C8_LOJA"],
							"ITEM": [{
								"C8_PRODUTO": cotacao["C8_PRODUTO"]
							}]
						})
					}
				})
			} else {
				var cotacao = integra.getProtheus("/JWSSC803/1/" + hAPI.getCardValue("idEmpresa") + "/" + hAPI.getCardValue("C8_NUM"));

				if (cotacao.ok) {
					var tableCotacao = tools.getTableFilho(
						cardData || hAPI.getCardData(getValue("WKNumProces")),
						["C8_PRODUTO", "C8_FORNECE", "C8_LOJA"]
					);
					var tabCotacao = tableCotacao.map(function (linha) {
						return {
							"C8_FORNECE": linha["C8_FORNECE"].value,
							"C8_LOJA": linha["C8_LOJA"].value,
							"C8_PRODUTO": linha["C8_PRODUTO"].value
						}
					})
					log.dir(tabCotacao)
					cotacao.retorno.DADOS.forEach(function (el) {
						var filt = tabCotacao.filter(function (tc) {
							return tc.C8_FORNECE == el.C8_FORNECE
								&& tc.C8_LOJA == el.C8_LOJA
								&& tc.C8_PRODUTO.trim() == el.C8_PRODUTO.trim()
						});
						if (filt.length == 0) {
							var filterFORNECE = FORNECE.filter(function (f) { return f.C8_FORNECE == (el.C8_FORNECE + el.C8_LOJA) })
							if (filterFORNECE.length > 0) {
								filterFORNECE[0].ITEM.push({
									"C8_PRODUTO": el.C8_PRODUTO
								})
							} else {
								FORNECE.push({
									"C8_FORNECE": (el.C8_FORNECE + el.C8_LOJA),
									"ITEM": [{
										"C8_PRODUTO": el.C8_PRODUTO
									}]
								})
							}
						}
					})
				}
			}

			if (FORNECE.length > 0) {
				var COTACAO = [{
					"EMPRESA": hAPI.getCardValue("idEmpresa"),
					"C8_NUMERO": hAPI.getCardValue("C8_NUM"),
					"FORNECE": FORNECE
				}]
				retorno = integra.postProtheus("/JWSSC802/4", { "COTACAO": COTACAO })
			}

			return retorno;
		},
		recuperaDados: function () {
			var pedidos = hAPI.getCardValue("pedidoProtheus").toString().split(",");

			pedidos.forEach(function (pedido) {
				var obj = integra.getProtheus("/JWSSC702/1/" + hAPI.getCardValue("idEmpresa") + "/" + pedido)

				if (obj.ok) {
					obj.retorno.DADOS.forEach(function (el) {
						var childData = new java.util.HashMap();
						childData.put("C7_FILIAL", "" + el.C7_FILIAL);
						childData.put("C7_TIPO", "" + el.C7_TIPO);
						childData.put("C7_NUM", "" + el.C7_NUM);
						childData.put("C7_EMISSAO", "" + el.C7_EMISSAO);
						childData.put("C7_FORNECE", "" + el.C7_FORNECE);
						childData.put("C7_LOJA", "" + el.C7_LOJA);
						childData.put("C7_COND", "" + el.C7_COND);
						childData.put("C7_TPFRETE", "" + el.C7_TPFRETE);
						childData.put("C7_FRETE", "" + el.C7_FRETE);
						childData.put("C7_ITEM", "" + el.C7_ITEM);
						childData.put("C7_PRODUTO", "" + el.C7_PRODUTO.trim());
						childData.put("C7_DESCRI", "" + el.C7_DESCRI.trim());
						childData.put("C7_UM", "" + el.C7_UM);
						childData.put("C7_QTDSOL", "" + el.C7_QTDSOL);
						childData.put("C7_QUANT", "" + el.C7_QUANT);
						childData.put("C7_PRECO", "" + el.C7_PRECO);
						childData.put("C7_TOTAL", "" + el.C7_TOTAL);
						childData.put("C7_TES", "" + el.C7_TES);
						childData.put("C7_VALIPI", "" + el.C7_VALIPI);
						childData.put("C7_VALICM", "" + el.C7_VALICM);
						childData.put("C7_VALIR", "" + el.C7_VALIR);
						childData.put("C7_VALSOL", "" + el.C7_VALSOL);
						childData.put("C7_VALISS", "" + el.C7_VALISS);
						childData.put("C7_VALINS", "" + el.C7_VALINS);
						childData.put("C7_VALCSL", "" + el.C7_VALCSL);
						childData.put("C7_VALCOF", "" + el.C7_VALCOF);
						childData.put("C7_VALPIS", "" + el.C7_VALPIS);
						childData.put("C7_ITEMSC", "" + el.C7_ITEMSC);
						childData.put("C7_NUMSC", "" + el.C7_NUMSC);
						childData.put("C7_NUMCOT", "" + el.C7_NUMCOT);
						hAPI.addCardChild("tabPedidos", childData);
					})
				}
			})
		},
		registra: function (pedidos, cardData) {
			log.info(">> tools.pedido.registra <<")
			var ciclo_atual = hAPI.getCardValue("ciclo_atual");

			log.dir(pedidos);
			var campoPedidos = [];
			for (var i = 0; i < pedidos.length; i++) {
				var ped = pedidos[i][1];
				if (campoPedidos.indexOf(ped) < 0) campoPedidos.push(ped);
			}
			campoPedidos.sort(function (a, b) { return a - b });

			hAPI.setCardValue("pedidoProtheus", campoPedidos);

		},
		valorTotal: function (cardData) {
			var valor = 0;
			var ciclo_atual = hAPI.getCardValue("ciclo_atual");
			if (hAPI.getCardValue("tipoSc") != "5") {
				var cotacoes = integra.getDBFluig(
					"SELECT COT.C8_FORNECE,COT.C8_LOJA,COT.C8_PRODUTO,COT.C8_PRECO,cot.QTD_COMPRADOR,COT.C8_DIFAL,COT.QTD_COMPRADOR,COT.C8_QUANT,COT.C8_VALSOL FROM " + hAPI.getAdvancedProperty("mlFormCotacao") + " ML \
						INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
						INNER JOIN "+ hAPI.getAdvancedProperty("mlTabCotacao") + " COT ON COT.DOCUMENTID = ML.DOCUMENTID AND COT.VERSION = ML.VERSION \
					WHERE ML.C8_NUM = '"+ hAPI.getCardValue("C8_NUM") + "' AND ML.idEmpresa = '" + hAPI.getCardValue("idEmpresa") + "' AND ML.C8_CICLO = '" + ciclo_atual + "' AND COT.VENCEDOR_COMPRADOR = 'true' AND DOC.VERSAO_ATIVA = 1"
				)
			} else {
				var tableCotacao = tools.getTableFilho(
					cardData || hAPI.getCardData(getValue("WKNumProces")),
					["C8_PRODUTO", "C8_FORNECE", "C8_LOJA", "QTD_COMPRADOR",
						"C8_QUANT", "C8_PRECO", "C8_DIFAL", "C8_VALSOL"]
				);
				var cotacoes = tableCotacao.map(function (linha) {
					return {
						C8_FORNECE: linha["C8_FORNECE"].value,
						C8_LOJA: linha["C8_LOJA"].value,
						C8_PRODUTO: linha["C8_PRODUTO"].value,
						C8_PRECO: linha["C8_PRECO"].value,
						QTD_COMPRADOR: linha["QTD_COMPRADOR"].value,
						C8_DIFAL: linha["C8_DIFAL"].value,
						QTD_COMPRADOR: linha["QTD_COMPRADOR"].value,
						C8_QUANT: linha["C8_QUANT"].value,
						C8_VALSOL: linha["C8_VALSOL"].value
					}
				})
			}

			cotacoes.forEach(function (cotacao) {
				valor += ((tools.formata.toFloat(cotacao["C8_PRECO"]) * parseInt(cotacao["QTD_COMPRADOR"])) + (tools.formata.toFloat(cotacao["C8_DIFAL"]) * parseInt(cotacao["QTD_COMPRADOR"]) / parseInt(cotacao["C8_QUANT"])) + (tools.formata.toFloat(cotacao["C8_VALSOL"]) * parseInt(cotacao["QTD_COMPRADOR"]) / parseInt(cotacao["C8_QUANT"])))
				log.info(">> valor: " + valor)
			})
			return valor;
		}
	},
	sc: {
		cancelaProtheus: function () {
			var obj = { ok: false }
			try {
				obj = integra.postProtheus("/JWSSC101/4", {
					"COTACAO": [{
						"EMPRESA": hAPI.getCardValue("idEmpresa"),
						"NUMERO": hAPI.getCardValue("idSc")
					}]
				})
			} catch (e) {
				obj["error"] = e.message != undefined ? e.message : e
			}

			return obj;
		}
	},
	tes: {
		get: function (tabTES, A2_COD, A2_LOJA, B1_COD, TESPADRAO) {
			log.info("++ tools.tes.get ++ \n A2_COD: " + A2_COD + " \n A2_LOJA: " + A2_LOJA + " \n B1_COD: " + B1_COD)
			var filtTES = tabTES.filter(function (el) { return el.TES_A2_COD == A2_COD && el.TES_A2_LOJA == A2_LOJA && el.TES_B1_COD == B1_COD.substring(0, 8) && el.TES_CODIGO != "" })
			log.dir(filtTES);
			return filtTES.length > 0 ? filtTES[0].TES_CODIGO : "" + TESPADRAO;
		},
		regulariza: function (cardData) {
			log.info("-- tools.tes.regulariza")
			var arrAdiciona = [];
			var tableTES = tools.getTableFilho(
				cardData || hAPI.getCardData(getValue("WKNumProces")),
				["TES_A2_COD", "TES_A2_LOJA", "TES_B1_COD", "TES_A2_CGC", "TES_CODIGO"]
			);
			var tes = tableTES.map(function (linha) {
				var idx = linha["TES_A2_COD"].index;
				return {
					"idx": idx,
					"TES_A2_COD": "" + linha["TES_A2_COD"].value,
					"TES_A2_LOJA": "" + linha["TES_A2_LOJA"].value,
					"TES_B1_COD": "" + linha["TES_B1_COD"].value,
					"TES_A2_CGC": "" + linha["TES_A2_CGC"].value,
					"TES_CODIGO": "" + linha["TES_CODIGO"].value
				}
			})
			log.info(">> tes <<");
			log.dir(tes);

			var tesVazias = tes.filter(function (el) { return el.TES_CODIGO == "" })
			log.info(">> tesVazias <<");
			log.dir(tesVazias);
			if (tesVazias.length > 0) {
				for (var i = tesVazias.length - 1; i >= 0; i--) {
					hAPI.removeCardChild("tabTES", tesVazias[i]["idx"])
				}
			}

			var fornecedores = tools.cotacao.getTabFornecedor(cardData, false);
			log.info(">> fornecedores <<");
			log.dir(fornecedores);

			var tableProduto = tools.getTableFilho(
				cardData || hAPI.getCardData(getValue("WKNumProces")),
				["B1_COD", "B1_PAI"]
			);
			var produtos = tableProduto
				.filter(function (linha) {
					return linha["B1_PAI"].value == ""
				})
				.map(function (linha) {
					idx = linha["B1_COD"].index;
					return {
						"idx": idx,
						"B1_COD": "" + linha["B1_COD"].value
					}
				})
			log.info(">> produtos <<");
			log.dir(produtos);

			fornecedores.forEach(function (f) {
				var filtTES = tes.filter(function (el) {
					return el.TES_A2_COD == f.A2_COD
						&& el.TES_A2_LOJA == f.A2_LOJA
				})
				if (filtTES.length == 0) {
					arrAdiciona.push({
						"TES_A2_COD": f.A2_COD,
						"TES_A2_LOJA": f.A2_LOJA,
						"TES_A2_CGC": f.A2_CGC,
					})
				}
			})
			produtos.forEach(function (p) {
				var filtTES = tes.filter(function (el) { return el.TES_B1_COD == p.B1_COD })

				if (filtTES.length == 0) {
					arrAdiciona.push({
						"TES_B1_COD": p.B1_COD
					})
				}
			})

			log.info(">> arrAdiciona <<");
			log.dir(arrAdiciona);
			arrAdiciona.forEach(function (el) {
				var childData = new java.util.HashMap()
				childData.put("TES_A2_COD", el.TES_A2_COD)
				childData.put("TES_A2_LOJA", el.TES_A2_LOJA)
				childData.put("TES_A2_CGC", el.TES_A2_CGC)
				childData.put("TES_B1_COD", el.TES_B1_COD)
				hAPI.addCardChild("tabTES", childData)
			})
		}
	},
	validacaoTecnica: {
		carregaIdDocs: function (cardData) {
			var tableAnexos = tools.getTableFilho(
				cardData || hAPI.getCardData(getValue("WKNumProces")),
				["FILE_DESCRIPTION", "FILE_ID"]
			);
			tableAnexos.forEach(function (linha) {
				if (linha["FILE_ID"].value == "") {
					var ds = DatasetFactory.getDataset(
						"processAttachment",
						["documentId"],
						[
							DatasetFactory.createConstraint("processAttachmentPK.attachmentSequence", "1", "1", ConstraintType.MUST_NOT),
							DatasetFactory.createConstraint("processAttachmentPK.processInstanceId", getValue("WKNumProces"), getValue("WKNumProces"), ConstraintType.MUST),
						],
						null
					)
					if (ds != null && ds.rowsCount > 0) {
						var c = [DatasetFactory.createConstraint("documentDescription", linha["FILE_DESCRIPTION"].value, linha["FILE_DESCRIPTION"].value, ConstraintType.MUST)]
						for (var i = 0; i < ds.rowsCount; i++) {
							c.push(DatasetFactory.createConstraint("documentPK.documentId", ds.getValue(i, "documentId"), ds.getValue(i, "documentId"), ConstraintType.SHOULD))
						}
						var ds2 = DatasetFactory.getDataset("document", null, c, null);
						if (ds2 != null && ds2.rowsCount > 0) {
							hAPI.setCardValue("FILE_ID___" + idx, ds2.getValue(0, "documentId"))
						}
					}
				}
			})
		},
		necessario: function () {
			var cardData = hAPI.getCardData(getValue("WKNumProces"));
			var tableValidacao = tools.getTableFilho(cardData,
				["VT_DECISAO"]);

			return tableValidacao
				.filter(function (linha) { return linha["VT_DECISAO"].value == "" }).length > 0
		}
	},
	getDataset: function (name, campos, filtros, isInternal) {

		var constraints = [];

		if (isInternal) {
			constraints.push(DatasetFactory.createConstraint('metadata#active', true, true, ConstraintType.MUST));
		}

		if (filtros) {
			filtros.forEach(function (filtro) {
				constraints.push(DatasetFactory.createConstraint(filtro.field, filtro.value, filtro.value, filtro.type || ConstraintType.MUST));
			});
		}

		var result = [];
		try {

			var dataset = DatasetFactory.getDataset(name, null, constraints, null);

			if (dataset == null) {
				return result;
			}
			if (dataset.rowsCount > 0) {

				var _loop = function _loop() {
					var o = {};

					if (!campos) {
						campos = dataset.getColumnsName();
					}

					campos.forEach(function (campo) {
						o[campo] = dataset.getValue(i, campo);
					});

					result.push(o);
				};

				for (var i = 0; i < dataset.rowsCount; i++) {
					_loop();
				}
			}
			return result;
		} catch (error) {
			return result
		}
	},
	/**
	* Método para listar os filhos de um pai x filho
	* @param cardData: campos do formulário, ex: hAPI.getCardData(getValue("WKNumProces"))
	* @param fields[]: Array dos campos que pertencem ao pai x filho em questao, ex ['cCentroCustoRat',
							'valorCCusto']
	* @returns [{{}}] Array de Objeto com as chaves e valores
	*/
	getTableFilho: function (cardData, fields) {
		log.info("Consultando os campos pai x filho Form");
		cardData = cardData || hAPI.getCardData(getValue("WKNumProces"));
		var it = cardData.keySet().iterator();
		var listaFilho = [];
		var fieldTemp = fields[0];

		while (it.hasNext()) {
			var key = it.next();
			var campo = key.split("___");

			if (key.indexOf('___') >= 0 && campo[0] == fieldTemp) {
				var idx = campo[1];
				var row = {};

				for (var i = 0; i < fields.length; i++) {
					var name = fields[i] + "___" + idx;
					row[fields[i]] = { value: cardData.get(name), index: idx, name: name };
				}
				listaFilho.push(row);
			}
		}
		return listaFilho;

	}
}