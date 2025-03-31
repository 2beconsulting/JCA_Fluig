function createDataset(fields, constraints, sortFields) {
	try{
		var instanceId = getConstraint(constraints,"instanceId","");
		if(instanceId != ""){
			var ds = DatasetBuilder.newDataset();
			
			ds.addColumn("instanceId");
			ds.addColumn("documentId");
			ds.addColumn("documentDescription");
			ds.addColumn("url");
			
			var dsHistory = DatasetFactory.getDataset(
				"processHistory",
				["processHistoryPK.movementSequence","stateSequence"],
				[
					DatasetFactory.createConstraint("processHistoryPK.processInstanceId",instanceId,instanceId,ConstraintType.MUST),
					DatasetFactory.createConstraint("stateSequence","1","1",ConstraintType.SHOULD),
					DatasetFactory.createConstraint("stateSequence","3","3",ConstraintType.SHOULD),
					DatasetFactory.createConstraint("stateSequence","65","65",ConstraintType.SHOULD)
				],
				["processHistoryPK.movementSequence"]
			)
			//log.info(">> dsHistory");
			//log.dir(dsHistory);
			if(dsHistory != null && dsHistory.rowsCount > 0){
				var c = [
					DatasetFactory.createConstraint("processAttachmentPK.processInstanceId",instanceId,instanceId,ConstraintType.MUST),
					DatasetFactory.createConstraint("processAttachmentPK.attachmentSequence","1","1",ConstraintType.MUST_NOT)
				];
				
				for(var i = 0 ; i < dsHistory.rowsCount ; i++){
					c.push(DatasetFactory.createConstraint("originalMovementSequence",dsHistory.getValue(i,"processHistoryPK.movementSequence"),dsHistory.getValue(i,"processHistoryPK.movementSequence"),ConstraintType.SHOULD))
				}
				
				var dsAttachment = DatasetFactory.getDataset("processAttachment",["documentId","processAttachmentPK.movementSequence"],c,["documentId"]);
				//log.info(">> dsAttachment");
				//log.dir(dsAttachment);
				
				if(dsAttachment != null && dsAttachment.rowsCount > 0){
					for(var i = 0 ; i < dsAttachment.rowsCount ; i++){
						var documentId = dsAttachment.getValue(i,"documentId");
						var url = getUrl(documentId);
						
						ds.addRow([
							instanceId,
							documentId,
							getDocumentDescription(documentId),
							url.ok ? url.content : ""
						])
					}
				}
			}
			
			return ds;
		}
		else{
			throw "A constraint \"instanceId\" é obrigatória";
		}
	}catch(e){
		var dsError = DatasetBuilder.newDataset();
		dsError.addColumn("ERROR");
		dsError.addRow([e.message != undefined ? e.message : e]);
		return dsError;
	}
	
}

function getConstraint(constraints,fieldName,defaultValue){
	var obj = defaultValue;
	if(constraints != null){
		constraints.forEach(function(el,idx,arr){
			if(el.fieldName.toString().toUpperCase() == fieldName.toUpperCase()){
				obj = el.initialValue;
				arr.length = idx;
			}
		})
	}
	return obj;
}

function getDocumentDescription(documentId){
	var dsDocument = DatasetFactory.getDataset(
		"document",
		["documentDescription"],
		[
			DatasetFactory.createConstraint("documentPK.documentId",documentId,documentId,ConstraintType.MUST),
			DatasetFactory.createConstraint("activeVersion",true,true,ConstraintType.MUST)
		],
		null
	)
	
	return (dsDocument != null && dsDocument.rowsCount > 0) ? dsDocument.getValue(0,"documentDescription") : "";
}

function getUrl(documentId){
	var obj = {ok:false};
	
	var data = {
        companyId 	: getValue("WKCompany") + '',
        serviceCode : 'FLUIG_REST',
        endpoint 	: "/api/public/ecm/document/downloadURL/"+documentId,
        method 		: 'get',
        timeout		: 60000,
        async		: false,
        headers: {
            'Content-Type': 'application/json'
        }
    }
	
	var clientService = fluigAPI.getAuthorizeClientService();
	
	var result = clientService.invoke(new org.json.JSONObject(data).toString());
	
	if(result.getHttpStatusResult() >= 200 && result.getHttpStatusResult() < 300){
    	if (result.getResult()!= null && !result.getResult().isEmpty()){
    		obj.ok = true;
    		obj["content"] = JSON.parse(result.getResult()).content;
    	}
	}
	else{
		obj.ok = false;
		obj["error"] = result.getResult();
	}
	
	return obj;
}