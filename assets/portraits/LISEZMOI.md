# Portraits des diapos « personnage »

Une image par séance, référencée depuis `S0x/index.html` :

```html
<image-slot id="perso-s12" shape="rect" fit="cover"
            src="../assets/portraits/yves-clot.jpg"
            placeholder="Portrait d'Yves Clot"></image-slot>
```

- **Nom de fichier :** `prenom-nom.jpg` en minuscules, sans accent.
- **Format :** JPEG ou WebP, cadrage portrait, au moins 716 × 892 px
  (le cadre fait 358 × 446 px, donc le double pour un écran à haute densité).
- **Poids :** viser moins de 200 Ko par portrait.
- **Droits :** ce sont des photographies de personnes réelles. N'y déposer
  qu'une image dont l'usage est autorisé, et renseigner le crédit dans
  `<p class="perso-credit">` de la diapo. Tant que le fichier n'est pas là,
  l'emplacement affiche une vignette d'attente et la diapo reste présentable.
