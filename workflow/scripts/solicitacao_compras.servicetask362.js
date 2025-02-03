function servicetask362(attempt, message) {
    tools.log(">> servicetask362")

    var ciclo_atual = hAPI.getCardValue("ciclo_atual");
    ciclo_atual = ciclo_atual == "" ? 1 : ((ciclo_atual * 1) + 1);

    if (ciclo_atual == 1) {
        var cotacao = hAPI.getCardValue("C8_NUM");
        var ciclo = tools.cotacao.geraCicloInicial(cotacao);

        if (!ciclo.ok) {
            throw ciclo.errorMessage;
        }
    } else {
        var novoCiclo = tools.cotacao.geraCicloNovo(ciclo_atual);

        if (!novoCiclo.ok) throw "Ocorreu um problema ao gerar o novo ciclo : " + novoCiclo.error
    }

    hAPI.setCardValue("ciclo_atual", ciclo_atual);
    tools.log("** servicetask362");

}