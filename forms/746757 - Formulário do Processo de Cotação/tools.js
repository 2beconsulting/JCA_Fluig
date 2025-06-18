var tools = {
	aDadosCot: {

		fornecedores: [],
		produtos: [],
		TES: []
	},
	fornecedores: {
		carregaDados: function () {
			aDados["fornecedores"] = [];

			$("[name^=A2_COD___].form-control,[name^=_A2_COD___].form-control").not("[value=''],[value='0.00']").each((e, it) => {
				aDados.fornecedores.push({
					A2_COD: $(it).closest("tr").find("[name*=A2_COD___]").val(),
					A2_LOJA: $(it).closest("tr").find("[name*=A2_LOJA___]").val(),
					A2_NOME: $(it).closest("tr").find("[name*=A2_NOME___]").val(),
					A2_CGC: $(it).closest("tr").find("[name*=A2_CGC___]").val(),
					A2_EST: $(it).closest("tr").find("[name*=A2_EST___]").val(),
					ATIVO: $(it).closest("tr").find("[name*=CICLO_REMOVIDO___]").val() == "",
					CICLO_REMOV: $(it).closest("tr").find("[name*=CICLO_REMOVIDO___]").val()
				})
			});

			aDados["fornecedoresAtivo"] = aDados["fornecedores"].filter(function (el) { return el.ATIVO })
		}
	},
	mapa: {
		atualizaComplemento: function () {
			let complemento = [];
			let filtrar = $("[name=filtrar_mapa]:checked").val();

			if (filtrar == "fornecedor") {
				complemento.push({
					id: "",
					text: "Selecione"
				})
				aDados.fornecedores.forEach(function (el) {
					complemento.push({
						id: el.A2_COD + "|" + el.A2_LOJA,
						text: el.A2_NOME
					})
				})

			}
			else if (filtrar == "produto") {
				complemento.push({
					id: "",
					text: "Selecione"
				})
				aDados.produtos.forEach(function (el) {
					complemento.push({
						id: el.B1_COD,
						text: el.B1_DESC
					})
				})
			}

			$("#complem_mapa").empty()
			$("#complem_mapa").select2({
				data: complemento
			})
		},
		carregaDados: function () {
			aDados.condPagto = DatasetFactory.getDataset("DS_CONDICAO_PAGAMENTO", null, null, null).values;

			var ds = DatasetFactory.getDataset(
				"DS_CONSULTA_AUXILIAR_COTACAO",
				null,
				[
					DatasetFactory.createConstraint("S_COTACAO", $("#numeroSolicitacao").val(), $("#numeroSolicitacao").val(), ConstraintType.MUST),
					DatasetFactory.createConstraint("IDEMPRESA", $("#idEmpresa").val(), $("#idEmpresa").val(), ConstraintType.MUST),
					DatasetFactory.createConstraint("S_COMPRA", $("#solicitacao_compra").val(), $("#solicitacao_compra").val(), ConstraintType.MUST)
				],
				null
			)

			if (ds != null && ds.values.length > 0) {
				for (var i = 0; i < ds.values.length; i++) {
					var valor = ds.values[i].C8_PRECO.trim();
					if (valor != "" && valor != null
						&& valor != "0.00"
						&& valor != "0"
						&& valor != "0,00") {

						let filtProd = aDados.produtos.filter(function (prd) { return prd.C8_PRODUTO == ds.values[i].C8_PRODUTO.trim().substring(0, 8) })
						let B1_ZMARCA = filtProd.length > 0 ? filtProd[0]["B1_ZMARCA"] : "";
						let ZPM_DESC = filtProd.length > 0 ? filtProd[0]["ZPM_DESC"] : "";
						let condPagto = aDados.condPagto.filter(function (cP) { return cP.CODIGO == ds.values[i].C8_COND })
						let filtFornec = aDados.fornecedores.filter(function (e) { return e.A2_COD == ds.values[i].C8_FORNECE && e.A2_LOJA == ds.values[i].C8_LOJA })

						if (filtFornec.length > 0) {
							aDados.cotacoes.push({
								C8_CICLO: ds.values[i].C8_CICLO,
								C8_ITEM: ds.values[i].C8_ITEM,
								C8_PRODUTO: ds.values[i].C8_PRODUTO.trim().substring(0, 8),
								C1_DESCRI: aDados.produtos.filter(function (e) { return e.B1_COD == ds.values[i].C8_PRODUTO.trim().substring(0, 8) })[0]["B1_DESC"],
								C8_UM: ds.values[i].C8_UM,
								C8_FORNECE: ds.values[i].C8_FORNECE,
								C8_LOJA: ds.values[i].C8_LOJA,
								A2_NOME: filtFornec[0]["A2_NOME"],
								C8_QUANT: ds.values[i].C8_QUANT,
								C8_PRECO: ds.values[i].C8_PRECO,
								C8_TOTAL: ds.values[i].C8_TOTAL,
								C8_COND: ds.values[i].C8_COND,
								condPagto: "" + condPagto.length > 0 ? condPagto[0]["DESCRICAO"] : "",
								C8_PRAZO: ds.values[i].C8_PRAZO,
								C8_FILENT: ds.values[i].C8_FILENT,
								C8_EMISSAO: ds.values[i].C8_EMISSAO,
								C8_VALIPI: ds.values[i].C8_VALIPI,
								C8_VALICM: ds.values[i].C8_VALICM,
								C8_VALISS: ds.values[i].C8_VALISS,
								C8_DIFAL: ds.values[i].C8_DIFAL,
								C8_VALSOL: ds.values[i].C8_VALSOL,
								C8_SEGURO: ds.values[i].C8_SEGURO,
								C8_DESPESA: ds.values[i].C8_DESPESA,
								C8_VALFRE: ds.values[i].C8_VALFRE,
								C8_TPFRETE: ds.values[i].C8_TPFRETE,
								C8_VALIDA: ds.values[i].C8_VALIDA,
								C8_NUMPED: ds.values[i].C8_NUMPED,
								C8_ITEMPED: ds.values[i].C8_ITEMPED,
								B1_ZMARCA: B1_ZMARCA,
								ZPM_DESC: ZPM_DESC
							})
						}
					}
				}
			}

			/*			$("[name^=_C8_PRODUTO___]").each((i,el)=>{
							//console.log(i,el)
							if(!["","0.00","0","null"].includes($(el).closest("tr").find("[name*=C8_PRECO___]").val())){
								let filtProd = aDados.produtos.filter(function(prd){return prd.C8_PRODUTO == $(el).closest("tr").find("[name*="+"C8_PRODUTO"+"___]").val().trim().substring(0,8)})
								let B1_ZMARCA 	= filtProd.length > 0 ? filtProd[0]["B1_ZMARCA"] : "";
								let ZPM_DESC 	= filtProd.length > 0 ? filtProd[0]["ZPM_DESC"] : "";
								let condPagto = aDados.condPagto.filter(function(cP){return cP.CODIGO == $(el).closest("tr").find("[name*=C8_COND___]").val()})
								let filtFornec	= aDados.fornecedores.filter(function(e){return e.A2_COD == $(el).closest("tr").find("[name*="+"C8_FORNECE"+"___]").val() && e.A2_LOJA == $(el).closest("tr").find("[name*="+"C8_LOJA"+"___]").val()})
								
								if(filtFornec.length > 0){
									aDados.cotacoes.push({
										C8_CICLO		: $(el).closest("tr").find("[name*="+"C8_CICLO"+"___]").val(),
										C8_ITEM			: $(el).closest("tr").find("[name*="+"C8_ITEM"+"___]").val(),
										C8_PRODUTO		: $(el).closest("tr").find("[name*="+"C8_PRODUTO"+"___]").val().trim().substring(0,8),
										C1_DESCRI		: aDados.produtos.filter(function(e){return e.B1_COD == $(el).closest("tr").find("[name*="+"C8_PRODUTO"+"___]").val().trim().substring(0,8)})[0]["B1_DESC"],
										C8_UM			: $(el).closest("tr").find("[name*="+"C8_UM"+"___]").val(),
										C8_FORNECE		: $(el).closest("tr").find("[name*="+"C8_FORNECE"+"___]").val(),
										C8_LOJA			: $(el).closest("tr").find("[name*="+"C8_LOJA"+"___]").val(),
										A2_NOME			: filtFornec[0]["A2_NOME"],
										C8_QUANT		: $(el).closest("tr").find("[name*="+"C8_QUANT"+"___]").val(),
										C8_PRECO		: $(el).closest("tr").find("[name*="+"C8_PRECO"+"___]").val(),
										C8_TOTAL		: $(el).closest("tr").find("[name*="+"C8_TOTAL"+"___]").val(),
										C8_COND			: $(el).closest("tr").find("[name*="+"C8_COND"+"___]").val(),
										condPagto		: "" + condPagto.length > 0 ? condPagto[0]["DESCRICAO"] : "",
										C8_PRAZO		: $(el).closest("tr").find("[name*="+"C8_PRAZO"+"___]").val(),
										C8_FILENT		: $(el).closest("tr").find("[name*="+"C8_FILENT"+"___]").val(),
										C8_EMISSAO		: $(el).closest("tr").find("[name*="+"C8_EMISSAO"+"___]").val(),
										C8_VALIPI		: $(el).closest("tr").find("[name*="+"C8_VALIPI"+"___]").val(),
										C8_VALICM		: $(el).closest("tr").find("[name*="+"C8_VALICM"+"___]").val(),
										C8_VALISS		: $(el).closest("tr").find("[name*="+"C8_VALISS"+"___]").val(),
										C8_DIFAL		: $(el).closest("tr").find("[name*="+"C8_DIFAL"+"___]").val(),
										C8_VALSOL		: $(el).closest("tr").find("[name*="+"C8_VALSOL"+"___]").val(),
										C8_SEGURO		: $(el).closest("tr").find("[name*="+"C8_SEGURO"+"___]").val(),
										C8_DESPESA		: $(el).closest("tr").find("[name*="+"C8_DESPESA"+"___]").val(),
										C8_VALFRE		: $(el).closest("tr").find("[name*="+"C8_VALFRE"+"___]").val(),
										C8_TPFRETE		: $(el).closest("tr").find("[name*="+"C8_TPFRETE"+"___]").val(),
										C8_VALIDA		: $(el).closest("tr").find("[name*="+"C8_VALIDA"+"___]").val(),
										C8_NUMPED		: $(el).closest("tr").find("[name*="+"C8_NUMPED"+"___]").val(),
										C8_ITEMPED		: $(el).closest("tr").find("[name*="+"C8_ITEMPED"+"___]").val(),
										B1_ZMARCA		: B1_ZMARCA,
										ZPM_DESC		: ZPM_DESC
									})
								}	
							}
						});*/

			aDados.produtos.forEach(function (el) {
				el["cotacoes"] = aDados.cotacoes.filter(function (ele) { return ele.C8_PRODUTO.trim() == el.B1_COD })
				el["qtdCotacoes"] = el["cotacoes"].length;
				el["qtdFornecedores"] = aDados.fornecedores.length;

				if (el["cotacoes"].length > 0) {
					tools.aDadosCot.produtos.push(el)
				}

			});

			aDados.fornecedores.forEach(function (el) {
				el["cotacoes"] = aDados.cotacoes.filter(function (ele) { return ele.C8_FORNECE == el.A2_COD && ele.C8_LOJA == el.A2_LOJA });
				el["qtdCotacoes"] = el["cotacoes"].length;
				el["qtdProdutos"] = aDados.produtos.length;

				if (el["cotacoes"].length > 0) {
					tools.aDadosCot.fornecedores.push(el)
				}
			});

			//Esta parte foi inserida para utilizar apenas com os templates tmpl3 e tmpl4, caso volte a usar os templates tmpl1 e tmpl2, este bloco deve ser comentado
			aDados.produtos.sort(function (a, b) { return b.qtdCotacoes - a.qtdCotacoes })
			aDados.fornecedores.sort(function (a, b) { return b.qtdCotacoes - a.qtdCotacoes })
		},
		carregaMapa: function () {
			let filtrar = $("[name=filtrar_mapa]:checked").val();
			let complemento = $("#complem_mapa").val();
			if (filtrar == "fornecedor") {
				let A2_COD = complemento.split("|")[0];
				let A2_LOJA = complemento.split("|")[1];
				let mapa = aDados.fornecedores.filter(function (el) { return complemento == "" || (el.A2_COD == A2_COD && el.A2_LOJA == A2_LOJA) })
				if (mapa.length > 0) {
					let temp = $("#tmpl3").html();
					let html = Mustache.render(temp, mapa);
					$("#tabMapa").html(html);
				}
				return
			}
			else if (filtrar == "produto") {
				let mapa = aDados.produtos.filter(function (el) { return complemento == "" || el.B1_COD.trim() == complemento })
				if (mapa.length > 0) {
					let temp = $("#tmpl4").html();
					let html = Mustache.render(temp, mapa);
					$("#tabMapa").html(html);
				}
				return
			}
			$("#tabMapa").html("");

		},
		carregaMapa_old: function () {
			let filtrar = $("[name=filtrar_mapa]:checked").val();
			let complemento = $("#complem_mapa").val();
			if (filtrar == "fornecedor") {
				let A2_COD = complemento.split("|")[0];
				let A2_LOJA = complemento.split("|")[1];
				let mapa = aDados.fornecedores.filter(function (el) { return complemento == "" || (el.A2_COD == A2_COD && el.A2_LOJA == A2_LOJA) })
				if (mapa.length > 0) {
					let temp = $("#tmpl1").html();
					let html = Mustache.render(temp, mapa);
					$("#tabMapa").html(html);
				}
				return
			}
			else if (filtrar == "produto") {
				let mapa = aDados.produtos.filter(function (el) { return complemento == "" || el.B1_COD.trim() == complemento })
				if (mapa.length > 0) {
					let temp = $("#tmpl2").html();
					let html = Mustache.render(temp, mapa);
					$("#tabMapa").html(html);
				}
				return
			}
			$("#tabMapa").html("");

		},
		habilita: function () {
			tools.mapa.carregaDados();
			$("[name=filtrar_mapa]").on("change", tools.mapa.atualizaComplemento)
			$("[btn-filtrar]").on("click", tools.mapa.carregaMapa)
		}
	},
	produtos: {
		carrega: function () {
			aDados["produtos"] = [];
			let filhos = [];

			$("[name^=_B1_COD___]").each((e, it) => {
				if ($(it).closest("tr").find("[name^=_" + "B1_PAI" + "___]").val() == "") {
					aDados.produtos.push({
						B1_COD: $(it).closest("tr").find("[name^=_" + "B1_COD" + "___]").val(),
						B1_DESC: $(it).closest("tr").find("[name^=_" + "B1_DESC" + "___]").val(),
						FILHOS: $("[name^=_B1_COD___]").toArray().filter(function (prod) { return $(prod).closest("tr").find("[name^=_B1_PAI___]").val() == $(it).closest("tr").find("[name^=_" + "B1_COD" + "___]").val() }).map(function (prod) {
							return {
								"B1_COD": $(prod).closest("tr").find("[name^=_" + "B1_COD" + "___]").val(),
								"B1_DESC": $(prod).closest("tr").find("[name^=_" + "B1_DESC" + "___]").val(),
								"B1_ZMARCA": $(prod).closest("tr").find("[name^=_" + "B1_ZMARCA" + "___]").val(),
								"ZPM_DESC": $(prod).closest("tr").find("[name^=_" + "ZPM_DESC" + "___]").val()
							}
						})
					})
				}
			});
			/*
			$("[name*=B1_PAI___]").not("[value='']").each(function(idx,el){
				if($(el).closest("tr").find("[name*=B1_COD___]").val() != undefined){
					filhos.push({
							B1_COD 		: $(el).closest("tr").find("[name*=B1_COD___]").val().trim(),
							B1_DESC 	: $(el).closest("tr").find("[name*=B1_DESC___]").val(),
							B1_PAI 		: $(el).closest("tr").find("[name*=B1_PAI___]").val().trim(),
							B1_ZMARCA 	: $(el).closest("tr").find("[name*=B1_ZMARCA___]").val(),
							ZPM_DESC 	: $(el).closest("tr").find("[name*=ZPM_DESC___]").val(),
							B1_UPRC		: $(el).closest("tr").find("[name*=B1_UPRC___]").val() != "" ? parseFloat($(el).closest("tr").find("[name^=_B1_UPRC___]").val()) : 0,
									B1_UCOM		: $(el).closest("tr").find("[name*=B1_UCOM___]").val()
						})
				}
			})
			
			$("[name*=B1_PAI___][value='']").each(function(idx,el){
				if($(el).closest("tr").find("[name*=B1_COD___]").val() != undefined){
					filterFilhos = filhos.filter(function(pf){return pf.B1_PAI == $(el).closest("tr").find("[name*=B1_COD___]").val().trim()});
					filterFilhos = filterFilhos.length > 0 ? filterFilhos : [{
						B1_COD 		: $(el).closest("tr").find("[name*=B1_COD___]").val().trim(),
							B1_DESC 	: $(el).closest("tr").find("[name*=B1_DESC___]").val(),
							B1_PAI 		: $(el).closest("tr").find("[name*=B1_PAI___]").val().trim(),
							B1_ZMARCA 	: $(el).closest("tr").find("[name*=B1_ZMARCA___]").val(),
							ZPM_DESC 	: $(el).closest("tr").find("[name*=ZPM_DESC___]").val(),
							B1_UPRC		: $(el).closest("tr").find("[name*=B1_UPRC___]").val() != "" ? parseFloat($(el).closest("tr").find("[name^=_B1_UPRC___]").val()) : 0,
							B1_UCOM		: $(el).closest("tr").find("[name*=B1_UCOM___]").val()
					}]
					
					aDados.produtos.push({
						B1_COD		: $(el).closest("tr").find("[name*=B1_COD___]").val().trim(),
						B1_DESC 	: $(el).closest("tr").find("[name*=B1_DESC___]").val(),
							QTD			: $("[name*=codigoProduto___][value='"+$(el).closest("tr").find("[name*=B1_COD___]").val()+"']").closest("tr").find("[name*=produto_qtd___]").val(),
							UM			: $("[name*=codigoProduto___][value='"+$(el).closest("tr").find("[name*=B1_COD___]").val()+"']").closest("tr").find("[name*=unidadeMedidaProduto___]").val(),
							FILHOS		: filterFilhos
						})
						
				}
			})
			*/
		}

	},
	TES: {
		modal: null,
		carregaDiv() {
			if ($("[name*=tipoSc]:checked").val() != "5" || aDados.cotacoes.length > 0) {
				let temp = $("#tmpl5").html();
				//let html = Mustache.render(temp, aDados);
				/**
				 * @todo limpar o aDadosCot, deixando somente os produtos e os forncedores.
				 */

				let html = Mustache.render(temp, tools.aDadosCot)

				tools.TES.modal = FLUIGC.modal({
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

			var ds = DatasetFactory.getDataset(
				"DS_CONSULTA_AUXILIAR_COTACAO",
				null,
				[
					DatasetFactory.createConstraint("S_COTACAO", $("#numeroSolicitacao").val(), $("#numeroSolicitacao").val(), ConstraintType.MUST),
					DatasetFactory.createConstraint("IDEMPRESA", $("#idEmpresa").val(), $("#idEmpresa").val(), ConstraintType.MUST),
					DatasetFactory.createConstraint("S_COMPRA", $("#solicitacao_compra").val(), $("#solicitacao_compra").val(), ConstraintType.MUST)
				],
				null
			)

			if (ds != null && ds.values.length > 0) {
				for (var i = 0; i < ds.values.length; i++) {

					var ciclo = ds.values[i].C8_CICLO;
					var valor = ds.values[i].C8_PRECO.trim();
					if (ciclo == $("#ciclo_atual").val() && valor != "" && valor != "0.00") {
						let a2_cod = ds.values[i].C8_FORNECE;
						let a2_loja = ds.values[i].C8_LOJA;
						let b1_cod = ds.values[i].C8_PRODUTO.substring(0, 8);
						$("[data-a2cod='" + a2_cod + "'][data-a2loja='" + a2_loja + "']").addClass("necessario");
						$("[data-b1cod='" + b1_cod + "']").addClass("necessario");
					}

				}
			}
		},
		carregaOptions() {
			var ds = DatasetFactory.getDataset("DS_TES", null, null, null)
			if (ds == null || ds.values == undefined) return;
			aDados["TES"] = ds.values.filter((el) => el.BLOQUEADO == "2")
			aDados["TES"] = aDados["TES"].sort(function (el1, el2) { return el1.CODIGO - el2.CODIGO })

			tools.aDadosCot["TES"] = ds.values.filter((el) => el.BLOQUEADO == "2")
			tools.aDadosCot["TES"] = tools.aDadosCot["TES"].sort(function (el1, el2) { return el1.CODIGO - el2.CODIGO })
		},
		init() {
			if ([5, 23].includes(WKNumState)) {
				if (!aDados.TES) tools.TES.carregaOptions();
				$("#btnTES").on("click", tools.TES.carregaDiv)
			} else {
				$("#btnTES").hide();
			}
		},
		identificaLinha(TES_A2_CGC, TES_B1_COD, tipo) {
			let linha = null;
			let elemento;
			if (tipo == "fornecedor") {
				elemento = $("tr").has("[name^=TES_A2_CGC___][value='" + TES_A2_CGC + "']").toArray()
				if (elemento != null && elemento != undefined
					&& elemento.length > 0
				) {
					linha = elemento[0].sectionRowIndex;
					return linha;
				}
			}
			elemento = $("tr").has("[name^=TES_B1_COD___][value='" + TES_B1_COD + "']").toArray()
			if (elemento != null && elemento != undefined
				&& elemento.length > 0
			) {
				linha = elemento[0].sectionRowIndex;
				return linha;
			}
		},
		gravaLinha(TES_A2_COD, TES_A2_LOJA, TES_A2_CGC, TES_B1_COD, TES_CODIGO, tipo) {

			if (tipo == "global") {
				$("[name^=TES_CODIGO___]").val(TES_CODIGO);
				$("[name^=TES_COMPRADOR___]").val(usuarioAtual);
				return
			}
			let linha = tools.TES.identificaLinha(TES_A2_CGC, TES_B1_COD, tipo);

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
				tools.TES.gravaLinha(obj.A2_COD, obj.A2_LOJA, obj.A2_CGC, obj.B1_COD, obj.CODIGO, "produto");
				if (obj.CODIGO != "") {
					$("[data-b1cod='" + obj.B1_COD + "']").addClass("preenchido")
				} else {
					$("[data-b1cod='" + obj.B1_COD + "']").removeClass("preenchido")
				}
			} else if (obj.tipo == "fornecedor") {
				tools.TES.gravaLinha(obj.A2_COD, obj.A2_LOJA, obj.A2_CGC, obj.B1_COD, obj.CODIGO, "fornecedor");
				if (obj.CODIGO != "") {
					$("[data-a2cgc='" + obj.A2_CGC + "']").addClass("preenchido")
				} else {
					$("[data-a2cgc='" + obj.A2_CGC + "']").removeClass("preenchido")
				}
			} else {
				tools.TES.gravaLinha(obj.A2_COD, obj.A2_LOJA, obj.A2_CGC, produto.B1_COD, obj.CODIGO, "global");
				tools.TES.selecao.linha(obj.A2_CGC, produto.B1_COD, obj.CODIGO);
				tools.TES.modal.isOpen() ? tools.TES.modal.remove() : 0;
			}
		},
		processa(event) {
			event.stopPropagation();
			event.preventDefault();
			let _this = this;
			aDados["obj"] = {
				A2_COD: $(this).attr("data-a2cod"),
				A2_LOJA: $(this).attr("data-a2loja"),
				A2_NOME: $(this).attr("data-a2nome"),
				A2_CGC: $(this).attr("data-a2cgc"),
				B1_COD: $(this).attr("data-b1cod"),
				B1_DESC: $(this).attr("data-b1desc"),
				CFOP: $(this).find("option:selected").attr("data-cfop"),
				DESCRICAO: $(this).find("option:selected").attr("data-descricao"),
				ESTOQUE: $(this).find("option:selected").attr("data-estoque"),
				CODIGO: $(this).find("option:selected").attr("data-codigo"),
				FINALIDADE: $(this).find("option:selected").attr("data-finalidade"),
				tipo: null
			}

			let txtTES = `		<br><strong>Código: </strong>	${aDados.obj.CODIGO}
								<strong>Descrição: </strong>	${aDados.obj.DESCRICAO}
								<strong>CFOP: </strong>			${aDados.obj.CFOP}
								<strong>Estoque: </strong>		${aDados.obj.ESTOQUE}
								<strong>Finalidade: </strong>	${aDados.obj.FINALIDADE}`
			let message;

			if (aDados.obj.CODIGO != "") {
				aDados.obj.tipo = "global";
				let complemento = ""
				if (aDados.obj.B1_COD != undefined) {
					aDados.obj.tipo = "produto";
					complemento = "ao produto <br><strong>" + aDados.obj.B1_COD + " | " + aDados.obj.B1_DESC + "</strong>"
				}
				if (aDados.obj.A2_COD != undefined) {
					aDados.obj.tipo = "fornecedor";
					complemento = "ao fornecedor <br><strong>" + aDados.obj.A2_CGC + ":" + aDados.obj.A2_LOJA + " | " + aDados.obj.A2_NOME + "</strong>"
				}
				message = "Confirma a aplicação da TES abaixo ";
				message += complemento
				message += txtTES
			} else {
				aDados.obj.tipo = "global";
				let complemento = ""
				if (aDados.obj.B1_COD != undefined) {
					aDados.obj.tipo = "produto";
					complemento = "do produto <br><strong>" + aDados.obj.B1_COD + " | " + aDados.obj.B1_DESC + "</strong> ?"
				}
				if (aDados.obj.A2_COD != undefined) {
					aDados.obj.tipo = "fornecedor";
					complemento = "do fornecedor <br><strong>" + aDados.obj.A2_CGC + ":" + aDados.obj.A2_LOJA + " | " + aDados.obj.A2_NOME + "</strong>?"
				}
				message = "Confirma a limpeza da TES  ";
				message += complemento;
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
					if (aDados.obj != undefined) {
						tools.TES.selecao.limpezaCancelada()
					}
				}
			});
		},
		selecao: {
			limpezaCancelada() {
				let obj = aDados.obj;
				delete aDados.obj;
				let codigo = "";
				if (obj.tipo == "produto") {
					codigo = $("[name^=TES_B1_COD][value='" + obj.B1_COD + "']")
						.closest("tr").find("[name^=TES_CODIGO]").val();
				}
				if (obj.tipo == "fornecedor") {
					codigo = $("[name^=TES_A2_COD][value='" + obj.A2_COD + "']")
						.closest("tr").find("[name^=TES_CODIGO]").val();
				}
				if (codigo != "") {
					tools.TES.selecao.linha(obj.A2_CGC, obj.B1_COD, codigo)
				}
			},
			linha(A2_CGC, B1_COD, CODIGO) {
				if (B1_COD != undefined) {
					$("[data-b1cod=" + B1_COD + "]").val(CODIGO);
					$("[data-b1cod=" + B1_COD + "]").addClass("preenchido")
				} if (A2_CGC != undefined) {
					$("[data-a2cgc=" + A2_CGC + "]").val(CODIGO);
					$("[data-a2cgc=" + A2_CGC + "]").addClass("preenchido")
				} else {
					$("[data-global]").val(CODIGO);
					$("[data-global]").addClass("preenchido")
				}
			},
			todos() {
				$("[name^=TES_A2_CGC___]").toArray().forEach(function (el) {
					if (el.value != ""
						&& $(el).closest("tr").find("[name^=TES_CODIGO___]").val() != "") {
						tools.TES.selecao.linha(el.value,
							undefined,
							$(el).closest("tr").find("[name^=TES_CODIGO___]").val())
					}

				})
				$("[name^=TES_B1_COD___]").toArray().forEach(function (el) {
					if (el.value != ""
						&& $(el).closest("tr").find("[name^=TES_CODIGO___]").val() != "") {
						tools.TES.selecao.linha(undefined,
							$(el).closest("tr").find("[name^=TES_B1_COD___]").val(),
							$(el).closest("tr").find("[name^=TES_CODIGO___]").val())
					}

				})
			}
		}

	}
}