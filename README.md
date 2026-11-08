# Dames

Le jeu de dames international, sur un damier de 10 × 10, contre l'ordinateur. Sept niveaux, du débutant au grand maître ; la partie en cours est gardée et reprend où tu l'avais laissée, même sur un autre PC.

*English version: [README.en.md](README.en.md)*

## Comment jouer

- Clique un de tes pions, puis la case d'arrivée.
- Pour une **rafle** (plusieurs prises d'un coup), clique directement la case d'arrivée ; si plusieurs chemins finissent sur la même case, clique les cases de passage une par une.
- **Annuler** reprend ton dernier coup (et la réponse de l'ordinateur).
- **Nouvelle partie** recommence ; la liste de couleur choisit **Je joue les blancs**, **Je joue les noirs** ou **Couleur au hasard**. Les blancs commencent.
- Changer de **niveau** en cours de partie s'applique tout de suite, sans recommencer.

## Les règles internationales

- Chaque camp commence avec 20 pions sur les cases foncées des quatre premières rangées.
- Un pion avance d'une case en diagonale ; il **prend en avant comme en arrière**, en sautant par-dessus une pièce adverse vers la case libre juste derrière.
- **La prise est obligatoire**, et il faut choisir la rafle qui prend **le plus de pièces possible**. Le jeu le rappelle si tu tentes un autre coup.
- Un pion qui termine son coup sur la dernière rangée devient **dame** : elle se déplace et prend sur toute la longueur d'une diagonale.
- On gagne quand l'adversaire n'a plus de pièce ou plus aucun coup possible.
- La partie est **nulle** après 25 coups joués uniquement avec des dames, sans prise, ou après une triple répétition de la même position.

## Les niveaux

Débutant, Facile, Moyen, Difficile, Expert, Maître et Grand maître. Les premiers niveaux calculent peu de coups à l'avance et se trompent volontairement de temps en temps ; à partir de Difficile, l'ordinateur cherche le meilleur coup sans erreur, avec de plus en plus de temps de réflexion (jusqu'à 15 secondes).

## Pendant la partie

Le panneau **Coups** liste la partie en notation officielle (cases numérotées de 1 à 50). Le compteur indique tes pions et dames et ceux de l'ordinateur ; l'en-tête montre tes victoires, nulles et défaites au niveau choisi.

## Données et synchronisation

Tes statistiques par niveau et la partie en cours sont enregistrées par NeoDex, sauvegardées et synchronisées entre tes PC si la synchro est activée.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Dames → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
