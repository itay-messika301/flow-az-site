/* Flow — lead delivery for all site forms.
   Every form emails the full submission to Mor via FormSubmit.
   To route through Make instead, set `webhook` to a Make webhook URL —
   FormSubmit then becomes the automatic fallback. */
window.FLOW_LEADS = {
  webhook: '',
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
    }).then(function (r) {
      if (!r.ok) throw new Error('formsubmit ' + r.status);
      return r.json();
    }).then(function (j) {
      /* FormSubmit answers HTTP 200 even on failure — must check the body */
      if (String(j.success) !== 'true') throw new Error('formsubmit: ' + (j.message || 'not delivered'));
    });
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
    if (/no scenario listening/i.test(t)) throw new Error('scenario off');
  }).catch(function () {
    return viaEmail();
  });
};
