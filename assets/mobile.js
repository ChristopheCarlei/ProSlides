/* ============================================================================
   Fichier      | assets/mobile.js
   Projet       | ProSlides — Cours FPSE 752501
   Créé         | 2026-08-10
   Description  | Garde-fou téléphone. Le canvas 1280×720 est mis à l'échelle en
                | « cover » : sur un écran portrait étroit, le rogne latéral
                | atteint ~474 px de canvas par côté (mesuré à 375×812), soit
                | bien au-delà de la zone de sécurité qui commence à x=96. Tout
                | le contenu sort de l'écran, et la page ne défile pas
                | horizontalement — il ne reste rien à lire.
                | Plutôt que d'afficher des diapos vides, on oriente vers les
                | deux modes qui, eux, sont responsives : le support de cours et
                | le e-learning.
   Dépendances  | règles .mg-* dans assets/deck.css
                | window.SupportLecture (support.js) · window.Elearn (elearn.js)
   Note         | Préfixe « mg- » : aucun rapport avec les noms filtrés par les
                | bloqueurs de publicité (voir CLAUDE.md §7bis).
   ============================================================================ */

(function () {
  'use strict';

  /* Le seuil d'affichage est porté par la MÉDIA QUERY de deck.css, pas par ce
     script : une bascule pilotée en JS dépendrait de l'évènement `change` de
     matchMedia, qui ne se déclenche pas de façon fiable lors d'un changement de
     viewport, et laissait le garde-fou dans un état périmé après rotation.
     Ici on se contente de construire le DOM — le CSS décide s'il se voit. */

  var garde = null;

  function seance() {
    var t = (document.title || '').split('—')[0];
    return t.trim() || 'Cette séance';
  }

  function bouton(cls, libelle, detail, action) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'mg-btn ' + cls;
    b.innerHTML = '<b>' + libelle + '</b><span>' + detail + '</span>';
    b.addEventListener('click', action);
    return b;
  }

  function construire() {
    if (garde) return garde;

    garde = document.createElement('div');
    garde.className = 'mg-wrap';
    garde.id = 'mg-wrap';
    garde.setAttribute('role', 'region');
    garde.setAttribute('aria-label', 'Choix du format de lecture');

    var carte = document.createElement('div');
    carte.className = 'mg-card';
    carte.innerHTML =
      '<span class="mg-kicker">' + seance() + '</span>' +
      '<h2>Cet écran est trop étroit pour les diapositives</h2>' +
      '<p>Elles sont dessinées pour un vidéoprojecteur&nbsp;: en portrait, la ' +
      'quasi-totalité de leur largeur sort de l\'écran. Deux formats sont ' +
      'faits pour votre téléphone.</p>';

    var choix = document.createElement('div');
    choix.className = 'mg-choix';

    if (window.Elearn) {
      choix.appendChild(bouton('mg-btn--quiz', 'Me tester',
        'Quiz interactif sur la séance', function () { window.Elearn.open(); }));
    }
    if (window.SupportLecture) {
      choix.appendChild(bouton('mg-btn--sup', 'Support de cours',
        'Le contenu rédigé, à lire ou imprimer', function () { window.SupportLecture.open(); }));
    }
    carte.appendChild(choix);

    var pied = document.createElement('p');
    pied.className = 'mg-pied';
    pied.innerHTML = 'Ou tournez votre téléphone pour afficher les diapositives. ';
    var quandMeme = document.createElement('button');
    quandMeme.type = 'button';
    quandMeme.className = 'mg-lien';
    quandMeme.textContent = 'Les afficher quand même';
    quandMeme.addEventListener('click', function () {
      document.body.classList.add('mg-ignore');
    });
    pied.appendChild(quandMeme);
    carte.appendChild(pied);

    garde.appendChild(carte);
    document.body.appendChild(garde);
    return garde;
  }

  /* Construit systématiquement : le garde-fou est masqué par défaut et n'est
     révélé que par la média query. Coût négligeable, et aucun état à
     resynchroniser lors d'une rotation. */
  function init() {
    construire();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.GardeMobile = {
    visible: function () {
      return !!garde && getComputedStyle(garde).display !== 'none';
    },
    reinitialiser: function () { document.body.classList.remove('mg-ignore'); }
  };
})();
