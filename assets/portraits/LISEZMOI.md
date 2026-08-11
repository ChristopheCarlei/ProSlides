# Portraits des diapos « personnage »

Une image par séance, référencée depuis `S0x/index.html` :

```html
<image-slot id="perso-s12" shape="rect" fit="cover"
            src="../assets/portraits/yves-clot.jpg"
            placeholder="Portrait d'Yves Clot"></image-slot>
```

- **Nom de fichier :** `prenom-nom.jpg` en minuscules, sans accent.
- **Format :** JPEG ou WebP, cadrage portrait au ratio **0,803** (le cadre fait
  358 × 446 px). Viser 716 × 892 px pour rester net sur un écran à haute densité.
- **Poids :** moins de 200 Ko par portrait.

---

## Attributions — obligation de licence

Ces cinq images sont réutilisables, mais **à condition de créditer**. Le crédit
figure sous chaque portrait dans `<p class="perso-credit">`. La liste complète,
avec les liens exigés par les licences, est conservée ici.

| Fichier | Séance | Source | Auteur | Licence |
|---|---|---|---|---|
| `richard-wittorski.jpg` | S01 | [Wittorski Richard.jpg](https://commons.wikimedia.org/wiki/File:Wittorski_Richard.jpg) | Emmadechampsocial | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `herbert-simon.jpg` | S04 | [Herbert Simon, RIT NandE Vol13Num11 1981 Mar19 Complete.jpg](https://commons.wikimedia.org/wiki/File:Herbert_Simon,_RIT_NandE_Vol13Num11_1981_Mar19_Complete.jpg) | Rochester Institute of Technology | Domaine public |
| `carol-dweck.jpg` | S05 | [Carol Dweck for Innovation documentary.jpg](https://commons.wikimedia.org/wiki/File:Carol_Dweck_for_Innovation_documentary.jpg) | Satheesh Gopalan | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| `carl-rogers.jpg` | S10 | [Carl Ransom Rogers.jpg](https://commons.wikimedia.org/wiki/File:Carl_Ransom_Rogers.jpg) | Didius | [CC BY 2.5](https://creativecommons.org/licenses/by/2.5/) |
| `daniel-kahneman.jpg` | S11 | [Daniel Kahneman (3283955327) (cropped).jpg](https://commons.wikimedia.org/wiki/File:Daniel_Kahneman_(3283955327)_(cropped).jpg) | nrkbeta | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |

⚠️ **Les cinq fichiers ont été recadrés**, ce qui en fait des œuvres dérivées.
Les quatre sous licence *ShareAlike* (BY-SA) doivent donc rester diffusés sous
cette même licence. Cela concerne l'image, pas le diaporama qui l'accueille :
juxtaposer une image et du texte constitue une collection, pas une adaptation.
Le portrait d'Herbert Simon, en domaine public, n'a aucune de ces obligations.

⚠️ **Carl Rogers : c'est un dessin au crayon, pas une photographie.** Aucune
photo de lui n'est disponible sous licence libre. Le crédit de la diapo le dit.

---

## Les sept séances sans portrait

Tuckman (S02), Baddeley (S03), Hattie (S06), Barnes (S07), Schön (S08),
Pasquinelli (S09) et Clot (S12) n'ont **aucune image sous licence libre** sur
Wikimedia Commons — vérifié en août 2026. Leurs emplacements affichent une
vignette d'attente, et la diapo reste présentable en l'état.

Des photos d'eux circulent sur le web, mais elles appartiennent à des
photographes ou à des institutions : les publier sur le site du cours serait une
contrefaçon. Deux voies propres pour compléter :

1. **Demander l'autorisation** à la personne ou à son institution. Wittorski,
   Clot et Pasquinelli sont des universitaires joignables ; un accord écrit pour
   un usage pédagogique en ligne suffit. Conserver cet accord.
2. **Photographier soi-même** lors d'une conférence, avec l'accord de la
   personne.

Dans les deux cas, remplir `src` et remplacer le texte de `.perso-credit`.
