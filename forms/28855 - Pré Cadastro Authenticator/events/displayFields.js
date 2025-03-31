function displayFields(form, customHTML) {
  var mode = form.getFormMode();

  customHTML.append(
    "<script>function getFormMode(){ return '" +
      form.getFormMode() +
      "'; }</script>"
  );
}
