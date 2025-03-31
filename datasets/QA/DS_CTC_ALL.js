function createDataset(fields, constraints, sortFields) {
  var dataset = DatasetBuilder.newDataset();
  dataset.addColumn("Ciclo");
  dataset.addColumn("Item");
  dataset.addColumn("Produto");
  dataset.addColumn("UM");
  dataset.addColumn("Fornecedor");
  dataset.addColumn("Loja");
  dataset.addColumn("QtdFornecida");
  dataset.addColumn("Preco");
  dataset.addColumn("Total");
  dataset.addColumn("Condicao");
  dataset.addColumn("Prazo");
  dataset.addColumn("FilialEntrega");
  dataset.addColumn("Emissao");
  dataset.addColumn("IPI");
  dataset.addColumn("ICMS");
  dataset.addColumn("ISS");
  dataset.addColumn("DIFAL");
  dataset.addColumn("Seguro");
  dataset.addColumn("Despesa");
  dataset.addColumn("ValorFrete");
  dataset.addColumn("TipoFrete");
  dataset.addColumn("Validade");
  dataset.addColumn("Pedido");
  dataset.addColumn("ItemPedido");
  dataset.addColumn("BeneficioFiscal");

  var solicitacao = getConstraintValue(constraints, "numeroSolicitacao");

  var constraints = new Array();

  constraints.push(
    DatasetFactory.createConstraint(
      "metadata#active",
      true,
      true,
      ConstraintType.MUST
    )
  );

  constraints.push(
    DatasetFactory.createConstraint(
      "numeroSolicitacao",
      solicitacao,
      solicitacao,
      ConstraintType.MUST
    )
  );

  var datasetPrincipal = DatasetFactory.getDataset(
    "DSFormulariocotacoesProcessoCotacaoCompras",
    null,
    constraints,
    null
  );

  for (var i = 0; i < datasetPrincipal.rowsCount; i++) {
    var WKNumProces = datasetPrincipal.getValue(i, "WKNumProces");
    var documentId = datasetPrincipal.getValue(i, "metadata#id");
    var documentVersion = datasetPrincipal.getValue(i, "metadata#version");

    var constraintsFilhos = new Array();

    constraintsFilhos.push(
      DatasetFactory.createConstraint(
        "tablename",
        "tabCotacao",
        "tabCotacao",
        ConstraintType.MUST
      )
    );

    constraintsFilhos.push(
      DatasetFactory.createConstraint(
        "metadata#id",
        documentId,
        documentId,
        ConstraintType.MUST
      )
    );

    constraintsFilhos.push(
      DatasetFactory.createConstraint(
        "metadata#version",
        documentVersion,
        documentVersion,
        ConstraintType.MUST
      )
    );

    var datasetFilhos = DatasetFactory.getDataset(
      "DSFormulariocotacoesProcessoCotacaoCompras",
      null,
      constraintsFilhos,
      null
    );

    for (var j = 0; j < datasetFilhos.rowsCount; j++) {
      dataset.addRow(
        new Array(
          datasetFilhos.getValue(j, "C8_CICLO"),
          datasetFilhos.getValue(j, "C8_ITEM"),
          datasetFilhos.getValue(j, "C8_PRODUTO"),
          datasetFilhos.getValue(j, "C8_UM"),
          datasetFilhos.getValue(j, "C8_FORNECE"),
          datasetFilhos.getValue(j, "C8_LOJA"),
          datasetFilhos.getValue(j, "C8_QUANT"),
          datasetFilhos.getValue(j, "C8_PRECO"),
          datasetFilhos.getValue(j, "C8_TOTAL"),
          datasetFilhos.getValue(j, "C8_COND"),
          datasetFilhos.getValue(j, "C8_PRAZO"),
          datasetFilhos.getValue(j, "C8_FILENT"),
          datasetFilhos.getValue(j, "C8_EMISSAO"),
          datasetFilhos.getValue(j, "C8_VALIPI"),
          datasetFilhos.getValue(j, "C8_VALICM"),
          datasetFilhos.getValue(j, "C8_VALISS"),
          datasetFilhos.getValue(j, "C8_DIFAL"),
          datasetFilhos.getValue(j, "C8_SEGURO"),
          datasetFilhos.getValue(j, "C8_DESPESA"),
          datasetFilhos.getValue(j, "C8_VALFRE"),
          datasetFilhos.getValue(j, "C8_TPFRETE"),
          datasetFilhos.getValue(j, "C8_VALIDA"),
          datasetFilhos.getValue(j, "C8_NUMPED"),
          datasetFilhos.getValue(j, "C8_ITEMPED"),
          datasetFilhos.getValue(j, "BEN_FISCAL")
        )
      );
    }
  }

  return dataset;
}

function getConstraintValue(constraints, fieldName) {
  for (var i = 0; i < constraints.length; i++) {
    if (constraints[i].fieldName == fieldName) {
      return constraints[i].initialValue;
    }
  }
  return "";
}
