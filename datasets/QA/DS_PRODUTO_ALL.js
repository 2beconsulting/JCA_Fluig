function createDataset(fields, constraints, sortFields) {
  var dataset = DatasetBuilder.newDataset();
  dataset.addColumn("Codigo");
  dataset.addColumn("ProdutoPai");
  dataset.addColumn("Descricao");
  dataset.addColumn("Grupo");
  dataset.addColumn("Loc");
  dataset.addColumn("Msb");
  dataset.addColumn("Tipo");
  dataset.addColumn("Um");
  dataset.addColumn("Marca");
  dataset.addColumn("Desc");
  dataset.addColumn("Uprc");
  dataset.addColumn("Ucom");

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
        "tabProduto",
        "tabProduto",
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
            datasetFilhos.getValue(j, "B1_COD"),
            datasetFilhos.getValue(j, "B1_PAI"),
            datasetFilhos.getValue(j, "B1_DESC"),
            datasetFilhos.getValue(j, "B1_GRUPO"),
            datasetFilhos.getValue(j, "B1_LOCPAD"),
            datasetFilhos.getValue(j, "B1_MSBLQL"),
            datasetFilhos.getValue(j, "B1_TIPO"),
            datasetFilhos.getValue(j, "B1_UM"),
            datasetFilhos.getValue(j, "B1_ZMARCA"),
            datasetFilhos.getValue(j, "ZPM_DESC"),
            datasetFilhos.getValue(j, "B1_UPRC"),
            datasetFilhos.getValue(j, "B1_UCOM")
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
