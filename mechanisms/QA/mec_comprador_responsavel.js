function resolve(process,colleague){

	var userList = new java.util.ArrayList();

	var processInstanceId = hAPI.getCardValue("solicitacao_compra");
	var movementSequence = "";
	
	var processHistory = DatasetFactory.getDataset(
			"processHistory",
			null,
			[
				DatasetFactory.createConstraint("processHistoryPK.processInstanceId",processInstanceId,processInstanceId,ConstraintType.MUST),
				DatasetFactory.createConstraint("stateSequence","65","65",ConstraintType.MUST)
			],
			null
		)
	
	if(processHistory != null && processHistory.rowsCount > 0){
		var movementSequence = processHistory.getValue((processHistory.rowsCount - 1),"processHistoryPK.movementSequence");
		var processTask = DatasetFactory.getDataset(
				"processTask",
				null,
				[
					DatasetFactory.createConstraint("processTaskPK.processInstanceId",processInstanceId,processInstanceId,ConstraintType.MUST),
					DatasetFactory.createConstraint("processTaskPK.movementSequence",movementSequence,movementSequence,ConstraintType.MUST),
					DatasetFactory.createConstraint("status","2","2",ConstraintType.MUST)
				],
				null
			)
		
		if(processTask != null && processTask.rowsCount > 0){
			userList.add(processTask.getValue(0,"processTaskPK.colleagueId"));
			return userList;
		}
	}

	
	userList.add('admin');

	return userList;

}