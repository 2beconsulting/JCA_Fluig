function setEnable(form, lEnable) {
	var hpForm = new java.util.HashMap();
	hpForm = form.getCardData();
	var it = hpForm.keySet().iterator();
	while (it.hasNext()) {
	  var key = it.next();
	  form.setEnabled(key, lEnable);
	}
}