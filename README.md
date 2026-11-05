# Aggro Chess Battle

Chess with aggro capture animations. Plain HTML, CSS and JavaScript.
https://basiltschopp.github.io/aggro-chess-battle
<br>

> [!TIP]
> All chess rules come from [chess.js](https://github.com/jhlywa/chess.js) 1.4.0 by Jeff Hlywa (BSD 2-Clause License).
> This project has no chess logic of its own: it asks chess.js for legal moves, animates them and applies them with game.move().
>
> The computer opponent is [Stockfish](https://github.com/official-stockfish/Stockfish) 17.1 via [stockfish.js](https://github.com/nmrugg/stockfish.js) by Nathan Rugg / Chess.com (GPL-3.0 License).
> The single-threaded lite WebAssembly build runs in a Web Worker and answers UCI commands (position fen, go movetime).
>
> - The board and pieces are drawn with Canvas 2D paths, no image files.
> - A requestAnimationFrame loop draws pieces, props and particles. Each capture is an async function per piece type built from small tweens.
> - CSS keeps the board within the viewport, so it works on phones in portrait and landscape.
> - 1 PLAYER mode needs a web server, because browsers block Web Workers on file://. 
> - 2 PLAYERS also works offline.

> [!NOTE]
> This project is released under the [GPL-3.0 License](https://www.gnu.org/licenses/gpl-3.0.html), as it includes Stockfish.
>
> - chess.js keeps its own BSD 2-Clause License, see LICENSE-chess.js.txt. 
> - Stockfish's license is in engine/LICENSE-stockfish.txt.
