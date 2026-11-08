# Dames (Draughts)

International draughts, on a 10 × 10 board, against the computer. Seven levels, from beginner to grandmaster; the current game is kept and resumes where you left it, even on another PC.

*Version française : [README.md](README.md)*

## How to play

- Click one of your pieces, then the destination square.
- For a **multiple capture**, click the destination square directly; if several paths end on the same square, click the squares along the way one by one.
- **Undo** takes back your last move (and the computer's reply).
- **New game** starts over; the colour list chooses **I play white**, **I play black** or **Random colour**. White moves first.
- Changing the **level** during a game applies at once, without restarting.

## International rules

- Each side starts with 20 men on the dark squares of the first four rows.
- A man moves one square diagonally forward; it **captures forwards and backwards**, jumping over an enemy piece to the free square just behind.
- **Capturing is compulsory**, and you must choose the sequence that takes **the most pieces**. The game reminds you if you try another move.
- A man that ends its move on the far row becomes a **king**: it moves and captures along the whole length of a diagonal.
- You win when the opponent has no pieces or no legal move left.
- The game is a **draw** after 25 moves played only with kings, without a capture, or after the same position occurs three times.

## The levels

Beginner, Easy, Medium, Hard, Expert, Master and Grandmaster. The first levels look only a few moves ahead and deliberately slip up now and then; from Hard onwards the computer searches for the best move without mistakes, with more and more thinking time (up to 15 seconds).

## During the game

The **Moves** panel lists the game in official notation (squares numbered 1 to 50). The counter shows your men and kings and the computer's; the header shows your wins, draws and losses at the chosen level.

## Data and sync

Your statistics per level and the current game are stored by NeoDex, backed up and synced between your PCs when sync is on.

## Install

In NeoDex: **NeoStore → Discover → Dames → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
