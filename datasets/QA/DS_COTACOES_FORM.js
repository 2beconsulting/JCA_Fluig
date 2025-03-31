function createDataset(fields, constraints, sortFields) {


  var jConstr = constraintToJson(constraints);
  var mlFormCotacao = "ML001744";
  var mlTabFornecedor = "ML001750";
  var cnstFornecedores = jConstr.FORNECEDORES;


  /**
   * Somente cotações em aberto, para os fornecedores informados, que estejam na etapa de aguarando prazo da cotação
   */
  var txtQuery = "SELECT ML.* , PW.NUM_PROCES, FORN.DOCUMENTID, \
    FORN.A2_CGC  , FORN.A2_COD , \
  FORN.A2_LOJA  , FORN.A2_NOME , ML.version  \
  FROM " + mlFormCotacao + " ML \
                INNER JOIN "+ mlTabFornecedor + " FORN ON FORN.DOCUMENTID = ML.DOCUMENTID \
                AND FORN.VERSION = ML.VERSION \
                AND ML.VERSION  = (SELECT MAX(VERSION) FROM " + mlFormCotacao + " MLVERS WHERE MLVERS.DOCUMENTID = ML.DOCUMENTID) \
                INNER JOIN PROCES_WORKFLOW PW ON PW.NR_DOCUMENTO_CARD = ML.DOCUMENTID                \
                AND PW.STATUS = '0'  \
                INNER JOIN HISTOR_PROCES HP ON HP.NUM_PROCES = PW.NUM_PROCES \
                AND HP.NUM_SEQ_ESTADO = '5' \
          WHERE FORN.A2_CGC IN ('"+ cnstFornecedores + "')";


  var dataset = DatasetBuilder.newDataset();
  if (cnstFornecedores == undefined)
    return dataset;

  return Exec(txtQuery, dataset);
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

function retornoNomeColuna(colunaRetorno) {

  return colunaRetorno
}


function Exec(minhaQuery, newDataset) {
  log.info("DS_COTACOES_FORM > minhaQuery: \n" + minhaQuery)
  var dataSource = "jdbc/AppDS";
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
    log.dir(rs.getMetaData())
    while (rs.next()) {
      if (!created) {
        newDataset.addColumn("idx")
        for (var i = 1; i <= columnCount; i++) {
          newDataset.addColumn(retornoNomeColuna(rs.getMetaData().getColumnName(i)));
        }
        created = true;
      }
      var Arr = [];
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