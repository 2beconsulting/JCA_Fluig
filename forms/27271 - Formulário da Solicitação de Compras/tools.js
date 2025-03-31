var tools = {
	anexos: {
		carrega: function () {
			let anexos = tools.anexos.listaItens($("#idPastaGED").val()).sort(function (a, b) { return b.documentId - a.documentId });
			let rodadas = $("[name^=_cotacao_solicitacao___]").toArray().map(function (el) {
				return {
					"solicitacao": $(el).val(),
					"rodada": $(el).closest("tr").find("[name*=cotacao_ciclo___]").val()
				}
			});
			anexos.map(function (a) {
				let filtRodada = rodadas.filter(function (r) { return r.solicitacao == a.documentDescription });
				a["rodada"] = filtRodada.length > 0 ? filtRodada[0].rodada : "";
				return a;
			})
			fluigMapa.fornecedores.forEach(function (f) {
				f["rodadas"] = [];

				anexos.forEach(function (a) {
					let filt = a.sub.filter(function (a_s) {
						return a_s.documentDescription.indexOf(f.A2_COD) == 0
					}).map(function (m) { return m });

					if (filt.length > 0) {
						f.rodadas.push({
							"documentDescription": a.documentDescription,
							"rodada": a.rodada,
							"sub": filt
						})
					}
				})

				if (f["rodadas"].length > 0) {
					f["hasAttachment"] = true;
				} else {
					f["hasAttachment"] = false;
				}
			})
		},
		exibeAnexos() {
			var cod = $(this).attr("data-cod");
			var loja = $(this).attr("data-loja");
			console.log(this, cod, loja);
			let filt = fluigMapa.fornecedores.filter(function (el) { return el.A2_COD == cod })

			let temp = $("#tmpl11").html();
			let html = Mustache.render(temp, filt[0].rodadas);

			FLUIGC.modal({
				title: 'Anexos',
				content: html,
				id: 'fluig-attachment',
				size: 'full',
				actions: [{
					'label': 'Fechar',
					'autoClose': true
				}]
			}, function (erro, it) {
				//console.log(erro,it)
				if (!erro) {
					$("[icon-open]").on("click", tools.anexos.openFile)
				}
			});
		},
		listaItens(idPastaGED) {
			let obj = [];
			return obj;
			let ds = DatasetFactory.getDataset(
				"document",
				null,
				[
					DatasetFactory.createConstraint("activeVersion", true, true, ConstraintType.MUST),
					DatasetFactory.createConstraint("parentDocumentId", idPastaGED, idPastaGED, ConstraintType.MUST)
				],
				["documentDescription"]
			)

			if (ds != null && ds.values != undefined && ds.values.length > 0) {
				ds.values.forEach(function (el) {
					let it = {
						"documentId": el["documentPK.documentId"],
						"version": el["documentPK.version"],
						"documentType": el.documentType,
						"documentDescription": el.documentDescription
					}
					if (el.documentType == "1") it["sub"] = tools.anexos.listaItens(el["documentPK.documentId"]);
					obj.push(it);
				})
			}


			return obj
		},
		openFile: function () {
			let docId = $(this).attr("data-docid");
			let docVersion = $(this).attr("data-version");

			parent.ECM.documentView = {};
			var cfg = {
				url: "/ecm_documentview/documentView.ftl",
				width: 750,
				height: 500,
				maximized: true,
				showbtclose: false,
				title: "Visualização de Documento",
				callBack: function () {
					parent.ECM.documentView.getDocument(docId, docVersion)
				},
				customButtons: []
			};
			parent.ECM.documentView.panel = parent.WCMC.panel(cfg);
			parent.ECM.documentView.panel.bind("panel-close", function () {
				parent.ECM.documentView.hideIFrame();
				if (parent.ECM.documentView.toUndefined == undefined || parent.ECM.documentView.toUndefined) {
					parent.ECM.documentView = undefined
				}
			})
		}
	},
	aprovacao: {
		msgErro: function () {
			FLUIGC.modal({
				title: 'Problema na alçada',
				content: $("#aprovacaoProblemaAprovador,#_aprovacaoProblemaAprovador").val(),
				id: 'fluig-modal',
				actions: [{
					'label': 'Fechar',
					'autoClose': true
				}]
			});
		}
	},
	aprov1: function () {
		var decisaoAprovador = $("[name=decisaoAprovador]:checked,[name=_decisaoAprovador]:checked").val();

		$("#descReprovAprov,#_descReprovAprov").closest(".form-group").hide();

		if (decisaoAprovador == "nao" || decisaoAprovador == "retornar") $("#descReprovAprov,#_descReprovAprov").closest(".form-group").show();

	},
	aprov2: function () {
		var decisaoAprovador = $("[name=decisaoAprovador2]:checked,[name=_decisaoAprovador2]:checked").val();

		$("#descReprovAprov2,#_descReprovAprov2").closest(".form-group").hide();

		if (decisaoAprovador == "nao" || decisaoAprovador == "retornar") $("#descReprovAprov2,#_descReprovAprov2").closest(".form-group").show();

	},
	aprov3: function () {
		var decisaoAprovador = $("[name=decisaoAprovador3]:checked,[name=_decisaoAprovador3]:checked").val();

		$("#descReprovAprov3,#_descReprovAprov3").closest(".form-group").hide();

		if (decisaoAprovador == "nao" || decisaoAprovador == "retornar") $("#descReprovAprov3,#_descReprovAprov3").closest(".form-group").show();

	},
	calculaPrazoEntrega: function () {
		let tipoSC = $("[name=tipoSc]:checked").val();

		if (tipoSC != undefined) {
			let ds = DatasetFactory.getDataset(
				"DS_COMPRAS_PRAZOS_ENTREGA",
				null,
				[
					DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST)
				],
				null
			)

			if (ds != null && ds.values.length > 0) {
				let dias = 1 * ds.values[0]["prazo_" + tipoSC];

				if (!isNaN(dias)) {
					let d = new Date();
					d.setDate(d.getDate() + dias);

					let txtDate = (d.getDate() < 10 ? "0" + d.getDate() : d.getDate()) + "/" + ((d.getMonth() + 1) < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "/" + d.getFullYear()

					$("#data_entrega").val(txtDate);

					$("[name^=produto_entrega___]").val(txtDate);
				}
			}
		}
	},
	customRemoveChild(oElement) {
		fnWdkRemoveChild(oElement);
	},
	generatePDF: function () {
		var dd = {
			pageMargins: [40, 97, 40, 40],
			pageSize: 'A4',
			pageOrientation: 'landscape',
			header: function (currentPage, pageCount, pageSize) {
				return {
					margin: 40,
					columns: [
						{
							image: "data:image/png;base64,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", // Adicione a URL da imagem
							width: 150,
							height: 50
						},
					]
				};
			},
			content: [
				{ text: 'Informações Básicas', style: 'sectionHeader' },
				{
					style: 'tableExample',
					table: {
						widths: ['*', '*', '*', '*', '*', '*', '*', '*'],
						body: [
							[
								{ text: 'Número Processo:', style: 'fieldLabel' },
								{ text: '2023.12.005', style: 'fieldValue' },
								{ text: 'Gestor do Contrato:', style: 'fieldLabel' },
								{ text: 'Valesca Santos', style: 'fieldValue' },
								{ text: 'Cargo do Gestor:', style: 'fieldLabel' },
								{ text: 'Gerente', style: 'fieldValue' },
								{ text: 'Descrição:', style: 'fieldLabel' },
								{ text: 'Regularização - Serviços de elaboração de Manifestação de Inconformidade', style: 'fieldValue' }
							],
							[
								{ text: 'Justificativa:', style: 'fieldLabel' },
								{ text: 'Trata-se da regularização de uma contratação emergencial para contratação dos serviços referentes a 6 processos administrativos fiscais federais (Manifestação de Inconformidade) do Grupo JCA.', style: 'fieldValue', colSpan: 7 },
								{}, {}, {}, {}, {}, {}
							],
							[
								{ text: 'Histórico do Processo:', style: 'fieldLabel' },
								{ text: 'O escopo dos serviços prevê a análise dos procedimentos de todas as rubricas.', style: 'fieldValue', colSpan: 7 },
								{}, {}, {}, {}, {}, {}
							]
						]
					},
					layout: 'lightHorizontalLines'
				},
				{ text: 'Resultados e Alavancas Utilizadas:', style: 'fieldLabel' },
				{ text: 'Neste processo foi obtido um saving negociável de 14% (R$ 5.000,00) em relação à proposta inicial.', style: 'fieldValue' },
				{ text: 'Outros Fatos Relevantes:', style: 'fieldLabel' },
				{ text: 'O pagamento será efetuado em 2 parcelas, sendo: (i) R$ 15.000,00 com vencimento em 08/12/2023 e (ii) R$ 15.000,00 com vencimento em 08/01/2024.', style: 'fieldValue' },
				{
					style: 'tableExample',
					table: {
						widths: ['*', '*', '*', '*', '*', '*', 45, '*'],
						body: [
							[
								{ text: 'Conduzido pelo Ariba:', style: 'fieldLabel' },
								{ text: 'Não', style: 'fieldValue' },
								{ text: 'Anualizavel:', style: 'fieldLabel' },
								{ text: 'Não', style: 'fieldValue' },
								{ text: 'Responsável:', style: 'fieldLabel' },
								{ text: 'Lorem Ipsum', style: 'fieldValue' },
								{ text: 'Portal/Globus Nº:', style: 'fieldLabel' },
								{ text: '1236224', style: 'fieldValue' }
							],
							[
								{ text: 'Tipo de Processo:', style: 'fieldLabel' },
								{ text: 'Nova Contratação (Spot)', style: 'fieldValue' },
								{ text: 'Tipo de Item:', style: 'fieldLabel' },
								{ text: 'Novo Item', style: 'fieldValue' },
								{ text: 'Tipo Renovável:', style: 'fieldLabel' },
								{ text: 'Não', style: 'fieldValue' },
								{ text: 'Processo Anterior:', style: 'fieldLabel' },
								{ text: 'N/A', style: 'fieldValue' }
							],
							[
								{ text: 'Serviço/Material:', style: 'fieldLabel' },
								{ text: 'Serviço', style: 'fieldValue' },
								{ text: 'Frota:', style: 'fieldLabel' },
								{ text: 'Não', style: 'fieldValue' },
								{ text: 'Categoria:', style: 'fieldLabel' },
								{ text: 'Gerais Administrativa', style: 'fieldValue' },
								{ text: 'Conta (DRC):', style: 'fieldLabel' },
								{ text: 'Consultorias e serviços especializados', style: 'fieldValue' }
							],
							[
								{ text: 'Data de Abertura:', style: 'fieldLabel' },
								{ text: '28/11/2023', style: 'fieldValue' },
								{ text: 'Aprovação da Solicitação:', style: 'fieldLabel' },
								{ text: 'Sim', style: 'fieldValue' },
								{ text: 'Empresa(s):', style: 'fieldLabel' },
								{ text: 'Auto Viação 1001 LTDA', style: 'fieldValue' },
								{ text: 'Orçamento:', style: 'fieldLabel' },
								{ text: '35.000,00', style: 'fieldValue' }
							],
							[
								{ text: 'Aprovado por:', style: 'fieldLabel' },
								{ text: 'Luís Baleiro', style: 'fieldValue' },
								{ text: 'Orçado DR:', style: 'fieldLabel' },
								{ text: 'N/A', style: 'fieldValue' },
								{ text: 'Contratação Direta:', style: 'fieldLabel' },
								{ text: 'Não', style: 'fieldValue', colSpan: 3 }
							]
						]
					},
					layout: 'lightHorizontalLines'
				}
			],
			styles: {
				sectionHeader: {
					fontSize: 16,
					bold: true,
					margin: [0, 10, 0, 5]
				},
				fieldLabel: {
					fontSize: 12,
					bold: true,
					margin: [0, 5, 0, 2]
				},
				fieldValue: {
					fontSize: 12,
					margin: [5, 5, 10, 2]
				},
				tableExample: {
					margin: [0, 5, 0, 15]
				}
			}
		}
		pdfMake.createPdf(dd).download('intrack.pdf');
	},
	calculaTerminoCotacao: function () {
		let validade_cotacao = $("#validade_cotacao").val();

		if (validade_cotacao != "" && !isNaN(validade_cotacao)) {
			let d = new Date();
			d.setDate(d.getDate() + parseInt(validade_cotacao));
			$("#dataTerminoSolicitacaoCotacao").val(d.toLocaleDateString("pt-BR"))
		} else {
			$("#dataTerminoSolicitacaoCotacao").val("")
		}

	},
	cotacao: {
		carregaDados: function (cotacoes) {
			if ($("#C8_NUM,#_C8_NUM").val() != "" || $("[name*=tipoSc]:checked").val() == "5") {
				if (usuarioCompras) {
					let ciclo = $("#ciclo_atual,#_ciclo_atual").val();
					aDados.cotacoes = [];
					aDados.solicitacao = [];

					if (aDados.cotacoes.length < 1) {
						if (!cotacoes) {
							let tmp = tools.cotacao.getFormCotacao();
							cotacoes = aDados.dsCotacoes;
						}

						aDados.cotacoes = cotacoes
							.filter(function (el) { return el.C8_PRECO != "" && el.C8_PRECO != "0.00" && el.C8_PRECO != "0,00" && el.C8_PRECO != "null" && el.C8_PRECO != "0.000000" && el.C8_PRECO != "0,000000" })
							.map(function (cotacao) {
								let filtForn = aDados.fornecedores.filter(function (f) { return f.A2_COD == cotacao["C8_FORNECE"] && f.A2_LOJA == cotacao["C8_LOJA"] });
								cotacao["C8_COND"] = filtForn.length > 0 ? filtForn[0]["A2_COND"] : "";
								let condPagto = aDados.condPagto.filter(function (cP) { return cP.CODIGO == cotacao["C8_COND"] })

								return {
									IDX: cotacao["idx"],
									C8_CICLO: cotacao["C8_CICLO"],
									VENCEDOR: cotacao["VENCEDOR"] == "true",
									VENCEDOR_COMP: cotacao["VENCEDOR_COMPRADOR"] == "true",
									QTD_COMPRADOR: !["", "null"].includes(cotacao["QTD_COMPRADOR"]) ? cotacao["QTD_COMPRADOR"] : 0,
									COMPRADOR: !["", "null"].includes(cotacao["COMPRADOR"]) ? cotacao["COMPRADOR"] : "",
									COMPRADOR_JUSTIFICATIVA: !["", "null"].includes(cotacao["COMPRADOR_JUSTIFICATIVA"]) ? cotacao["COMPRADOR_JUSTIFICATIVA"] : "",
									C8_PRODUTO: cotacao["C8_PRODUTO"].trim(),
									B1_COD: aDados.produtos.filter(function (p) { return p.B1_COD == cotacao["C8_PRODUTO"].trim().substring(0, 8) })[0]["B1_COD"],
									B1_DESC: aDados.produtos.filter(function (p) { return p.B1_COD == cotacao["C8_PRODUTO"].trim().substring(0, 8) })[0]["B1_DESC"],
									QTD: aDados.produtos.filter(function (p) { return p.B1_COD == cotacao["C8_PRODUTO"].trim().trim().substring(0, 8) })[0]["QTD"],
									MARCA: aDados.produtos.filter(function (p) { return p.B1_COD == cotacao["C8_PRODUTO"].trim().substring(0, 8) })[0].FILHOS.filter(function (pF) { return pF.B1_COD == cotacao["C8_PRODUTO"].trim() })[0]["ZPM_DESC"],
									C8_FORNECE: cotacao["C8_FORNECE"],
									C8_LOJA: cotacao["C8_LOJA"],
									A2_NOME: filtForn[0]["A2_NOME"],
									C8_QUANT: cotacao["C8_QUANT"],
									C8_PRECO: cotacao["C8_PRECO"],
									C8_TOTAL: cotacao["C8_TOTAL"],
									CONDPAGTO: condPagto.length > 0 ? condPagto[0]["DESCRICAO"] : "",
									C8_PRAZO: cotacao["C8_PRAZO"],
									C8_FILENT: cotacao["C8_FILENT"],
									C8_VALIPI: cotacao["C8_VALIPI"],
									C8_VALICM: cotacao["C8_VALICM"],
									C8_VALISS: cotacao["C8_VALISS"],
									C8_DIFAL: cotacao["C8_DIFAL"],
									C8_VALSOL: cotacao["C8_VALSOL"],
									C8_VALIDA: cotacao["C8_VALIDA"],
									C8_UM: cotacao["C8_UM"]
								}
							})

					}

					aDados.produtos.forEach(function (el) {
						el["cotacoes"] = aDados.cotacoes.filter(function (ele) { return ((ele.C8_PRODUTO.trim().length == 12 && ele.C8_PRODUTO.trim().substring(0, 8) == el.B1_COD) || ele.C8_PRODUTO.trim().substring(0, 8) == el.B1_COD) && ele.C8_CICLO == ciclo });
						el["temCotacao"] = el["cotacoes"].length > 0;
					});

					aDados.fornecedores.forEach(function (el) {
						el["cotacoes"] = aDados.cotacoes.filter(function (ele) { return /* ele.C8_PRODUTO.trim().length == 12 && */ ele.C8_FORNECE == el.A2_COD && ele.C8_LOJA == el.A2_LOJA && ele.C8_CICLO == ciclo })
						el["temCotacao"] = el["cotacoes"].length > 0;
					});

				} else {
					$("[name=filtrar_mapa]").closest(".row").hide();
					if (aDados.cotacoes.length < 1) {
						let tmp = tools.cotacao.getFormCotacao();
						let dsCotacoes = aDados.dsCotacoes.filter(function (el) { return el.C8_CICLO == $("#ciclo_atual,#_ciclo_atual").val() })
						for (var i = 0; i < dsCotacoes.length; i++) {
							aDados.cotacoes.push({
								C8_CICLO: dsCotacoes[i]["C8_CICLO"],
								VENCEDOR: dsCotacoes[i]["VENCEDOR"] == "true",
								VENCEDOR_COMP: dsCotacoes[i]["VENCEDOR_COMPRADOR"] == "true",
								C8_ITEM: dsCotacoes[i]["C8_ITEM"],
								B1_COD: dsCotacoes[i]["B1_COD"],//
								C8_PRODUTO: dsCotacoes[i]["C8_PRODUTO"].trim(),
								C8_UM: dsCotacoes[i]["C8_UM"],
								C8_FORNECE: dsCotacoes[i]["C8_FORNECE"],
								C8_LOJA: dsCotacoes[i]["C8_LOJA"],
								A2_NOME: aDados.fornecedores.filter(function (el) { return el.A2_COD == dsCotacoes[i]["C8_FORNECE"] && el.A2_LOJA == dsCotacoes[i]["C8_LOJA"] })[0]["A2_NOME"],
								C8_QUANT: dsCotacoes[i]["C8_QUANT"],
								QTD_COMPRADOR: dsCotacoes[i]["QTD_COMPRADOR"],//
								C8_PRECO: dsCotacoes[i]["C8_PRECO"],
								C8_TOTAL: dsCotacoes[i]["C8_TOTAL"],
								C8_PRAZO: dsCotacoes[i]["C8_PRAZO"],
								C8_FILENT: dsCotacoes[i]["C8_FILENT"],
								C8_VALIPI: dsCotacoes[i]["C8_VALIPI"],
								C8_VALICM: dsCotacoes[i]["C8_VALICM"],
								C8_VALISS: dsCotacoes[i]["C8_VALISS"],
								C8_DIFAL: dsCotacoes[i]["C8_DIFAL"],
								C8_VALSOL: dsCotacoes[i]["C8_VALSOL"],
								C8_VALIDA: dsCotacoes[i]["C8_VALIDA"],
								C8_UM: dsCotacoes[i]["C8_UM"]
							})
						}
					}

					aDados.produtos.forEach(function (el) {
						el.cotacoes = aDados.cotacoes.filter(function (it) { return it.C8_PRODUTO.trim().substring(0, 8) == el.B1_COD })
					})

					$("#ciclo_mapa").closest(".row").hide()
				}
			}
		},
		getFormCotacao: function () {
			if ($("#C8_NUM,#_C8_NUM").val() != "" && $("[name*=tipoSc]:checked").val() != "5") {
				aDados["dsCotacoes"] = DatasetFactory.getDataset(
					"DS_CONSULTA_COTACOES",
					null,
					[
						DatasetFactory.createConstraint("idEmpresa", $("#idEmpresa,#_idEmpresa").val(), $("#idEmpresaEntrega,#_idEmpresaEntrega").val(), ConstraintType.MUST),
						DatasetFactory.createConstraint("C8_NUM", $("#C8_NUM,#_C8_NUM").val(), $("#C8_NUM,#_C8_NUM").val(), ConstraintType.MUST)
					],
					null
				).values
			}
			else if ($("[name*=tipoSc]:checked").val() == "5") {
				aDados["dsCotacoes"] = $("[name*=C8_PRODUTO___].form-control").toArray().map(function (el) {
					return {
						IDX: $(el).attr("id").split("___")[1],
						C8_CICLO: $(el).closest("tr").find("[name*=C8_CICLO]").val(),
						VENCEDOR: $(el).closest("tr").find("[name*=VENCEDOR]").val() == "true",
						VENCEDOR_COMP: $(el).closest("tr").find("[name*=VENCEDOR_COMPRADOR]").val() == "true",
						QTD_COMPRADOR: !["", "null"].includes($(el).closest("tr").find("[name*=QTD_COMPRADOR]").val()) ? $(el).closest("tr").find("[name*=QTD_COMPRADOR]").val() : 0,
						COMPRADOR: !["", "null"].includes($(el).closest("tr").find("[name*=COMPRADOR]").val()) ? $(el).closest("tr").find("[name*=COMPRADOR]").val() : "",
						COMPRADOR_JUSTIFICATIVA: !["", "null"].includes($(el).closest("tr").find("[name*=COMPRADOR_JUSTIFICATIVA]").val()) ? $(el).closest("tr").find("[name*=COMPRADOR_JUSTIFICATIVA]").val() : "",
						C8_PRODUTO: $(el).closest("tr").find("[name*=C8_PRODUTO]").val().trim(),
						B1_COD: aDados.produtos.filter(function (p) { return p.B1_COD == $(el).closest("tr").find("[name*=C8_PRODUTO]").val().trim().substring(0, 8) })[0]["B1_COD"],
						B1_DESC: aDados.produtos.filter(function (p) { return p.B1_COD == $(el).closest("tr").find("[name*=C8_PRODUTO]").val().trim().substring(0, 8) })[0]["B1_DESC"],
						QTD: aDados.produtos.filter(function (p) { return p.B1_COD == $(el).closest("tr").find("[name*=C8_PRODUTO]").val().trim().substring(0, 8) })[0]["QTD"],
						MARCA: aDados.produtos.filter(function (p) { return p.B1_COD == $(el).closest("tr").find("[name*=C8_PRODUTO]").val().trim().substring(0, 8) })[0].FILHOS.filter(function (pF) { return pF.B1_COD == $(el).closest("tr").find("[name*=C8_PRODUTO]").val().trim() })[0]["ZPM_DESC"],
						C8_FORNECE: $(el).closest("tr").find("[name*=C8_FORNECE]").val(),
						C8_LOJA: $(el).closest("tr").find("[name*=C8_LOJA]").val(),
						//A2_NOME: 					filtForn[0]["A2_NOME"],
						C8_QUANT: $(el).closest("tr").find("[name*=C8_QUANT]").val(),
						C8_PRECO: $(el).closest("tr").find("[name*=C8_PRECO]").val(),
						C8_TOTAL: $(el).closest("tr").find("[name*=C8_TOTAL]").val(),
						//CONDPAGTO: 					condPagto.length > 0 ? condPagto[0]["DESCRICAO"] : "",
						C8_PRAZO: $(el).closest("tr").find("[name*=C8_PRAZO]").val(),
						C8_FILENT: $(el).closest("tr").find("[name*=C8_FILENT]").val(),
						C8_VALIPI: $(el).closest("tr").find("[name*=C8_VALIPI]").val(),
						C8_VALICM: $(el).closest("tr").find("[name*=C8_VALICM]").val(),
						C8_VALISS: $(el).closest("tr").find("[name*=C8_VALISS]").val(),
						C8_DIFAL: $(el).closest("tr").find("[name*=C8_DIFAL]").val(),
						C8_VALSOL: $(el).closest("tr").find("[name*=C8_VALSOL]").val(),
						C8_VALIDA: $(el).closest("tr").find("[name*=C8_VALIDA]").val(),
						C8_UM: $(el).closest("tr").find("[name*=C8_UM]").val()
					}
				})
			}

		},
		init: function () {
			if ([65, 21, 163].includes(WKNumState)) {
				if ($("[name=tipoSc]:checked,[name=_tipoSc]:checked").val() == "5") {
					$("#btnAddCotacao").on("click", tools.cotacao.modal.listar);
					return;
				}
			}
			tools.cotacao.carregaDados();
			$("#btnAddCotacao").hide();
		},
		modal: {
			calculaTotal: function () {
				let C8PRECO = $("[data-panel=edit][data-id=C8_PRECO]").val();
				let C8QUANT = $("[data-panel=edit][data-id=C8_QUANT]").val();

				if (C8PRECO != "" && C8QUANT != "") {
					let C8TOTAL = tools.formata.toFloat(C8PRECO) * tools.formata.toFloat(C8QUANT);
					$("[data-panel=edit][data-id=C8_TOTAL]").val(C8TOTAL.toLocaleString("PT-BR", { minimumFractionDigits: 2 }))
				} else {
					$("[data-panel=edit][data-id=C8_TOTAL]").val("0,00")
				}
			},
			carregaEdit: function () {
				let A2_COD = $("[data-panel=list][data-id=A2_COD]").val();
				let A2_LOJA = $("[data-panel=list][data-id=A2_LOJA]").val();
				let C8_PRODUTO = $("[name=selectCotacao]:checked").val();

				let filtForn = aDados.fornecedores.filter(function (el) { return el.A2_COD == A2_COD && el.A2_LOJA == A2_LOJA });
				if (filtForn.length > 0) {
					var filtCotaca = filtForn[0].cotacoes.filter(function (el) { return el.C8_PRODUTO == C8_PRODUTO })
					if (filtCotaca.length > 0) {
						let idxCotacao = filtCotaca[0].IDX;
						$("[data-panel='edit'][data-id='produto']").val(filtCotaca[0].B1_DESC)
						$("[data-panel='edit'][data-id='C8_PROD']").val(filtCotaca[0].B1_COD)
						$("[data-panel='edit'][data-id='marca']").val(filtCotaca[0].MARCA)
						$("[data-panel='edit'][data-id='C8_PRODUTO']").val(filtCotaca[0].C8_PRODUTO)
						$("[data-panel='edit'][data-id='UM']").val(tools.cotacao.modal.options.UM.lista.filter(function (el) { return el.id == filtCotaca[0].C8_UM })[0].desc)
						$("[data-panel='edit'][data-id='C8_UM']").val(filtCotaca[0].C8_UM)
						$("[data-panel='edit'][data-id='C8_PRECO']").val(filtCotaca[0].C8_PRECO)
						$("[data-panel='edit'][data-id='C8_QUANT']").val(filtCotaca[0].C8_QUANT)
						$("[data-panel='edit'][data-id='C8_TOTAL']").val(filtCotaca[0].C8_TOTAL)
						$("[data-panel='edit'][data-id='C8_VALISS']").val(filtCotaca[0].C8_VALISS)
						$("[data-panel='edit'][data-id='C8_VALIPI']").val(filtCotaca[0].C8_VALIPI)
						$("[data-panel='edit'][data-id='C8_VALICM']").val(filtCotaca[0].C8_VALICM)
						//$("[data-panel='edit'][data-id='C8_SEGURO']").val(filtCotaca[0].C8_SEGURO)
						//$("[data-panel='edit'][data-id='C8_DESPESA']").val(filtCotaca[0].C8_DESPESA)
						//$("[data-panel='edit'][data-id='C8_VALFRE']").val(filtCotaca[0].C8_VALFRE)
						//$("[data-panel='edit'][data-id='C8_TPFRETE']").val(filtCotaca[0].C8_TPFRETE)
						//$("[data-panel='edit'][data-id='condicao']").val(filtCotaca[0].C8_COND + " | " + filtCotaca[0].CONDPAGTO)
						//$("[data-panel='edit'][data-id='C8_COND']").val(filtCotaca[0].C8_COND)
					}
				}

			},
			delete: function () {

				let C8_PRODUTO = $("[name=selectCotacao]:checked").val();
				let A2_COD = $("[data-panel=list][data-id=A2_COD]").val();
				let A2_LOJA = $("[data-panel=list][data-id=A2_LOJA]").val();

				if (C8_PRODUTO != undefined) {
					let ret = FLUIGC.message.confirm({
						message: 'Confirma a exclusão da cotação selecionada?',
						labelYes: 'Confirmar',
						labelNo: 'Cancelar'
					}, function (result, el, ev) {
						if (result) {
							let filterForn = aDados.fornecedores.filter(function (el) { return el.A2_COD == A2_COD && el.A2_LOJA == A2_LOJA });
							if (filterForn.length > 0 && filterForn[0].cotacoes != undefined) {
								//var filCot = filterForn[0].cotacoes.filter(function (el) { return el.C8_PRODUTO == C8_PRODUTO });
								var filCot = aDados.dsCotacoes.filter(function (el) { return el.C8_PRODUTO == C8_PRODUTO && el.C8_FORNECE == A2_COD && el.C8_LOJA == A2_LOJA });
							}
							if (filterForn != undefined && filterForn.length > 0) {

								fnWdkRemoveChild($("#C8_PRODUTO___" + filCot[0].IDX).get(0));
								tools.cotacao.carregaDados();
								tools.TES.init();

								tools.cotacao.modal["listarCotacao"].remove();
								tools.cotacao.modal.listar();

							} else {
								FLUIGC.toast({
									message: 'Favor entrar em contato com o suporte pois ocorreu um erro',
									type: 'danger'
								});
							}
						}
					})

				} else {
					FLUIGC.toast({
						message: 'É necessário selecionar uma cotação para excluir',
						type: 'danger'
					});
				}
			},
			edit: function () {
				let cotacaoSelecionada = $("[name=selectCotacao]:checked").val()

				if (cotacaoSelecionada != undefined) {
					let A2_COD = $("[data-panel=list][data-id=A2_COD]").val();
					let A2_LOJA = $("[data-panel=list][data-id=A2_LOJA]").val();

					let filtForn = aDados.fornecedores.filter(function (el) { return el.A2_COD == A2_COD && el.A2_LOJA == A2_LOJA });
					if (filtForn.length > 0) {
						var filtCotaca = filtForn[0].cotacoes.filter(function (el) { return el.C8_PRODUTO == cotacaoSelecionada })
						if (filtCotaca.length > 0) {

							let temp = $("#tmpl7").html();
							let html = Mustache.render(temp);
							tools.cotacao.modal["editarCotacao"] = FLUIGC.modal({
								title: 'Editar cotação',
								content: html,
								id: 'fluig-editarCotacao',
								size: 'full',
								actions: [{
									'label': 'Salvar',
									'bind': 'data-salvar-modal',
								}, {
									'label': 'Cancelar',
									'autoClose': true
								}]
							}, function (err, data) {
								//console.log(err, data)
								if (!err) {
									$("[btn-id]").not("[btn-id='produto'],[btn-id='marca']").on("click", tools.cotacao.modal.selects.view);
									$("[data-salvar-modal]").on("click", tools.cotacao.modal.salvar);
									tools.cotacao.modal.carregaEdit();
									$("[data-panel=edit][data-id=C8_PRECO],[data-panel=edit][data-id=C8_TOTAL],[data-panel=edit][data-id=C8_VALIPI],[data-panel=edit][data-id=C8_VALICM],[data-panel=edit][data-id=C8_VALISS],[data-panel=edit][data-id=C8_DESPESA],[data-panel=edit][data-id=C8_VALFRE]").on("keyup", tools.formata.mascara.money);
									$("[data-panel=edit][data-id=C8_QUANT]").mask("####0");
									$("[data-panel=edit][data-id=C8_PRECO],[data-panel=edit][data-id=C8_QUANT]").on("change", tools.cotacao.modal.calculaTotal)
								} else {
									// do something with data
								}
							})
						} else {
							FLUIGC.toast({
								message: 'Entre em contato com o suporte para analisar problema encontrado',
								type: 'danger'
							});
						}
					} else {
						FLUIGC.toast({
							message: 'Entre em contato com o suporte para analisar problema encontrado',
							type: 'danger'
						});
					}
				} else {
					FLUIGC.toast({
						message: 'É necessário selecionar uma cotação para editar',
						type: 'danger'
					});
				}
			},
			listar: function () {
				tools.cotacao.carregaDados();
				tools.cotacao.modal.options.condicao.carrega();
				tools.cotacao.modal.options.UM.carrega();
				tools.cotacao.modal.processaCotacoes();

				let temp = $("#tmpl6").html();
				let html = Mustache.render(temp, aDados.fornecedores[0]);
				if (tools.cotacao.modal["listarCotacao"] != undefined)
					tools.cotacao.modal["listarCotacao"].remove();
				tools.cotacao.modal["listarCotacao"] = FLUIGC.modal({
					title: 'Manutenção de cotações',
					content: html,
					id: 'fluig-listarCotacao',
					size: 'full',
					actions: [{
						'label': 'Incluir',
						'bind': 'data-incluir-modal',
					}, {
						'label': 'Editar',
						'bind': 'data-editar-modal',
					}, {
						'label': 'Excluir',
						'customClass': 'btn-danger',
						'bind': 'data-excluir-modal',
					}, {
						'label': 'Fechar',
						'autoClose': true
					}]
				}, function (err, data) {
					//console.log(err, data)
					if (!err) {
						$("[btn-id]").on("click", tools.cotacao.modal.selects.view);
						$("[data-incluir-modal]").on("click", tools.cotacao.modal.insert)
						$("[data-editar-modal]").on("click", tools.cotacao.modal.edit)
						$("[data-excluir-modal]").on("click", tools.cotacao.modal.delete)


						//Nova tratativa para frete e condição no cabeçalho
						$("[data-id='C8_VALFRE']").val($("[name^=A2_VALFRE___]").val())
						$("[data-id='C8_TPFRETE']").val($("[name^=A2_TPFRETE___]").val())
						let filtCond = aDados.condPagto.filter(function (el) { return el.CODIGO == $("[name^=A2_COND___]").val() })
						if (filtCond.length > 0) $("[data-id='condicao']").val(filtCond[0]["DESCRICAO"])

						$("[data-id='C8_VALFRE']").on("keyup", tools.formata.mascara.money);
						$("[data-id='C8_VALFRE'],[data-id='C8_TPFRETE']").on("change", function () {
							let C8_TPFRETE = $("[data-id='C8_TPFRETE']").val();
							let C8_VALFRE = $("[data-id='C8_VALFRE']").val();

							if (C8_VALFRE != "") {
								if (C8_TPFRETE != "") {
									if (C8_TPFRETE == "S") {
										$("[name^=A2_TPFRETE___]").val(C8_TPFRETE);
										$("[name^=A2_VALFRE___]").val("0,00");
									} else {
										$("[name^=A2_TPFRETE___]").val(C8_TPFRETE);
										$("[name^=A2_VALFRE___]").val(C8_VALFRE);
									}

								} else {
									$("[data-id='C8_VALFRE']").val("");
									FLUIGC.toast({
										message: 'É necessário selecionar o Tipo do Frete antes de incluir o valor',
										type: 'danger'
									});
								}
							}
							else {
								if (C8_TPFRETE == "S") {
									$("[name^=A2_TPFRETE___]").val(C8_TPFRETE);
									$("[name^=A2_VALFRE___]").val("0,00");
								}
							}
						})
					} else {
						// do something with data
					}
				})

			},
			insert: function () {
				let temp = $("#tmpl7").html();
				let html = Mustache.render(temp);
				tools.cotacao.modal["inserirCotacao"] = FLUIGC.modal({
					title: 'Inserir cotação',
					content: html,
					id: 'fluig-inserirCotacao',
					size: 'full',
					actions: [{
						'label': 'Salvar',
						'bind': 'data-salvar-modal',
					}, {
						'label': 'Cancelar',
						'autoClose': true
					}]
				}, function (err, data) {
					if (!err) {
						$("[btn-id]").on("click", tools.cotacao.modal.selects.view);
						$("[data-salvar-modal]").on("click", tools.cotacao.modal.salvar);
						$("[data-panel=edit][data-id=C8_PRECO],[data-panel=edit][data-id=C8_TOTAL],[data-panel=edit][data-id=C8_VALIPI],[data-panel=edit][data-id=C8_VALICM],[data-panel=edit][data-id=C8_VALISS],[data-panel=edit][data-id=C8_DESPESA],[data-panel=edit][data-id=C8_VALFRE]").on("keyup", tools.formata.mascara.money);
						$("[data-panel=edit][data-id=C8_QUANT]").mask("####0");
						$("[data-panel=edit][data-id=C8_PRECO],[data-panel=edit][data-id=C8_QUANT]").on("change", tools.cotacao.modal.calculaTotal).on("keyup", tools.cotacao.modal.calculaTotal)
					} else {
						// do something with data
					}
				})
			},
			processaCotacoes: function () {
				aDados.fornecedores.forEach(function (el) {
					el["pedido"] = {
						"C8_TOTAL": 0,
						"C8_VALIPI": 0,
						"C8_VALICM": 0,
						"C8_SEGURO": 0,
						"C8_DESPESA": 0,
						"C8_VALFRE": 0
					};
					if (el.cotacoes && el.cotacoes.length > 0) {
						el["pedido"]["cotacoes"] = el.cotacoes.filter(function (cot) { return cot.VENCEDOR_COMP == "true" && cot.C8_FORNECE == el.A2_COD && cot.C8_LOJA == el.A2_LOJA })
						el["pedido"]["cotacoes"].forEach(function (cot) {
							el["pedido"]["C8_TOTAL"] += tools.formata.toFloat(cot.C8_TOTAL);
							el["pedido"]["C8_VALIPI"] += tools.formata.toFloat(cot.C8_VALIPI);
							el["pedido"]["C8_VALICM"] += tools.formata.toFloat(cot.C8_VALICM);
							//el["pedido"]["C8_SEGURO"] += tools.formata.toFloat(cot.C8_SEGURO);
							//el["pedido"]["C8_DESPESA"] += tools.formata.toFloat(cot.C8_DESPESA);
							el["pedido"]["C8_VALFRE"] += tools.formata.toFloat(cot.C8_VALFRE);
						})
					}

					el["pedido"]["C8_TOTAL"] = el["pedido"]["C8_TOTAL"].toLocaleString("PT-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
					el["pedido"]["C8_VALIPI"] = el["pedido"]["C8_VALIPI"].toLocaleString("PT-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
					el["pedido"]["C8_VALICM"] = el["pedido"]["C8_VALICM"].toLocaleString("PT-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
					//el["pedido"]["C8_SEGURO"] = el["pedido"]["C8_SEGURO"].toLocaleString("PT-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
					//el["pedido"]["C8_DESPESA"] = el["pedido"]["C8_DESPESA"].toLocaleString("PT-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
					el["pedido"]["C8_VALFRE"] = el["pedido"]["C8_VALFRE"].toLocaleString("PT-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
				})

			},
			salvar: function () {
				let painel = $(this).closest("[role]").attr("id");

				let C8_PRODUTO = $("[data-panel=edit][data-id=C8_PRODUTO]").val();
				let C8_UM = $("[data-panel=edit][data-id=C8_UM]").val();
				let C8_PRECO = $("[data-panel=edit][data-id=C8_PRECO]").val();
				let C8_QUANT = $("[data-panel=edit][data-id=C8_QUANT]").val();
				let C8_TOTAL = $("[data-panel=edit][data-id=C8_TOTAL]").val();
				let C8_COND = $("[data-panel=edit][data-id=C8_COND]").val();
				let A2_COD = $("[data-panel=list][data-id=A2_COD]").val();
				let A2_LOJA = $("[data-panel=list][data-id=A2_LOJA]").val();

				let idx;

				if (C8_PRODUTO != "" && C8_UM != "" && C8_PRECO != "" && C8_QUANT != "" && C8_TOTAL != "") {
					let filterForn = aDados.fornecedores.filter(function (el) { return el.A2_COD == A2_COD && el.A2_LOJA == A2_LOJA });
					if (filterForn.length > 0 && filterForn[0].cotacoes != undefined) {
						//var filCot = filterForn[0].cotacoes.filter(function (el) { return el.C8_PRODUTO == C8_PRODUTO });
						var filCot = aDados.dsCotacoes.filter(function (el) { return el.C8_PRODUTO == C8_PRODUTO && el.C8_FORNECE == A2_COD && el.C8_LOJA == A2_LOJA });
					}

					if (painel == "fluig-inserirCotacao") {
						if (filCot != undefined && filCot.length > 0) {
							let ret = FLUIGC.message.confirm({
								message: 'Foi encontrado uma cotação para o Produto + Marca já inserido, deseja substituir?',
								labelYes: 'Substituir',
								labelNo: 'Cancelar'
							}, function (result, el, ev) {
								if (result) {
									idx = filCot[0].IDX;

									$("#VENCEDOR_COMPRADOR" + "___" + idx).val("true");
									$("#COMPRADOR" + "___" + idx).val(usuarioAtual);
									$("#QTD_COMPRADOR" + "___" + idx).val(C8_QUANT);
									$("#C8_CICLO" + "___" + idx).val($("#ciclo_atual,#_ciclo_atual").val());
									$("#C8_PRODUTO" + "___" + idx).val(C8_PRODUTO);
									$("#C8_FORNECE" + "___" + idx).val(A2_COD);
									$("#C8_LOJA" + "___" + idx).val(A2_LOJA);
									$("#C8_QUANT" + "___" + idx).val(C8_QUANT);
									$("#C8_UM" + "___" + idx).val(C8_UM);
									$("#C8_PRECO" + "___" + idx).val(C8_PRECO);
									$("#C8_TOTAL" + "___" + idx).val(C8_TOTAL);
									$("#C8_COND" + "___" + idx).val(C8_COND);
									$("#C8_PRAZO" + "___" + idx).val("1");
									$("#C8_VALIPI" + "___" + idx).val($("[data-panel=edit][data-id=C8_VALIPI]").val());
									$("#C8_VALICM" + "___" + idx).val($("[data-panel=edit][data-id=C8_VALICM]").val());
									$("#C8_VALISS" + "___" + idx).val($("[data-panel=edit][data-id=C8_VALISS]").val());
									//$("#C8_VALFRE" + "___" + idx).val($("[data-panel=edit][data-id=C8_VALFRE]").val());
									//$("#C8_TPFRETE" + "___" + idx).val($("[data-panel=edit][data-id=C8_TPFRETE]").val());
									//$("#C8_SEGURO" + "___" + idx).val($("[data-panel=edit][data-id=C8_SEGURO]").val());
									//$("#C8_DESPESA" + "___" + idx).val($("[data-panel=edit][data-id=C8_DESPESA]").val());
									$("#C8_FILENT" + "___" + idx).val($("#idEmpresaEntrega,#_idEmpresaEntrega").val());

									tools.cotacao.carregaDados();
									tools.TES.init();
									tools.cotacao.modal.listar();
									tools.cotacao.modal["inserirCotacao"].remove();

								} else {
									return;
								}
							});

						} else {
							idx = wdkAddChild("tabCotacao");
						}
					} else if (painel == "fluig-editarCotacao") {
						idx = filCot[0].IDX
					}

					if (idx) {
						$("#VENCEDOR_COMPRADOR" + "___" + idx).val("true");
						$("#COMPRADOR" + "___" + idx).val(usuarioAtual);
						$("#QTD_COMPRADOR" + "___" + idx).val(C8_QUANT);
						$("#C8_CICLO" + "___" + idx).val($("#ciclo_atual,#_ciclo_atual").val());
						$("#C8_PRODUTO" + "___" + idx).val(C8_PRODUTO);
						$("#C8_FORNECE" + "___" + idx).val(A2_COD);
						$("#C8_LOJA" + "___" + idx).val(A2_LOJA);
						$("#C8_QUANT" + "___" + idx).val(C8_QUANT);
						$("#C8_UM" + "___" + idx).val(C8_UM);
						$("#C8_PRECO" + "___" + idx).val(C8_PRECO);
						$("#C8_TOTAL" + "___" + idx).val(C8_TOTAL);
						$("#C8_COND" + "___" + idx).val(C8_COND);
						$("#C8_PRAZO" + "___" + idx).val("1");
						$("#C8_VALIPI" + "___" + idx).val($("[data-panel=edit][data-id=C8_VALIPI]").val());
						$("#C8_VALICM" + "___" + idx).val($("[data-panel=edit][data-id=C8_VALICM]").val());
						$("#C8_VALISS" + "___" + idx).val($("[data-panel=edit][data-id=C8_VALISS]").val());
						//$("#C8_VALFRE" + "___" + idx).val($("[data-panel=edit][data-id=C8_VALFRE]").val());
						//$("#C8_TPFRETE" + "___" + idx).val($("[data-panel=edit][data-id=C8_TPFRETE]").val());
						//$("#C8_SEGURO" + "___" + idx).val($("[data-panel=edit][data-id=C8_SEGURO]").val());
						//$("#C8_DESPESA" + "___" + idx).val($("[data-panel=edit][data-id=C8_DESPESA]").val());
						$("#C8_FILENT" + "___" + idx).val($("#idEmpresaEntrega,#_idEmpresaEntrega").val());

						tools.cotacao.carregaDados();

						if (painel == "fluig-editarCotacao") {
							tools.cotacao.modal["editarCotacao"].remove();
						} else {
							tools.cotacao.modal["inserirCotacao"].remove();
						}

						tools.cotacao.modal["listarCotacao"].remove();
						tools.cotacao.modal.listar();
					}

				} else {
					FLUIGC.toast({
						message: 'Verifique os campos obrigatórios',
						type: 'danger'
					});
				}

			},
			selects: {
				condicao: function () {
					tools.cotacao["modalSelecionaCondicao"] = FLUIGC.modal({
						title: 'Selecionar Condição',
						content: `
							        <table class="table table-striped" id="modCondicao">
						        	<thead>
						        		<th>Código</th>
						        		<th>Descrição</th>
						        	</thead>
						        	<tbody>
						        		<td></td>
						        		<td></td>
						        	</tbody>
						        </table>
						        `,
						id: 'fluig-modalSelecionaCondicao'
					}, function (err, data) {
						if (!err) {
							$("#modCondicao").DataTable({
								data: tools.cotacao.modal.options.condicao["lista"],
								columns: [
									{ data: "id" },
									{ data: "desc" }
								],
								createdRow: function (row, data, dataIndex) {
									$(row).attr('data-cod', data.id);
									$(row).attr('data-desc', data.desc);
									$(row).on("click", function () {
										let cod = $(this).attr("data-cod");
										let desc = $(this).attr("data-desc");

										$("[data-panel=list][data-id=condicao]").val(desc);
										$("[data-panel=list][data-id=C8_COND]").val(cod);
										$("[name^=A2_COND___]").val(cod)

										tools.cotacao.modalSelecionaCondicao.remove();

									})
								}
							})

						}
					})
				},
				marca: function () {
					let C8_PROD = $("[data-panel=edit][data-id=C8_PROD]").val()
					if (C8_PROD != "") {
						tools.cotacao["modalSelecionaMarca"] = FLUIGC.modal({
							title: 'Selecionar marca',
							content: `
 							        <table class="table table-striped" id="modMarca">
 						        	<thead>
 						        		<th>Código</th>
 						        		<th>Descrição</th>
 						        	</thead>
 						        	<tbody>
 						        		<td></td>
 						        		<td></td>
 						        	</tbody>
 						        </table>
 						        `,
							id: 'fluig-modalSelecionaMarca'
						}, function (err, data) {
							if (!err) {
								$("#modMarca").DataTable({
									data: aDados.produtos.filter(
										function (el) { return el.B1_COD == C8_PROD })[0].FILHOS.sort(function (a, b) { return b.ZPM_DESC - a.ZPM_DESC }).map(function (it) { return { id: it.B1_COD, desc: it.ZPM_DESC, um: it.UM } }),
									columns: [
										{ data: "id", visible: false },
										{ data: "um", visible: false },
										{ data: "desc" }
									],
									createdRow: function (row, data, dataIndex) {
										$(row).attr('data-cod', data.id);
										$(row).attr('data-desc', data.desc);
										$(row).on("click", function () {
											let cod = $(this).attr("data-cod");
											let desc = $(this).attr("data-desc");

											$("[data-panel=edit][data-id=marca]").val(desc);
											$("[data-panel=edit][data-id=C8_PRODUTO]").val(cod);
											$("[data-panel=edit][data-id=UM]").val(data.um);
											$("[data-panel=edit][data-id=C8_UM]").val(data.um);

											tools.cotacao.modalSelecionaMarca.remove();

										})
									}
								})

							}
						})
					} else {

					}

				},
				produto: function () {
					tools.cotacao["modalSelecionaProduto"] = FLUIGC.modal({
						title: 'Selecionar produto',
						content: `
					        <table class="table table-striped" id="modProduto">
					        	<thead>
					        		<th>Código</th>
					        		<th>Descrição</th>
					        	</thead>
					        	<tbody>
					        		<td></td>
					        		<td></td>
					        	</tbody>
					        </table>
					        `,
						id: 'fluig-selecionaProduto'
					}, function (err, data) {
						if (!err) {
							$("#modProduto").DataTable({
								data: aDados.produtos,
								columns: [
									{ data: "B1_COD" },
									{ data: "B1_DESC" }
								],
								createdRow: function (row, data, dataIndex) {
									$(row).attr('data-cod', data.B1_COD);
									$(row).attr('data-desc', data.B1_DESC);
									$(row).on("click", function () {
										let cod = $(this).attr("data-cod");
										let desc = $(this).attr("data-desc");

										$("[data-panel=edit][data-id=produto]").val(desc);
										$("[data-panel=edit][data-id=C8_PROD]").val(cod);

										let filtMarcas = aDados.produtos.filter(function (el) { return el.B1_COD == cod })
										if (filtMarcas[0] != undefined) {
											$("[data-panel=edit][data-id=C8_QUANT]").val(filtMarcas[0].QTD);
											if (filtMarcas[0].FILHOS.length == 1) {
												$("[data-panel=edit][data-id=marca]").val(filtMarcas[0].FILHOS[0].ZPM_DESC);
												$("[data-panel=edit][data-id=C8_PRODUTO]").val(filtMarcas[0].FILHOS[0].B1_COD);
												$("[data-panel=edit][data-id=UM]").val(filtMarcas[0].UM);
												$("[data-panel=edit][data-id=C8_UM]").val(filtMarcas[0].UM);
											}
											else {
												$("[data-panel=edit][data-id=marca]").val("");
												$("[data-panel=edit][data-id=C8_PRODUTO]").val("");
												$("[data-panel=edit][data-id=UM]").val("");
												$("[data-panel=edit][data-id=C8_UM]").val("");
											}
										}



										tools.cotacao.modalSelecionaProduto.remove();

									})
								}
							})

						}
					})
				},
				um: function () {
					tools.cotacao["modalSelecionaUM"] = FLUIGC.modal({
						title: 'Selecionar Unidade Medida',
						content: `
						        <table class="table table-striped" id="modUM">
					        	<thead>
					        		<th>Código</th>
					        		<th>Descrição</th>
					        	</thead>
					        	<tbody>
					        		<td></td>
					        		<td></td>
					        	</tbody>
					        </table>
					        `,
						id: 'fluig-modalSelecionaUM'
					}, function (err, data) {
						//console.log(err, data)
						if (!err) {
							$("#modUM").DataTable({
								data: tools.cotacao.modal.options.UM["lista"],
								columns: [
									{ data: "id" },
									{ data: "desc" }
								],
								createdRow: function (row, data, dataIndex) {
									$(row).attr('data-cod', data.id);
									$(row).attr('data-desc', data.desc);
									$(row).on("click", function () {
										let cod = $(this).attr("data-cod");
										let desc = $(this).attr("data-desc");

										$("[data-panel=edit][data-id=UM]").val(desc);
										$("[data-panel=edit][data-id=C8_UM]").val(cod);

										tools.cotacao.modalSelecionaUM.remove();

									})
								}
							})
						}
					})
				},
				view: function () {
					switch ($(this).attr("btn-id")) {
						case "produto":
							tools.cotacao.modal.selects.produto()
							break;
						case "marca":
							tools.cotacao.modal.selects.marca()
							break;
						case "um":
							tools.cotacao.modal.selects.um()
							break;
						case "condicao":
							tools.cotacao.modal.selects.condicao()
							break;
					}
				}
			},
			options: {
				condicao: {
					carrega: function () {
						let ds = DatasetFactory.getDataset("DS_CONDICAO_PAGAMENTO", null, null, null)
						tools.cotacao.modal.options.condicao["lista"] = (ds.values != undefined && ds.values.length > 0) ? ds.values.map(function (it) { return { id: it.CODIGO, desc: it.DESCRICAO } }) : []
					}
				},
				UM: {
					carrega: function () {
						let ds = DatasetFactory.getDataset("ds_consulta_unidade_medida_produto", null, null, null)
						tools.cotacao.modal.options.UM["lista"] = (ds.values != undefined && ds.values.length > 0) ? ds.values.map(function (it) { return { id: it.AH_UNIMED, desc: it.AH_UMRES } }) : []
					}
				}
			}
		}
	},
	formata: {
		fluigToFloat: function (v) {
			v = v.indexOf(",") > -1 ? v.split(".").join("").split(",").join(".") : v;
			if (!isNaN(v) && v != "") {
				return parseFloat(v)
			} else {
				return 0
			}
		},
		mascara: {
			money: function (casas) {
				let v = this.value;
				v = v.replace(/\D/g, "");//Remove tudo o que não é dígito
				if (casas == undefined || isNaN(casas)) {
					v = !isNaN(v) && v != "" ? parseInt(v).toString() : "000";
					v = v.replace(/(\d)(\d{8})$/, "$1.$2");//coloca o ponto dos milhões
					v = v.replace(/(\d)(\d{5})$/, "$1.$2");//coloca o ponto dos milhares

					v = v.replace(/(\d)(\d{2})$/, "$1,$2");//coloca a virgula antes dos 2 últimos dígitos
				}
				else if (casas == 6) {
					v = !isNaN(v) && v != "" ? parseInt(v).toString() : "0000000";
					v = v.replace(/(\d)(\d{12})$/, "$1.$2");//coloca o ponto dos milhões
					v = v.replace(/(\d)(\d{9})$/, "$1.$2");//coloca o ponto dos milhares

					v = v.replace(/(\d)(\d{6})$/, "$1,$2");//coloca a virgula antes dos 6 últimos dígitos
				}
				else {
					if (!isNaN(v) && v != "") {
						v = parseInt(v).toString();
					} else {
						var t = "0";
						for (var i = 0; i < casas; i++) t += "0"
						v = t;
					}

					v = v.replace("/(\d)(\d{" + (6 + casas) + "})$/", "$1.$2");//coloca o ponto dos milhões
					v = v.replace("/(\d)(\d{" + (3 + casas) + "})$/", "$1.$2");//coloca o ponto dos milhares

					v = v.replace("/(\d)(\d{" + casas + "})$/", "$1,$2");//coloca a virgula antes dos 2 últimos dígitos
				}

				this.value = v;
			},
			phone: function () {
				let v = this.value
				v = v.replace(/\D/g, '')
				v = v.replace(/(\d{2})(\d)/, "($1) $2")
				v = v.replace(/(\d)(\d{4})$/, "$1-$2")
				this.value = v;
			}
		},
		toFloat: function (old) {
			let newValue = 0;
			if (old != "") {
				if (isNaN(old)) {
					if (old.indexOf(",") > -1) {
						newValue = old.split(".").join("").split(",").join(".");
					}
				} else {
					newValue = old;
				}
			}

			return parseFloat(newValue);
		},
		floatToMoney: function (v, casas) {
			if (casas == undefined) {
				v = v != undefined && !isNaN(v) ? parseFloat(v).toFixed(2) : "000";
				v = v.replace(/\D/g, "");//Remove tudo o que não é dígito
				v = v.replace(/(\d)(\d{8})$/, "$1.$2");//coloca o ponto dos milhões
				v = v.replace(/(\d)(\d{5})$/, "$1.$2");//coloca o ponto dos milhares

				v = v.replace(/(\d)(\d{2})$/, "$1,$2");//coloca a virgula antes dos 2 últimos dígitos
			} else {
				if (!isNaN(v) && v != "") {
					v = parseInt(v).toString();
				} else {
					var t = "0";
					for (var i = 0; i < casas; i++) t += "0"
					v = t;
				}

				v = v.replace("/(\d)(\d{" + (6 + casas) + "})$/", "$1.$2");//coloca o ponto dos milhões
				v = v.replace("/(\d)(\d{" + (3 + casas) + "})$/", "$1.$2");//coloca o ponto dos milhares

				v = v.replace("/(\d)(\d{" + casas + "})$/", "$1,$2");//coloca a virgula antes dos 2 últimos dígitos
			}

			return v;
		},
		floatToMoney6: function (v) {
			v = v != undefined && !isNaN(v) ? parseFloat(v).toFixed(6) : "0000000";
			v = v.replace(/\D/g, "");//Remove tudo o que não é dígito
			v = v.replace(/(\d)(\d{12})$/, "$1.$2");//coloca o ponto dos milhões
			v = v.replace(/(\d)(\d{9})$/, "$1.$2");//coloca o ponto dos milhares

			v = v.replace(/(\d)(\d{6})$/, "$1,$2");//coloca a virgula antes dos 2 últimos dígitos

			return v;
		}
	},
	fornecedores: {
		add: function () {
			if ($("[name=tipoSc]:checked,[name=_tipoSc]:checked").val() == "5") {
				if ($("[name^=A2_LOJA___],[name^=_A2_LOJA___]").length > 0) {
					FLUIGC.toast({
						message: 'Para o tipo de solicitação Regularização é permitido incluir apenas 1 fornecedor!',
						timeout: 3000,
						type: 'danger'
					});
					return;
				}
			}
			let idx = wdkAddChild("tabFornecedor");
			tools.fornecedores.habilitaAcoes();
		},
		carregaDados: function () {
			aDados["fornecedores"] = $("[name^=A2_COD___].form-control,[name^=_A2_COD___].form-control").toArray().map(function (file) {
				return {
					"A2_COD": $(file).closest("tr").find("[name*='" + "A2_COD" + "___']").val(),
					"A2_LOJA": $(file).closest("tr").find("[name*='" + "A2_LOJA" + "___']").val(),
					"A2_NOME": $(file).closest("tr").find("[name*='" + "A2_NOME" + "___']").val(),
					"A2_CGC": $(file).closest("tr").find("[name*='" + "A2_CGC" + "___']").val(),
					"A2_COND": $(file).closest("tr").find("[name*='" + "A2_COND" + "___']").val(),
					"A2_EST": $(file).closest("tr").find("[name*='" + "A2_EST" + "___']").val(),
					"A2_TPFRETE": $(file).closest("tr").find("[name*='" + "A2_TPFRETE" + "___']").val(),
					"A2_VALFRE": $(file).closest("tr").find("[name*='" + "A2_VALFRE" + "___']").val(),
					"ATIVO": $(file).closest("tr").find("[name*='" + "CICLO_REMOVIDO" + "___']").val() == "",
					"CICLO_REMOV": $(file).closest("tr").find("[name*='" + "CICLO_REMOVIDO" + "___']").val(),
					"VALIDACAO_NECESSARIA": $(file).closest("tr").find("[name*='" + "VALIDACAO_NECESSARIA" + "___']").val(),
					"VALIDACAO_DECISAO": $(file).closest("tr").find("[name*='" + "VALIDACAO_DECISAO" + "___']").val(),
					"VALIDACAO_OBS": $(file).closest("tr").find("[name*='" + "VALIDACAO_OBS" + "___']").val(),
				}
			});

			aDados["fornecedoresAtivo"] = aDados["fornecedores"].filter(function (el) { return el.ATIVO })
		},
		cotacaoCiclo: function (el) {
			let A2_COD = $(el).closest("tr").find("[name^=A2_COD___],[name^=_A2_COD___]").val();
			let A2_LOJA = $(el).closest("tr").find("[name^=A2_LOJA___],[name^=_A2_LOJA___]").val();
			let ciclo_atual = $("#ciclo_atual").val();

			let filt = aDados.cotacoes.filter(function (c) { return c.C8_CICLO == ciclo_atual && c.C8_FORNECE == A2_COD && c.C8_LOJA == A2_LOJA });

			return filt.length > 0;
		},
		excluiFornecedor: function (ev) {

			let idx = $(this).closest("tr").find("[name^=A2_COD___],[name^=_A2_COD___]").attr("id").split("___")[1];
			let A2_COD = $(this).closest("tr").find("[name^=A2_COD___],[name^=_A2_COD___]").val();
			let A2_LOJA = $(this).closest("tr").find("[name^=A2_LOJA___],[name^=_A2_LOJA___]").val();
			let A2_CGC = $(this).closest("tr").find("[name^=A2_CGC___],[name^=_A2_CGC___]").val();
			let A2_NOME = $(this).closest("tr").find("[name^=A2_NOME___],[name^=_A2_NOME___]").val();
			let A2_EST = $(this).closest("tr").find("[name^=A2_EST___],[name^=_A2_EST___]").val();

			if (aDados.dsCotacoes == undefined || aDados.dsCotacoes.filter(function (el) { return el.C8_FORNECE == A2_COD && el.C8_LOJA == A2_LOJA }).length == 0 || A2_COD.length == 0) { //Não foi gerado itens na cotação
				fnWdkRemoveChild($(this).closest("tr").find("[name^=A2_LOJA___],[name^=_A2_LOJA___]").get(0))
				fnWdkRemoveChild($(this));

				tools.fornecedores.carregaDados();
				tools.cotacao.carregaDados(aDados.dsCotacoes);
			} else {

				let html = "\
 	 				<div class=\"row\">\
 		 				<div class=\"form-group col-md-2\">\
 		 					<label>Código</label>\
 		 					<input type=\"hidden\" id=\"idxExcluir\" value=\""+ idx + "\">\
 		 					<input class=\"form-control\" id=\"A2_COD_EXCLUI\" value=\""+ A2_COD + "\" readonly>\
 		 				</div>\
 		 				<div class=\"form-group col-md-1\">\
 		 					<label>Loja</label>\
 		 					<input class=\"form-control\" id=\"A2_LOJA_EXCLUI\" value=\""+ A2_LOJA + "\" readonly>\
 		 				</div>\
 		 				<div class=\"form-group col-md-3\">\
 							<label>CNPJ/CPF</label>\
 							<input class=\"form-control\" id=\"A2_CGC_EXCLUI\" value=\""+ A2_CGC + "\" readonly>\
 						</div>\
 						<div class=\"form-group col-md-5\">\
 		 					<label>Nome</label>\
 		 					<input class=\"form-control\" id=\"A2_NOME_EXCLUI\" value=\""+ A2_NOME + "\" readonly>\
 		 				</div>\
 		 				<div class=\"form-group col-md-1\">\
 		 					<label>UF</label>\
 		 					<input class=\"form-control\" id=\"A2_EST_EXCLUI\" value=\""+ A2_EST + "\" readonly>\
 		 				</div>\
 					</div>\
 	 				<div class=\"row\">\
 		 				<div class=\"form-group col-md-12\">\
 		 					<label>Justificativa</label>\
 		 					<textarea class=\"form-control\" rows=\"3\" id=\"JUSTIFICATIVA_EXCLUI\"></textarea>\
 		 				</div>\
 	 				</div>"

				tools.fornecedores["modalConfirm"] = FLUIGC.modal({
					title: 'Confirmar exclusão do Fornecedor',
					content: html,
					size: 'full',
					id: 'fluig-confirma',
					actions: [{
						'label': 'Confirmar',
						'bind': 'data-confirm-modal',
					}, {
						'label': 'Cancelar',
						'autoClose': true
					}]
				}, function (err, data) {
					//console.log(err, data)
					if (!err) {
						$("[data-confirm-modal]").off("click").on("click", function (ev) {
							ev.stopPropagation()
							let problems = "";
							if ($("#JUSTIFICATIVA_EXCLUI").val() == "") problems += "O campo Justificativa é obrigatório <br>";
							if (problems != "") {
								FLUIGC.modal({
									title: 'Campos obrigatórios',
									content: problems,
									id: 'fluig-problem',
									actions: [{
										'label': 'OK',
										'autoClose': true
									}]
								})
								return;
							} else {

								if (tools.fornecedores.temCotacao(A2_COD, A2_LOJA)) {
									FLUIGC.message.confirm({
										message: 'Existem cotações inseridas para este fornecedor que serão excluidas, Confirma?',
										labelYes: 'Confirmar',
										labelNo: 'Cancelar'
									}, function (result, el, ev) {
										if (result) {
											let idxExcluir = tools.fornecedores.identificaIdx(A2_COD, A2_LOJA)
											$("#CICLO_REMOVIDO___" + idxExcluir + ",#_CICLO_REMOVIDO___" + idxExcluir).val($("#ciclo_atual").val() != "" ? $("#ciclo_atual").val() : "1");
											$("#MOTIVO_REMOCAO___" + idxExcluir + ",#_MOTIVO_REMOCAO___" + idxExcluir).val($("#JUSTIFICATIVA_EXCLUI").val());
											$("#COMPRADOR_REMOCAO___" + idxExcluir + ",#_COMPRADOR_REMOCAO___" + idxExcluir).val(usuarioAtual);

											tools.fornecedores.carregaDados();
											tools.fornecedores.habilitaAcoes();
											tools.cotacao.carregaDados(aDados.dsCotacoes);
											//tools.mapa.carregaBase();
											tools.mapaCompradores.exibe();
											tools.fornecedores.modalConfirm.remove();
										}
									});
								}
								else {
									let idxExcluir = tools.fornecedores.identificaIdx(A2_COD, A2_LOJA)
									$("#CICLO_REMOVIDO___" + idxExcluir + ",#_CICLO_REMOVIDO___" + idxExcluir).val($("#ciclo_atual").val() != "" ? $("#ciclo_atual").val() : "1");
									$("#MOTIVO_REMOCAO___" + idxExcluir + ",#_MOTIVO_REMOCAO___" + idxExcluir).val($("#JUSTIFICATIVA_EXCLUI").val());
									$("#COMPRADOR_REMOCAO___" + idxExcluir + ",#_COMPRADOR_REMOCAO___" + idxExcluir).val(usuarioAtual);
								}

								tools.fornecedores.carregaDados();
								tools.fornecedores.habilitaAcoes();
								tools.cotacao.carregaDados(aDados.dsCotacoes);
								//tools.mapa.carregaBase();
								tools.mapaCompradores.exibe();
								tools.fornecedores.modalConfirm.remove();
							}
						})
					} else {
						// do something with data
					}
				})
			}

		},
		excluiFornecedorCancela: function (ev) {
			//console.log(ev,this)

			let idx = $(this).closest("tr").find("[name^=A2_COD___],[name^=_A2_COD___]").attr("id").split("___")[1];
			let A2_COD = $(this).closest("tr").find("[name^=A2_COD___],[name^=_A2_COD___]").val();
			let A2_LOJA = $(this).closest("tr").find("[name^=A2_LOJA___],[name^=_A2_LOJA___]").val();
			let A2_CGC = $(this).closest("tr").find("[name^=A2_CGC___],[name^=_A2_CGC___]").val();
			let A2_NOME = $(this).closest("tr").find("[name^=A2_NOME___],[name^=_A2_NOME___]").val();
			let A2_EST = $(this).closest("tr").find("[name^=A2_EST___],[name^=_A2_EST___]").val();
			let MOTIVO_REMOCAO = $(this).closest("tr").find("[name^=MOTIVO_REMOCAO___],[name^=_MOTIVO_REMOCAO___]").val();
			let COMPRADOR_REMOCAO = $(this).closest("tr").find("[name^=COMPRADOR_REMOCAO___],[name^=_COMPRADOR_REMOCAO___]").val();

			let html = "\
 	 				<div class=\"row\">\
 		 				<div class=\"form-group col-md-2\">\
 		 					<label>Código</label>\
 		 					<input type=\"hidden\" id=\"idxExcluir\" value=\""+ idx + "\">\
 		 					<input class=\"form-control\" id=\"A2_COD_EXCLUI\" value=\""+ A2_COD + "\" readonly>\
 		 				</div>\
 		 				<div class=\"form-group col-md-1\">\
 		 					<label>Loja</label>\
 		 					<input class=\"form-control\" id=\"A2_LOJA_EXCLUI\" value=\""+ A2_LOJA + "\" readonly>\
 		 				</div>\
 		 				<div class=\"form-group col-md-3\">\
 							<label>CNPJ/CPF</label>\
 							<input class=\"form-control\" id=\"A2_CGC_EXCLUI\" value=\""+ A2_CGC + "\" readonly>\
 						</div>\
 						<div class=\"form-group col-md-5\">\
 		 					<label>Nome</label>\
 		 					<input class=\"form-control\" id=\"A2_NOME_EXCLUI\" value=\""+ A2_NOME + "\" readonly>\
 		 				</div>\
 		 				<div class=\"form-group col-md-1\">\
 		 					<label>UF</label>\
 		 					<input class=\"form-control\" id=\"A2_EST_EXCLUI\" value=\""+ A2_EST + "\" readonly>\
 		 				</div>\
 					</div>\
 	 				<div class=\"row\">\
 	 					<div class=\"form-group col-md-12\">\
 	 						<label>Comprador</label>\
 	 						<input class=\"form-control\" id=\"COMPRADOR_REMOCAO\" value=\""+ COMPRADOR_REMOCAO + "\" readonly>\
 	 					</div>\
 	 				</div>\
 	 				<div class=\"row\">\
 		 				<div class=\"form-group col-md-12\">\
 		 					<label>Justificativa</label>\
 		 					<textarea class=\"form-control\" rows=\"3\" id=\"JUSTIFICATIVA_EXCLUI\" readonly>"+ MOTIVO_REMOCAO + "</textarea>\
 		 				</div>\
 	 				</div>"

			tools.fornecedores["modalConfirm"] = FLUIGC.modal({
				title: 'Cancelar exclusão do Fornecedor',
				content: html,
				size: 'full',
				id: 'fluig-confirma',
				actions: [{
					'label': 'Cancelar exclusão',
					'bind': 'data-confirm-modal',
				}, {
					'label': 'Fechar',
					'autoClose': true
				}]
			}, function (err, data) {
				if (!err) {
					$("[data-confirm-modal]").off("click").on("click", function (ev) {
						ev.stopPropagation()

						$("#CICLO_REMOVIDO___" + $("#idxExcluir").val() + ",#_CICLO_REMOVIDO___" + $("#idxExcluir").val()).val("");
						$("#MOTIVO_REMOCAO___" + $("#idxExcluir").val() + ",#_MOTIVO_REMOCAO___" + $("#idxExcluir").val()).val("");
						$("#COMPRADOR_REMOCAO___" + $("#idxExcluir").val() + ",#_COMPRADOR_REMOCAO___" + $("#idxExcluir").val()).val("");

						tools.fornecedores.carregaDados();
						tools.cotacao.carregaDados(aDados.dsCotacoes);
						tools.mapaCompradores.exibe();

						tools.fornecedores.habilitaAcoes();
						tools.fornecedores.modalConfirm.remove();

					})
				} else {
					// do something with data
				}
			})

		},
		excluiFornecedorConsultar: function (ev) {
			let idx = $(this).closest("tr").find("[name^=A2_COD___],[name^=_A2_COD___]").attr("id").split("___")[1];
			let A2_COD = $(this).closest("tr").find("[name^=A2_COD___],[name^=_A2_COD___]").val();
			let A2_LOJA = $(this).closest("tr").find("[name^=A2_LOJA___],[name^=_A2_LOJA___]").val();
			let A2_CGC = $(this).closest("tr").find("[name^=A2_CGC___],[name^=_A2_CGC___]").val();
			let A2_NOME = $(this).closest("tr").find("[name^=A2_NOME___],[name^=_A2_NOME___]").val();
			let A2_EST = $(this).closest("tr").find("[name^=A2_EST___],[name^=_A2_EST___]").val();
			let MOTIVO_REMOCAO = $(this).closest("tr").find("[name^=MOTIVO_REMOCAO___],[name^=_MOTIVO_REMOCAO___]").val();
			let COMPRADOR_REMOCAO = $(this).closest("tr").find("[name^=COMPRADOR_REMOCAO___],[name^=_COMPRADOR_REMOCAO___]").val();
			let CICLO_REMOCAO = $(this).closest("tr").find("[name^=CICLO_REMOVIDO___],[name^=_CICLO_REMOVIDO___]").val();

			let html = "\
	 				<div class=\"row\">\
		 				<div class=\"form-group col-md-2\">\
		 					<label>Código</label>\
		 					<input type=\"hidden\" id=\"idxExcluir\" value=\""+ idx + "\">\
		 					<input class=\"form-control\" id=\"A2_COD_EXCLUI\" value=\""+ A2_COD + "\" readonly>\
		 				</div>\
		 				<div class=\"form-group col-md-1\">\
		 					<label>Loja</label>\
		 					<input class=\"form-control\" id=\"A2_LOJA_EXCLUI\" value=\""+ A2_LOJA + "\" readonly>\
		 				</div>\
		 				<div class=\"form-group col-md-3\">\
							<label>CNPJ/CPF</label>\
							<input class=\"form-control\" id=\"A2_CGC_EXCLUI\" value=\""+ A2_CGC + "\" readonly>\
						</div>\
						<div class=\"form-group col-md-5\">\
		 					<label>Nome</label>\
		 					<input class=\"form-control\" id=\"A2_NOME_EXCLUI\" value=\""+ A2_NOME + "\" readonly>\
		 				</div>\
		 				<div class=\"form-group col-md-1\">\
		 					<label>UF</label>\
		 					<input class=\"form-control\" id=\"A2_EST_EXCLUI\" value=\""+ A2_EST + "\" readonly>\
		 				</div>\
					</div>\
	 				<div class=\"row\">\
	 					<div class=\"form-group col-md-2\">\
	 						<label>Ciclo</label>\
	 						<input class=\"form-control\" id=\"CICLO_REMOCAO\" value=\""+ CICLO_REMOCAO + "\" readonly>\
	 					</div>\
	 					<div class=\"form-group col-md-10\">\
	 						<label>Comprador</label>\
	 						<input class=\"form-control\" id=\"COMPRADOR_REMOCAO\" value=\""+ COMPRADOR_REMOCAO + "\" readonly>\
	 					</div>\
	 				</div>\
	 				<div class=\"row\">\
		 				<div class=\"form-group col-md-12\">\
		 					<label>Justificativa</label>\
		 					<textarea class=\"form-control\" rows=\"3\" id=\"JUSTIFICATIVA_EXCLUI\" readonly>"+ MOTIVO_REMOCAO + "</textarea>\
		 				</div>\
	 				</div>"

			tools.fornecedores["modalConfirm"] = FLUIGC.modal({
				title: 'Consulta exclusão do Fornecedor',
				content: html,
				size: 'full',
				id: 'fluig-confirma',
				actions: [{
					'label': 'Fechar',
					'autoClose': true
				}]
			})
		},
		habilitaAcoes: function (idx) {

			if ([26, 65, 21, 163, 76, 80, 105, 148].includes(WKNumState)) {
				$(".analisa-cotacao").show();
				$("[btn-excluir],[btn-cancelarexclusao],[btn-excluido]").hide();

				let ciclo_atual = $("#ciclo_atual").val();
				$("[btn-excluir]").each(function (idx, el) {
					if ($(el).closest("tr").find("[name^=CICLO_REMOVIDO___][value=''],[name^=_CICLO_REMOVIDO___][value='']").length > 0) {
						$(el).show();
						$(el).off("click").on("click", tools.fornecedores.excluiFornecedor);
					}
				})
				$("[btn-cancelarexclusao]").each(function (idx, el) {
					if (tools.fornecedores.cotacaoCiclo(el)) {
						if ($(el).closest("tr").find("[name^=CICLO_REMOVIDO___][value='" + ciclo_atual + "'],[name^=_CICLO_REMOVIDO___][value='" + ciclo_atual + "']").length > 0 && $(el).closest("tr").find("[name^=CICLO_REMOVIDO___],[name^=_CICLO_REMOVIDO___]").not("[value='']").length > 0) {
							$(el).show();
							$(el).off("click").on("click", tools.fornecedores.excluiFornecedorCancela);
						}
					}

				})
				$("[btn-excluido]").each(function (idx, el) {
					if (!tools.fornecedores.cotacaoCiclo(el)) {
						if ($(el).closest("tr").find("[name^=CICLO_REMOVIDO___],[name^=_CICLO_REMOVIDO___]").not("[value='']").length) {
							$(el).show();
							$(el).off("click").on("click", tools.fornecedores.excluiFornecedorConsultar);
						}
					}
				})
			}

		},
		habilitaAdicionar: function () {
			if ([65, 26, 21, 163, 76, 80, 105, 148].indexOf(WKNumState) > -1) {
				$("#btnAddFornecedor").off("click").on("click", tools.fornecedores.add);
			}
			else {
				$("#btnAddFornecedor").hide();
			}
		},
		identificaIdx: function (A2_COD, A2_LOJA) {
			return $("[name^=A2_COD___].form-control[value='" + A2_COD + "'],[name^=_A2_COD___].form-control[value='" + A2_COD + "']").closest("tr").find("[name*=A2_LOJA___][value='" + A2_LOJA + "']").attr("id").split("___")[1]
		},
		temCotacao(A2_COD, A2_LOJA) {
			let filtFornec = aDados.fornecedores.filter(function (el) { return el.A2_COD == A2_COD && el.A2_LOJA == A2_LOJA })

			if (filtFornec.length > 0) {
				return filtFornec[0].cotacoes != null && filtFornec[0].cotacoes.length > 0;
			}

			return false

			//return aDados.dsCotacoes.filter(function(el){return el.C8_FORNECE == A2_COD && el.C8_LOJA == A2_LOJA}).length > 0
		},
		validaDuplicidade: function (index, valor) {
			let retorno = true;
			$("[name^=A2_CGC___]").not("#A2_CGC___" + index + ",#_A2_CGC___" + index).each(function (idx, el) {
				if (el.value == valor) retorno = false;
			})
			return retorno;
		}
	},
	mapa: {
		atualizaComplemento: function () {
			let filtrar = $("[name=filtrar_mapa]:checked").val();
			$("#complem_mapa").empty()

			if (filtrar == "fornecedor") {
				$("#complem_mapa").append($("<option>", {
					value: "",
					text: "Selecione"
				}))

				aDados.fornecedores.forEach(function (el) {
					$("#complem_mapa").append($("<option>", {
						value: el.A2_COD + "|" + el.A2_LOJA,
						text: el.A2_NOME
					}))
				})

				$("#complem_mapa").closest(".form-group").show();
				$("[btn-filtrar]").show();

			}
			else if (filtrar == "produto") {
				$("#complem_mapa").empty()
				$("#complem_mapa").append($("<option>", {
					value: "",
					text: "Selecione"
				}))
				aDados.produtos.forEach(function (el) {
					$("#complem_mapa").append($("<option>", {
						value: el.B1_COD,
						text: el.B1_DESC
					}))
				})

				$("#complem_mapa").closest(".form-group").show();
				$("[btn-filtrar]").show();
			}
			else {
				$("#complem_mapa").closest(".form-group").hide();
				$("[btn-filtrar]").hide();
			}

		},
		atualizaCiclo: function () {
			var ciclo_atual = $("#ciclo_atual,#_ciclo_atual").val();
			$("#ciclo_mapa").empty()

			if (usuarioCompras) {
				$("[name^=cotacao_ciclo___]").toArray().forEach(function (el) {
					$("#ciclo_mapa").append($("<option>", {
						value: el.value,
						text: "Ciclo " + el.value
					}))
				})
			} else {
				$("#ciclo_mapa").append($("<option>", {
					value: ciclo_atual,
					text: "Ciclo " + ciclo_atual
				}))
			}

			$("#ciclo_mapa").val(ciclo_atual).trigger('change');
			$("#ciclo_mapa").prop('disabled', !usuarioCompras)
		},
		carregaBase: function () {
			aDados.condPagto = DatasetFactory.getDataset("DS_CONDICAO_PAGAMENTO", null, null, null).values;
			let filhos = []

			tools.produtos.carrega();
			tools.fornecedores.carregaDados();
			//tools.cotacao.carregaDados();

		},
		carregaMapa: function (item) {
			//tools.cotacao.carregaDados();
			//let filtrar = $("[name=filtrar_mapa]:checked").val();
			let filtrar = item != undefined ? item.tipoFiltro == undefined ? ($(this).attr("btn-prod") != undefined ? "produto" : "") : item.tipoFiltro : "produto";
			let complemento = $("#complem_mapa").val();
			if (filtrar == "fornecedor") {
				let A2_COD = complemento.split("|")[0];
				let A2_LOJA = complemento.split("|")[1];
				let mapa = aDados.fornecedores.filter(function (el) { return complemento == "" || (el.A2_COD == A2_COD && el.A2_LOJA == A2_LOJA) })
				if (mapa.length > 0) {
					let temp = $("#tmpl1").html();
					let html = Mustache.render(temp, mapa);
					//$("#tabMapa").html(html);
					if ([26, 76, 80, 105, 148].includes(WKNumState)) $("[data-vencedor]").on("click", tools.mapa.setaVencedor);
				}

				return
			}
			else if (filtrar == "produto") {
				let complemento = item != undefined ? item.complementoFiltro == undefined ? $(this).attr("data-cod") : item.complementoFiltro.substring(0, 8) : $(this).attr("data-cod");
				let mapa = aDados.produtos.filter(function (el) { return complemento == "" || el.B1_COD.trim() == complemento })
				if (mapa.length > 0) {
					mapa[0].cotacoes = mapa[0].cotacoes.filter(function (c) {
						return aDados.fornecedoresAtivo.filter(function (f) { return f.A2_COD == c.C8_FORNECE && f.A2_LOJA == c.C8_LOJA }).length > 0
					})
					mapa[0].cotacoes.forEach(function (cotacao) {
						cotacao["TOTAL_GERAL"] = tools.formata.toFloat(cotacao.C8_TOTAL) + tools.formata.toFloat(cotacao.C8_DIFAL) + tools.formata.toFloat(cotacao.C8_VALIPI) + tools.formata.toFloat(cotacao.C8_VALISS) + tools.formata.toFloat(cotacao.C8_VALSOL)
						cotacao.C8_TOTAL = tools.formata.floatToMoney(tools.formata.toFloat(cotacao.C8_TOTAL));
						cotacao.C8_PRECO = tools.formata.floatToMoney(tools.formata.toFloat(cotacao.C8_PRECO));
						cotacao.C8_DIFAL = tools.formata.floatToMoney(tools.formata.toFloat(cotacao.C8_DIFAL));
						cotacao.C8_VALICM = tools.formata.floatToMoney(tools.formata.toFloat(cotacao.C8_VALICM));
						cotacao.C8_VALIPI = tools.formata.floatToMoney(tools.formata.toFloat(cotacao.C8_VALIPI));
						cotacao.C8_VALISS = tools.formata.floatToMoney(tools.formata.toFloat(cotacao.C8_VALISS));
						cotacao.C8_VALSOL = tools.formata.floatToMoney(tools.formata.toFloat(cotacao.C8_VALSOL));
						cotacao.TOTAL_GERAL = tools.formata.floatToMoney(tools.formata.toFloat(cotacao.TOTAL_GERAL));
					})
					let temp = $("#tmpl2").html();
					let html = Mustache.render(temp, mapa);
					if (tools.mapa["modalMapaProduto"] != undefined) tools.mapa["modalMapaProduto"].remove()
					tools.mapa["modalMapaProduto"] = FLUIGC.modal({
						title: 'Detalhe produto',
						content: html,
						size: 'full',
						id: 'fluig-mapaProduto'
					}, function (err, data) {
						if (!err) {
							if ([26, 76, 80, 105, 148].includes(WKNumState)) $("[data-vencedor]").on("click", tools.mapa.setaVencedor);
							//tools.mapaCompradores.exibe();
						}
						else {
							//tools.mapaCompradores.exibe();
						}

					})
					//$("#tabMapa").html(html);

				}
				return
			}
			//$("#tabMapa").html("");

		},
		carregaMapaOutros: function () {
			tools.mapa.carregaBase();
			let ciclo_atual = $("#ciclo_atual,#_ciclo_atual").val();
			let idEmpresa = $("#idEmpresa,#_idEmpresa").val();
			let C8_NUM = $("#C8_NUM,#_C8_NUM").val();

			let cot = DatasetFactory.getDataset(
				"DS_CONSULTA_COTACOES",
				null,
				[
					DatasetFactory.createConstraint("idEmpresa", idEmpresa, idEmpresa, ConstraintType.MUST),
					DatasetFactory.createConstraint("C8_NUM", C8_NUM, C8_NUM, ConstraintType.MUST),
					DatasetFactory.createConstraint("C8_CICLO", ciclo_atual, ciclo_atual, ConstraintType.MUST),
					DatasetFactory.createConstraint("VENCEDOR_COMPRADOR", "true", "true", ConstraintType.MUST)
				],
				null
			).values
				.map(function (el) {
					let fornec = aDados.fornecedores.filter(function (f) { return f.A2_COD == el.C8_FORNECE.trim() });
					let C8_PRODUTO = el.C8_PRODUTO.trim();
					let produto = aDados.produtos.filter(function (p) { return p.B1_COD == C8_PRODUTO.substring(0, 8) });
					let fMarca = produto.length > 0 ? produto[0].FILHOS.filter(function (pF) { return pF.B1_COD == C8_PRODUTO }) : produto;
					let marca = fMarca.length > 0 ? fMarca[0]["ZPM_DESC"] : "";
					let QTD_COMPRADOR = el.QTD_COMPRADOR;
					let C8_PRECO = tools.formata.fluigToFloat(el.C8_PRECO) * QTD_COMPRADOR;
					let C8_VALIPI = tools.formata.fluigToFloat(el.C8_VALIPI);
					let C8_VALISS = tools.formata.fluigToFloat(el.C8_VALISS);
					let C8_VALICM = tools.formata.fluigToFloat(el.C8_VALICM);
					let C8_DIFAL = tools.formata.fluigToFloat(el.C8_DIFAL);
					let C8_VALSOL = tools.formata.fluigToFloat(el.C8_VALSOL);
					return {
						"C8_CICLO": ciclo_atual,
						"QTD_COMPRADOR": QTD_COMPRADOR,
						"C8_PRODUTO": C8_PRODUTO.substring(0, 8),
						"MARCA": marca,
						"C8_FORNECE": el.C8_FORNECE,
						"FORNECEDOR": (fornec.length > 0 ? fornec[0]["A2_NOME"] : ""),
						"C8_LOJA": el.C8_LOJA,
						"C8_PRECO": C8_PRECO,
						"C8_VALIPI": C8_VALIPI,
						"C8_VALISS": C8_VALISS,
						"C8_VALICM": C8_VALICM,
						"C8_DIFAL": C8_DIFAL,
						"C8_VALSOL": C8_VALSOL,
						"C8_IMPOSTOS": C8_VALIPI + C8_VALSOL + C8_DIFAL,
						"C8_TOTAL": tools.formata.floatToMoney(C8_PRECO + C8_VALIPI + C8_VALSOL + C8_DIFAL),
					}
				}).sort(function (a, b) { return a.FORNECEDOR - b.FORNECEDOR })

			let obj = {
				totalOrcado: 0,
				totalPedido: 0
			}

			let mapa = aDados.produtos.map(function (prd) {
				prd["vlOrcado"] = tools.formata.toFloat(prd.vlUnit) * parseInt(prd.QTD);
				prd["cotacoes"] = cot.filter(function (c) { return c.C8_PRODUTO == prd.B1_COD });
				prd["vlPedido"] = 0;
				prd["qtdPedido"] = 0;
				prd["cotacoes"].forEach(function (c) {
					prd["vlPedido"] += tools.formata.toFloat(c.C8_TOTAL);
					prd["qtdPedido"] += parseInt(c.QTD_COMPRADOR);
				})
				obj.totalOrcado += prd["vlOrcado"];
				obj.totalPedido += prd["vlPedido"];
				prd["vlOrcado"] = tools.formata.floatToMoney(prd["vlOrcado"]);
				prd["vlPedido"] = tools.formata.floatToMoney(prd["vlPedido"]);
				return prd;
			})

			if (mapa.length > 0) {
				obj["produtos"] = mapa;
				obj["totalOrcado"] = tools.formata.floatToMoney(obj["totalOrcado"]);
				obj["totalPedido"] = tools.formata.floatToMoney(obj["totalPedido"]);
				obj["percDiferenca"] = tools.formata.floatToMoney((tools.formata.fluigToFloat(obj["totalPedido"]) - tools.formata.fluigToFloat(obj["totalOrcado"])) / tools.formata.fluigToFloat(obj["totalOrcado"]) * 100);

				let temp = $("#tmpl9").html();
				let html = Mustache.render(temp, obj);
				$("#tabMapa").html(html);
			}
		},
		init: function () {
			if (![0, 1, 2, 3, 65, 134, 163, 88, 21, 163].includes(WKNumState)) {
				tools.mapa.atualizaCiclo();
				if (!usuarioCompras) tools.mapa.carregaMapaOutros();
				$("[name=filtrar_mapa]").on("change", tools.mapa.atualizaComplemento);
				$("[btn-filtrar]").on("click", tools.mapa.carregaMapa);
				tools.mapa.atualizaComplemento();
			}
		},
		setaVencedor: function () {
			let fornecedor = $(this).attr("fornecedor");
			let loja = $(this).attr("loja");
			let produto = $(this).attr("produto");
			let ciclo_mapa = $("#ciclo_mapa").val()

			let dataFiltered = aDados.cotacoes.filter(function (el) { return el.C8_CICLO == ciclo_mapa && el.C8_FORNECE == fornecedor && el.C8_LOJA == loja && el.C8_PRODUTO.substring(0, 8) == produto })

			if (dataFiltered.length > 0) {
				let temp = $("#tmpl3").html();
				let html = Mustache.render(temp, dataFiltered[0]);
				tools.mapa["modalConfirm"] = FLUIGC.modal({
					title: 'Confirmar vencedor',
					content: html,
					size: 'full',
					id: 'fluig-confirma',
					actions: [{
						'label': 'Confirmar',
						'bind': 'data-confirm-modal',
					}, {
						'label': 'Cancelar',
						'autoClose': true
					}]
				}, function (err, data) {
					//console.log(err, data)
					if (!err) {
						let solicitado = aDados.produtos.filter(function (el) { return el.B1_COD == produto.substring(0, 8) });
						let vencedores_comp = aDados.cotacoes.filter(function (el) { return el.C8_CICLO == ciclo_mapa && el.C8_PRODUTO.substring(0, 8) == produto.substring(0, 8) && el.VENCEDOR_COMP && el.C8_FORNECE != fornecedor });
						let C8_QUANT = parseInt(dataFiltered[0]["C8_QUANT"])

						let qtdSolic = parseInt(solicitado[0]["QTD"])
						let qtdVenc = 0;
						vencedores_comp.forEach(function (el) {
							qtdVenc += parseInt(el.QTD_COMPRADOR != "" ? el.QTD_COMPRADOR : 0)
						})

						let confirm_qtd = qtdSolic - qtdVenc;
						$("#confirm_qtd").val(confirm_qtd <= C8_QUANT ? confirm_qtd : C8_QUANT);

						$("[data-confirm-modal]").on("click", function (ev) {
							ev.stopPropagation();
							aDados["loading"] = FLUIGC.loading(window);
							aDados.loading.show();
							setTimeout(() => {
								let problems = "";
								if ($("#confirm_qtd").val() == "") problems += "O campo Quantidade é obrigatório <br>";
								if ($("#confirm_justificativa").val() == "" && $("#confirm_vencedor").val() != "true" && $("#confirm_qtd").val() != "0") problems += "O campo Justificativa é obrigatório <br>";
								if (problems != "") {
									FLUIGC.modal({
										title: 'Campos obrigatórios',
										content: problems,
										id: 'fluig-problem',
										actions: [{
											'label': 'OK',
											'autoClose': true
										}]
									})
									aDados.loading.hide();
									return;
								} else {
									let solicitado = aDados.produtos.filter(function (el) { return el.B1_COD == produto.substring(0, 8) });
									let vencedores = aDados.cotacoes.filter(function (el) { return el.C8_CICLO == ciclo_mapa && el.C8_PRODUTO.substring(0, 8) == produto.substring(0, 8) && el.VENCEDOR });
									let vencedores_comp = aDados.cotacoes.filter(function (el) { return el.C8_CICLO == ciclo_mapa && el.C8_PRODUTO.substring(0, 8) == produto.substring(0, 8) && el.VENCEDOR_COMP && el.C8_FORNECE != fornecedor });

									let qtdSolic = parseInt(solicitado[0]["QTD"])
									let qtdVenc = 0;
									vencedores_comp.forEach(function (el) {
										qtdVenc += parseInt(el.QTD_COMPRADOR != "" && el.QTD_COMPRADOR != "null" ? el.QTD_COMPRADOR : 0)
									})
									if ((qtdSolic - qtdVenc - parseInt($("#confirm_qtd").val())) < 0) {
										FLUIGC.toast({
											message: 'Quantidade excede a solicitada! Verifique o mapa de cotação',
											type: 'danger'
										});
										aDados.loading.hide();
										return
									}

									let dataFiltered = aDados.cotacoes.filter(function (el) { return el.C8_CICLO == ciclo_mapa && el.C8_FORNECE == fornecedor && el.C8_LOJA == loja && el.C8_PRODUTO.substring(0, 8) == produto })

									if (dataFiltered.length > 0) {
										let filtForn = aDados.fornecedores.filter(function (el) { return el.A2_COD == fornecedor && el.A2_LOJA == loja });
										let idx = dataFiltered[0]["IDX"];
										if (parseInt(dataFiltered[0]["C8_QUANT"]) < parseInt($("#confirm_qtd").val())) {
											FLUIGC.toast({
												message: 'Quantidade é superior a fornecida! Verifique o campo Quantidade',
												type: 'danger'
											});
											aDados.loading.hide();
											return
										} else {
											let ds = DatasetFactory.getDataset(
												"DS_ATUALIZA_COTACAO",
												null,
												[
													DatasetFactory.createConstraint("idEmpresa", $("#idEmpresa").val(), "", ConstraintType.MUST),
													DatasetFactory.createConstraint("C8_NUM", $("#C8_NUM").val(), "", ConstraintType.MUST),
													DatasetFactory.createConstraint("C8_CICLO", $("#ciclo_atual").val(), "", ConstraintType.MUST),
													DatasetFactory.createConstraint("IDX", idx, "", ConstraintType.MUST),
													DatasetFactory.createConstraint("C8_FORNECE", fornecedor, "", ConstraintType.MUST),
													DatasetFactory.createConstraint("C8_LOJA", loja, "", ConstraintType.MUST),
													DatasetFactory.createConstraint("C8_PRODUTO", $("#confirm_produto_id").val(), "", ConstraintType.MUST),

													DatasetFactory.createConstraint("C8_COND", filtForn.length > 0 ? filtForn[0]["A2_COND"] : undefined, "", ConstraintType.MUST),
													DatasetFactory.createConstraint("C8_TPFRETE", filtForn.length > 0 ? filtForn[0]["A2_TPFRETE"] : undefined, "", ConstraintType.MUST),
													DatasetFactory.createConstraint("C8_TOTFRE", filtForn.length > 0 ? filtForn[0]["A2_VALFRE"] : undefined, "", ConstraintType.MUST),

													DatasetFactory.createConstraint("C8_QUANT", $("#confirm_quantidade").val(), "", ConstraintType.MUST),
													DatasetFactory.createConstraint("COMPRADOR", $("#confirm_qtd").val() != "" && $("#confirm_qtd").val() != "0" ? usuarioAtual : "", "", ConstraintType.MUST),
													DatasetFactory.createConstraint("VENCEDOR_COMPRADOR", $("#confirm_qtd").val() != "" && $("#confirm_qtd").val() != "0" ? "true" : "", "", ConstraintType.MUST),
													DatasetFactory.createConstraint("QTD_COMPRADOR", $("#confirm_qtd").val() != "" ? $("#confirm_qtd").val() : "0", "", ConstraintType.MUST),
													DatasetFactory.createConstraint("COMPRADOR_JUSTIFICATIVA", $("#confirm_qtd").val() != "" ? $("#confirm_justificativa").val() : "", "", ConstraintType.MUST)
												],
												null,
												{
													success: function (ds) {
														if (ds.columns.includes("ERROR")) {
															FLUIGC.toast({
																message: ds.values[0]["ERROR"],
																type: 'danger'
															});
															aDados.loading.hide();
														}
														else {
															let tmpCot = tools.cotacao.carregaDados(ds.values);
															tools.mapaCompradores.exibe();
															tools.mapa.carregaMapa({ "tipoFiltro": "produto", "complementoFiltro": produto.substring(0, 8) });
															tools.mapa.modalConfirm.remove();
															aDados.loading.hide();
														}
													},
													error: function (jqXHR, textStatus, errorThrown) {
														console.log(jqXHR, textStatus, errorThrown)
														FLUIGC.toast({
															message: "Ocorreu um problema na atualização da cotação. Favor confirmar novamente!",
															type: 'danger'
														});
													}
												}
											)
										}

									}

								}
							}, 100)

						})
					} else {
						// do something with data
					}
				})
			}

		},
		setaVencedorOld: function () {
			let fornecedor = $(this).attr("fornecedor");
			let loja = $(this).attr("loja");
			let produto = $(this).attr("produto");
			let ciclo_mapa = $("#ciclo_mapa").val()

			let dataFiltered = aDados.cotacoes.filter(function (el) { return el.C8_CICLO == ciclo_mapa && el.C8_FORNECE == fornecedor && el.C8_LOJA == loja && el.C8_PRODUTO == produto })

			if (dataFiltered.length > 0) {
				dataFiltered[0]["VENCEDOR_COMP"] = "true"
			}

			tools.mapa.carregaMapa()
		}
	},
	mapaCompradores: {
		carregaAnexosFornecedores: function () {
			let idPastaGED = $("#idPastaGED,#_idPastaGED").val();
			let ciclos = $("[name^=_cotacao_ciclo___]").toArray().map(function (el) {
				return {
					"ciclo": $(el).val(),
					"solicitacao": $(el).closest("tr").find("[name*=cotacao_solicitacao___]").val()
				}
			})
			let anexos = tools.anexos.listaItens(idPastaGED)
			let fornecedores = aDados.fornecedores
		},
		carregaBase: function () {
			aDados.condPagto = DatasetFactory.getDataset("DS_CONDICAO_PAGAMENTO", null, null, null).values;
			if (usuarioCompras) {
				console.log("inicio > " + new Date())
				if (aDados.fornecedores == undefined || aDados.produtos == undefined) tools.solicitacao.carregaDados();
				fluigMapa = { fornecedores: [], produtos: [], TOTAL_QTD: 0 };

				if (aDados.fornecedores != undefined && aDados.fornecedores.length > 0 && aDados.produtos != undefined && aDados.produtos.length > 0) {
					if ($("[name=tipoSc]:checked,[name=_tipoSc]:checked").val() == "5") {
						var ciclos = ["1"];
					} else {
						var ciclos = $("[name*=cotacao_ciclo___].form-control").toArray().map(function (el) { return parseInt($(el).val()) }).sort(function (a, b) { return a - b });
					}

					if (ciclos.length > 0 || $("[name=tipoSc]:checked,[name=_tipoSc]:checked").val() == "5") {

						fluigMapa.fornecedores = aDados.fornecedores.filter(function (f) { return f.ATIVO }).sort(function (a, b) { return a.A2_NOME.trim() - b.A2_NOME.trim() }).map(function (f) {
							return {
								"A2_COD": f.A2_COD,
								"A2_LOJA": f.A2_LOJA,
								"A2_CGC": f.A2_CGC,
								"A2_NOME": f.A2_NOME,
								"A2_EST": f.A2_EST,
								"A2_COND": f.A2_COND,
								"A2_TPFRETE": f.A2_TPFRETE,
								"A2_VALFRE": tools.formata.toFloat(f.A2_VALFRE),
							}
						})

						fluigMapa["tamanho"] = 500 + (300 * fluigMapa.fornecedores.length);

						//let dsCotacoes = tools.cotacao.getFormCotacao();
						let cotacoes = aDados.cotacoes
							//.filter(function (el) { return el.C8_PRECO != "" && el.C8_PRECO != "0.00" && el.C8_PRECO != "0,00" && el.C8_PRECO != "null"  && el.C8_PRECO != "0.000000" && el.C8_PRECO != "0,000000"})
							.map(function (el) {
								return {
									"C8_CICLO": el.C8_CICLO,
									"B1_COD": el.B1_COD,
									"C8_PRODUTO": el.C8_PRODUTO,
									"vencedor_protheus": el.VENCEDOR/* == "true"*/,
									"vencedor_comprador": el.VENCEDOR_COMP/* == "true"*/,
									"B1_ZMARCA": aDados.produtos.filter(function (p) { return p.B1_COD == el.C8_PRODUTO.substring(0, 8) })[0].FILHOS.filter(function (p) { return p.B1_COD == el.C8_PRODUTO })[0].ZPM_DESC,
									"C8_FORNECE": el.C8_FORNECE,
									"C8_LOJA": el.C8_LOJA,
									"C8_QUANT": parseInt(el.QTD_COMPRADOR != "" && el.QTD_COMPRADOR != "null" ? el.QTD_COMPRADOR : el.C8_QUANT != "" ? el.C8_QUANT : "0"),
									"C8_PRECO": tools.formata.fluigToFloat(el.C8_PRECO),
									"C8_VALIPI": tools.formata.fluigToFloat(el.C8_VALIPI),
									"C8_VALISS": tools.formata.fluigToFloat(el.C8_VALISS),
									"C8_VALIPI": tools.formata.fluigToFloat(el.C8_VALIPI),
									"C8_VALICM": tools.formata.fluigToFloat(el.C8_VALICM),
									"C8_DIFAL": tools.formata.fluigToFloat(el.C8_DIFAL),
									"C8_VALSOL": tools.formata.fluigToFloat(el.C8_VALSOL),
									"C8_IMPOSTOS": tools.formata.fluigToFloat(el.C8_VALIPI) + tools.formata.fluigToFloat(el.C8_VALISS) + tools.formata.fluigToFloat(el.C8_VALSOL) + tools.formata.fluigToFloat(el.C8_DIFAL),
									"C8_TOTAL": (parseInt(el.QTD_COMPRADOR != "" && el.QTD_COMPRADOR != "null" ? el.QTD_COMPRADOR : el.C8_QUANT != "" ? el.C8_QUANT : "0")) * tools.formata.fluigToFloat(el.C8_PRECO),
									"C8_TOTAL_INTERF": (el.vencedor_comprador ? parseInt(el.QTD_COMPRADOR) : parseInt(el.C8_QUANT != "" ? el.C8_QUANT : "0")) * tools.formata.fluigToFloat(el.C8_PRECO),
									"C8_PRAZO": el.C8_PRAZO,
									"C8_VALSOL": tools.formata.fluigToFloat(el.C8_VALSOL),
								}
							})

						if (cotacoes.length > 0) {
							aDados.produtos.forEach(function (prod) {

								fluigMapa.produtos.push({
									"B1_COD": prod.B1_COD,
									"B1_DESC": prod.B1_DESC,
									"QTD": prod.QTD,
									"UM": prod.UM,
									"B1_UPRC": tools.formata.toFloat(prod.B1_UPRC),
									"FORNECEDORES": fluigMapa.fornecedores.map(function (f) {
										return {
											"A2_COD": f.A2_COD,
											"A2_LOJA": f.A2_LOJA,
											"A2_CGC": f.A2_CGC,
											"CICLOS": ciclos.map(function (c) {
												return {
													"CICLO": c,
													"COTACOES": cotacoes.filter(function (cot) { return prod.B1_COD == cot.C8_PRODUTO.substring(0, 8) && c == cot.C8_CICLO && cot.C8_FORNECE == f.A2_COD && cot.C8_LOJA == f.A2_LOJA })
												}
											})
										}
									}),
									"CICLOS": ciclos.map(function (c) {
										return {
											"CICLO": c,
											"MENOR": cotacoes.filter(function (cot) { return prod.B1_COD == cot.C8_PRODUTO.substring(0, 8) && c == cot.C8_CICLO }).reduce(tools.mapaCompradores.funcs.menorPreco, cotacoes[0])
										}
									})
								})

								fluigMapa.TOTAL_QTD += parseInt(prod.QTD);
							})

							fluigMapa.produtos.forEach(function (prd, iPrd, aPrd) {
								prd.B1_UPRC = prd.B1_UPRC != "" ? prd.B1_UPRC : prd.CICLOS.reduce(tools.mapaCompradores.funcs.primeiraCotacao, prd.CICLOS[0]).MENOR.C8_PRECO;
								prd["FORNECEDORES"].forEach(function (forn, iForn, aPrd) {
									forn["CICLOS"].forEach(function (cic, iCic, aCic) {
										forn["PRIMEIRA"] = forn["PRIMEIRA"] == undefined ? cic.COTACOES.length > 0 ? cic.COTACOES.reduce(tools.mapaCompradores.funcs.menorPreco, cic.COTACOES[0]).C8_PRECO : undefined : forn["PRIMEIRA"],
											forn["NEGOCIADA"] = (aCic[iCic - 1] != undefined && aCic[iCic - 1]["COTACOES"].length > 0) ? aCic[iCic - 1]["COTACOES"].reduce(tools.mapaCompradores.funcs.menorPreco, aCic[iCic - 1]["COTACOES"][0]).C8_PRECO : forn["NEGOCIADA"],
											forn["ATUAL"] = cic["COTACOES"]
										forn["vencedor_protheus"] = cic["COTACOES"].length > 0 && cic["COTACOES"].filter(function (el) { return el.vencedor_protheus }).length > 0
										forn["vencedor_comprador"] = cic["COTACOES"].length > 0 && cic["COTACOES"].filter(function (el) { return el.vencedor_comprador }).length > 0
									})
								})
							})

							fluigMapa.fornecedores.forEach(function (forn, idx, arr) {
								forn["TOTAIS"] = { "PRIMEIRA": 0, "NEGOCIADA": 0, "ATUAL": 0, "TOTAL": 0, "IMPOSTOS": 0 };
								fluigMapa.produtos.forEach(function (prd) {
									let primeira = prd.FORNECEDORES[idx].PRIMEIRA;
									let negociada = prd.FORNECEDORES[idx].NEGOCIADA;
									let atual = prd.FORNECEDORES[idx].ATUAL[0];

									primeira = primeira != undefined ? primeira : 0;
									negociada = negociada != undefined ? negociada : 0;
									let preco = atual != undefined ? atual.C8_PRECO : 0;

									forn.TOTAIS.PRIMEIRA += primeira;
									forn.TOTAIS.NEGOCIADA += negociada;
									forn.TOTAIS.ATUAL += preco;
								})

								let agregado = fluigMapa.produtos.reduce(tools.mapaCompradores.funcs.calcAgregados, { idx: idx, C8_IMPOSTOS: 0, TOTAL_BASELINE: 0, TOTAL: 0, C8_VALIPI: 0, C8_VALISS: 0, C8_VALSOL: 0, C8_DIFAL: 0, FCP: 0, ONLYSERVICE: true });
								forn.TOTAIS["C8_VALFRE"] = agregado.ONLYSERVICE ? 0 : forn.A2_VALFRE;
								forn.TOTAIS["C8_VALIPI"] = agregado.C8_VALIPI;
								forn.TOTAIS["C8_VALISS"] = agregado.C8_VALISS;
								forn.TOTAIS["C8_VALSOL"] = agregado.C8_VALSOL;
								forn.TOTAIS["C8_DIFAL"] = agregado.C8_DIFAL;
								forn.TOTAIS["C8_IMPOSTOS"] = agregado.C8_IMPOSTOS;
								forn.TOTAIS["BASELINE"] = agregado.TOTAL_BASELINE;
								forn.TOTAIS.TOTAL = agregado.TOTAL;
								forn.TOTAIS["TOTALGERAL"] = agregado.TOTAL + (agregado.ONLYSERVICE ? 0 : forn.A2_VALFRE) + agregado.C8_IMPOSTOS;
								let filCond = aDados.condPagto.filter(function (el) { return el.CODIGO == forn.A2_COND })[0];
								forn.TOTAIS["C8_COND"] = filCond != undefined ? filCond.DESCRICAO : "";

								forn.TOTAIS["varFinalBaseLine"] = forn.TOTAIS["TOTALGERAL"] / forn.TOTAIS["BASELINE"] - 1;
								forn.TOTAIS["economia"] = forn.TOTAIS["BASELINE"] - forn.TOTAIS["TOTALGERAL"];
								forn.TOTAIS["save"] = forn.TOTAIS["economia"] > 0;
								forn.TOTAIS["penalty"] = forn.TOTAIS["economia"] < 0;
								forn.TOTAIS["economiaUnformatted"] = forn.TOTAIS["economia"];
								forn.TOTAIS["performance"] = (forn.TOTAIS.ATUAL / forn.TOTAIS.PRIMEIRA - 1) * 100;

							})

							fluigMapa["orcado"] = $("#valor_total,#_valor_total").val();
							fluigMapa["baseline"] = fluigMapa.produtos.reduce(tools.mapaCompradores.funcs.somaBaseline, 0);
							fluigMapa["melhorprimeira"] = fluigMapa.produtos.reduce(tools.mapaCompradores.funcs.somaMelhorPrimeira, 0);

							console.log("fim carregaDados > " + new Date())
							tools.mapaCompradores.formata();

							//fluigMapa.fornecedores.sort(function(a,b){return tools.formata.toFloat(b.TOTAIS.ATUAL) == 0 ? -1 : tools.formata.toFloat(b.TOTAIS.ATUAL) - tools.formata.toFloat(a.TOTAIS.ATUAL)}).sort(function(a,b){return tools.formata.toFloat(b.TOTAIS.economiaUnformatted) == 0 ? -1 : tools.formata.toFloat(b.TOTAIS.economiaUnformatted) - tools.formata.toFloat(a.TOTAIS.economiaUnformatted)});
							fluigMapa.fornecedores.sort(function (a, b) { return tools.formata.toFloat(b.TOTAIS.ATUAL) - tools.formata.toFloat(a.TOTAIS.ATUAL) });

							var fornecedoresOrdem = [];
							aDados.fornecedores.forEach(function (el, idx, arr) {
								fornecedoresOrdem.push({
									"A2_CGC": el.A2_CGC,
									"idxADados": idx
								})
							})
							fluigMapa.fornecedores.forEach(function (el, idx, arr) {
								var fornFilter = fornecedoresOrdem.filter(function (f) { return f.A2_CGC == el.A2_CGC })
								if (fornFilter.length > 0) fornFilter[0]["idxFluigMapa"] = idx
							})
							//console.log(fornecedoresOrdem)
							aDados.fornecedores.sort(function (a, b) { return fornecedoresOrdem.filter(function (el) { return a.A2_CGC == el.A2_CGC })[0].idxFluigMapa - fornecedoresOrdem.filter(function (el) { return b.A2_CGC == el.A2_CGC })[0].idxFluigMapa })
							fluigMapa.produtos.forEach(function (p) {
								p.FORNECEDORES.sort(function (a, b) { return fornecedoresOrdem.filter(function (el) { return a.A2_CGC == el.A2_CGC })[0].idxFluigMapa - fornecedoresOrdem.filter(function (el) { return b.A2_CGC == el.A2_CGC })[0].idxFluigMapa })
							})

							console.log("fim > " + new Date())

						} else {
							$("#mapa_cotacao").hide();
							FLUIGC.toast({
								message: 'Não foram encontradas cotações para exibição do Mapa de Cotação',
								type: 'warning'
							});
						}

					}

				}

			}
		},
		exibe: function () {
			if ([26, 35, 40, 224, 110, 70, 71, 76, 80, 105, 148].includes(WKNumState)) {
				if (usuarioCompras) {
					tools.mapaCompradores.carregaBase();
					tools.anexos.carrega();

					let temp = $("#tmpl8").html();
					let html = Mustache.render(temp, fluigMapa);

					$("#tabMapa").html(html);
					$("[open-modal]").on("click", tools.mapaCompradores.exibeModal)
					$("[btn-prod],[btn-forn]").on("click", tools.mapa.carregaMapa)
					$("[icon-attachment]").on("click", tools.anexos.exibeAnexos)

				} else {
					tools.mapa.carregaMapaOutros();
				}
			}
			//delete aDados;

		},
		exibeModal: function () {
			let temp = $("#tmpl8").html();
			let html = Mustache.render(temp, fluigMapa);

			var myModal = parent.FLUIGC.modal({
				title: 'Mapa de Cotação',
				content: html,
				size: "full",
				id: 'fluig-modal',
			}, function (err, data) {
				if (!err) {
					//console.log(data)
					$("#fluig-modal").find("[open-modal]").hide();
				}
			});

		},
		formata: function () {
			fluigMapa.produtos.forEach(function (prd) {
				prd.FORNECEDORES.forEach(function (forn) {
					forn.PRIMEIRA = tools.formata.floatToMoney(forn.PRIMEIRA);
					forn.NEGOCIADA = tools.formata.floatToMoney(forn.NEGOCIADA);
					forn.ATUAL.forEach(function (at) {
						at.C8_PRECO = tools.formata.floatToMoney(at.C8_PRECO);
						at.C8_TOTAL = tools.formata.floatToMoney(at.C8_TOTAL);
					})
				})
			})

			aDados.produtos.forEach(function (prd) {
				prd.cotacoes.forEach(function (cot) {
					cot.C8_PRECO = tools.formata.floatToMoney(cot.C8_PRECO, 6);
					cot.C8_DIFAL = tools.formata.floatToMoney(cot.C8_DIFAL);
					cot.C8_TOTAL = tools.formata.floatToMoney(cot.C8_TOTAL);
					cot.C8_VALIPI = tools.formata.floatToMoney(cot.C8_VALIPI);
					cot.C8_VALISS = tools.formata.floatToMoney(cot.C8_VALISS);
					cot.C8_VALSOL = tools.formata.floatToMoney(cot.C8_VALSOL);
				})
			})

			fluigMapa.fornecedores.forEach(function (forn) {
				forn.TOTAIS.PRIMEIRA = tools.formata.floatToMoney(forn.TOTAIS.PRIMEIRA);
				forn.TOTAIS.NEGOCIADA = tools.formata.floatToMoney(forn.TOTAIS.NEGOCIADA);
				forn.TOTAIS.ATUAL = tools.formata.floatToMoney(forn.TOTAIS.ATUAL);
				forn.TOTAIS.C8_IMPOSTOS = tools.formata.floatToMoney(forn.TOTAIS.C8_IMPOSTOS);
				forn.TOTAIS.C8_VALIPI = tools.formata.floatToMoney(forn.TOTAIS.C8_VALIPI);
				forn.TOTAIS.C8_VALISS = tools.formata.floatToMoney(forn.TOTAIS.C8_VALISS);
				forn.TOTAIS.C8_VALSOL = tools.formata.floatToMoney(forn.TOTAIS.C8_VALSOL);
				forn.TOTAIS.C8_DIFAL = tools.formata.floatToMoney(forn.TOTAIS.C8_DIFAL);
				//forn.TOTAIS.C8_IMPOSTOS = tools.formata.floatToMoney(forn.TOTAIS.C8_IMPOSTOS);
				forn.TOTAIS.TOTAL = tools.formata.floatToMoney(forn.TOTAIS.TOTAL);
				forn.TOTAIS.C8_VALFRE = tools.formata.floatToMoney(forn.TOTAIS.C8_VALFRE);
				forn.TOTAIS.TOTALGERAL = tools.formata.floatToMoney6(forn.TOTAIS.TOTALGERAL);
				forn.TOTAIS.varFinalBaseLine = tools.formata.floatToMoney(forn.TOTAIS.varFinalBaseLine);
				forn.TOTAIS.economia = tools.formata.floatToMoney(forn.TOTAIS.economia);
				forn.TOTAIS.performance = tools.formata.floatToMoney(forn.TOTAIS.performance);
			})

			fluigMapa.baseline = tools.formata.floatToMoney(fluigMapa.baseline);
			fluigMapa.melhorprimeira = tools.formata.floatToMoney(fluigMapa.melhorprimeira);

			tools.mapaCompradores.carregaAnexosFornecedores();
		},
		funcs: {
			calcAgregados(item, obj) {
				obj.FORNECEDORES[item.idx].ATUAL.forEach(function (el) {
					item.C8_VALIPI += el.C8_VALIPI;
					item.C8_VALISS += el.C8_VALISS;
					item.C8_VALSOL += el.C8_VALSOL;
					item.C8_DIFAL += el.C8_DIFAL;
					item.FCP += el.FCP;
					item.C8_IMPOSTOS += el.C8_IMPOSTOS;
					item.TOTAL_BASELINE += (obj.B1_UPRC * el.C8_QUANT);
					item.TOTAL += (el.C8_QUANT * el.C8_PRECO);
					item.ONLYSERVICE = (el.C8_PRODUTO.indexOf("S") != 0 ? false : item.ONLYSERVICE);
				})
				return item
			},
			menorPreco(item, obj) {
				return obj.C8_PRECO < item.C8_PRECO ? obj : item
			},

			primeiraCotacao(item, obj) {
				return item.MENOR != "" && item.MENOR != undefined ? item : obj;
			},
			somaBaseline(item, obj) {
				return item + (obj.B1_UPRC * parseInt(obj.QTD));
			},
			somaMelhorPrimeira(item, obj) {
				obj.CICLOS.forEach(function (el, idx, arr) {
					if (el.MENOR != undefined) {
						item += el.MENOR.C8_TOTAL
						arr.length = idx
					}
				})
				return item
			}
		}
	},
	obsLimpar: function () {
		$("#observacoes,#_observacoes").off("keypress").on("keypress", function (e) {
			var chr = String.fromCharCode(e.keyCode);
			if ("\\/<>".indexOf(chr) > -1) return false;
		})

		$("#observacoes,#_observacoes").off("change").on("change", function (e) {
			$('#observacoes,#_observacoes').val($('#observacoes,#_observacoes').val().trim()
				.replace(/\\/g, "")
				.replace(/\//g, "")
				.replace(/</g, "")
				.replace(/>/g, "")
			)
		})
	},
	pedidos: {
		carregaDados: function () {
			aDados["pedidos"] = $("[name*=C7_NUM___].form-control").toArray().map(function (el) {
				return {
					"C7_STATUS": $(el).closest("tr").find("[name*=C7_STATUS" + "___]").val(),
					"C7_FILIAL": $(el).closest("tr").find("[name*=C7_FILIAL" + "___]").val(),
					"C7_NUM": $(el).closest("tr").find("[name*=C7_NUM" + "___]").val(),
					"C7_EMISSAO": $(el).closest("tr").find("[name*=C7_EMISSAO" + "___]").val(),
					"C7_FORNECE": $(el).closest("tr").find("[name*=C7_FORNECE" + "___]").val(),
					"C7_LOJA": $(el).closest("tr").find("[name*=C7_LOJA" + "___]").val(),
					"C7_COND": $(el).closest("tr").find("[name*=C7_COND" + "___]").val(),
					"C7_TPFRETE": [{ ID: "S", "DESC": "Sem Frete" }, { ID: "C", "DESC": "CIF" }, { ID: "F", "DESC": "FOB" }].filter(function (o) { return o.ID == $(el).closest("tr").find("[name*=C7_TPFRETE" + "___]").val() })[0].DESC,
					"C7_FRETE": $(el).closest("tr").find("[name*=C7_FRETE" + "___]").val(),
					"C7_ITEM": $(el).closest("tr").find("[name*=C7_ITEM" + "___]").val(),
					"C7_PRODUTO": $(el).closest("tr").find("[name*=C7_PRODUTO" + "___]").val(),
					"C7_DESCRI": $(el).closest("tr").find("[name*=C7_DESCRI" + "___]").val(),
					"C7_UM": $(el).closest("tr").find("[name*=C7_UM" + "___]").val(),
					"C7_QTDSOL": $(el).closest("tr").find("[name*=C7_QTDSOL" + "___]").val(),
					"C7_QUANT": $(el).closest("tr").find("[name*=C7_QUANT" + "___]").val(),
					"C7_PRECO": $(el).closest("tr").find("[name*=C7_PRECO" + "___]").val(),
					"C7_TOTAL": $(el).closest("tr").find("[name*=C7_TOTAL" + "___]").val(),
					"C7_TES": $(el).closest("tr").find("[name*=C7_TES" + "___]").val(),
					"C7_VALIPI": $(el).closest("tr").find("[name*=C7_VALIPI" + "___]").val(),
					"C7_VALICM": $(el).closest("tr").find("[name*=C7_VALICM" + "___]").val(),
					"C7_VALIR": $(el).closest("tr").find("[name*=C7_VALIR" + "___]").val(),
					"C7_VALSOL": $(el).closest("tr").find("[name*=C7_VALSOL" + "___]").val(),
					"C7_VALISS": $(el).closest("tr").find("[name*=C7_VALISS" + "___]").val(),
					"C7_VALINS": $(el).closest("tr").find("[name*=C7_VALINS" + "___]").val(),
					"C7_VALCSL": $(el).closest("tr").find("[name*=C7_VALCSL" + "___]").val(),
					"C7_VALCOF": $(el).closest("tr").find("[name*=C7_VALCOF" + "___]").val(),
					"C7_VALPIS": $(el).closest("tr").find("[name*=C7_VALPIS" + "___]").val(),
					"C7_ITEMSC": $(el).closest("tr").find("[name*=C7_ITEMSC" + "___]").val(),
					"C7_NUMSC": $(el).closest("tr").find("[name*=C7_NUMSC" + "___]").val(),
					"C7_NUMCOT": $(el).closest("tr").find("[name*=C7_NUMCOT" + "___]").val()
				}
			}).filter(function (el) {
				if (WKNumState == 224) {
					return el.C7_STATUS == "";
				}
				else {
					return el.C7_STATUS != "";
				}
			}).reduce(tools.pedidos.funcs.normalizaPedido, [])
		},
		exibir: function () {
			if (([26, 76, 80, 105, 148].includes(WKNumState) && $("[name*=decisaoLiberarPedido]:checked").val() != undefined) || WKNumState == 224 || WKNumState == 71 || WKNumState == 70) {
				let temp = $("#tmpl14").html();
				let html = Mustache.render(temp, aDados.pedidos);

				$("#tabPedido").html(html);
				$("#panelPedidos").show();
			}
		},
		formata: function () {
			aDados.pedidos.forEach(function (pedido) {
				pedido["C7_VALIPI"] = tools.formata.floatToMoney(pedido["C7_VALIPI"]);
				pedido["C7_VALICM"] = tools.formata.floatToMoney(pedido["C7_VALICM"]);
				pedido["C7_VALIR"] = tools.formata.floatToMoney(pedido["C7_VALIR"]);
				pedido["C7_VALSOL"] = tools.formata.floatToMoney(pedido["C7_VALSOL"]);
				pedido["C7_VALISS"] = tools.formata.floatToMoney(pedido["C7_VALISS"]);
				pedido["C7_VALINS"] = tools.formata.floatToMoney(pedido["C7_VALINS"]);
				pedido["C7_VALCSL"] = tools.formata.floatToMoney(pedido["C7_VALCSL"]);
				pedido["C7_VALCOF"] = tools.formata.floatToMoney(pedido["C7_VALCOF"]);
				pedido["C7_VALPIS"] = tools.formata.floatToMoney(pedido["C7_VALPIS"]);
				pedido["C7_TOTAL"] = tools.formata.floatToMoney(pedido["C7_TOTAL"]);
				pedido["C7_IMPOSTOS"] = tools.formata.floatToMoney(pedido["C7_IMPOSTOS"]);
				pedido["C7_FRETE"] = tools.formata.floatToMoney(pedido["C7_FRETE"]);
				pedido["C7_TOTALGERAL"] = tools.formata.floatToMoney(pedido["C7_TOTALGERAL"]);
			})
		},
		funcs: {
			normalizaPedido(item, obj) {
				let itemFilter = item.filter(function (el) { return el.C7_NUM == obj.C7_NUM });

				if (itemFilter.length > 0) {
					itemFilter[0]["C7_VALIPI"] += parseFloat(obj.C7_VALIPI);
					itemFilter[0]["C7_VALICM"] += parseFloat(obj.C7_VALICM);
					itemFilter[0]["C7_VALIR"] += parseFloat(obj.C7_VALIR);
					itemFilter[0]["C7_VALSOL"] += parseFloat(obj.C7_VALSOL);
					itemFilter[0]["C7_VALISS"] += parseFloat(obj.C7_VALISS);
					itemFilter[0]["C7_VALINS"] += parseFloat(obj.C7_VALINS);
					itemFilter[0]["C7_VALCSL"] += parseFloat(obj.C7_VALCSL);
					itemFilter[0]["C7_VALCOF"] += parseFloat(obj.C7_VALCOF);
					itemFilter[0]["C7_VALPIS"] += parseFloat(obj.C7_VALPIS);
					itemFilter[0]["C7_TOTAL"] += parseFloat(obj.C7_TOTAL);

					itemFilter[0].ITENS.push({
						"C7_ITEM": obj.C7_ITEM,
						"C7_PRODUTO": obj.C7_PRODUTO,
						"C7_DESCRI": obj.C7_DESCRI,
						"C7_UM": obj.C7_UM,
						"C7_QTDSOL": obj.C7_QTDSOL,
						"C7_QUANT": obj.C7_QUANT,
						"C7_PRECO": tools.formata.floatToMoney(parseFloat(obj.C7_PRECO)),
						"C7_TOTAL": tools.formata.floatToMoney(parseFloat(obj.C7_TOTAL)),
						"C7_TES": obj.C7_TES,
					})
				}
				else {
					let forn = aDados.fornecedores.filter(function (el) { return el.A2_COD == obj.C7_FORNECE && el.A2_LOJA == obj.C7_LOJA });
					let cond = aDados.condPagto.filter(function (el) { return el.CODIGO == obj.C7_COND });
					item.push({
						"C7_STATUS": obj.C7_STATUS == "" ? "Em aprovação" : obj.C7_STATUS,
						"C7_FILIAL": obj.C7_FILIAL,
						"C7_NUM": obj.C7_NUM,
						"C7_EMISSAO": obj.C7_EMISSAO,
						"C7_FORNECE": obj.C7_FORNECE,
						"C7_LOJA": obj.C7_LOJA,
						"A2_NOME": forn.length > 0 ? forn[0]["A2_NOME"] : "",
						"C7_COND": obj.C7_COND,
						"COND_PAGTO": cond.length > 0 ? cond[0]["DESCRICAO"] : "",
						"C7_TPFRETE": obj.C7_TPFRETE,
						"C7_FRETE": parseFloat(obj.C7_FRETE),
						"C7_VALIPI": parseFloat(obj.C7_VALIPI),
						"C7_VALICM": parseFloat(obj.C7_VALICM),
						"C7_VALIR": parseFloat(obj.C7_VALIR),
						"C7_VALSOL": parseFloat(obj.C7_VALSOL),
						"C7_VALISS": parseFloat(obj.C7_VALISS),
						"C7_VALINS": parseFloat(obj.C7_VALINS),
						"C7_VALCSL": parseFloat(obj.C7_VALCSL),
						"C7_VALCOF": parseFloat(obj.C7_VALCOF),
						"C7_VALPIS": parseFloat(obj.C7_VALPIS),
						"C7_TOTAL": parseFloat(obj.C7_TOTAL),
						"ITENS": [{
							"C7_ITEM": obj.C7_ITEM,
							"C7_PRODUTO": obj.C7_PRODUTO,
							"C7_DESCRI": obj.C7_DESCRI,
							"C7_UM": obj.C7_UM,
							"C7_QTDSOL": obj.C7_QTDSOL,
							"C7_QUANT": obj.C7_QUANT,
							"C7_PRECO": tools.formata.floatToMoney(parseFloat(obj.C7_PRECO)),
							"C7_TOTAL": tools.formata.floatToMoney(parseFloat(obj.C7_TOTAL)),
							"C7_TES": obj.C7_TES,
						}]
					})
				}
				return item;
			},
		},
		incluir: function () {

		},
		init: function () {
			if ([224, 71, 26, 70, 76, 80, 105, 148].includes(WKNumState)) {
				if ($("[name*=tipo_pc_contrato]:checked").val() == "pc") {
					tools.pedidos.carregaDados();
					tools.pedidos.totaliza();
					tools.pedidos.formata();
					tools.pedidos.exibir();
				}
			}
		},
		totaliza: function () {
			aDados.pedidos.forEach(function (pedido) {
				pedido["C7_IMPOSTOS"] = (pedido["C7_VALCOF"] + pedido["C7_VALCSL"] + pedido["C7_VALICM"] + pedido["C7_VALINS"] + pedido["C7_VALIPI"] + pedido["C7_VALIR"] + pedido["C7_VALISS"] + pedido["C7_VALPIS"] + pedido["C7_VALSOL"]);
				pedido["C7_TOTALGERAL"] = pedido["C7_TOTAL"] + pedido["C7_FRETE"] + pedido["C7_IMPOSTOS"];
			})
		}
	},
	produtos: {
		add: function () {
			if (tools.produtos.validaInserir()) {
				let index = wdkAddChild('tabelaProduto')
				MaskEvent.init()
				$('#produto_qtd___' + index).on('change', () => somarValores())
				$('#produto_qtd___' + index).on('keyup', () => somarValores())
				$('#produto_vlUnitario___' + index).on('change', () => somarValores())
				$('#produto_vlUnitario___' + index).on('keyup', () => somarValores())
				$("#produto_entrega___" + index).val($("#data_entrega").val())
				//setTimeout(function(){
				//	reloadZoomFilterValues("produto___"+index, "tipo," + $("#tipo_contratacao,#_tipo_contratacao").val())
				//},1000)
			} else {
				FLUIGC.toast({
					message: 'É necessário selecionar a Empresa Entrega e o Tipo de compra para prosseguir!',
					type: 'danger'
				});
			}
		},
		carrega: function () {
			aDados["produtos"] = [];
			let filhos = [];

			let prodTmp = $("[name*=codigoProduto___].form-control").toArray().map(function (el) {
				return {
					"B1_COD": $(el).val(),
					"B1_UPRC": $(el).closest("tr").find("[name*=" + "produto_vlUltCompra" + "___]").val() != "NaN" ? $(el).closest("tr").find("[name*=" + "produto_vlUltCompra" + "___]").val() : "",
					"B1_UCOM": $(el).closest("tr").find("[name*=" + "produto_dtUltCompra" + "___]").val(),
					"vlUnit": $(el).closest("tr").find("[name*=" + "produto_vlUnitario" + "___]").val(),
					"marcas": $(el).closest("tr").find("[name*=" + "produto_marcas" + "___]").val()
				}
			})

			$("[name*=B1_PAI___]").not("[value='']").each(function (idx, el) {
				if ($(el).closest("tr").find("[name*=B1_COD___]").val() != undefined) {
					filhos.push({
						B1_COD: $(el).closest("tr").find("[name*=B1_COD___]").val().trim(),
						B1_DESC: $(el).closest("tr").find("[name*=B1_DESC___]").val(),
						B1_PAI: $(el).closest("tr").find("[name*=B1_PAI___]").val().trim(),
						B1_ZMARCA: $(el).closest("tr").find("[name*=B1_ZMARCA___]").val(),
						ZPM_DESC: $(el).closest("tr").find("[name*=ZPM_DESC___]").val(),
						UM: $("[name*=codigoProduto___][value='" + $(el).closest("tr").find("[name*=B1_PAI___]").val() + "']").closest("tr").find("[name*=unidadeMedidaProduto___]").val()
					})
				}
			})

			$("[name*=B1_PAI___][value='']").each(function (idx, el) {
				if ($(el).closest("tr").find("[name*=B1_COD___]").val() != undefined) {
					filterFilhos = filhos.filter(function (pf) { return pf.B1_PAI == $(el).closest("tr").find("[name*=B1_COD___]").val().trim() });
					filterFilhos = filterFilhos.length > 0 ? filterFilhos : [{
						B1_COD: $(el).closest("tr").find("[name*=B1_COD___]").val().trim(),
						B1_DESC: $(el).closest("tr").find("[name*=B1_DESC___]").val(),
						B1_PAI: $(el).closest("tr").find("[name*=B1_PAI___]").val().trim(),
						B1_ZMARCA: $(el).closest("tr").find("[name*=B1_ZMARCA___]").val(),
						ZPM_DESC: $(el).closest("tr").find("[name*=ZPM_DESC___]").val(),
						B1_UPRC: $(el).closest("tr").find("[name*=produto_vlUnitario___]").val() != "" ? parseFloat($(el).closest("tr").find("[name^=produto_vlUnitario___]").val()) : 0,
						B1_UCOM: $(el).closest("tr").find("[name*=B1_UCOM___]").val()

					}]

					let pTemp = prodTmp.filter(function (pT) { return pT.B1_COD == $(el).closest("tr").find("[name*=B1_COD___]").val().trim() })[0];

					aDados.produtos.push({
						B1_COD: $(el).closest("tr").find("[name*=B1_COD___]").val().trim(),
						B1_DESC: $(el).closest("tr").find("[name*=B1_DESC___]").val(),
						QTD: $("[name*=codigoProduto___][value='" + $(el).closest("tr").find("[name*=B1_COD___]").val() + "']").closest("tr").find("[name*=produto_qtd___]").val(),
						UM: $("[name*=codigoProduto___][value='" + $(el).closest("tr").find("[name*=B1_COD___]").val() + "']").closest("tr").find("[name*=unidadeMedidaProduto___]").val(),
						B1_UPRC: pTemp.B1_UPRC,
						B1_UCOM: pTemp.B1_UCOM,
						vlUnit: pTemp.vlUnit,
						marcas: pTemp.marcas,
						FILHOS: filterFilhos
					})

				}
			})
		},
		carregaFilhos: function (selectedItem, index) {
			let objRet = false;

			if (selectedItem.SERVICO != "S") {
				let ds = DatasetFactory.getDataset(
					"ds_consulta_produto_filho_protheus",
					null,
					[
						DatasetFactory.createConstraint("B1_COD", selectedItem['B1_COD'].trim(), selectedItem['B1_COD'].trim(), ConstraintType.MUST),
						DatasetFactory.createConstraint("EMPRESA", $("#idEmpresa").val(), $("#idEmpresa").val(), ConstraintType.MUST)
					],
					null
				)

				if (ds != null && ds.values.length > 0 && ds.values[0]["ERRO"] == undefined) {
					let idx = wdkAddChild("tabProduto");
					$("#B1_COD" + "___" + idx).val(selectedItem.B1_COD);
					$("#B1_DESC" + "___" + idx).val(selectedItem.B1_DESC);
					$("#B1_UM" + "___" + idx).val(selectedItem.B1_UM);
					let saldo = 0;
					var B1_UCOM = "";
					var B1_UPRC = "";

					ds.values.forEach(function (el) {
						if (el.ERRO == undefined && el.BLOQFIL == "N") {
							let idx = wdkAddChild("tabProduto");

							$("#B1_PAI" + "___" + idx).val(selectedItem['B1_COD'].trim());
							$("#B1_COD" + "___" + idx).val(el.B1_COD);
							$("#B1_DESC" + "___" + idx).val(el.B1_DESC);
							$("#B1_GRUPO" + "___" + idx).val(el.B1_GRUPO);
							$("#B1_LOCPAD" + "___" + idx).val(el.B1_LOCPAD);
							$("#B1_MSBLQL" + "___" + idx).val(el.B1_MSBLQL);
							$("#B1_TIPO" + "___" + idx).val(el.B1_TIPO);
							$("#B1_UM" + "___" + idx).val(el.B1_UM);
							$("#B1_ZMARCA" + "___" + idx).val(el.B1_ZMARCA);
							$("#ZPM_DESC" + "___" + idx).val(el.ZPM_DESC);
							$("#B1_UPRC" + "___" + idx).val(el.B1_UPRC);
							$("#B1_COD" + "___" + idx).val(el.B1_COD);
							$("#B1_UCOM" + "___" + idx).val(el.B1_UCOM);
							saldo += parseInt(el.SALDO != "" ? el.SALDO : "0");
							let ret = tools.validaUPRC(B1_UCOM, B1_UPRC, el);
							B1_UCOM = ret.B1_UCOM;
							B1_UPRC = ret.B1_UPRC;
							objRet = true;
						}

					})

					$("#produto_saldo___" + index).val(saldo);
					$("#produto_vlUnitario___" + index).val(parseFloat(B1_UPRC).toFixed(2).replace(".", ",")).trigger("blur");
					$("#produto_vlUltCompra___" + index).val(parseFloat(B1_UPRC).toFixed(2));
					$("#produto_dtUltCompra___" + index).val(B1_UCOM);
				}
			} else {
				let idx = wdkAddChild("tabProduto");
				$("#B1_COD" + "___" + idx).val(selectedItem.B1_COD);
				$("#B1_DESC" + "___" + idx).val(selectedItem.B1_DESC);
				$("#B1_UM" + "___" + idx).val(selectedItem.B1_UM);

			}

			return objRet;
		},
		customRemoveChild(oElement) {
			if (WKNumState == INICIO0 || WKNumState == INICIO1 || WKNumState == REVISAR_SOLICITACAO || WKNumState == TRATAR_ERRO || WKNumState == 260) {
				myLoading.show();

				setTimeout(() => {
					let codigoProduto = $(oElement).closest("tr").find("[name^=codigoProduto___]").val();
					tools.produtos.limpaFilhos(codigoProduto);
					fnWdkRemoveChild(oElement)
					somarValores()
					myLoading.hide();
				}, 200)

			}
		},
		habilitaBotao: function () {
			if (WKNumState == INICIO0 || WKNumState == INICIO1 || WKNumState == REVISAR_SOLICITACAO || WKNumState == TRATAR_ERRO || WKNumState == 260) {
				$('#inserirProduto').on('click', tools.produtos.add)
				$('#inserirProduto').show();
			} else {
				$('#inserirProduto').hide();
			}
		},
		limpaFilhos: function (B1_COD) {
			if (B1_COD != "") {
				$("[name*=B1_PAI___]").each(function (idx, el) {
					if (el.value == B1_COD || $(el).closest("tr").find("[name^=B1_COD___]").val() == B1_COD) {
						console.log(el);
						fnWdkRemoveChild(el)
					}
				})
			}
		},
		validaDuplicidade: function (index, valor) {
			let retorno = true;
			$("[name^=codigoProduto___]").not("#codigoProduto___" + index + ",#_codigoProduto___" + index).each(function (idx, el) {
				if (el.value == valor) retorno = false;
			})
			return retorno;
		},
		validaInserir: function () {
			let data_entrega = $("#data_entrega,#_data_entrega").val();
			let idEmpresa = $("#idEmpresa,#__idEmpresa").val();
			return data_entrega != "" && idEmpresa != "";
		}
	},
	rateio: {
		dinamica: function () {
			$(".semRateio,.comRateio").hide();

			var havera_rateio = $("[name=havera_rateio]:checked,[name=_havera_rateio]:checked").val();

			if (havera_rateio == "sim") {
				$("#rateio").show();
				$("#divTabelaRateio").show();
			} else {
				$("#rateio").hide();
				$("#divTabelaRateio").hide();
				$("[name^=pRateioCCusto___]").each(function (id, el) { fnWdkRemoveChild(el); })
			}
		},
		validaDuplicidade: function (index, COD_EMPRES) {
			let retorno = true;
			$("[name^=codigoEmpresaRateio___]").not("#codigoEmpresaRateio___" + index + ",#_codigoEmpresaRateio___" + index).each(function (idx, el) {
				if (el.value == COD_EMPRES) retorno = false;
			})
			return retorno;
		}
	},
	solicitacao: {
		carregaDados: function () {
			aDados.condPagto = DatasetFactory.getDataset("DS_CONDICAO_PAGAMENTO", null, null, null).values;
			let filhos = []

			tools.produtos.carrega();
			tools.fornecedores.carregaDados();
		}
	},
	fSetHistorico: function () {
		let historico = $('#historico').val().trim() != "" ? JSON.parse($('#historico').val().trim()) : ""
		$("#div-obs").show()
		if (historico != '') {
			let historicoLinha = ''
			for (i in historico) {
				let obs = historico[i]
				let decisao = obs.decisao ? `<span><strong>Decisão: </strong>${obs.decisao}</span><br>` : "";
				historicoLinha += `<span>${obs.usuario} - ${obs.data}</span> <br>${decisao} <span><strong>Observação:</strong> ${obs.observacao}</span><br><hr><br>`;
			}
			$('#dv_historico').html(historicoLinha)
		}
		let $dvHist = $("#dv_historico")

		if ($dvHist.is(":visible")) $('button#btn-historico').text('OCULTAR')
		else $('button#btn-historico').text('MOSTRAR')

		$('button#btn-historico').on("click", () => {
			if ($dvHist.is(":visible")) {
				$('button#btn-historico').text("MOSTRAR")
				$dvHist.slideUp("slow")
			} else {
				$('button#btn-historico').text("OCULTAR")
				$dvHist.slideDown("slow")
			}
		});
	},
	TES: {
		carregaDiv() {
			if ($("[name*=tipoSc]:checked").val() != "5" || aDados.cotacoes.length > 0) {
				let temp = $("#tmpl5").html();
				let html = Mustache.render(temp, aDados);

				FLUIGC.modal({
					title: 'Preencher dados TES',
					content: html,
					size: 'full',
					id: 'fluig-confirma',
					overflow: 'scroll',
					actions: []
				}, function () {
					$(".tes").on("change", tools.TES.processa);
					tools.TES.selecao.todos();
					tools.TES.carregaNecessarios();
				})
			} else {
				FLUIGC.toast({
					message: 'É necessário inserir cotações para prosseguir com a TES!',
					type: 'danger'
				});
			}

		},
		carregaNecessarios() {
			$("[name^=C8_CICLO___][value=1].form-control,[name^=_C8_CICLO___][value=1].form-control").closest("tr").find("[name*=C8_PRECO___]").not("[value=''],[value='0.00'],[value='0.000000']").toArray().forEach(function (el) {
				let a2_cod = $(el).closest("tr").find("[name*=C8_FORNECE___]").val();
				let a2_loja = $(el).closest("tr").find("[name*=C8_LOJA___]").val();
				let b1_cod = $(el).closest("tr").find("[name*=C8_PRODUTO___]").val().substring(0, 8);

				$("[data-a2cod='" + a2_cod + "'][data-a2loja='" + a2_loja + "'][data-b1cod='" + b1_cod + "']").addClass("necessario");
			})
		},
		carregaOptions() {
			var ds = DatasetFactory.getDataset("DS_TES", null, null, null)
			if (ds == null || ds.values == undefined) return;
			aDados["TES"] = ds.values.filter((el) => el.BLOQUEADO == "2")
			aDados["TES"] = aDados["TES"].sort(function (el1, el2) { return el1.CODIGO - el2.CODIGO })
		},
		init() {
			if ([26, 65, 21, 163, 76, 80, 105, 148].includes(WKNumState)) {
				if (aDados.fornecedores.length == 0) tools.mapa.carregaBase()
				if (!aDados.TES) tools.TES.carregaOptions();
				$("#btnTES").on("click", tools.TES.carregaDiv)
			} else {
				$("#btnTES").hide();
			}
		},
		identificaLinha(TES_A2_CGC, TES_B1_COD) {
			let linha = null;
			$("[name^=TES_A2_CGC___]").toArray().forEach(function (el, i, arr) {
				if (el.value == TES_A2_CGC) {
					let idx = el.id.split("___")[1]
					if ($("#TES_B1_COD___" + idx).val() == TES_B1_COD) {
						linha = idx;
						arr.length = i
					}
				}
			})

			return linha
		},
		gravaLinha(TES_A2_COD, TES_A2_LOJA, TES_A2_CGC, TES_B1_COD, TES_CODIGO) {
			let linha = tools.TES.identificaLinha(TES_A2_CGC, TES_B1_COD);

			if (linha == null) linha = wdkAddChild("tabTES");

			$("#TES_A2_COD" + "___" + linha).val(TES_A2_COD);
			$("#TES_A2_LOJA" + "___" + linha).val(TES_A2_LOJA);
			$("#TES_A2_CGC" + "___" + linha).val(TES_A2_CGC);
			$("#TES_B1_COD" + "___" + linha).val(TES_B1_COD);
			$("#TES_CODIGO" + "___" + linha).val(TES_CODIGO);
			$("#TES_COMPRADOR" + "___" + linha).val(usuarioAtual);
		},
		gravaSelecao() {
			let obj = aDados.obj;
			delete aDados.obj;

			if (obj.tipo == "produto") {
				tools.TES.gravaLinha(obj.A2_COD, obj.A2_LOJA, obj.A2_CGC, obj.B1_COD.substring(0, 8), obj.CODIGO);
				if (obj.CODIGO != "") {
					$("[data-a2cgc=" + obj.A2_CGC + "][data-b1cod=" + obj.B1_COD + "]").addClass("preenchido")
				} else {
					$("[data-a2cgc=" + obj.A2_CGC + "][data-b1cod=" + obj.B1_COD + "]").removeClass("preenchido")
				}

			} else {
				aDados.produtos.forEach(function (produto) {
					tools.TES.gravaLinha(obj.A2_COD, obj.A2_LOJA, obj.A2_CGC, produto.B1_COD.substring(0, 8), obj.CODIGO);
					tools.TES.selecao.linha(obj.A2_CGC, produto.B1_COD.substring(0, 8), obj.CODIGO);
				})
			}
		},
		processa() {
			let _this = this;
			aDados["obj"] = {
				A2_COD: $(this).attr("data-a2cod"),
				A2_LOJA: $(this).attr("data-a2loja"),
				A2_NOME: $(this).attr("data-a2nome"),
				A2_CGC: $(this).attr("data-a2cgc"),
				B1_COD: $(this).attr("data-b1cod"),
				B1_DESC: $(this).attr("data-b1desc"),
				tipo: $(this).attr("data-b1desc") != undefined ? "produto" : "fornecedor",
				CFOP: $(this).find("option:selected").attr("data-cfop"),
				DESCRICAO: $(this).find("option:selected").attr("data-descricao"),
				ESTOQUE: $(this).find("option:selected").attr("data-estoque"),
				CODIGO: $(this).find("option:selected").attr("data-codigo"),
				FINALIDADE: $(this).find("option:selected").attr("data-finalidade")
			}

			let txtTES = `	
 								<br><strong>Código: </strong>	${aDados.obj.CODIGO}
 								<strong>Descrição: </strong>	${aDados.obj.DESCRICAO}
 								<strong>CFOP: </strong>			${aDados.obj.CFOP}
 								<strong>Estoque: </strong>		${aDados.obj.ESTOQUE}
 								<strong>Finalidade: </strong>	${aDados.obj.FINALIDADE}`
			let message;

			if (aDados.obj.CODIGO != "") {
				message = "Confirma a aplicação da TES abaixo ";
				message += (aDados.obj.tipo == "produto" ? "ao produto <br><strong>" + aDados.obj.B1_COD + " | " + aDados.obj.B1_DESC + "</strong> do fornecedor <br><strong>" : " aos produtos do fornecedor <br><strong>")
				message += aDados.obj.A2_CGC + " | " + aDados.obj.A2_NOME + "</strong> ?" + txtTES
			} else {
				if (aDados.obj.tipo == "produto")
					message = "Confirma a limpeza da TES  ";
				message += "ao produto <br><strong>" + aDados.obj.B1_COD + " | " + aDados.obj.B1_DESC + "</strong> do fornecedor <br><strong>";
				message += aDados.obj.A2_CGC + " | " + aDados.obj.A2_NOME + "</strong> ?"
			}

			FLUIGC.message.confirm({
				message: message,
				title: 'TES',
				labelYes: 'Confirma',
				labelNo: 'Cancela'
			}, function (result, el, ev) {
				if (result) {
					tools.TES.gravaSelecao();
				} else {
					if (aDados.obj != undefined && aDados.obj.tipo == "produto") {
						tools.TES.selecao.limpezaCancelada()
					}
				}
			});
		},
		selecao: {
			limpezaCancelada() {
				let obj = aDados.obj;
				delete aDados.obj;

				let codigo = $("[name^=TES_A2_COD][value='" + obj.A2_COD + "']").closest("tr").find("[name^=TES_A2_LOJA][value='" + obj.A2_LOJA + "']").closest("tr").find("[name^=TES_B1_COD][value='" + obj.B1_COD + "']").closest("tr").find("[name^=TES_CODIGO]").val();

				if (codigo != "") {
					tools.TES.selecao.linha(obj.A2_CGC, obj.B1_COD, codigo)
				}
			},
			linha(A2_CGC, B1_COD, CODIGO) {
				$("[data-a2cgc=" + A2_CGC + "][data-b1cod=" + B1_COD + "]").val(CODIGO);
				$("[data-a2cgc=" + A2_CGC + "][data-b1cod=" + B1_COD + "]").addClass("preenchido")
			},
			todos() {
				$("[name^=TES_A2_CGC___]").toArray().forEach(function (el) {
					if (el.value != "" && $(el).closest("tr").find("[name^=TES_B1_COD___]").val() != "" && $(el).closest("tr").find("[name^=TES_CODIGO___]").val() != "") {
						tools.TES.selecao.linha(el.value, $(el).closest("tr").find("[name^=TES_B1_COD___]").val(), $(el).closest("tr").find("[name^=TES_CODIGO___]").val())
					}

				})
			}
		}

	},
	validacaoTecnica: {
		init: function () {
			tools.validacaoTecnica.carregaDados();
			if ([26, 76, 80, 105, 148].includes(WKNumState) && usuarioCompras) {
				tools.validacaoTecnica.habilitaAcoes();
				tools.validacaoTecnica.view.read();
			} else if (aDados.validacaoTecnica.associacoes.length > 0) {
				tools.validacaoTecnica.view.edit();
			}
			tools.validacaoTecnica.view.panel();
			$("#validacao_tecnica_necessaria").on("change", tools.validacaoTecnica.view.panel);
		},
		acoes: {
			adicionaAnexos: function () {
				let temp = $("#tmpl10").html();
				let html = Mustache.render(temp);
				FLUIGC.modal({
					title: 'Adiciona Anexo',
					content: html,
					id: 'fluig-Anexo',
					actions: [{
						'label': 'Fechar',
						'autoClose': true
					}]
				}, function (err, data) {
					if (!err) {
						$("[btn-adicionaAnexo]").on("click", function () {
							let file = tools.validacaoTecnica.anexos.uploadFile();
							tools.validacaoTecnica.carregaDados();
						})
					}
				});
			},
			associaAnexos: function () {
				let temp = $("#tmpl12").html();
				let html = Mustache.render(temp);
				tools.validacaoTecnica["modalAssociaAnexo"] = FLUIGC.modal({
					title: 'Associa Anexo',
					content: html,
					id: 'fluig-AssociaAnexo',
					size: 'full',
					actions: [{
						'label': 'Confirmar',
						'bind': 'btn-incluiAssociacao'
					}, {
						'label': 'Cancelar',
						'autoClose': true
					}]
				}, function (err, data) {
					if (!err) {
						$("[data-panel='edit'][btn-id='A2_CGC']").on("click", tools.validacaoTecnica.options.fornecedor)
						$("[data-panel='edit'][btn-id='B1_COD']").on("click", tools.validacaoTecnica.options.produto)
						$("[data-panel='edit'][btn-id='ANEXO_IDX']").on("click", tools.validacaoTecnica.options.anexo)

						$("[btn-incluiassociacao]").on("click", tools.validacaoTecnica.acoes.salvaAssociacao)
					}
				});
			},
			excluiAssociacao: function () {
				let idx = $(this).attr("data-idx");

				if (idx) {
					FLUIGC.message.confirm({
						message: 'Confirma a exclusão desta associação?',
						labelYes: 'Confirma',
						labelNo: 'Cancela'
					}, function (result, el, ev) {
						if (result) {
							fnWdkRemoveChild(document.getElementById("VT_A2CGC___" + idx));
							tools.validacaoTecnica.view.read();
						}
					});
				}
			},
			salvaAssociacao: function () {
				//console.log(this);
				let A2_CGC = $("[data-panel='edit'][data-id='A2_CGC']").val();
				let B1_COD = $("[data-panel='edit'][data-id='B1_COD']").val();
				let ANEXO_IDX = $("[data-panel='edit'][data-id='ANEXO_IDX']").val();
				let DETALHAMENTO_ANEXO = $("[data-id='DETALHAMENTO_ANEXO']").val();

				let txtErro = "";
				if (A2_CGC == "" || A2_CGC == undefined) {
					txtErro += "O campo Fornecedor é obrigatório! \n"
				}
				if ((ANEXO_IDX == "" || ANEXO_IDX == undefined) && (DETALHAMENTO_ANEXO == "" || DETALHAMENTO_ANEXO == undefined)) {
					txtErro += "O campo Anexo ou Detalhamento é obrigatório! \n"
				}

				if (txtErro == "") {
					let idx = wdkAddChild("tabValidacaoTecnica");
					$("#VT_A2CGC___" + idx).val(A2_CGC);
					$("#VT_B1COD___" + idx).val(B1_COD);
					$("#VT_FILEIDX___" + idx).val(ANEXO_IDX);
					$("#VT_DETALHAMENTO___" + idx).val(DETALHAMENTO_ANEXO);

					FLUIGC.toast({
						message: "Associação incluida com sucesso",
						type: 'success'
					});

					tools.validacaoTecnica.view.read();
					tools.validacaoTecnica["modalAssociaAnexo"].remove();
				} else {
					FLUIGC.toast({
						title: 'Erro: ',
						message: txtErro,
						type: 'danger'
					});
				}

			},
			salvaDecisao: function () {
				let A2_COD = $(this).attr("data-cod");
				let A2_LOJA = $(this).attr("data-loja");
				var A2_CGC = $(this).attr("data-cgc");
				let ACAO = $(this).attr("data-acao");

				if (ACAO == "ok") {
					$("[name^=VT_A2CGC___].form-control,[name^=_VT_A2CGC___].form-control").toArray()
						.forEach(function (file) {
							if ($(file).closest("tr").find("[name*='" + "VT_A2CGC" + "___']").val() == A2_CGC && $(file).closest("tr").find("[name*='" + "VT_EXECUTADA" + "___']").val() == "") {
								$(file).closest("tr").find("[name*='" + "VT_DECISAO" + "___']").val("APROVADO");
								$(file).closest("tr").find("[name*='" + "VT_DECISAOOBS" + "___']").val("");
								$(file).closest("tr").find("[name*='" + "VT_DATA_HORA" + "___']").val(new Date().toLocaleString("pt-br"));
							}
						})
					$("[name^=A2_CGC___].form-control[value='" + A2_CGC + "'],[name^=_A2_CGC___].form-control[value='" + A2_CGC + "']").toArray()
						.forEach(function (fornec) {
							$(fornec).closest("tr").find("[name*='" + "VALIDACAO_DECISAO" + "___']").val("true");
						})
					tools.fornecedores.carregaDados();
					tools.validacaoTecnica.view.edit();
				}
				else if (ACAO == "nok") {
					tools.validacaoTecnica["modalAssociaAnexo"] = FLUIGC.modal({
						title: 'Confirma reprovação',
						content: '<div class="row col-md-12 form-group"><label>Observação</label><textarea class="form-control" data-cgc="' + A2_CGC + '" id="DECISAOOBS" rows="5"></textarea></div>',
						id: 'fluig-confirmaReprova',
						size: 'full',
						actions: [{
							'label': 'Confirmar',
							'bind': 'btn-confirmaReprova'
						}, {
							'label': 'Cancelar',
							'autoClose': true
						}]
					}, function (err, data) {
						console.log(err, data);
						$("[btn-confirmareprova]").on("click", function () {
							let A2_CGC = $("#DECISAOOBS").attr("data-cgc");
							let OBS = $("#DECISAOOBS").val();

							$("[name^=VT_A2CGC___].form-control,[name^=_VT_A2CGC___].form-control").toArray()
								.forEach(function (file) {
									if ($(file).closest("tr").find("[name*='" + "VT_A2CGC" + "___']").val() == A2_CGC && $(file).closest("tr").find("[name*='" + "VT_EXECUTADA" + "___']").val() == "") {
										$(file).closest("tr").find("[name*='" + "VT_DECISAO" + "___']").val("REPROVADO");
										$(file).closest("tr").find("[name*='" + "VT_DECISAOOBS" + "___']").val(OBS);
										$(file).closest("tr").find("[name*='" + "VT_DATA_HORA" + "___']").val(new Date().toLocaleString("pt-br"));
									}
								})

							$("[name^=A2_CGC___].form-control[value='" + A2_CGC + "'],[name^=_A2_CGC___].form-control[value='" + A2_CGC + "']").toArray()
								.forEach(function (fornec) {
									$(fornec).closest("tr").find("[name*='" + "VALIDACAO_DECISAO" + "___']").val("false");
									$(fornec).closest("tr").find("[name*='" + "VALIDACAO_OBS" + "___']").val(OBS);
								})

							tools.fornecedores.carregaDados();
							tools.validacaoTecnica.view.edit();
							tools.validacaoTecnica["modalAssociaAnexo"].remove();
						})
					});
				}

				//tools.validacaoTecnica.view.edit();
			}
		},
		carregaDados: function () {
			aDados["validacaoTecnica"] = {};
			aDados.validacaoTecnica["files"] = $("[name^=FILE_DESCRIPTION___].form-control,[name^=_FILE_DESCRIPTION___].form-control").toArray().map(function (file) {
				return {
					"FILE_DESCRIPTION": $(file).closest("tr").find("[name*='" + "FILE_DESCRIPTION" + "___']").val(),
					"FILE_ID": $(file).closest("tr").find("[name*='" + "FILE_ID" + "___']").val(),
					"FILE_IDX": $(file).closest("tr").find("[name*='" + "FILE_IDX" + "___']").val()
				}
			});

			aDados.validacaoTecnica["associacoes"] = $("[name^=VT_A2CGC___].form-control,[name^=_VT_A2CGC___].form-control").toArray().map(function (file) {
				return {
					"idx": $(file).attr("id").split("___")[1],
					"VT_A2CGC": $(file).closest("tr").find("[name*='" + "VT_A2CGC" + "___']").val(),
					"VT_B1COD": $(file).closest("tr").find("[name*='" + "VT_B1COD" + "___']").val(),
					"VT_FILEIDX": $(file).closest("tr").find("[name*='" + "VT_FILEIDX" + "___']").val(),
					"FILE_DESCRIPTION": $(file).closest("tr").find("[name*='" + "VT_FILEIDX" + "___']").val() != "" ? aDados.validacaoTecnica.files.filter(function (f) { return f.FILE_IDX == $(file).closest("tr").find("[name*='" + "VT_FILEIDX" + "___']").val() })[0].FILE_DESCRIPTION : "",
					"FILE_ID": $(file).closest("tr").find("[name*='" + "VT_FILEIDX" + "___']").val() != "" ? aDados.validacaoTecnica.files.filter(function (f) { return f.FILE_IDX == $(file).closest("tr").find("[name*='" + "VT_FILEIDX" + "___']").val() })[0].FILE_ID : "",
					"VT_DETALHAMENTO": $(file).closest("tr").find("[name*='" + "VT_DETALHAMENTO" + "___']").val(),
					"VT_DECISAO": $(file).closest("tr").find("[name*='" + "VT_DECISAO" + "___']").val(),
					"VT_DECISAOOBS": $(file).closest("tr").find("[name*='" + "VT_DECISAOOBS" + "___']").val(),
					"VT_DATA_HORA": $(file).closest("tr").find("[name*='" + "VT_DATA_HORA" + "___']").val(),
					"exibeFile": $(file).closest("tr").find("[name*='" + "VT_FILEIDX" + "___']").val() != "",
					"exibeDetalhe": $(file).closest("tr").find("[name*='" + "VT_DETALHAMENTO" + "___']").val() != "",
					"exibeExcluir": $(file).closest("tr").find("[name*='" + "VT_EXECUTADA" + "___']").val() == "" && [26, 76, 80, 105, 148].includes(WKNumState),
					"APROVADO": $(file).closest("tr").find("[name*='" + "VT_DECISAO" + "___']").val() == "APROVADO",
					"REPROVADO": $(file).closest("tr").find("[name*='" + "VT_DECISAO" + "___']").val() == "REPROVADO",
					"exibeDecisao": $(file).closest("tr").find("[name*='" + "VT_DECISAO" + "___']").val() != ""
				}
			});

			aDados.validacaoTecnica["fornecedores"] = aDados.fornecedores
				.filter(function (el) { return aDados.validacaoTecnica["associacoes"].filter(function (a) { return el.A2_CGC == a.VT_A2CGC }).length > 0 })
				.map(function (el) {
					return {
						"A2_COD": el.A2_COD,
						"A2_LOJA": el.A2_LOJA,
						"A2_NOME": el.A2_NOME.trim(),
						"A2_CGC": el.A2_CGC,
						"A2_EST": el.A2_EST,
						"APROVADO": el.VALIDACAO_DECISAO == "true",
						"REPROVADO": el.VALIDACAO_DECISAO == "false",
						"MSGREPROV": el.VALIDACAO_OBS,
						"associacoes": aDados.validacaoTecnica.associacoes.filter(function (a) { return a.VT_A2CGC == el.A2_CGC && a.VT_B1COD == "" }),
						"produtos": aDados.produtos.map(function (p) {
							return {
								"B1_COD": p.B1_COD,
								"B1_DESC": p.B1_DESC,
								"associacoes": aDados.validacaoTecnica.associacoes.filter(function (a) { return a.VT_A2CGC == el.A2_CGC && a.VT_B1COD == p.B1_COD })
							}
						}).filter(function (p) { return p.associacoes.length > 0 })
					}
				}
				)
				.filter(function (el) { return el.associacoes.length > 0 || el.produtos.length > 0 })
		},
		view: {
			edit() {
				tools.validacaoTecnica.carregaDados()
				if (aDados.validacaoTecnica.fornecedores.length > 0) {
					let temp = $("#tmpl13").html();
					let html = Mustache.render(temp, aDados.validacaoTecnica.fornecedores);
					$("#tabValidacaoTecnica").html(html);
					$("[file-id]").on("click", tools.validacaoTecnica.anexos.abre);
					$("[data-validafornecedor]").on("click", tools.validacaoTecnica.acoes.salvaDecisao);
				}
			},
			read() {
				tools.validacaoTecnica.carregaDados()
				if (aDados.validacaoTecnica.fornecedores.length > 0) {
					let temp = $("#tmpl13").html();
					let html = Mustache.render(temp, aDados.validacaoTecnica.fornecedores);
					$("#tabValidacaoTecnica").html(html);
					$("[file-id]").on("click", tools.validacaoTecnica.anexos.abre);
					$(".delAssocValid").on("click", tools.validacaoTecnica.acoes.excluiAssociacao);
				}

			},
			panel() {
				if ($("[name*=validacao_tecnica_necessaria]:checked").val() == "true") {
					$("#panelValidacaoTecnica").show()
				} else {
					$("#panelValidacaoTecnica").hide()
				}
			}
		},
		habilitaAcoes: function () {
			$("#btnAdicionaAnexos").removeClass("hide").on("click", tools.validacaoTecnica.acoes.adicionaAnexos);
			$("#btnAssociaAnexos").removeClass("hide").on("click", tools.validacaoTecnica.acoes.associaAnexos);
		},
		anexos: {
			abre: function () {
				tools.validacaoTecnica.anexos.openAttachment($(this).attr("file-id"))
			},
			recuperaId: function (documentDescription) {
				let dsAttach = DatasetFactory.getDataset(
					"processAttachment",
					["documentId"],
					[
						DatasetFactory.createConstraint("processAttachmentPK.attachmentSequence", "1", "1", ConstraintType.MUST_NOT),
						DatasetFactory.createConstraint("processAttachmentPK.processInstanceId", $("#numeroSolicitacao,#_numeroSolicitacao").val(), $("#numeroSolicitacao,#_numeroSolicitacao").val(), ConstraintType.MUST)
					],
					["documentId"]
				)

				if (dsAttach.values != undefined && dsAttach.values.length > 0) {
					let c = [DatasetFactory.createConstraint("documentDescription", documentDescription, documentDescription, ConstraintType.MUST)]
					dsAttach.values.forEach(function (at) {
						c.push(DatasetFactory.createConstraint("documentPK.documentId", at.documentId, at.documentId, ConstraintType.SHOULD))
					})
					let dsDoc = DatasetFactory.getDataset("document", null, c, ["documentPK.documentId"])
					return dsDoc.values[dsDoc.values.length - 1]["documentPK.documentId"];
				}
				return "";
			},
			uploadFile: function () { /*  FUNÇÃO DE UPLOAD */
				try {
					var fileDescription = $("[data-fileDescription]").val();
					var idInput = $("[data-fileDescription]").val();
					if (fileDescription != "") {
						var tabAttachments = parent.document.getElementById('tab-attachments');
						if (tabAttachments) {
							var tim = new Date().getTime().toString();
							//Verifica se o navegador é o Ie9 para realizar o devido tratamento
							if (parent.WCMAPI.isIe9()) {
								$('.ecm-navigation-silverlight', parent.document).show('fade').css('top', 0);
								$('#ecm-navigation-silverlight', parent.document).attr({
									'data-on-camera': 'true',
									'data-file-name-camera': fileDescription + "_" + tim,
								});
								$(parent.document).on('keyup', this.actionKeyup);
							} else {
								var element = parent.document.getElementById('ecm-navigation-inputFile-clone');
								if (element && document.createEvent) {
									element.setAttribute('data-on-camera', 'true');
									if (fileDescription && idInput) {
										element.setAttribute('data-file-name-camera', fileDescription + "_" + tim);
									}
									//Realiza o click no botão "Carregar arquivos" que tem na aba de anexos
									element.click();
								}
							}
							let idx = wdkAddChild("tabAnexosValidacao");
							$("#FILE_DESCRIPTION___" + idx).val(fileDescription);
							$("#FILE_NAME___" + idx).val(fileDescription);
							$("#FILE_IDX___" + idx).val(tim);

							$("[data-fileDescription]").val("");
						}
					} else {
						FLUIGC.toast({
							message: 'É necessário inserir uma descrição para o anexo',
							type: 'danger'
						});
					}

				} catch (e) {
					console.error('Houve um erro inesperado na função uploadFile');
					console.error(e);
				}
			},
			openAttachment: function (docId) {
				parent.ECM.documentView = {};
				var cfg = {
					url: "/ecm_documentview/documentView.ftl",
					width: 750,
					height: 500,
					maximized: true,
					showbtclose: false,
					title: "Visualização de Documento",
					callBack: function () {
						parent.ECM.documentView.getDocument(docId, "1000")
					},
					customButtons: []
				};
				parent.ECM.documentView.panel = parent.WCMC.panel(cfg);
				parent.ECM.documentView.panel.bind("panel-close", function () {
					parent.ECM.documentView.hideIFrame();
					if (parent.ECM.documentView.toUndefined == undefined || parent.ECM.documentView.toUndefined) {
						parent.ECM.documentView = undefined
					}
				})
			}
		},
		options: {
			anexo: function () {
				tools.validacaoTecnica["modalSelecionaAnexo"] = FLUIGC.modal({
					title: 'Selecionar Anexo',
					content: `
 						        <table class="table table-striped" id="modAnexo">
 					        	<thead>
 					        		<th>FILE_DESCRIPTION</th>
 					        		<th>FILE_IDX</th>
 					        	</thead>
 					        	<tbody>
 					        		<td></td>
 					        		<td></td>
 					        	</tbody>
 					        </table>
 					        `,
					id: 'fluig-modalSelecionaAnexo'
				}, function (err, data) {
					if (!err) {
						$("#modAnexo").DataTable({
							data: aDados.validacaoTecnica.files,
							columns: [
								{ data: "FILE_DESCRIPTION" },
								{ data: "FILE_IDX", visible: false }
							],
							createdRow: function (row, data, dataIndex) {
								$(row).attr('data-FILE_DESCRIPTION', data.FILE_DESCRIPTION);
								$(row).attr('data-FILE_IDX', data.FILE_IDX);
								$(row).on("click", function () {
									let FILE_DESCRIPTION = $(this).attr("data-FILE_DESCRIPTION");
									let FILE_IDX = $(this).attr("data-FILE_IDX");

									$("[data-panel='edit'][data-id='ANEXO_DESC']").val(FILE_DESCRIPTION);
									$("[data-panel='edit'][data-id='ANEXO_IDX']").val(FILE_IDX);

									tools.validacaoTecnica.modalSelecionaAnexo.remove();

								})
							}
						})

					}
				})
			},
			fornecedor: function () {
				tools.validacaoTecnica["modalSelecionaFornecedor"] = FLUIGC.modal({
					title: 'Selecionar Fornecedor',
					content: `
 						        <table class="table table-striped" id="modFornecedor">
 					        	<thead>
 					        		<th>Código</th>
 					        		<th>Loja</th>
 					        		<th>CNPJ</th>
 					        		<th>Nome</th>
 					        	</thead>
 					        	<tbody>
 					        		<td></td>
 					        		<td></td>
 					        		<td></td>
 					        		<td></td>
 					        	</tbody>
 					        </table>
 					        `,
					id: 'fluig-modalSelecionaFornecedor'
				}, function (err, data) {
					if (!err) {
						$("#modFornecedor").DataTable({
							data: fluigMapa.fornecedores.filter(function (el) { return el.A2_COND != "" }),
							columns: [
								{ data: "A2_COD" },
								{ data: "A2_LOJA" },
								{ data: "A2_CGC" },
								{ data: "A2_NOME" },
								{ data: "A2_EST" }
							],
							createdRow: function (row, data, dataIndex) {
								$(row).attr('data-cgc', data.A2_CGC);
								$(row).attr('data-cod', data.A2_COD);
								$(row).attr('data-loja', data.A2_LOJA);
								$(row).attr('data-nome', data.A2_NOME);
								$(row).attr('data-uf', data.A2_EST);
								$(row).on("click", function () {
									let cgc = $(this).attr("data-cgc");
									let cod = $(this).attr("data-cod");
									let loja = $(this).attr("data-loja");
									let nome = $(this).attr("data-nome");
									let uf = $(this).attr("data-uf");

									$("[data-panel='edit'][data-id='B1_DESC']").val("");
									$("[data-panel='edit'][data-id='A2_NOME']").val(nome);
									$("[data-panel='edit'][data-id='A2_CGC']").val(cgc);
									$("[data-panel='edit'][data-id='A2_COD']").val(cod);
									$("[data-panel='edit'][data-id='A2_LOJA']").val(loja);
									$("[data-panel='edit'][data-id='A2_EST']").val(uf);

									tools.validacaoTecnica.modalSelecionaFornecedor.remove();

								})
							}
						})

					}
				})
			},
			produto: function () {
				let A2_COD = $("[data-panel='edit'][data-id='A2_COD']").val();
				let A2_LOJA = $("[data-panel='edit'][data-id='A2_LOJA']").val();
				if (A2_COD != undefined && A2_COD != "") {
					let ciclo_atual = $("#ciclo_atual").val();
					tools.cotacao.carregaDados();
					let produtos = fluigMapa.produtos.filter(function (el) { return aDados.cotacoes.filter(function (cot) { return cot.C8_CICLO == ciclo_atual && cot.C8_PRODUTO.substring(0, 8) == el.B1_COD && cot.C8_FORNECE == A2_COD && cot.C8_LOJA == A2_LOJA }).length > 0 })
					tools.validacaoTecnica["modalSelecionaProduto"] = FLUIGC.modal({
						title: 'Selecionar Produto',
						content: `
 	 						        <table class="table table-striped" id="modProduto">
 	 					        	<thead>
 	 					        		<th>Código</th>
 	 					        		<th>Descrição</th>
 	 					        	</thead>
 	 					        	<tbody>
 	 					        		<td></td>
 	 					        		<td></td>
 	 					        	</tbody>
 	 					        </table>
 	 					        `,
						id: 'fluig-modalSelecionaProduto'
					}, function (err, data) {
						if (!err) {
							$("#modProduto").DataTable({
								data: produtos,
								columns: [
									{ data: "B1_COD" },
									{ data: "B1_DESC" }
								],
								createdRow: function (row, data, dataIndex) {
									$(row).attr('data-cod', data.B1_COD);
									$(row).attr('data-desc', data.B1_DESC);
									$(row).on("click", function () {
										let cod = $(this).attr("data-cod");
										let desc = $(this).attr("data-desc");
										$("[data-panel='edit'][data-id='B1_COD']").val(cod);
										$("[data-panel='edit'][data-id='B1_DESC']").val(desc);

										tools.validacaoTecnica.modalSelecionaProduto.remove();

									})
								}
							})

						}
					})
				} else {
					FLUIGC.toast({
						message: 'É necessário selecionar o fornecedor antes de selecionar o produto',
						type: 'danger'
					});
				}
			}
		}
	},
	validacaoTecnicaOld: {
		init() {
			tools.validacaoTecnica.carregaDados();

			let temp = $("#tmpl4").html();
			let html = Mustache.render(temp, aDados.validacaoTecnica.fornecedores);
			$("#tabValidacaoTecnica").html(html);

			$("[data-validaItem]").on("click", tools.validacaoTecnica.validaItem);
			$("[data-validaFornecedor]").on("click", tools.validacaoTecnica.validaFornecedor);

		},
		carregaDados() {
			aDados["validacaoTecnica"] = {};
			aDados["validacaoTecnica"]["fornecedores"] = tools.validacaoTecnica.carregaFornecedores();
			aDados["validacaoTecnica"]["produtosPai"] = tools.validacaoTecnica.carregaProdutosPai();
			aDados["validacaoTecnica"]["produtosFilho"] = tools.validacaoTecnica.carregaProdutosFilho();
			aDados["validacaoTecnica"]["produtosCotacoes"] = tools.validacaoTecnica.carregaProdutosCotacoes();

			tools.validacaoTecnica.processaDados();
		},
		carregaFornecedores() {
			var obj = [];
			$("[name^=_A2_COD___]").each((idx, el) => {
				obj.push({
					A2_COD: $(el).val(),
					A2_LOJA: $(el).closest("tr").find("[name^=_A2_LOJA___]").val(),
					A2_NOME: $(el).closest("tr").find("[name^=_A2_NOME___]").val(),
					A2_CGC: $(el).closest("tr").find("[name^=_A2_CGC___]").val(),
					A2_EST: $(el).closest("tr").find("[name^=_A2_EST___]").val()
				})
			});
			return obj;
		},
		carregaProdutosCotacoes() {
			var obj = [];
			$("[name^=_C8_PRECO___]").not("[value='']").each(function (idx, el) {
				if ($(el).closest("tr").find("[name^=_C8_CICLO___]").val() == $("#ciclo_atual,#_ciclo_atual").val()) {
					obj.push({
						idx: el.id.split("___")[1],
						C8_PRODUTO: $(el).closest("tr").find("[name^=_C8_PRODUTO___]").val().trim(),
						C8_FORNECE: $(el).closest("tr").find("[name^=_C8_FORNECE___]").val(),
						C8_LOJA: $(el).closest("tr").find("[name^=_C8_LOJA___]").val(),
						C8_QUANT: $(el).closest("tr").find("[name^=_C8_QUANT___]").val(),
						valid: $(el).closest("tr").find("[name*=VALIDACAO_TECNICA___]").val() == "true",
						nValid: $(el).closest("tr").find("[name*=VALIDACAO_TECNICA___]").val() == "false",
						MARCA: aDados.validacaoTecnica.produtosFilho.filter(function (pF) { return pF.B1_COD == $(el).closest("tr").find("[name^=_C8_PRODUTO___]").val().trim() })[0]["ZPM_DESC"]
					})
				}
			})
			return obj;
		},
		carregaProdutosFilho() {
			var obj = [];
			$("[name^=_B1_PAI___]").not("[value='']").each(function (idx, el) {
				if ($(el).closest("tr").find("[name^=_B1_COD___]").val() != undefined) {
					obj.push({
						B1_COD: $(el).closest("tr").find("[name^=_B1_COD___]").val(),
						B1_DESC: $(el).closest("tr").find("[name^=_B1_DESC___]").val(),
						B1_PAI: $(el).closest("tr").find("[name^=_B1_PAI___]").val(),
						B1_ZMARCA: $(el).closest("tr").find("[name^=_B1_ZMARCA___]").val(),
						ZPM_DESC: $(el).closest("tr").find("[name^=_ZPM_DESC___]").val()
					})
				}
			})
			return obj;
		},
		carregaProdutosPai() {
			var obj = [];
			$("[name^=_B1_PAI___][value='']").each(function (idx, el) {
				if ($(el).closest("tr").find("[name^=_B1_COD___]").val() != undefined) {
					obj.push({
						B1_COD: $(el).closest("tr").find("[name^=_B1_COD___]").val(),
						B1_DESC: $(el).closest("tr").find("[name^=_B1_DESC___]").val(),
						QTD: $("[name^=_codigoProduto___][value='" + $(el).closest("tr").find("[name^=_B1_COD___]").val() + "']").closest("tr").find("[name^=_produto_qtd___]").val()
					})
				}
			})
			return obj;
		},
		processaDados() {
			aDados.validacaoTecnica.fornecedores.forEach(function (f) {
				let arrCotacao = aDados.validacaoTecnica.produtosCotacoes.filter(function (c) { return c.C8_FORNECE == f.A2_COD && c.C8_LOJA == f.A2_LOJA })
				if (arrCotacao.length > 0) {
					f["produtos"] = [];
					aDados.validacaoTecnica.produtosPai.filter(function (pP) { return arrCotacao.filter(function (a) { return a.C8_PRODUTO.substring(0, 8) == pP.B1_COD }).length > 0 }).forEach(function (el) {
						f["produtos"].push({
							B1_COD: el.B1_COD,
							B1_DESC: el.B1_DESC,
							QTD: el.QTD
						})
					});

					f.produtos.forEach(function (p) {
						p["cotacoes"] = arrCotacao.filter(function (aC) { return aC.C8_PRODUTO.substring(0, 8) == p.B1_COD })
					})
				}
			})
		},
		validaItem() {
			let idx = $(this).attr("data-index");
			let valid = $(this).attr("data-acao") == "ok";
			$("#VALIDACAO_TECNICA___" + idx).val(valid);
			$("#RESP_VALIDACAO___" + idx).val(usuarioAtual);

			tools.validacaoTecnica.init();
		},
		validaFornecedor() {
			let cod = $(this).attr("data-cod");
			let loja = $(this).attr("data-loja");
			let valid = $(this).attr("data-acao") == "ok";

			var fornecFilter = aDados.validacaoTecnica.fornecedores.filter(function (el) { return el.A2_COD == cod && el.A2_LOJA == loja });

			fornecFilter.forEach(function (el) {
				el.produtos.forEach(function (p) {
					p.cotacoes.forEach(function (c) {
						$("#VALIDACAO_TECNICA___" + c.idx).val(valid);
						$("#RESP_VALIDACAO___" + c.idx).val(usuarioAtual);
					})
				})
			})


			tools.validacaoTecnica.init();
		}
	},
	validaUPRC: function (B1_UCOM, B1_UPRC, el) {
		if (el.B1_UCOM.trim() != "") {
			if (el.B1_UCOM.substring(6) + el.B1_UCOM.substring(3, 5) + el.B1_UCOM.substring(0, 2) > B1_UCOM.substring(6) + B1_UCOM.substring(3, 5) + B1_UCOM.substring(0, 2)) {
				return {
					B1_UCOM: el.B1_UCOM,
					B1_UPRC: el.B1_UPRC
				}
			}
		}
		return {
			B1_UCOM: B1_UCOM,
			B1_UPRC: B1_UPRC
		}
	}
}