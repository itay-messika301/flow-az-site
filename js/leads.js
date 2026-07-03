/* Flow — lead delivery for all site forms.
   Every form posts JSON to the Make.com webhook (Make routes to Monday +
   email). If the webhook is unset or fails for any reason, the lead falls
   back to a FormSubmit email so nothing is ever lost. */
window.FLOW_LEADS = {
  webhook: 'https://hook.eu1.make.com/m5pe94q7gpj1rninakylc12pyv8zky86',
  email: 'mor@flow-az.com'
};

window.sendFlowLead = function (form, fields) {
  var payload = Object.assign({ form: form, page: location.pathname }, fields);

  function viaEmail() {
    return fetch('https://formsubmit.co/ajax/' + window.FLOW_LEADS.email, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(Object.assign({
        _subject: 'פנייה חדשה מהאתר — ' + form,
        _template: 'table'
      }, payload))
    }).then(function (r) { if (!r.ok) throw new Error('formsubmit ' + r.status); });
  }

  if (!window.FLOW_LEADS.webhook) return viaEmail();

  return fetch(window.FLOW_LEADS.webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(function (r) {
    if (!r.ok) throw new Error('webhook ' + r.status);
    return r.text();
  }).then(function (t) {
    /* Make returns 200 with an error text when the scenario is off */
    if (/no scenario listening/i.test(t)) throw new Error('scenario off');
  }).catch(function () {
    return viaEmail();
  });
};
