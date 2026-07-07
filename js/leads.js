/* Flow — lead delivery for all site forms.
   Every form emails the full submission to Mor via FormSubmit.
   Field labels follow the language of the page the visitor was on
   (Hebrew page → Hebrew email, English page → English email).
   To route through Make instead, set `webhook` to a Make webhook URL —
   FormSubmit then becomes the automatic fallback. */
window.FLOW_LEADS = {
  webhook: '',
  email: 'mor@flow-az.com'
};

window.sendFlowLead = function (form, fields) {
  /* the site's language toggle keeps <html lang> in sync with the UI language */
  var isHe = document.documentElement.getAttribute('lang') === 'he';

  var formEn = {
    'צור קשר': 'Contact',
    'פרויקטים': 'Projects',
    'הרצאות': 'Lectures',
    'קורסים אונליין': 'Online Courses',
    'ניוזלטר': 'Newsletter'
  };
  var keyEn = {
    'שם': 'First name',
    'שם משפחה': 'Last name',
    'טלפון': 'Phone',
    'אימייל': 'Email',
    'חברה': 'Company',
    'הודעה': 'Message',
    'מספר משתתפים': 'Participants',
    'פורמט': 'Format',
    'מיקום': 'Location',
    'רמה': 'Level',
    'תחום עניין': 'Interest area',
    'נושא': 'Topic',
    'אישור דיוור': 'Marketing consent'
  };
  var valEn = { 'כן': 'Yes' };

  var formName = isHe ? form : (formEn[form] || form);
  var payload = {
    form: formName,
    page: location.pathname
  };
  payload[isHe ? 'שפה' : 'Language'] = isHe ? 'עברית' : 'English';
  for (var k in fields) {
    var v = fields[k];
    if (v === '' || v == null) continue; /* skip empty fields — cleaner email */
    if (isHe) payload[k] = v;
    else payload[keyEn[k] || k] = valEn[v] || v;
  }

  function viaEmail() {
    return fetch('https://formsubmit.co/ajax/' + window.FLOW_LEADS.email, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(Object.assign({
        _subject: (isHe ? 'פנייה חדשה מהאתר — ' : 'New lead from the website — ') + formName,
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
