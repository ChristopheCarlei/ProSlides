# ProSlides

Présentations reveal.js du cours FPSE 752501 (Christophe Carlei, UNIGE).
Hébergé via GitHub Pages → https://christophecarlei.github.io/ProSlides/

## Séances

- `S01/` — Séance 01 : Cadre & Objectifs
- `S02/` — Séance 02 : Projets & groupes
- `S03/` — Séance 03 : Mémoire & Collaboration
- `S04/` — Séance 04 : Avant-projet & IA
- `S05/` — Séance 05 : Prise de parole & Agilité

## Structure

```
videos/            ← tous les clips et images, mutualisés entre les séances
S01/
  index.html       ← la présentation
  assets/fonts/    ← police TheSans (UNIGE/FPSE)
  assets/logos/    ← logos AFORDENS + FPSE
  assets/vendor/   ← moteur reveal.js (CSS + JS), local
S02/ … S05/        ← même structure
```

Les médias sont **mutualisés** dans `videos/` à la racine : chaque diapo y accède
via un chemin relatif `../videos/NomDuFichier.mp4`. Un clip utilisé par plusieurs
séances n'existe donc qu'en un seul exemplaire.

> ⚠️ Conséquence : une séance n'est **pas** autonome prise isolément. Pour la
> diffuser, publier le dépôt entier (GitHub Pages) — ne pas déplacer un dossier
> `S0x/` seul, il perdrait ses vidéos.

## Intégration dans Moodle

Dans une « Page » Moodle, basculer l'éditeur en HTML et coller :

```html
<iframe src="https://christophecarlei.github.io/ProSlides/S01/"
        width="100%" height="640" style="border:0" allowfullscreen></iframe>
```

## Utilisation

- Navigation : flèches ← → du clavier, ou les contrôles à l'écran.
- Plein écran : touche **F**.
- Bouton « Mode lecture » (haut-droite) : défilement vertical de toutes les
  diapos — pratique pour la révision asynchrone.
- Les activités comportent un minuteur : cliquer dessus pour le lancer
  (bip + flash en fin d'étape).
- Impression / PDF : ajouter `?print-pdf` à l'URL puis imprimer.
