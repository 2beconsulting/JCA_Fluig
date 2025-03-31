function createDataset(fields, constraints, sortFields) {
	try{
		
		var c = [
			DatasetFactory.createConstraint("BLOQUEADO","NAO","NAO",ConstraintType.MUST),
			DatasetFactory.createConstraint("B1_ZMARCA","","",ConstraintType.MUST) //Retirado temporariamente por problema no retorno do endPoint /JWSSX301/C1_PRODUTO
		]
	
		processaConstraints(c,constraints);
		
		processaGrupos(c);
		
		log.dir(c);
		
		return DatasetFactory.getDataset("ds_consulta_produto_todos_protheus", null, c, null);
		
	}catch(e){
		var ds = DatasetBuilder.newDataset();
		ds.addColumn("ERRO")
		ds.addRow([e.message != undefined ? e.message : e])
		return ds;
	}
	
}

function processaConstraints(c,constraints){
	log.dir(constraints)
	for(var i=0 ; i < constraints.length ; i++){
		if(constraints[i]["fieldName"].toUpperCase() == "TIPO"){
			var tipo = constraints[i]["initialValue"];
			if(tipo == "servico"){
				var c1 = DatasetFactory.createConstraint("B1_TIPO", "SV", "SV", ConstraintType.MUST);
			}else{
				var c1 = DatasetFactory.createConstraint("B1_TIPO", "SV", "SV", ConstraintType.MUST_NOT);
			}

			c.push(c1);
		}else if(constraints[i]["fieldName"].toUpperCase() == "PROCESSO" && constraints[i]["initialValue"].toUpperCase() == "COMPRAS"){
			var c1 = DatasetFactory.createConstraint("MO", "N", "N", ConstraintType.MUST); // Apenas os produtos que sejam diferentes de Mão de Obra
			c.push(c1);
		}else{
			var c1 = DatasetFactory.createConstraint(constraints[i]["fieldName"],constraints[i]["initialValue"],constraints[i]["finalValue"],ConstraintType.MUST);
			if(constraints[i]["likeSearch"]) c1.setLikeSearch(true);
			c.push(c1);
		}
		
	}
}

function processaGrupos(c){
	var gruposUsuario = getGruposUsuario();
	var gruposProduto = getGruposProdutos();
	
	var gruposProibidos = processaGruposProibidos(c,gruposUsuario,gruposProduto)
}

function getGruposUsuario(){
	var arr = [];
	
	var ds = DatasetFactory.getDataset(
		"colleagueGroup",
		null,
		[
			DatasetFactory.createConstraint("colleagueGroupPK.colleagueId",getValue("WKUser"),getValue("WKUser"),ConstraintType.MUST)
		],
		null
	)
	
	if(ds != null && ds.rowsCount > 0){
		for(var i=0 ; i < ds.rowsCount ; i++){
			arr.push(""+ds.getValue(i,"colleagueGroupPK.groupId"))
		}
	}
	return arr;
}

function getGruposProdutos(){
	var arr = [];
	
	var ds = DatasetFactory.getDataset(
		"DS_Cadastro_GrupoProduto_GrupoFluig",
		null,
		[
			DatasetFactory.createConstraint("metadata#active",true,true,ConstraintType.MUST)
		],
		null
	)
	
	if(ds != null && ds.rowsCount > 0){
		for(var i=0 ; i < ds.rowsCount ; i++){
			arr.push({
				"BM_GRUPO"		: "" + ds.getValue(i,"BM_GRUPO"),
				"groupId"		: "" + ds.getValue(i,"groupId")
			})
		}
	}
	return arr;
}

function processaGruposProibidos(c,gruposUsuario,gruposProduto){
	for(item in gruposProduto){
		if(gruposUsuario.indexOf(gruposProduto[item].groupId) < 0){
			c.push(DatasetFactory.createConstraint("B1_GRUPO",gruposProduto[item].BM_GRUPO,gruposProduto[item].BM_GRUPO,ConstraintType.MUST_NOT))
		}
	}
}