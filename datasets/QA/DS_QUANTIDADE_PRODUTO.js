function createDataset(fields, constraints, sortFields) {
  var dataset = DatasetBuilder.newDataset();
  dataset.addColumn("Item");
  dataset.addColumn("Produto");
  dataset.addColumn("UM");
  dataset.addColumn("Descricao");
  dataset.addColumn("Quantidade");
  dataset.addColumn("Preco");
  dataset.addColumn("Total");

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
        "tabSC",
        "tabSC",
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
            datasetFilhos.getValue(j, "C1_ITEM"),
            datasetFilhos.getValue(j, "C1_PRODUTO"),
            datasetFilhos.getValue(j, "C1_UM"),
            datasetFilhos.getValue(j, "C1_DESCRI"),
            datasetFilhos.getValue(j, "C1_QUANT"),
            datasetFilhos.getValue(j, "C1_PRECO"),
            datasetFilhos.getValue(j, "C1_TOTAL")
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
