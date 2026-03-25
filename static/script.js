document.addEventListener("DOMContentLoaded", () => {

    const cells = document.querySelectorAll(".cell");

    let mode = "";
    let gameOver = false;

    let wins = 0;
    let loss = 0;
    let draw = 0;

    const modeSelection = document.getElementById("modeSelection");
    const gameContainer = document.getElementById("gameContainer");

    // ================= MODE SELECT =================
    document.getElementById("onePlayer").onclick = () => {
        mode = "1-player";
        startGame();
    };

    document.getElementById("twoPlayer").onclick = () => {
        mode = "2-player";
        startGame();
    };

    function startGame() {
        modeSelection.style.display = "none";
        gameContainer.style.display = "block";
    }

    // ================= CHANGE MODE =================
    document.getElementById("changeMode").onclick = () => {
        location.reload();
    };

    // ================= CELL CLICK =================
    cells.forEach(cell => {
        cell.addEventListener("click", () => {

            if (gameOver) return;

            const index = parseInt(cell.dataset.index);

            fetch("/move", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    index: index,
                    mode: mode
                })
            })
            .then(res => res.json())
            .then(data => {

                if (data.error) {
                    alert(data.error);
                    return;
                }

                updateBoard(data.board);

                // ===== WIN =====
                if (data.winner) {
                    gameOver = true;

                    if (mode === "1-player") {
                        if (data.winner === "X") wins++;
                        else loss++;
                    } else {
                        wins++;
                    }

                    updateScore();
                    updateStatus(`Winner: ${data.winner}`);

                    highlightWinner(data.board, data.winner);
                }

                // ===== DRAW =====
                else if (data.draw) {
                    gameOver = true;
                    draw++;
                    updateScore();
                    updateStatus("It's a Draw!");

                    setTimeout(() => {
                        const again = confirm("It's a draw 🤝\nWould you like to start a new game?");
                        if (again) {
                            location.reload(); // SIMPLE RESET
                        }
                    }, 300);
                }

                // ===== CONTINUE =====
                else {
                    updateStatus(`Current Player: ${data.current_player}`);
                }

            })
            .catch(err => {
                console.error(err);
                alert("Error occurred");
            });
        });
    });

    // ================= UPDATE BOARD =================
    function updateBoard(board) {
        cells.forEach((cell, i) => {
            cell.textContent = board[i];
        });
    }

    // ================= STATUS =================
    function updateStatus(text) {
        document.getElementById("status").textContent = text;
    }

    // ================= SCORE =================
    function updateScore() {
        document.getElementById("wins").textContent = wins;
        document.getElementById("loss").textContent = loss;
        document.getElementById("draw").textContent = draw;
    }

    // ================= WIN HIGHLIGHT =================
    function highlightWinner(board, winner) {
        const patterns = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];

        patterns.forEach(p => {
            const [a,b,c] = p;

            if (board[a] === winner &&
                board[b] === winner &&
                board[c] === winner) {

                p.forEach(i => {
                    cells[i].style.background = "limegreen";
                    cells[i].style.color = "white";
                });
            }
        });
    }

    // ================= RESET BUTTON =================
    document.getElementById("reset").addEventListener("click", () => {
        fetch("/reset")
        .then(() => {
            location.reload(); // FULL RESET (NO BUGS)
        })
        .catch(err => {
            console.error("Reset error:", err);
        });
    });

});