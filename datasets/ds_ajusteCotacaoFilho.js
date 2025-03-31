function defineStructure() {

}
function onSync(lastSyncDate) {

}
function createDataset(fields, constraints, sortFields) {

    log.info("ds_ajusteCotacaoFilho")
    var mlFormCotacao = "ML001742";
    var mlTabCotacao = "ML001743";
    var C8NUM = "000002";
    var IDEMPRESA = "00100289";
    var idFichaCotacaoCotacoes = "756307";
    var CICLOATUAL = "1";
    var CODFOMCOTACAOCOTACOES = "746754";
    var query = "SELECT COT.VENCEDOR, COT.VENCEDOR_COMPRADOR, COT.COMPRADOR, COT.QTD_COMPRADOR, COT.COMPRADOR_JUSTIFICATIVA, \
    COT.C8_ITEM, COT.C8_PRODUTO, COT.C8_UM, COT.C8_FORNECE, COT.C8_LOJA, COT.C8_QUANT, COT.C8_PRECO, COT.C8_TOTAL, COT.C8_PRAZO, \
    COT.C8_FILENT, COT.C8_VALIPI, COT.C8_VALICM, COT.C8_VALISS, COT.C8_DIFAL, COT.C8_VALSOL, COT.C8_VALIDA \
					 FROM "+ mlFormCotacao + " ML \
					INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
					INNER JOIN "+ mlTabCotacao + " COT ON COT.DOCUMENTID = ML.DOCUMENTID AND COT.VERSION = ML.VERSION \
				WHERE ML.C8_NUM = '"+ C8NUM + "' \
                AND ML.idEmpresa = '" + IDEMPRESA + "' \
                AND ML.C8_CICLO = '" + CICLOATUAL + "' \
                AND DOC.VERSAO_ATIVA = 1"

    var dataSetRetorno = tools.getDataset('ds_sql_execute', null, null, false);

    log.info("ds_ajusteCotacaoFilho: ");
    log.dir(dataSetRetorno)
    var idx = 1;
    var cotacaoFields = { "values": [] };

    for (var index = 0; index < dataSetRetorno.length; index++) {
        var linhaRetorno = dataSetRetorno[index];
        cotacaoFields.values.push(tools.createCardField("C8_CICLO" + "___" + idx,
            CICLOATUAL));
        cotacaoFields.values.push(tools.createCardField("C8_ITEM" + "___" + idx,
            linhaRetorno["C8_ITEM"] ? linhaRetorno["C8_ITEM"] : ""));
        cotacaoFields.values.push(tools.createCardField("C8_PRODUTO" + "___" + idx,
            linhaRetorno["C8_PRODUTO"] ? linhaRetorno["C8_PRODUTO"] : ""));
        cotacaoFields.values.push(tools.createCardField("C8_UM" + "___" + idx,
            linhaRetorno["C8_UM"] ? linhaRetorno["C8_UM"] : ""));
        cotacaoFields.values.push(tools.createCardField("C8_FORNECE" + "___" + idx,
            linhaRetorno["C8_FORNECE"] ? linhaRetorno["C8_FORNECE"] : ""));
        cotacaoFields.values.push(tools.createCardField("C8_LOJA" + "___" + idx,
            linhaRetorno["C8_LOJA"] ? linhaRetorno["C8_LOJA"] : ""));
        cotacaoFields.values.push(tools.createCardField("C8_QUANT" + "___" + idx,
            (linhaRetorno["C8_QUANT"] != null && linhaRetorno["C8_QUANT"] != "null") ? tools.confirmaValor(linhaRetorno["C8_QUANT"]) : ""));
        cotacaoFields.values.push(tools.createCardField("C8_PRECO" + "___" + idx,
            (linhaRetorno["C8_PRECO"] != null && linhaRetorno["C8_PRECO"] != "null") ? tools.confirmaValor(linhaRetorno["C8_PRECO"]) : ""));
        cotacaoFields.values.push(tools.createCardField("C8_TOTAL" + "___" + idx,
            (linhaRetorno["C8_TOTAL"] != null && linhaRetorno["C8_TOTAL"] != "null") ? tools.confirmaValor(linhaRetorno["C8_TOTAL"]) : ""));
        cotacaoFields.values.push(tools.createCardField("C8_PRAZO" + "___" + idx,
            (linhaRetorno["C8_PRAZO"] != null && linhaRetorno["C8_PRAZO"] != "null") ? tools.confirmaValor(linhaRetorno["C8_PRAZO"]) : ""));
        cotacaoFields.values.push(tools.createCardField("C8_VALIPI" + "___" + idx,
            (linhaRetorno["C8_VALIPI"] != null && linhaRetorno["C8_VALIPI"] != "null") ? tools.confirmaValor(linhaRetorno["C8_VALIPI"]) : ""));
        cotacaoFields.values.push(tools.createCardField("C8_VALICM" + "___" + idx,
            (linhaRetorno["C8_VALICM"] != null && linhaRetorno["C8_VALICM"] != "null") ? tools.confirmaValor(linhaRetorno["C8_VALICM"]) : ""));
        cotacaoFields.values.push(tools.createCardField("C8_VALISS" + "___" + idx,
            (linhaRetorno["C8_VALISS"] != null && linhaRetorno["C8_VALISS"] != "null") ? tools.confirmaValor(linhaRetorno["C8_VALISS"]) : ""));
        cotacaoFields.values.push(tools.createCardField("C8_VALIDA" + "___" + idx,
            (linhaRetorno["C8_VALIDA"] != null && linhaRetorno["C8_VALIDA"] != "null") ? tools.confirmaValor(linhaRetorno["C8_VALIDA"]) : ""));

        cotacaoFields.values.push(tools.createCardField("C8_PRAZO" + "___" + idx,
            (linhaRetorno["C8_PRAZO"] != null && linhaRetorno["C8_PRAZO"] != "null") ? linhaRetorno["C8_PRAZO"] : ""));
        cotacaoFields.values.push(tools.createCardField("C8_FILENT" + "___" + idx,
            (linhaRetorno["C8_FILENT"] != null && linhaRetorno["C8_FILENT"] != "null") ? linhaRetorno["C8_FILENT"] : ""));

        idx++
    }
    log.dir(cotacaoFields);
    var formAtualizado = tools.atualizaForm(idFichaCotacaoCotacoes, CODFOMCOTACAOCOTACOES, cotacaoFields);

    var dataset = DatasetBuilder.newDataset();
    if (!formAtualizado.ok) {

        dataset.addColumn("erro");
        dataset.addRow(["Erro na atualização do formulário > " + formAtualizado.error]);
    } else {
        dataset.addColumn("resultado");
        dataset.addRow([JSON.stringfy(formAtualizado)]);

    }

    return dataset

}

var tools = {
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
    atualizaForm: function (cardID, formId, formFields) {
        log.info(">> tools.cotacao.atualizaForm"); //Atualiza o formulário auxililar da cotação
        var obj = { "ok": false, "error": "" };

        obj = tools.putFluig("/ecm-forms/api/v2/cardindex/" + formId + "/cards/" + cardID, formFields);

        return obj;
    },

    putFluig: function (endpoint, params) {
        log.info(">> integra.putFormFluig <<");
        var obj = { "ok": false };

        try {

            var data = {
                companyId: getValue("WKCompany") + '',
                serviceCode: 'FLUIG_REST',
                endpoint: endpoint,
                method: 'put',
                timeout: 60000,
                async: false,
                params: params,
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            var clientService = fluigAPI.getAuthorizeClientService();

            var result = clientService.invoke(new org.json.JSONObject(data).toString());
            if (result.getHttpStatusResult() >= 200 && result.getHttpStatusResult() < 300) {
                if (result.getResult() != null && !result.getResult().isEmpty()) {

                    if (result.getResult().indexOf("com.fluig.authorize.client.exception.ClientBasicAuthorizeException: java.net.SocketTimeoutException: Read timed out") > 0) {
                        obj["ok"] = false;
                        obj["error"] = result.getResult();
                    }
                    else if (JSON.parse(result.getResult()).errorMessage != undefined) {
                        obj["ok"] = false;
                        obj["error"] = JSON.parse(result.getResult()).errorMessage;
                    }
                    else {
                        obj["ok"] = true;
                        obj["retorno"] = JSON.parse(result.getResult());
                    }
                } else {
                    obj["error"] = "Não encontrou nenhum registro para a consulta!";
                }
            } else {
                obj["ok"] = false;
                obj["error"] = result.getResult()
            }
        } catch (e) {
            obj["error"] = (e.message != undefined && e.message != null) ? e.message : e;
        }
        log.info("** integra.putFormFluig **");
        return obj;

    },
    createCardField: function (field, valor) {
        return {
            "fieldId": field,
            "value": valor
        }
    },
    confirmaValor: function (oldValue) {
        return ["", "null", "0.00", "0,00"].indexOf(oldValue) < 0 ? oldValue : ""
    },


}