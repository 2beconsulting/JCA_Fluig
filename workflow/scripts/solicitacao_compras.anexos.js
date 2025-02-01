var anexos = {
	buscaPasta: function (descricaoPasta, pastaRaiz) {
		var cPasta = DatasetFactory.createConstraint("documentDescription", descricaoPasta, descricaoPasta, ConstraintType.MUST);
		var cPastaPai = DatasetFactory.createConstraint("parentDocumentId", pastaRaiz, pastaRaiz, ConstraintType.MUST);
		var cActive = DatasetFactory.createConstraint("activeVersion", true, true, ConstraintType.MUST);

		var dsPasta = DatasetFactory.getDataset("document", null, [cPasta, cPastaPai, cActive], null);

		if (dsPasta != null && dsPasta.rowsCount > 0) {
			
			log.info("descricaoPasta 	-> "+descricaoPasta );
			log.info("documentId 		-> "+dsPasta.getValue(0, "documentPK.documentId") );
			
			return dsPasta.getValue(0, "documentPK.documentId");
		} else {
			return anexos.criaPasta(descricaoPasta, pastaRaiz);
		}

	},
	criaPasta: function (txtDescricao, pastaPai) {
		log.info("anexos.criaPasta: " + pastaPai + " > " + txtDescricao)
		var supplierService 	= ServiceManager.getService('ECMFolderService');
		var serviceHelper 		= supplierService.getBean();
		var serviceLocator 		= serviceHelper.instantiate('com.totvs.technology.ecm.dm.ws.ECMFolderServiceService');
		var service 			= serviceLocator.getFolderServicePort();
		
		var customClient = serviceHelper.getCustomClient(
			service, 
			"com.totvs.technology.ecm.dm.ws.FolderService", 
			{
				"disable.chunking"	: "true",
				"log.soap.messages"	: "true",
				"receive.timeout"	: "60000"
			}
		);

		var retorno = customClient.createSimpleFolder(
			hAPI.getAdvancedProperty("username"),				//username
			hAPI.getAdvancedProperty("password"),				//password
			getValue("WKCompany"),								//companyId
			parseInt(pastaPai),									//parentDocumentId
			hAPI.getAdvancedProperty("publisherId"),			//publisherId
			txtDescricao										//documentDescription
		);

		return retorno.getItem().get(0).getDocumentId();
	},
	publica: function (idParent) {
		var docs = hAPI.listAttachments();
		
		for (var i = 0; i < docs.size(); i++) {
			var doc = docs.get(i);
			
			var descricaoFile = doc.getDocumentDescription();

			doc = anexos.handleDocDto(doc, idParent, descricaoFile)

			hAPI.publishWorkflowAttachment(doc);

		}
		
	},
	handleDocDto: function (doc, idParent, descricaoFile) {
		var calendar = java.util.Calendar.getInstance().getTime();
		
		doc.setParentDocumentId(parseInt(idParent));
		doc.setVersionDescription("Processo: " + getValue("WKNumProces"));
		doc.setExpires(false);
		doc.setCreateDate(calendar);
		doc.setInheritSecurity(true);
		doc.setTopicId(1);
		doc.setUserNotify(false);
		doc.setValidationStartDate(calendar);
		doc.setVersionOption("0");
		doc.setUpdateIsoProperties(true);
		if (descricaoFile != '')
			doc.setDocumentDescription(descricaoFile);

		return doc
	}
}
