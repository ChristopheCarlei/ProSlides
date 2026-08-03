# ProSlides

Présentations reveal.js du cours FPSE 752501 (Christophe Carlei, UNIGE).
Hébergé via GitHub Pages → https://christophecarlei.github.io/ProSlides/

## Séances

| # | Titre | Date 2027 |
|---|-------|-----------|
| `S01/` | Cadre & Objectifs | 23 fév |
| `S02/` | Projets & groupes | 2 mars |
| `S03/` | Mémoire & Collaboration | 9 mars |
| `S04/` | Avant-projet & IA | 16 mars |
| `S05/` | Prise de parole & Agilité | 23 mars |
| `S06/` | Communication & feedback | 6 avril |
| `S07/` | Gestion projet & planification | 13 avril |
| `S08/` | Présentations intermédiaires *(évaluée)* | 20 avril |
| `S09/` | Neuro-mythes | 27 avril |
| `S10/` | Observation & jugement | 4 mai |
| `S11/` | Efficacité & biais cognitifs | 11 mai |
| `S12/` | Controverses & apprentissage | 18 mai |
| `S13/` | Démonstration des projets *(évaluée finale)* | 25 mai |

## Structure

```
assets/
  clips/       ← toutes les vidéos et images de fond
  fonts/       ← police TheSans (UNIGE/FPSE)
  logos/       ← logos AFORDENS + FPSE
  vendor/      ← moteur reveal.js (CSS + JS), local
image-slot.js  ← composant partagé
S01/ … S13/    ← une séance = un seul index.html
```

Tout est **mutualisé** à la racine : chaque séance référence les ressources
partagées via `../assets/…` et `../image-slot.js`. Une ressource utilisée par
plusieurs séances n'existe qu'en un seul exemplaire.

> ⚠️ Conséquence : une séance n'est **pas** autonome prise isolément. Pour la
> diffuser, publier le dépôt entier — ne pas déplacer un dossier `S0x/` seul,
> il perdrait ses vidéos, ses polices et son moteur de présentation.

## Intégration dans Moodle

Dans une « Page » Moodle, basculer l'éditeur en HTML et coller :

```html
<iframe src="https://christophecarlei.github.io/ProSlides/S06/"
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
