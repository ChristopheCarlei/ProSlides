# Portraits des diapos « personnage »

Une image par séance, référencée depuis `S0x/index.html` :

```html
<image-slot id="perso-s12" shape="rect" fit="cover"
            src="../assets/portraits/yves-clot.jpg"
            placeholder="Portrait d'Yves Clot"></image-slot>
```

- **Nom de fichier :** `prenom-nom.jpg` en minuscules, sans accent.
- **Format :** cadrage portrait au ratio **0,803** (le cadre fait 358 × 446 px).
  Viser 716 × 892 px pour rester net sur un vidéoprojecteur.
- **Poids :** moins de 200 Ko par portrait.
- Les fichiers d'origine, avant recadrage, sont conservés hors dépôt dans
  `GitHub/_medias_hors_depot/portraits-sources/`.

---

## A. Images sous licence libre — attributions obligatoires

Ces cinq images viennent de Wikimedia Commons. Elles sont réutilisables **à
condition de créditer**.

La ligne de crédit sous le portrait a été retirée des diapos le 2026-08-11.
L'attribution a donc été reportée **en fin de la ligne de références**
(`<p class="perso-src">`, au bas de la fiche) : les licences CC BY et CC BY-SA
imposent de créditer partout où l'œuvre est diffusée, et le diaporama est en
ligne. Ne pas la supprimer sans la replacer ailleurs.

| Fichier | Séance | Source | Auteur | Licence |
|---|---|---|---|---|
| `richard-wittorski.jpg` | S01 | [Wittorski Richard.jpg](https://commons.wikimedia.org/wiki/File:Wittorski_Richard.jpg) | Emmadechampsocial | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `herbert-simon.jpg` | S04 | [Herbert Simon, RIT NandE Vol13Num11 1981 Mar19 Complete.jpg](https://commons.wikimedia.org/wiki/File:Herbert_Simon,_RIT_NandE_Vol13Num11_1981_Mar19_Complete.jpg) | Rochester Institute of Technology | Domaine public |
| `carol-dweck.jpg` | S05 | [Carol Dweck for Innovation documentary.jpg](https://commons.wikimedia.org/wiki/File:Carol_Dweck_for_Innovation_documentary.jpg) | Satheesh Gopalan | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| `carl-rogers.jpg` | S10 | [Carl Ransom Rogers.jpg](https://commons.wikimedia.org/wiki/File:Carl_Ransom_Rogers.jpg) | Didius | [CC BY 2.5](https://creativecommons.org/licenses/by/2.5/) |
| `daniel-kahneman.jpg` | S11 | [Daniel Kahneman (3283955327) (cropped).jpg](https://commons.wikimedia.org/wiki/File:Daniel_Kahneman_(3283955327)_(cropped).jpg) | nrkbeta | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |

⚠️ Ces cinq fichiers sont **recadrés**, donc des œuvres dérivées. Les quatre
sous licence *ShareAlike* (BY-SA) doivent rester diffusés sous cette même
licence. Cela concerne l'image, pas le diaporama qui l'accueille : juxtaposer
une image et du texte constitue une collection, pas une adaptation. Le portrait
d'Herbert Simon, en domaine public, n'a aucune de ces obligations.

⚠️ **Carl Rogers : c'est un dessin au crayon, pas une photographie.** Aucune
photo de lui n'est disponible sous licence libre. Le crédit de la diapo le dit.

---

## B. Images fournies — provenance à établir

Ces sept images ont été fournies par l'enseignant. **Leur source et leurs droits
ne sont pas documentés** et, depuis le retrait des lignes de crédit, les diapos
ne portent plus aucune mention à leur sujet.

| Fichier | Séance | Personne |
|---|---|---|
| `bruce-tuckman.jpg` | S02 | Bruce W. Tuckman |
| `alan-baddeley.jpg` | S03 | Alan Baddeley |
| `john-hattie.jpg` | S06 | John Hattie |
| `martin-barnes.jpg` | S07 | Martin Barnes |
| `donald-schon.jpg` | S08 | Donald A. Schön |
| `elena-pasquinelli.jpg` | S09 | Elena Pasquinelli |
| `yves-clot.jpg` | S12 | Yves Clot |

⚠️ **Projeter en salle et publier en ligne ne sont pas la même chose.** Le
diaporama est en ligne sur https://proslidesm.netlify.app : une photographie de
presse ou un portrait institutionnel y est diffusé publiquement. Pour chacune de
ces sept images, il faut soit retrouver l'auteur et la licence, soit obtenir une
autorisation écrite, soit la remplacer. Compléter ensuite `.perso-credit` dans la
diapo concernée, et cette table.

---

## C. Définition — deux portraits en dessous du seuil

Le cadre fait 358 px de large à l'écran, soit environ 537 px réels sur un
vidéoprojecteur en 1920. Rapport entre la définition du fichier et la largeur du
cadre :

| Portrait | Définition | Rapport |
|---|---|---|
| Wittorski · Simon · Baddeley · Hattie · Barnes | 716 × 892 | 2,00 |
| Clot | 683 × 851 | 1,91 |
| Kahneman | 657 × 818 | 1,84 |
| Dweck | 642 × 798 | 1,79 |
| Rogers | 526 × 656 | 1,47 |
| Pasquinelli | 398 × 496 | 1,11 |
| **Schön** | 314 × 390 | **0,88** |
| **Tuckman** | 304 × 379 | **0,85** |

Schön et Tuckman sont **agrandis** pour remplir le cadre : ils paraissent un peu
mous en projection. Acceptable en l'état, mais une source plus définie
améliorerait ces deux fiches.
