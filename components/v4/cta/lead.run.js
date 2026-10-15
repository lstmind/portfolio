/* Короткая форма (cta/LeadForm.tsx): свёрнута за ссылкой "Нет Telegram? ...", два режима.
   audit: сайт и куда ответить. contact: как обращаться, куда ответить, задача одной фразой.
   Заявка идёт тем же путём, что форма главной: /api/contact, сначала файл заявок, потом Telegram.
   Цели: form_open ловит общий обработчик кликов (components/v4/goals.tsx), audit_submit и lead_form шлёт эта форма.
   Возвращает очистку. */
import { ymGoal } from '../../../lib/metrika';
import { okText, postLead, showFail, validContact, validSite } from './lead';

export function runLead(root) {
  var offs = [];
  var on = function (t, type, fn) { t.addEventListener(type, fn); offs.push(function () { t.removeEventListener(type, fn); }); };
  var d = JSON.parse(root.dataset.lead);
  var audit = d.mode === 'audit';
  var alt = root.querySelector('.lead-alt'), form = root.querySelector('.lead-form');
  var status = root.querySelector('.lead-status'), send = root.querySelector('.lead-send');
  var f = function (n) { return form.elements.namedItem(n); };

  function toggle() {
    var open = form.hidden;
    form.hidden = !open;
    alt.setAttribute('aria-expanded', String(open));
    alt.textContent = open ? d.close : d.alt;
    root.classList.toggle('lead-open', open);
    if (open) form.querySelector('input:not(.lead-hp)').focus();
  }
  on(alt, 'click', toggle);

  /* ошибка у поля: красная рамка, текст в строке статуса, фокус в поле */
  function bad(el, text) {
    el.setAttribute('aria-invalid', 'true');
    status.textContent = text;
    el.focus();
    return false;
  }
  function check() {
    [].forEach.call(form.querySelectorAll('[aria-invalid]'), function (el) { el.setAttribute('aria-invalid', 'false'); });
    if (audit) {
      var s = f('site').value.trim();
      if (!s) return bad(f('site'), d.err.siteEmpty);
      if (!validSite(s)) return bad(f('site'), d.err.site);
    } else if (f('name').value.trim().length < 2) return bad(f('name'), d.err.name);
    var c = f('contact').value.trim();
    if (!c) return bad(f('contact'), d.err.contactEmpty);
    if (!validContact(c)) return bad(f('contact'), d.err.contact);
    return true;
  }
  /* поле поправили: рамка гаснет сразу, не дожидаясь новой отправки */
  on(form, 'input', function (e) { if (e.target.getAttribute('aria-invalid') === 'true') e.target.setAttribute('aria-invalid', 'false'); });

  /* что ушло бы в Telegram при сбое: то, что человек уже написал */
  function draft() {
    if (audit) {
      // у диагностики ещё "что не так": отдельной строкой после адреса
      var issue = f('task') ? f('task').value.trim() : '';
      return d.tgDraft + f('site').value.trim() + (issue ? '\n' + issue.charAt(0).toUpperCase() + issue.slice(1) : '');
    }
    var task = f('task').value.trim();
    // после "Здравствуйте!" задача с большой буквы: "Здравствуйте! Сайт для салона"
    return task ? d.tgDraft + ' ' + task.charAt(0).toUpperCase() + task.slice(1) : d.tgDraft;
  }

  var busy = false;
  on(form, 'submit', function (e) {
    e.preventDefault();
    if (busy) return;
    if (f('company').value) return;
    if (!check()) return;
    busy = true;
    send.disabled = true; send.textContent = d.sending; status.textContent = '';
    var p = audit
      ? { kind: 'audit', site: f('site').value.trim(), contact: f('contact').value.trim(), task: f('task') ? f('task').value.trim() : '' }
      : { kind: 'contact', name: f('name').value.trim(), contact: f('contact').value.trim(), task: f('task').value.trim() };
    p.place = d.place;
    postLead(p).then(function () {
      ymGoal(audit ? 'audit_submit' : 'lead_form', { place: d.place, page: location.pathname });
      form.reset();
      status.textContent = audit ? d.okAudit : okText(d);
      send.textContent = d.sent;
      root.classList.add('lead-done');
    }).catch(function () {
      busy = false;
      send.disabled = false; send.textContent = d.send;
      showFail(status, d, draft());
    });
  });

  return function destroy() {
    offs.forEach(function (fn) { fn(); }); offs = [];
  };
}
