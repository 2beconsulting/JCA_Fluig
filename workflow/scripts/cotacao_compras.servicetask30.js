function servicetask30(attempt, message) {
    tools.log("--servicetask30");

    var dataSource = "jdbc/AppDS";
    var ic = new javax.naming.InitialContext();
    var ds = ic.lookup(dataSource);
    var ciclo_atual = hAPI.getCardValue("ciclo_atual");
    var C8_NUM = hAPI.getCardValue("C8_NUM");
    var idEmpresa = hAPI.getCardValue("idEmpresa");
    var docId = hAPI.getCardValue("numIdCot");
    var S_COTACAO = hAPI.getCardValue("numeroSolicitacao");

    tools.log("docId: " + docId)

    try {
        var conn = ds.getConnection();
        var stmt = conn.createStatement();

        var rsCotacao = stmt.executeQuery(
            "SELECT COT.documentid,COT.version, COT.C8_CICLO, COT.BEN_FISCAL, COT.C8_ITEM, COT.C8_PRODUTO, COT.C8_UM, COT.C8_FORNECE, COT.C8_FORNOME, COT.C8_LOJA, COT.C8_QUANT, COT.C8_PRECO, COT.C8_TOTAL, COT.C8_COND, COT.C8_PRAZO, COT.C8_FILENT, COT.C8_EMISSAO, COT.C8_VALIPI, COT.C8_VALICM, COT.C8_VALISS, COT.C8_DIFAL, COT.C8_VALSOL, COT.C8_SEGURO, COT.C8_DESPESA, COT.C8_VALFRE, COT.C8_TPFRETE, COT.C8_VALIDA, COT.C8_NUMPED, COT.C8_ITEMPED \
                FROM "+ hAPI.getAdvancedProperty("mlFormCotCotacao") + " ML \
                INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
                INNER JOIN "+ hAPI.getAdvancedProperty("mlTabCotCotacao")
            + " COT ON COT.DOCUMENTID = ML.DOCUMENTID AND COT.VERSION = ML.VERSION \
            WHERE ML.numeroSolicitacao = '"+ S_COTACAO + "' \
            AND ML.idEmpresa = '" + idEmpresa + "' \
            AND COT.C8_CICLO = '" + ciclo_atual + "' \
            AND DOC.VERSAO_ATIVA = 1"
        );

        tools.log("-- rsCotacao");

        var idx = 1;
        var cotacaoFields = { "values": [] };

        while (rsCotacao.next()) {

            var C8_PRECO = ((rsCotacao.getObject("C8_PRECO") != null
                && rsCotacao.getObject("C8_PRECO") != "null") ?
                tools.confirmaValor(rsCotacao.getObject("C8_PRECO")) : "");
            tools.log(" c8_preco >>" + rsCotacao.getObject("C8_PRECO") + ": " + tools.confirmaValor(rsCotacao.getObject("C8_PRECO")) + ">" + C8_PRECO)

            if (C8_PRECO != "") {
                cotacaoFields.values.push(tools.createCardField("C8_CICLO" + "___" + idx,
                    ciclo_atual));
                cotacaoFields.values.push(tools.createCardField("C8_ITEM" + "___" + idx,
                    rsCotacao.getObject("C8_ITEM") ? rsCotacao.getObject("C8_ITEM") : ""));
                cotacaoFields.values.push(tools.createCardField("C8_PRODUTO" + "___" + idx,
                    rsCotacao.getObject("C8_PRODUTO") ? rsCotacao.getObject("C8_PRODUTO") : ""));
                cotacaoFields.values.push(tools.createCardField("C8_UM" + "___" + idx,
                    rsCotacao.getObject("C8_UM") ? rsCotacao.getObject("C8_UM") : ""));
                cotacaoFields.values.push(tools.createCardField("C8_FORNECE" + "___" + idx,
                    rsCotacao.getObject("C8_FORNECE") ? rsCotacao.getObject("C8_FORNECE") : ""));
                cotacaoFields.values.push(tools.createCardField("C8_LOJA" + "___" + idx,
                    rsCotacao.getObject("C8_LOJA") ? rsCotacao.getObject("C8_LOJA") : ""));
                cotacaoFields.values.push(tools.createCardField("C8_QUANT" + "___" + idx,
                    (rsCotacao.getObject("C8_QUANT") != null && rsCotacao.getObject("C8_QUANT") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_QUANT")) : ""));
                cotacaoFields.values.push(tools.createCardField("C8_PRECO" + "___" + idx,
                    (rsCotacao.getObject("C8_PRECO") != null && rsCotacao.getObject("C8_PRECO") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_PRECO")) : ""));
                cotacaoFields.values.push(tools.createCardField("C8_TOTAL" + "___" + idx,
                    (rsCotacao.getObject("C8_TOTAL") != null && rsCotacao.getObject("C8_TOTAL") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_TOTAL")) : ""));
                cotacaoFields.values.push(tools.createCardField("C8_PRAZO" + "___" + idx,
                    (rsCotacao.getObject("C8_PRAZO") != null && rsCotacao.getObject("C8_PRAZO") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_PRAZO")) : ""));
                cotacaoFields.values.push(tools.createCardField("C8_VALIPI" + "___" + idx,
                    (rsCotacao.getObject("C8_VALIPI") != null && rsCotacao.getObject("C8_VALIPI") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_VALIPI")) : ""));
                cotacaoFields.values.push(tools.createCardField("C8_VALICM" + "___" + idx,
                    (rsCotacao.getObject("C8_VALICM") != null && rsCotacao.getObject("C8_VALICM") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_VALICM")) : ""));
                cotacaoFields.values.push(tools.createCardField("C8_VALISS" + "___" + idx,
                    (rsCotacao.getObject("C8_VALISS") != null && rsCotacao.getObject("C8_VALISS") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_VALISS")) : ""));
                cotacaoFields.values.push(tools.createCardField("C8_VALIDA" + "___" + idx,
                    (rsCotacao.getObject("C8_VALIDA") != null && rsCotacao.getObject("C8_VALIDA") != "null") ? tools.confirmaValor(rsCotacao.getObject("C8_VALIDA")) : ""));
                cotacaoFields.values.push(tools.createCardField("C8_PRAZO" + "___" + idx,
                    (rsCotacao.getObject("C8_PRAZO") != null && rsCotacao.getObject("C8_PRAZO") != "null") ? rsCotacao.getObject("C8_PRAZO") : ""));
                cotacaoFields.values.push(tools.createCardField("C8_FILENT" + "___" + idx,
                    (rsCotacao.getObject("C8_FILENT") != null && rsCotacao.getObject("C8_FILENT") != "null") ? rsCotacao.getObject("C8_FILENT") : ""));

                idx++
            }
        }
        if (cotacaoFields.values.length > 0) {
            tools.createFormCotacaoAux(cotacaoFields)
            tools.log("-- fim rsCotacao");
            tools.log("-- deleted");
            var deleted = integra.deleteFluig("/ecm-forms/api/v2/cardindex/" + hAPI.getAdvancedProperty("formCotacaoAux") + "/cards/" + docId)
            log.dir(deleted);
        } else {
            hAPI.setTaskComments(
                getValue("WKUser"),
                getValue("WKNumProces"),
                getValue("WKActualThread"),
                "nenhum orçamento foi enviado nesta cotação."
            )
        }

    } catch (error) {
        tools.log("ERRO==============> " + error.message != undefined ?
            error.message : error);
        throw error.message
    } finally {
        if (stmt != null) stmt.close();
        if (conn != null) conn.close();
    }
}