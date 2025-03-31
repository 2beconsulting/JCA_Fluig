function createDataset(fields, constraints, sortFields) {

	try {
		var jConstr = constraintToJson(constraints);
		log.dir(jConstr);
		var mlFormCotacao = "ML001742";
		var mlTabCotacao = "ML001743";
		var idEmpresa = jConstr.IDEMPRESA;
		var C8_NUM = jConstr.C8_NUM;
		var C8_CICLO = jConstr.C8_CICLO;
		var VENCEDOR_COMPRADOR = jConstr.VENCEDOR_COMPRADOR;

		if (idEmpresa != undefined && C8_NUM != undefined) {
			var txtQuery = "SELECT ML.C8_CICLO, COT.documentid,COT.version, COT.VENCEDOR, COT.VENCEDOR_COMPRADOR, COT.COMPRADOR, COT.QTD_COMPRADOR, COT.COMPRADOR_JUSTIFICATIVA, COT.C8_ITEM, COT.C8_PRODUTO, COT.C8_UM, COT.C8_FORNECE, COT.C8_LOJA, COT.C8_QUANT, COT.C8_PRECO, COT.C8_TOTAL, COT.C8_PRAZO, COT.C8_FILENT, COT.C8_VALIPI, COT.C8_VALICM, COT.C8_VALISS, COT.C8_DIFAL, COT.C8_VALSOL, COT.C8_VALIDA FROM " + mlFormCotacao + " ML \
								INNER JOIN DOCUMENTO DOC ON DOC.NR_DOCUMENTO = ML.DOCUMENTID AND DOC.NR_VERSAO = ML.VERSION \
								INNER JOIN "+ mlTabCotacao + " COT ON COT.DOCUMENTID = ML.DOCUMENTID AND COT.VERSION = ML.VERSION \
							WHERE ML.C8_NUM = '"+ C8_NUM + "' AND ML.idEmpresa = '" + idEmpresa + "' AND DOC.VERSAO_ATIVA = 1"

			if (C8_CICLO != undefined) {
				txtQuery += " AND ML.C8_CICLO = '" + C8_CICLO + "'"
			}

			if (VENCEDOR_COMPRADOR != undefined) {
				txtQuery += " AND COT.VENCEDOR_COMPRADOR = '" + VENCEDOR_COMPRADOR + "'"
			}

			log.info(txtQuery);
			return Exec(txtQuery);
		}
		else {
			return dsError("As constraints 'idEmpresa' e 'C8_NUM' são obrigatórias!", ["idEmpresa", "C8_NUM", "C8_CICLO"])
		}
	}
	catch (e) {
		return dsError(e.message != undefined ? e.message : e, [])
	}

}

function dsError(msgError, fieldsRequired) {
	var ds = DatasetBuilder.newDataset();
	ds.addColumn("ERROR");
	fieldsRequired.forEach(function (field) { ds.addColumn(field) });

	var arr = [msgError];
	fieldsRequired.forEach(function (field) { arr.push("") });

	ds.addRow(arr);
	return ds;
}

function constraintToJson(constraints) {
	var obj = {};
	if (constraints != null) {
		for (var i = 0; i < constraints.length; i++) {
			obj[constraints[i].fieldName.toUpperCase()] = "" + constraints[i].initialValue
		}
	}
	return obj;
}

function Exec(minhaQuery) {
	log.info("DS_CONSULTA_COTACOES > minhaQuery: \n" + minhaQuery)
	var dataSource = "jdbc/AppDS";
	var newDataset = DatasetBuilder.newDataset();
	var ic = new javax.naming.InitialContext();
	var ds = ic.lookup(dataSource);
	var created = false;
	try {
		var conn = ds.getConnection();
		var stmt = conn.createStatement();
		var rs = stmt.executeQuery(minhaQuery);
		var columnCount = rs.getMetaData().getColumnCount();
		var seq = 0;
		log.warn("=== inicio processa retorno ===")
		while (rs.next()) {
			if (!created) {
				newDataset.addColumn("idx")
				for (var i = 1; i <= columnCount; i++) {
					newDataset.addColumn(rs.getMetaData().getColumnName(i));
				}
				created = true;
			}
			var Arr = new Array();
			seq = seq + 1;
			Arr.push(seq.toString());
			for (var i = 1; i <= columnCount; i++) {
				var obj = rs.getObject(rs.getMetaData().getColumnName(i));
				if (null != obj) {
					Arr.push(rs.getObject(rs.getMetaData().getColumnName(i)).toString());
				} else {
					Arr.push("null");
				}
			}
			newDataset.addRow(Arr);
		}

		log.warn("=== fim processa retorno ===")
	} catch (e) {
		log.error("ERRO==============> " + e.message);
	} finally {
		if (stmt != null) stmt.close();
		if (conn != null) conn.close();
	}
	return newDataset;
}