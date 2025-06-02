function createDataset(fields, constraints, sortFields) {
  var dataset = DatasetBuilder.newDataset();
  dataset.addColumn("Produto");
  dataset.addColumn("NomeProduto");
  dataset.addColumn("NomeFornecedor");
  dataset.addColumn("CodFornecedor");
  dataset.addColumn("Loja");

  var solicitacao = getConstraintValue(constraints, "solicitacao");

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
      "metadata#id",
      solicitacao,
      solicitacao,
      ConstraintType.MUST
    )
  );

  var datasetPrincipal = DatasetFactory.getDataset(
    "DSFormulariodoProcessodeCotacao",
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
        "tabFornecedorProduto",
        "tabFornecedorProduto",
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
      "DSFormulariodoProcessodeCotacao",
      null,
      constraintsFilhos,
      null
    );

    for (var j = 0; j < datasetFilhos.rowsCount; j++) {
      if (documentId == solicitacao) {
        dataset.addRow(
          new Array(
            datasetFilhos.getValue(j, "A5_PRODUTO"),
            datasetFilhos.getValue(j, "A5_NOMPROD"),
            datasetFilhos.getValue(j, "A5_NOMEFOR"),
            datasetFilhos.getValue(j, "A5_FORNECE"),
            datasetFilhos.getValue(j, "A5_LOJA")
          )
        );
      }
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
