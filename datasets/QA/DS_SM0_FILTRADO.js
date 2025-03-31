function createDataset(fields, constraints, sortFields) {
	log.dir(constraints);
	
	var processo = getContraint(constraints,"processo","COMPRAS");
	log.info(">> processo : " + processo);
	
	if(processo == "COMPRAS"){
		
		var DISPLAY = getContraint(constraints,"DISPLAY","1001");
		log.info(">>> DISPLAY : " + DISPLAY);
		var c = [
			DatasetFactory.createConstraint("COD_GRUPO","01","01",ConstraintType.MUST)
		]
		
		if(DISPLAY != ""){
			var c1 = DatasetFactory.createConstraint("COD_EMPRES","%"+DISPLAY+"%","%"+DISPLAY+"%",ConstraintType.SHOULD);
			c1.setLikeSearch(true);
			c.push(c1);
			var c2 = DatasetFactory.createConstraint("DES_EMPRES","%"+DISPLAY+"%","%"+DISPLAY+"%",ConstraintType.SHOULD);
			c2.setLikeSearch(true);
			c.push(c2);
			var c3 = DatasetFactory.createConstraint("CGC_EMPRES","%"+DISPLAY+"%","%"+DISPLAY+"%",ConstraintType.SHOULD);
			c3.setLikeSearch(true);
			c.push(c3);

			log.dir(c)
			
			return DatasetFactory.getDataset(
				"DS_SM0",
				fields,
				c,
				sortFields
			)
		}
		
		constraints = null;
		
	}
	
	return DatasetFactory.getDataset(
		"DS_SM0",
		fields,
		constraints,
		sortFields
	)
}

function getContraint(constraints,fieldName,defaultValue){
	if(constraints != null){
		for(var i=0 ; i < constraints.length ; i++){
			if(constraints[i]["fieldName"].toUpperCase() == fieldName.toUpperCase()){
				return constraints[i]["initialValue"]
			}
		}
	}
	
	return defaultValue;
}