function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetFactory.newDataset();

    log.info("######## Inicio ds_atualiza_filho_ficha  ########");

    /**
     * QA
     * 
    var user = "admin";
    var password = "2w8lJ6TtQGup0uGA";
     * PROD
     * 
    var user = "integracao.fluig";
    var password = "jca@2024";
     */
    var companyId = 1;
    var user = "integracao.fluig";
    var password = "jca@2024";
    var cardId = null;
    var version = null;

    var formCotacao; // ID do formulário de cotação
    try {
        var jConstr = tools.constraintToJson(constraints);
        var cardId = jConstr['CARDID'];
        var version = jConstr['VERSION'];
        formCotacao = jConstr['FORMID'] || formCotacao
        var C8_LOJA = jConstr['C8_LOJA'];
        var C8_ITEM = jConstr['C8_ITEM'];
        var C8_TOTAL = jConstr['C8_TOTAL'];
        var C8_PRECO = jConstr['C8_PRECO'];
        var C8_FORNECE = jConstr['C8_FORNECE'];
        var C8_QUANT = jConstr['C8_QUANT'];
        var C8_PRODUTO = jConstr['C8_PRODUTO'];
        var C8_PRAZO = jConstr['C8_PRAZO'];

        if (cardId == null) {
            log.info("ds_atualiza_filho_ficha cardId não informado");
            dataset.addColumn("result")
            dataset.addColumn("erro");
            dataset.addRow(["nok", "cardId não informado"]);
            return dataset;
        }
        cardId = parseInt(cardId);

        var svc = ServiceManager.getServiceInstance("ECMCardService");
        var cardServiceLocator = svc.instantiate('com.totvs.ECMCardServiceService');
        var cardService = cardServiceLocator.getCardServicePort();

        var properties = {};
        properties["disable.chunking"] = "true";
        properties["log.soap.messages"] = "true";

        var customClient = svc.getCustomClient(cardService, "com.totvs.CardService", properties);

        var dsDocument = tools.getDataset("document", null, [
            { field: "documentPK.documentId", value: cardId },
            { field: "activeVersion", value: "true" }
        ], false);

        if (dsDocument.length > 0) {
            version = dsDocument[0]["documentPK.version"];
        }
        /**@todo pegar um dataset para trazer a versão mais atual no momento da recuperação */
        var cardDtoArray = customClient.getCardVersion(companyId, user, password, cardId, version, user);
        var cardDto = cardDtoArray.getItem().get(0);
        var cardData = cardDto.getCardData();

        var tabela = tools.getTableFilho(cardData, [
            'C8_UM', 'C8_LOJA', 'C8_CICLO', 'C8_SEGURO', 'C8_VALFRE', 'C8_ITEM', 'C8_TPFRETE',
            'C8_DESPESA', 'C8_TOTAL', 'C8_VALIPI', 'BEN_FISCAL', 'C8_EMISSAO', 'C8_FILENT',
            'C8_VALIDA', 'C8_VALISS', 'C8_COND', 'C8_DIFAL', 'C8_VALSOL', 'C8_VALICM', 'C8_PRECO', 'C8_FORNECE',
            'C8_FORNOME', 'C8_NUMPED', 'C8_PRODUTO', 'C8_QUANT', 'C8_ITEMPED', 'C8_PRAZO'
        ]);

        var formFields = {
            "values": []
        };

        var seq = 0;
        for (var i = 0; i < tabela.length; i++) {
            var row = tabela[i];
            log.dir(row)
            if (row['C8_ITEM'].value == C8_ITEM
                && row['C8_PRODUTO'].value == C8_PRODUTO
                && row['C8_FORNECE'].value == C8_FORNECE
                && row['C8_LOJA'].value == C8_LOJA
            ) {
                formFields.values.push({ "fieldId": "C8_ITEM" + "___" + seq, "value": "" + row["C8_ITEM"].value });
                formFields.values.push({ "fieldId": "C8_PRODUTO" + "___" + seq, "value": "" + row["C8_PRODUTO"].value });
                formFields.values.push({ "fieldId": "C8_UM" + "___" + seq, "value": "" + row["C8_UM"].value });
                formFields.values.push({ "fieldId": "C8_FORNECE" + "___" + seq, "value": "" + row["C8_FORNECE"].value });
                formFields.values.push({ "fieldId": "C8_LOJA" + "___" + seq, "value": "" + row["C8_LOJA"].value });
                formFields.values.push({ "fieldId": "C8_VALIDA" + "___" + seq, "value": "" + row["C8_VALIDA"].value });

                formFields.values.push({ "fieldId": "C8_QUANT" + "___" + seq, "value": "" + C8_QUANT });
                formFields.values.push({ "fieldId": "C8_DIFAL" + "___" + seq, "value": "" + row["C8_DIFAL"].value });
                formFields.values.push({ "fieldId": "C8_PRECO" + "___" + seq, "value": "" + C8_PRECO });
                formFields.values.push({ "fieldId": "C8_PRAZO" + "___" + seq, "value": "" + C8_PRAZO });
                formFields.values.push({ "fieldId": "C8_VALICM" + "___" + seq, "value": row["C8_VALICM"].value });
                formFields.values.push({ "fieldId": "C8_VALIPI" + "___" + seq, "value": row["C8_VALIPI"].value });
                formFields.values.push({ "fieldId": "C8_VALISS" + "___" + seq, "value": row["C8_VALISS"].value });
                formFields.values.push({ "fieldId": "C8_TOTAL" + "___" + seq, "value": C8_TOTAL });
                seq = row['C8_ITEM'].index
                break
            }
        }
        if (formFields.values.length > 0) {
            var integrado = tools.putFluig("/ecm-forms/api/v2/cardindex/" + formCotacao
                + "/cards/" + cardId
                + "/children/" + seq, formFields);
            log.info(">> ds_atualiza_filho_ficha");
            log.dir(integrado);
            if (integrado.ok) {

                dataset.addColumn("result");
                dataset.addRow(["Registro alterado com sucesso."]);
                return dataset

            }
            else {
                return dsError(integrado.error, []);
            }
        }
        log.info("######## Inicio ds_atualiza_filho_ficha  ########");
        log.dir(tabela)
    }
    catch (e) {
        log.info("================> ERRO" + e.toString());
        log.info("================> LINHA" + e.lineNumber);

        dataset.addColumn("result")
        dataset.addColumn("erro");
        dataset.addRow(["nok", e.message + e.lineNumber + " - " + tabela]);
        return dataset;
    }

    dataset.addColumn("result");
    dataset.addRow(["Registro alterado com sucesso."]);


    return dataset;
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
    putFluig: function (endpoint, params) {
        log.info(">> putFluig <<");

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

        return obj;
    },
    constraintToJson: function (constraints) {
        var obj = {};
        if (constraints != null) {
            for (var i = 0; i < constraints.length; i++) {
                obj[constraints[i].fieldName.toUpperCase()] = "" + constraints[i].initialValue
            }
        }
        return obj;
    },
    getTableFilho: function (cardData, fields) {
        var it = cardData.iterator();
        var listaFilho = [];
        var linha = 0;

        var row = {};
        while (it.hasNext()) {
            var registro = it.next();
            var campo = registro.getField();
            var idCampo = campo.split("___");
            if (fields.filter(function (f) { return f == idCampo[0]; }).length > 0) {
                var idx = idCampo[1];
                if (linha > 0 && linha != idx) {
                    listaFilho.push(row);
                    row = {}
                }
                linha = idx;
                var name = idCampo[0] + "___" + idx;
                row[idCampo[0]] = { value: registro.getValue(), index: idx, name: name };

            }
        }
        
        listaFilho.push(row);
        return listaFilho;

    }
}