from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

board = [""] * 9
current_player = "X"


# 🔍 CHECK WINNER
def check_winner(b):
    wins = [(0,1,2),(3,4,5),(6,7,8),
            (0,3,6),(1,4,7),(2,5,8),
            (0,4,8),(2,4,6)]
    for i,j,k in wins:
        if b[i] and b[i] == b[j] == b[k]:
            return b[i]
    return None


# 🧠 MINIMAX ALGORITHM
def minimax(board_state, is_maximizing):
    winner = check_winner(board_state)

    if winner == "O":
        return 1
    elif winner == "X":
        return -1
    elif "" not in board_state:
        return 0

    if is_maximizing:
        best_score = -float("inf")
        for i in range(9):
            if board_state[i] == "":
                board_state[i] = "O"
                score = minimax(board_state, False)
                board_state[i] = ""
                best_score = max(score, best_score)
        return best_score
    else:
        best_score = float("inf")
        for i in range(9):
            if board_state[i] == "":
                board_state[i] = "X"
                score = minimax(board_state, True)
                board_state[i] = ""
                best_score = min(score, best_score)
        return best_score


# 🤖 AI MOVE USING MINIMAX
def ai_move():
    best_score = -float("inf")
    move = None

    for i in range(9):
        if board[i] == "":
            board[i] = "O"
            score = minimax(board, False)
            board[i] = ""

            if score > best_score:
                best_score = score
                move = i

    return move


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/move", methods=["POST"])
def move():
    global board, current_player

    data = request.get_json(silent=True) or {}

    index = data.get("index")
    mode = data.get("mode")

    # ✅ VALIDATION
    if index is None or not isinstance(index, int):
        return jsonify({"error": "Invalid index"}), 400

    if index < 0 or index > 8:
        return jsonify({"error": "Index out of range"}), 400

    if board[index] != "":
        return jsonify({"error": "Cell already filled"}), 400

    # =========================
    # 🎮 1 PLAYER MODE (X vs AI)
    # =========================
    if mode == "1-player":

        # Player (X)
        board[index] = "X"

        winner = check_winner(board)
        if winner:
            return jsonify({
                "board": board,
                "winner": winner
            })

        if "" not in board:
            return jsonify({
                "board": board,
                "draw": True
            })

        # AI (O)
        ai_index = ai_move()
        if ai_index is not None:
            board[ai_index] = "O"

        winner = check_winner(board)

        if winner:
            return jsonify({
                "board": board,
                "winner": winner
            })

        if "" not in board:
            return jsonify({
                "board": board,
                "draw": True
            })

        return jsonify({
            "board": board,
            "current_player": "X"
        })

    # =========================
    # 👥 2 PLAYER MODE
    # =========================
    else:
        board[index] = current_player

        winner = check_winner(board)

        if winner:
            return jsonify({
                "board": board,
                "winner": winner
            })

        if "" not in board:
            return jsonify({
                "board": board,
                "draw": True
            })

        # SWITCH PLAYER
        current_player = "O" if current_player == "X" else "X"

        return jsonify({
            "board": board,
            "current_player": current_player
        })


@app.route("/reset")
def reset():
    global board, current_player
    board = [""] * 9
    current_player = "X"
    return jsonify({"status": "reset"})


if __name__ == "__main__":
    app.run()