/* ============================================================================
   Fichier      | assets/support.js
   Projet       | ProSlides — Cours FPSE 752501
   Créé         | 2026-08-06
   Modifié      | 2026-08-06
   Description  | Mode « Support de cours » : construit un document A4 à partir
                | du <template id="support-src"> présent dans chaque séance,
                | ajoute une colonne de notes (Cornell) à chaque bloc et gère
                | la bascule présentation / support.
   API          | window.SupportLecture.{open,close,toggle,isOpen,doc}
                | évènement document « support:change » → detail.open (bool)
   Dépendances  | assets/support.css · <template id="support-src"> · #modebtn
   Chrome       | TESTÉ ✅ — affichage, console (0 erreur), bascule, rendu A4
   ============================================================================ */

(function () {
  'use strict';

  var TPL_ID = 'support-src';
  var doc = null;
  var open = false;

  /* --- construction du document ------------------------------------------ */

  function build() {
    var tpl = document.getElementById(TPL_ID);
    if (!tpl || !('content' in tpl)) return null;

    var main = document.createElement('main');
    main.className = 'support-doc';
    main.id = 'support-doc';
    main.setAttribute('lang', 'fr');
    main.appendChild(tpl.content.cloneNode(true));

    Array.prototype.forEach.call(main.querySelectorAll('.sup-block'), decorate);
    addRunningFooter(main);

    document.body.appendChild(main);
    return main;
  }

  /* Bandeau répété au bas de chaque page imprimée : Chrome reproduit les
     éléments position:fixed sur toutes les pages. */
  function addRunningFooter(main) {
    var src = main.querySelector('.sup-foot');
    if (!src || main.querySelector('.sup-runfoot')) return;
    var f = document.createElement('div');
    f.className = 'sup-runfoot';
    f.setAttribute('aria-hidden', 'true');
    f.innerHTML = src.innerHTML;
    main.appendChild(f);
  }

  /* Chaque bloc devient une grille : titre pleine largeur, contenu à gauche,
     colonne de notes vierge à droite. Le titre reste hors de la colonne de
     contenu pour courir sur toute la largeur. */
  function decorate(block) {
    if (block.querySelector(':scope > .sup-content')) return;

    var title = block.querySelector(':scope > h2');
    var content = document.createElement('div');
    content.className = 'sup-content';

    var node = block.firstChild;
    while (node) {
      var next = node.nextSibling;
      if (node !== title) content.appendChild(node);
      node = next;
    }
    block.appendChild(content);

    /* Colonne de notes seulement sur les blocs marqués data-notes="oui|lg" :
       elle est réservée aux contenus théoriques, pas aux informations sur le
       cours (cadre, calendrier, objectifs, outils). */
    var notes = block.getAttribute('data-notes');
    if (notes !== 'oui' && notes !== 'lg') return;

    var aside = document.createElement('aside');
    aside.className = 'sup-notes';
    aside.setAttribute('aria-hidden', 'true');
    aside.innerHTML = '<span class="sup-notes__lbl">Notes</span>';
    block.appendChild(aside);
  }

  /* --- bascule ------------------------------------------------------------ */

  function pauseMedia() {
    Array.prototype.forEach.call(
      document.querySelectorAll('.reveal video, .reveal audio'),
      function (m) {
        /* Couper une lecture encore en attente rejette la promesse de play()
           (AbortError) : on attend qu'elle aboutisse avant de mettre en pause. */
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
    if (!doc) doc = build();
    if (!doc) return;

    open = !!next;
    document.body.classList.toggle('support-open', open);
    /* reveal met html en overflow:hidden : sans cette classe, le document
       A4 ne défile pas. */
    document.documentElement.classList.toggle('support-open', open);

    var btn = document.getElementById('modebtn');
    if (btn) {
      btn.setAttribute('aria-pressed', String(open));
      btn.setAttribute(
        'aria-label',
        open ? 'Revenir au mode présentation' : 'Afficher le support de cours imprimable'
      );
    }

    if (open) {
      document.body.classList.remove('dark-slide', 'cover-active');
      pauseMedia();
      window.scrollTo(0, 0);
    }

    document.dispatchEvent(
      new CustomEvent('support:change', { detail: { open: open } })
    );
  }

  /* --- bouton « Imprimer » ------------------------------------------------- */

  /* Le bouton de bascule existant est déplacé dans une barre commune, pour que
     les deux pastilles s'alignent en haut à droite dans les deux modes. */
  function addPrintButton(modeBtn) {
    if (!modeBtn || document.querySelector('.topbtns')) return;

    var bar = document.createElement('div');
    bar.className = 'topbtns';
    modeBtn.parentNode.insertBefore(bar, modeBtn);

    var btn = document.createElement('button');
    btn.className = 'printbtn';
    btn.id = 'printbtn';
    btn.type = 'button';
    btn.title = 'Imprimer le support de cours (format A4)';
    btn.setAttribute('aria-label', 'Imprimer le support de cours au format A4');
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/>' +
      '<rect x="6" y="14" width="12" height="7" rx="1"/></svg>' +
      '<span>Imprimer</span>';
    btn.addEventListener('click', function () { window.print(); });

    bar.appendChild(btn);
    bar.appendChild(modeBtn);
  }

  /* --- repères de zone de sécurité ---------------------------------------- */

  /* ?safe dans l'URL, ou la touche G, affiche le cadre de la zone de sécurité
     du canvas (voir assets/deck.css). Outil de contrôle, jamais visible en
     séance. */
  function safeGuides() {
    var actif = /[?&]safe(=|&|$)/.test(location.search);
    document.documentElement.classList.toggle('safeguides', actif);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'g' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        document.documentElement.classList.toggle('safeguides');
      }
    });
  }

  /* --- initialisation ----------------------------------------------------- */

  function init() {
    /* Le document est construit dès le chargement : Ctrl+P produit le support
       même depuis le mode présentation. */
    if (!doc) doc = build();

    var btn = document.getElementById('modebtn');
    if (btn && !btn.dataset.supportBound) {
      btn.dataset.supportBound = '1';
      btn.addEventListener('click', function () { setOpen(!open); });
    }
    addPrintButton(btn);
    safeGuides();

    /* Échap ferme le support. */
    document.addEventListener('keydown', function (e) {
      if (open && (e.key === 'Escape' || e.key === 'Esc')) setOpen(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SupportLecture = {
    open: function () { setOpen(true); },
    close: function () { setOpen(false); },
    toggle: function () { setOpen(!open); },
    isOpen: function () { return open; },
    get doc() { return doc; }
  };
})();
