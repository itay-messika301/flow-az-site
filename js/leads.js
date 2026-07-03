/* Flow — lead delivery for all site forms.
   When FLOW_LEADS.webhook is set (Make.com custom webhook), every form posts
   there as JSON and Make handles Monday + email. Until then, leads fall back
   to FormSubmit so nothing is ever lost. */
window.FLOW_LEADS = {
  webhook: '', /* <-- paste Make webhook URL here */
  email: 'mor@flow-az.com'
};

window.sendFlowLead = function (form, fields) {
  var payload = Object.assign({ form: form, page: location.pathname }, fields);
  if (window.FLOW_LEADS.webhook) {
    return fetch(window.FLOW_LEADS.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { if (!r.ok) throw new Error('webhook ' + r.status); });
  }
  return fetch('https://formsubmit.co/ajax/' + window.FLOW_LEADS.email, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(Object.assign({
      _subject: 'פנייה חדשה מהאתר — ' + form,
      _template: 'table'
    }, payload))
  }).then(function (r) { if (!r.ok) throw new Error('formsubmit ' + r.status); });
};
