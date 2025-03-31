var dsName = "ds_send_recovery_mail ########## ";
function createDataset(fields, constraints, sortFields) {
    var ds = DatasetBuilder.newDataset();
    ds.addColumn("RETORNO");
    ds.addColumn("MENSAGEM");
    try {
        var email = '';
        if (constraints && constraints.length) {
            for (var i = 0; i < constraints.length; i++) {
                if (constraints[i]["fieldName"] == "MAIL") {
                    email = constraints[i].initialValue;
                }
            }
        }
        log.info(dsName + "constraints");
        log.dir(constraints);

        if (!!email) {
            var c1_ds_cadastro_conta = DatasetFactory.createConstraint("emailRegister", email, email, ConstraintType.MUST);
            var ds_cadastro_conta = DatasetFactory.getDataset("ds_cadastro_conta", null, [c1_ds_cadastro_conta], null);
            if (ds_cadastro_conta.rowsCount > 0) {
                var parameters = new java.util.HashMap();
                var subject = "Portal de Cotação - Recuperação de Senha";
                var recipients = new java.util.ArrayList();
                recipients.add(email);

                parameters.put("subject", subject);
                parameters.put("SENHA", ds_cadastro_conta.getValue(0, "passwordRegister"));
                parameters.put("MAIL", ds_cadastro_conta.getValue(0, "emailRegister"));
                notifier.notify("admin", "tpt_recovery_mail", parameters, recipients, "text/html");
                ds.addRow([
                    "OK",
                    "E-mail disparado com sucesso ao usuario: " + email,
                ]);
            } else {
                throw "Dataset 'ds_cadastro_conta' sem conteudo";
            }
        } else {
            throw "Parâmetro 'e-mail' obrigatorio";
        }
    } catch (error) {
        log.info(dsName + "caiu no catch");
        error.message ? error = error.message : error = error.toString();
        ds.addRow([
            "NOK",
            error
        ]);
    }

    return ds;
}