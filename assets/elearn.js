/* ============================================================================
   Fichier      | assets/elearn.js
   Projet       | ProSlides — Cours FPSE 752501
   Créé         | 2026-08-10
   Modifié      | 2026-08-10
   Description  | Mode « E-learning » : troisième mode d'affichage, après
                | Présentation et Support de cours. Construit un parcours
                | d'auto-test à partir du <template id="elearn-src"> de chaque
                | séance. Quatre types d'activités : qcm, paires, tri, ordre.
   API          | window.Elearn.{open,close,toggle,isOpen}
                | évènement document « elearn:change » → detail.open (bool)
   Dépendances  | assets/elearn.css · <template id="elearn-src">
                | assets/support.js (barre .topbtns, exclusion mutuelle)
   Principe     | Rétroaction non punitive : on peut toujours réessayer, chaque
                | option porte sa propre explication, et le bilan part de ce qui
                | fonctionne — c'est le propos de la séance 11 appliqué à
                | l'outil lui-même.
   ============================================================================ */

(function () {
  'use strict';

  var TPL_ID = 'elearn-src';

  var app = null;          // racine .el-app
  var stage = null, nav = null, steps = null, count = null;
  var open = false;
  var QS = [];             // descripteurs des activités
  var META = {};
  var marks = [];          // 'ok' | 'half' | 'miss' par activité
  var idx = -1;            // -1 = accueil, QS.length = bilan

  /* --- petits utilitaires -------------------------------------------------- */

  function node(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Récupère la rétroaction portée par un élément et la retire du libellé :
     l'auteur écrit <span class="el-fb">…</span> à l'intérieur de l'option. */
  function takeFb(elm) {
    var fb = elm.querySelector(':scope > .el-fb');
    if (!fb) return '';
    var html = fb.innerHTML;
    fb.parentNode.removeChild(fb);
    return html;
  }

  function label(elm) {
    var l = elm.querySelector(':scope > .el-lbl');
    return (l ? l.innerHTML : elm.innerHTML).trim();
  }

  var ICO = {
    ok: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    half: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5"/><path d="M12 16.5h.01"/><circle cx="12" cy="12" r="9"/></svg>',
    miss: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><path d="M12 16.5h.01"/></svg>',
    up: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>',
    down: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'
  };

  var TITRE = { ok: 'Exact', half: 'On y est', miss: 'Pas tout à fait' };

  var KIND_LBL = {
    qcm: 'Choix',
    paires: 'Appairement',
    tri: 'Tri',
    ordre: 'Mise en ordre'
  };

  /* --- lecture du <template> ---------------------------------------------- */

  function parse() {
    var tpl = document.getElementById(TPL_ID);
    if (!tpl || !('content' in tpl)) return false;

    var src = tpl.content.cloneNode(true);

    var meta = src.querySelector('.el-meta');
    META = {
      seance: meta ? meta.getAttribute('data-seance') || '' : '',
      titre: meta ? meta.getAttribute('data-titre') || '' : '',
      intro: meta ? meta.innerHTML : ''
    };

    QS = [];
    Array.prototype.forEach.call(src.querySelectorAll('.el-q'), function (q) {
      QS.push({
        type: q.getAttribute('data-type') || 'qcm',
        src: q.getAttribute('data-src') || '',
        srcLbl: q.getAttribute('data-src-label') || '',
        titre: q.getAttribute('data-titre') || '',
        dom: q
      });
    });
    marks = new Array(QS.length);
    return QS.length > 0;
  }

  /* ========================================================================
     Types d'activité
     Chaque type reçoit (q, host, ctl) :
       ctl.can(bool)          active / désactive le bouton principal
       ctl.check = fn         si l'activité se valide par un bouton « Vérifier »
                              fn() renvoie { kind, html }
       ctl.solve(kind, html)  si l'activité se résout d'elle-même
       ctl.miss()             signale une erreur (compte pour la note)
     ===================================================================== */

  var TYPES = {};

  /* ---- QCM : chaque option porte sa propre explication -------------------- */

  TYPES.qcm = function (q, host, ctl) {
    var multi = q.dom.hasAttribute('data-multi');
    var why = q.dom.querySelector('.el-why');
    var opts = [];

    Array.prototype.forEach.call(q.dom.querySelectorAll('.el-opts > li'), function (li) {
      opts.push({ ok: li.hasAttribute('data-ok'), fb: takeFb(li), lbl: label(li) });
    });
    shuffle(opts);

    var list = node('ul', 'el-opts');
    var picked = [];

    opts.forEach(function (o, i) {
      var b = node('button', 'el-opt', o.lbl);
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        if (multi) {
          var at = picked.indexOf(i);
          if (at >= 0) picked.splice(at, 1); else picked.push(i);
        } else {
          picked = [i];
        }
        Array.prototype.forEach.call(list.children, function (c, j) {
          var on = picked.indexOf(j) >= 0;
          c.classList.toggle('is-pick', on);
          c.setAttribute('aria-pressed', String(on));
        });
        ctl.can(picked.length > 0);
      });
      list.appendChild(b);
      o.btn = b;
    });

    host.appendChild(list);
    if (multi) host.insertBefore(node('p', 'el-hint', 'Plusieurs réponses possibles.'), list);
    ctl.can(false);

    ctl.check = function () {
      var bons = [], mauvais = [];
      opts.forEach(function (o, i) {
        var on = picked.indexOf(i) >= 0;
        if (on && o.ok) bons.push(o);
        if (on && !o.ok) mauvais.push(o);
      });
      var manque = opts.filter(function (o, i) { return o.ok && picked.indexOf(i) < 0; }).length;
      var juste = mauvais.length === 0 && manque === 0;

      if (!juste) {
        /* On n'éteint que les options fautives : la bonne réponse reste à
           trouver, l'étudiant réessaie sans que le corrigé lui soit donné. */
        mauvais.forEach(function (o) { o.btn.classList.add('is-bad'); o.btn.disabled = true; });
        picked = [];
        Array.prototype.forEach.call(list.children, function (c) { c.classList.remove('is-pick'); });
        ctl.can(false);
        ctl.miss();
        var txt = mauvais.map(function (o) { return o.fb; }).filter(Boolean).join('');
        if (!txt) txt = '<p>Ce n\'est pas la piste attendue. Relisez l\'énoncé et retentez votre chance.</p>';
        if (manque > 0 && mauvais.length === 0) {
          txt = '<p>Il manque encore une réponse à cocher.</p>';
        }
        return { kind: 'miss', html: txt, retry: true };
      }

      opts.forEach(function (o) {
        o.btn.disabled = true;
        if (o.ok) o.btn.classList.add('is-ok');
      });
      var html = bons.map(function (o) { return o.fb; }).filter(Boolean).join('');
      if (why) html += why.innerHTML;
      return { kind: 'ok', html: html || '<p>Bonne réponse.</p>' };
    };
  };

  /* ---- Appairement visuel : se résout au fil des paires trouvées ---------- */

  TYPES.paires = function (q, host, ctl) {
    var items = [];
    Array.prototype.forEach.call(q.dom.querySelectorAll('.el-pairs > li'), function (li) {
      var m = li.querySelector(':scope > .el-match');
      items.push({
        ico: li.getAttribute('data-ico') || '•',
        tint: li.getAttribute('data-tint') || '#00857F',
        fb: takeFb(li),
        lbl: label(li),
        match: m ? m.innerHTML.trim() : ''
      });
    });

    var wrap = node('div', 'el-pairs');
    var colA = node('div', 'el-pcol');
    var colB = node('div', 'el-pcol');
    colA.appendChild(node('p', 'el-pcol__h', q.dom.getAttribute('data-col-a') || 'Notion'));
    colB.appendChild(node('p', 'el-pcol__h', q.dom.getAttribute('data-col-b') || 'Ce que ça décrit'));

    var left = shuffle(items.slice());
    var right = shuffle(items.slice());
    var pick = null, found = 0, num = 0;
    var echos = [];

    function tile(it, side) {
      var b = node('button', 'el-tile');
      b.type = 'button';
      b.style.setProperty('--t', it.tint);
      b.innerHTML =
        (side === 'a' ? '<span class="el-tile__ico">' + it.ico + '</span>' : '') +
        '<span>' + (side === 'a' ? it.lbl : it.match) + '</span>' +
        '<span class="el-tile__n"></span>';
      b.addEventListener('click', function () { hit(it, side, b); });
      return b;
    }

    function clearPick() {
      if (pick) pick.btn.classList.remove('is-pick');
      pick = null;
    }

    function hit(it, side, btn) {
      if (btn.classList.contains('is-done')) return;

      if (!pick) { pick = { it: it, side: side, btn: btn }; btn.classList.add('is-pick'); return; }
      if (pick.btn === btn) { clearPick(); return; }
      if (pick.side === side) {           /* on change simplement de sélection */
        clearPick(); pick = { it: it, side: side, btn: btn }; btn.classList.add('is-pick'); return;
      }

      var a = pick.btn, b = btn;
      if (pick.it === it) {
        num++;
        [a, b].forEach(function (x) {
          x.classList.remove('is-pick');
          x.classList.add('is-done');
          x.disabled = true;
          x.querySelector('.el-tile__n').textContent = num;
        });
        pick = null;
        found++;
        if (it.fb) echos.push(it.fb);
        if (found === items.length) {
          ctl.solve('ok', echos.join('') ||
            '<p>Toutes les paires sont reconstituées.</p>');
        }
        return;
      }

      /* mauvaise paire : les deux tuiles tremblent, rien n'est verrouillé */
      [a, b].forEach(function (x) {
        x.classList.add('is-shake');
        setTimeout(function () { x.classList.remove('is-shake'); }, 360);
      });
      clearPick();
      ctl.miss();
      ctl.note('<p>Ces deux-là ne vont pas ensemble. Essayez une autre combinaison.</p>');
    }

    left.forEach(function (it) { colA.appendChild(tile(it, 'a')); });
    right.forEach(function (it) { colB.appendChild(tile(it, 'b')); });
    wrap.appendChild(colA); wrap.appendChild(colB);
    host.appendChild(wrap);
    ctl.can(false);
  };

  /* ---- Tri par catégories : clic-clic, et glisser-déposer à la souris ----- */

  TYPES.tri = function (q, host, ctl) {
    var bins = [];
    Array.prototype.forEach.call(q.dom.querySelectorAll('.el-bins > li'), function (li) {
      bins.push({ id: li.getAttribute('data-bin'), lbl: label(li) });
    });
    var cards = [];
    Array.prototype.forEach.call(q.dom.querySelectorAll('.el-cards > li'), function (li) {
      cards.push({ bin: li.getAttribute('data-bin'), fb: takeFb(li), lbl: label(li) });
    });
    shuffle(cards);

    var pool = node('ul', 'el-pool');
    var rack = node('ul', 'el-bins');
    var sel = null;

    function place(chip, host2) {
      host2.appendChild(chip);
      if (sel === chip) { chip.classList.remove('is-pick'); sel = null; }
      ctl.can(pool.children.length === 0);
    }

    bins.forEach(function (b) {
      var li = node('li', 'el-bin');
      li.innerHTML = '<div class="el-bin__h">' + b.lbl + '</div>';
      var body = node('div', 'el-bin__body');
      body.setAttribute('data-bin', b.id);
      li.appendChild(body);

      li.addEventListener('click', function () { if (sel) place(sel, body); });
      body.addEventListener('dragover', function (e) { e.preventDefault(); li.classList.add('is-target'); });
      body.addEventListener('dragleave', function () { li.classList.remove('is-target'); });
      body.addEventListener('drop', function (e) {
        e.preventDefault(); li.classList.remove('is-target');
        if (drag) place(drag, body);
      });
      rack.appendChild(li);
      b.body = body;
    });

    var drag = null;
    cards.forEach(function (c) {
      var chip = node('button', 'el-chip', c.lbl);
      chip.type = 'button';
      chip.draggable = true;
      chip.addEventListener('click', function (e) {
        e.stopPropagation();
        if (chip.disabled) return;
        if (sel === chip) { chip.classList.remove('is-pick'); sel = null; return; }
        if (sel) sel.classList.remove('is-pick');
        sel = chip; chip.classList.add('is-pick');
      });
      chip.addEventListener('dragstart', function (e) {
        drag = chip; chip.classList.add('is-drag');
        try { e.dataTransfer.setData('text/plain', c.lbl); } catch (err) {}
      });
      chip.addEventListener('dragend', function () { chip.classList.remove('is-drag'); drag = null; });
      c.chip = chip;
      pool.appendChild(chip);
    });

    /* Le vivier accepte aussi le retour d'une carte mal placée. */
    pool.addEventListener('click', function () { if (sel) place(sel, pool); });
    pool.addEventListener('dragover', function (e) { e.preventDefault(); });
    pool.addEventListener('drop', function (e) { e.preventDefault(); if (drag) place(drag, pool); });

    host.appendChild(pool);
    host.appendChild(rack);
    ctl.can(false);

    ctl.check = function () {
      var faux = [];
      cards.forEach(function (c) {
        var here = c.chip.parentNode.getAttribute('data-bin');
        var bon = here === c.bin;
        c.chip.classList.add(bon ? 'is-ok' : 'is-bad');
        if (!bon) faux.push(c);
      });

      if (faux.length) {
        ctl.miss();
        /* Les cartes justes restent en place et se verrouillent ; les autres
           repartent au vivier avec l'explication qui va avec. */
        cards.forEach(function (c) {
          if (c.chip.classList.contains('is-ok')) { c.chip.disabled = true; c.chip.draggable = false; }
          else { c.chip.classList.remove('is-bad'); pool.appendChild(c.chip); }
        });
        ctl.can(false);
        return {
          kind: 'miss', retry: true,
          html: '<p><strong>' + faux.length + (faux.length > 1 ? ' cartes sont' : ' carte est') +
                ' mal placée' + (faux.length > 1 ? 's' : '') + '</strong> — elle' +
                (faux.length > 1 ? 's sont reparties' : ' est repartie') +
                ' dans le vivier. Les autres sont validées.</p>' +
                faux.map(function (c) { return c.fb; }).filter(Boolean).join('')
        };
      }

      cards.forEach(function (c) { c.chip.disabled = true; c.chip.draggable = false; });
      return { kind: 'ok', html: cards.map(function (c) { return c.fb; }).filter(Boolean).join('') };
    };
  };

  /* ---- Remise en ordre : l'ordre du DOM source est l'ordre attendu -------- */

  TYPES.ordre = function (q, host, ctl) {
    var items = [];
    Array.prototype.forEach.call(q.dom.querySelectorAll('.el-seq > li'), function (li, i) {
      items.push({ rank: i, fb: takeFb(li), lbl: label(li) });
    });

    var mel = shuffle(items.slice());
    /* Un tirage qui redonne l'ordre correct priverait l'activité de son intérêt. */
    if (mel.every(function (it, i) { return it.rank === i; })) mel.reverse();

    var list = node('ol', 'el-seq');
    var drag = null;

    function renumber() {
      Array.prototype.forEach.call(list.children, function (row, i) {
        row.querySelector('.el-row__n').textContent = i + 1;
        row.querySelector('.el-mv--up').disabled = (i === 0);
        row.querySelector('.el-mv--dn').disabled = (i === list.children.length - 1);
      });
    }

    function move(row, d) {
      var i = Array.prototype.indexOf.call(list.children, row);
      var j = i + d;
      if (j < 0 || j >= list.children.length) return;
      if (d < 0) list.insertBefore(row, list.children[j]);
      else list.insertBefore(list.children[j], row);
      renumber();
    }

    mel.forEach(function (it) {
      var row = node('li', 'el-row');
      row.draggable = true;
      row.innerHTML =
        '<span class="el-row__n"></span>' +
        '<span class="el-row__t">' + it.lbl + '</span>' +
        '<span class="el-row__mv">' +
          '<button type="button" class="el-mv el-mv--up" aria-label="Monter">' + ICO.up + '</button>' +
          '<button type="button" class="el-mv el-mv--dn" aria-label="Descendre">' + ICO.down + '</button>' +
        '</span>';
      row.querySelector('.el-mv--up').addEventListener('click', function () { move(row, -1); });
      row.querySelector('.el-mv--dn').addEventListener('click', function () { move(row, 1); });

      row.addEventListener('dragstart', function (e) {
        drag = row; row.classList.add('is-drag');
        try { e.dataTransfer.setData('text/plain', it.lbl); } catch (err) {}
      });
      row.addEventListener('dragend', function () { row.classList.remove('is-drag'); drag = null; renumber(); });
      row.addEventListener('dragover', function (e) {
        e.preventDefault();
        if (!drag || drag === row) return;
        row.classList.add('is-over');
        var r = row.getBoundingClientRect();
        var apres = (e.clientY - r.top) > r.height / 2;
        list.insertBefore(drag, apres ? row.nextSibling : row);
      });
      row.addEventListener('dragleave', function () { row.classList.remove('is-over'); });
      row.addEventListener('drop', function (e) { e.preventDefault(); row.classList.remove('is-over'); renumber(); });

      it.row = row;
      list.appendChild(row);
    });

    host.appendChild(list);
    renumber();
    ctl.can(true);

    ctl.check = function () {
      var faux = 0;
      Array.prototype.forEach.call(list.children, function (row, i) {
        var it = items.filter(function (x) { return x.row === row; })[0];
        var bon = it.rank === i;
        row.classList.add(bon ? 'is-ok' : 'is-bad');
        if (!bon) faux++;
      });

      if (faux) {
        ctl.miss();
        setTimeout(function () {
          Array.prototype.forEach.call(list.children, function (r) { r.classList.remove('is-ok', 'is-bad'); });
        }, 1400);
        return {
          kind: 'miss', retry: true,
          html: '<p><strong>' + faux + ' élément' + (faux > 1 ? 's ne sont' : ' n\'est') +
                ' pas à sa place' + (faux > 1 ? '' : '') + '.</strong> Les rangées en vert sont bien placées : ' +
                'repartez de celles-là.</p>'
        };
      }

      Array.prototype.forEach.call(list.querySelectorAll('.el-mv'), function (b) { b.disabled = true; });
      Array.prototype.forEach.call(list.children, function (r) { r.draggable = false; });
      return { kind: 'ok', html: items.map(function (it) { return it.fb; }).filter(Boolean).join('') };
    };
  };

  /* ========================================================================
     Rendu des écrans
     ===================================================================== */

  function setSteps() {
    /* Les boutons de mode ne s'affichent que sur l'écran d'accueil (idx === -1).
       Voir la règle .el-accueil dans elearn.css. À poser AVANT reserveTop(),
       qui mesure la barre : l'ordre inverse relèverait l'état précédent. */
    document.body.classList.toggle('el-accueil', idx === -1);
    reserveTop();          /* appelé par chaque écran : la réserve reste juste */
    steps.innerHTML = '';
    QS.forEach(function (q, i) {
      var s = node('span', 'el-step');
      if (marks[i]) s.classList.add('is-' + marks[i]);
      if (i === idx) s.classList.add('is-now');
      steps.appendChild(s);
    });
    if (idx < 0) count.innerHTML = QS.length + ' activités';
    else if (idx >= QS.length) count.innerHTML = 'Bilan';
    else count.innerHTML = '<b>' + (idx + 1) + '</b> / ' + QS.length;
  }

  function srcTag(q) {
    if (q.srcLbl) return q.srcLbl;
    if (!q.src) return '';
    var n = q.src.replace(/^S0?/, '');
    return n === META.seance.replace(/^0/, '') ? 'Cette séance' : 'Rappel · séance ' + n;
  }

  /* --- accueil ------------------------------------------------------------- */

  function screenIntro() {
    idx = -1; setSteps();
    stage.innerHTML = ''; nav.innerHTML = '';

    var card = node('div', 'el-card el-intro');
    card.innerHTML =
      '<span class="el-kicker">Mode e-learning · séance ' + META.seance + '</span>' +
      '<h1>' + META.titre + '</h1>' + META.intro +
      '<ul class="el-facts">' +
        '<li class="el-fact">' + QS.length + ' activités</li>' +
        '<li class="el-fact">Réessais illimités</li>' +
        '<li class="el-fact">Sans note ni enregistrement</li>' +
      '</ul>';
    stage.appendChild(card);

    var go = node('button', 'el-btn el-btn--go', 'Commencer');
    go.type = 'button';
    go.addEventListener('click', function () { screenQ(0); });
    nav.appendChild(go);
    window.scrollTo(0, 0);
  }

  /* --- une activité -------------------------------------------------------- */

  function screenQ(i) {
    idx = i; setSteps();
    stage.innerHTML = ''; nav.innerHTML = '';

    var q = QS[i];
    var card = node('div', 'el-card');

    var tags = node('div', 'el-tags');
    var st = srcTag(q);
    if (st) {
      /* data-old force la teinte « rappel » quand l'activité couvre plusieurs
         séances et n'a donc pas de data-src unique. */
      var old = q.dom.hasAttribute('data-old') ||
                (q.src && q.src.replace(/^S0?/, '') !== META.seance.replace(/^0/, ''));
      tags.appendChild(node('span', 'el-tag' + (old ? ' el-tag--old' : ''), st));
    }
    tags.appendChild(node('span', 'el-tag el-tag--kind', KIND_LBL[q.type] || q.type));
    card.appendChild(tags);

    var stem = q.dom.querySelector('.el-stem');
    card.appendChild(node('p', 'el-stem', stem ? stem.innerHTML : (q.titre || '')));
    var hint = q.dom.querySelector('.el-hint');
    if (hint) card.appendChild(node('p', 'el-hint', hint.innerHTML));

    var host = node('div', 'el-host');
    card.appendChild(host);
    stage.appendChild(card);

    /* --- boutons --- */
    var main = node('button', 'el-btn el-btn--go', 'Vérifier');
    main.type = 'button';
    var skip = node('button', 'el-btn el-btn--ghost', 'Passer');
    skip.type = 'button';
    nav.appendChild(main);
    nav.appendChild(node('span', 'el-nav__sp'));
    nav.appendChild(skip);

    var errs = 0, resolu = false, echo = null;

    function showEcho(kind, html) {
      if (echo) echo.parentNode.removeChild(echo);
      echo = node('div', 'el-echo' + (kind === 'ok' ? '' : ' el-echo--' + kind));
      echo.innerHTML =
        '<p class="el-echo__h">' + ICO[kind] + TITRE[kind] + '</p>' + html +
        (q.src ? '<span class="el-echo__src">Source : support de cours, séance ' +
                 q.src.replace(/^S0?/, '') + '</span>' : '');
      card.appendChild(echo);
    }

    function terminer(kind, html) {
      resolu = true;
      marks[i] = kind;
      setSteps();
      showEcho(kind, html);
      main.textContent = (i + 1 < QS.length) ? 'Activité suivante' : 'Voir mon bilan';
      main.disabled = false;
      skip.style.display = 'none';
      main.focus();
    }

    var ctl = {
      can: function (on) { if (!resolu) main.disabled = !on; },
      miss: function () { errs++; },
      note: function (html) { showEcho('miss', html); },
      solve: function (kind, html) {
        terminer(errs === 0 ? kind : (kind === 'ok' ? 'half' : kind), html);
      },
      check: null
    };

    TYPES[q.type](q, host, ctl);

    main.addEventListener('click', function () {
      if (resolu) { avancer(i); return; }
      if (!ctl.check) return;
      var r = ctl.check();
      if (!r) return;
      if (r.retry) { showEcho(r.kind, r.html); return; }
      ctl.solve(r.kind, r.html);
    });

    skip.addEventListener('click', function () {
      marks[i] = 'miss';
      avancer(i);
    });

    window.scrollTo(0, 0);
  }

  function avancer(i) {
    if (i + 1 < QS.length) screenQ(i + 1);
    else screenBilan();
  }

  /* --- bilan --------------------------------------------------------------- */

  function screenBilan() {
    idx = QS.length; setSteps();
    stage.innerHTML = ''; nav.innerHTML = '';

    var pts = 0;
    marks.forEach(function (m) { pts += (m === 'ok') ? 1 : (m === 'half' ? 0.5 : 0); });
    var pct = QS.length ? Math.round(pts / QS.length * 100) : 0;

    var C = 2 * Math.PI * 70;
    var card = node('div', 'el-card el-score');

    var mot;
    if (pct >= 85) mot = 'La théorie de la séance est solide. Gardez cette base pour la présentation de votre livrable.';
    else if (pct >= 60) mot = 'L\'essentiel est acquis. Les activités passées en orange méritent une relecture du support de cours — rien de plus.';
    else mot = 'Le parcours a surtout servi à repérer ce qui n\'est pas encore stabilisé. C\'est exactement ce à quoi il sert : reprenez le support de cours sur ces points, puis relancez le quiz.';

    card.innerHTML =
      '<span class="el-kicker">Bilan · séance ' + META.seance + '</span>' +
      '<div class="el-dial">' +
        '<svg width="170" height="170" viewBox="0 0 170 170">' +
          '<circle cx="85" cy="85" r="70" fill="none" stroke="#D9E5E4" stroke-width="14"/>' +
          '<circle cx="85" cy="85" r="70" fill="none" stroke="#00857F" stroke-width="14" ' +
            'stroke-linecap="round" stroke-dasharray="' + C + '" ' +
            'stroke-dashoffset="' + (C * (1 - pct / 100)) + '"/>' +
        '</svg>' +
        '<span class="el-dial__v"><b>' + pct + '%</b><span>maîtrisé</span></span>' +
      '</div>' +
      '<p class="el-word">' + mot + '</p>';

    var recap = node('ul', 'el-recap');
    QS.forEach(function (q, i) {
      var m = marks[i] || 'miss';
      var li = node('li', 'is-' + m);
      var stem = q.dom.querySelector('.el-stem');
      li.innerHTML =
        '<span class="el-recap__b">' + (m === 'ok' ? '✓' : m === 'half' ? '~' : '?') + '</span>' +
        '<span class="el-recap__t">' + (q.titre || (stem ? stem.textContent : 'Activité ' + (i + 1))) + '</span>' +
        '<span class="el-recap__g">' + (m === 'ok' ? 'du premier coup' : m === 'half' ? 'après essai' : 'à revoir') + '</span>';
      recap.appendChild(li);
    });
    card.appendChild(recap);
    stage.appendChild(card);

    var again = node('button', 'el-btn el-btn--go', 'Recommencer');
    again.type = 'button';
    again.addEventListener('click', function () {
      marks = new Array(QS.length);
      parse();                 /* re-tirage : options et paires rebattues */
      screenIntro();
    });
    var back = node('button', 'el-btn el-btn--ghost', 'Revenir aux diapositives');
    back.type = 'button';
    back.addEventListener('click', function () { setOpen(false); });
    nav.appendChild(again);
    nav.appendChild(node('span', 'el-nav__sp'));
    nav.appendChild(back);

    window.scrollTo(0, 0);
  }

  /* ========================================================================
     Coquille et bascule
     ===================================================================== */

  function build() {
    if (!parse()) return null;

    var root = node('div', 'el-app');
    root.id = 'el-app';
    root.setAttribute('lang', 'fr');

    var top = node('div', 'el-top');
    var tin = node('div', 'el-top__in');
    steps = node('div', 'el-steps');
    count = node('span', 'el-count');
    tin.appendChild(steps); tin.appendChild(count);
    top.appendChild(tin);

    stage = node('div', 'el-stage');
    nav = node('div', 'el-nav');

    root.appendChild(top); root.appendChild(stage); root.appendChild(nav);
    document.body.appendChild(root);
    return root;
  }

  /* Mettre en pause pendant que reveal a encore une lecture en attente fait
     rejeter sa promesse (AbortError, non capturée puisqu'elle lui appartient).
     On redemande donc la lecture pour obtenir une promesse sur la même
     opération, et on ne coupe qu'une fois qu'elle a abouti. */
  /* La barre de boutons est fixée au-dessus de tout : on réserve sous elle la
     hauteur qu'elle occupe réellement, plutôt qu'une constante — ses libellés
     passent sur deux lignes sur les écrans très étroits. */
  function reserveTop() {
    if (!app) return;
    var bar = document.querySelector('.topbtns') || document.getElementById('quizbtn');
    /* Hors de l'écran d'accueil la barre est masquée : plus rien à contourner,
       la rangée de progression remonte. Sans ce cas, on garderait 64 px de vide
       réservés à des boutons qui ne sont plus là.
       Le test porte sur la largeur mesurée, pas sur offsetParent : celui-ci vaut
       toujours null pour un élément en position:fixed, ce qui faisait retomber
       la réserve à 14 px même quand la barre était bien affichée. */
    var r = bar ? bar.getBoundingClientRect() : null;
    if (!r || !r.width) { app.style.setProperty('--el-topgap', '14px'); return; }
    app.style.setProperty('--el-topgap', Math.ceil(r.bottom) + 10 + 'px');
  }

  function pauseMedia() {
    Array.prototype.forEach.call(
      document.querySelectorAll('.reveal video, .reveal audio'),
      function (m) {
        if (m.paused) return;
        var stop = function () { try { m.pause(); } catch (e) {} };
        try {
          var p = m.play();
          if (p && p.then) p.then(stop, stop); else stop();
        } catch (e) { stop(); }
      }
    );
  }

  function setOpen(next) {
    if (!app) app = build();
    if (!app) return;

    open = !!next;
    document.body.classList.toggle('elearn-open', open);
    document.documentElement.classList.toggle('elearn-open', open);

    var btn = document.getElementById('quizbtn');
    if (btn) {
      btn.setAttribute('aria-pressed', String(open));
      btn.setAttribute('aria-label', open ? 'Revenir au mode présentation' : 'Ouvrir le module e-learning');
    }

    if (open) {
      /* Les deux modes annexes s'excluent : ouvrir le quiz ferme le support. */
      if (window.SupportLecture && window.SupportLecture.isOpen()) window.SupportLecture.close();
      document.body.classList.remove('dark-slide', 'cover-active');
      pauseMedia();
      if (idx === -1 && !stage.children.length) screenIntro();
      reserveTop();
      window.scrollTo(0, 0);
    }

    document.dispatchEvent(new CustomEvent('elearn:change', { detail: { open: open } }));
  }

  function addButton() {
    if (document.getElementById('quizbtn')) return;
    var bar = document.querySelector('.topbtns');
    var btn = node('button', 'quizbtn');
    btn.id = 'quizbtn';
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Ouvrir le module e-learning');
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>' +
      '<circle cx="12" cy="12" r="9.5"/></svg>' +
      '<span class="lbl-off">E-learning</span><span class="lbl-on">Mode présentation</span>';
    btn.addEventListener('click', function () { setOpen(!open); });

    /* La barre est créée par support.js ; s'il n'a pas tourné, on se rabat sur
       une insertion simple en fin de body (le CSS la positionne de toute façon). */
    if (bar) bar.insertBefore(btn, bar.firstChild);
    else { btn.style.position = 'fixed'; btn.style.top = '16px'; btn.style.right = '18px';
           btn.style.zIndex = '60'; document.body.appendChild(btn); }
  }

  function init() {
    if (!document.getElementById(TPL_ID)) return;   /* séance sans module */
    addButton();

    /* Le support et le quiz ne coexistent pas. */
    document.addEventListener('support:change', function (e) {
      if (e.detail && e.detail.open && open) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (open && (e.key === 'Escape' || e.key === 'Esc')) setOpen(false);
    });

    /* Le retour à la ligne des libellés dépend de la largeur : on remesure,
       mais une frame plus tard — au moment de l'évènement la barre n'a pas
       encore été redisposée et on relèverait l'ancienne hauteur. */
    window.addEventListener('resize', function () {
      if (open) requestAnimationFrame(reserveTop);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.Elearn = {
    open: function () { setOpen(true); },
    close: function () { setOpen(false); },
    toggle: function () { setOpen(!open); },
    isOpen: function () { return open; }
  };
})();
