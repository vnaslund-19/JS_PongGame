window.onload = function()
{
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    // draw players
    context.fillStyle = "turquoise";
    context.fillRect(Lplayer.x, Lplayer.y, Lplayer.width, Lplayer.height);
    context.fillRect(Rplayer.x, Rplayer.y, Rplayer.width, Rplayer.height);

    requestAnimationFrame(update);
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
};

function update()
{
    if (gameEnded)
        return;

    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = "turquoise";
    
    Lplayer.y += Lplayer.speed;
    Rplayer.y += Rplayer.speed;

    let yMax = board.height - playerHeight;
    fixOutOfBounds(Lplayer, yMax);
    fixOutOfBounds(Rplayer, yMax);

    context.fillRect(Lplayer.x, Lplayer.y, Lplayer.width, Lplayer.height);
    context.fillRect(Rplayer.x, Rplayer.y, Rplayer.width, Rplayer.height);

    // ball
    if (keyState.powerUpInUse)
        context.fillStyle = "red";
    else
        context.fillStyle = "white";
    if (ball.serve)
    {
        ball.x += ball.xVel * serveSpeedMultiple;
        ball.y += ball.yVel * serveSpeedMultiple;
    }
    else
    {
        ball.x += ball.xVel;
        ball.y += ball.yVel;
    }
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    handlePaddleHit(ball, Lplayer);
    if (handlePaddleHit(ball, Rplayer))
        ball.xVel *= -1;
        
    // Bounce of top & bottom
    if (ball.y <= 0 || (ball.y + ball.height >= board.height))
        ball.yVel *= -1;

    // Point scored, player who conceded serves
    if (ball.x < 0)
    {
        Rplayer.score++;
        if (Rplayer.score >= 5)
        {
            endGame('Right wins!');
            return;
        }
        resetGame(-1);
    }

    if (ball.x + ball.width > board.width)
    {
        Lplayer.score++;
        if (Lplayer.score >= 5) 
        {
            endGame('Left wins!');
            return;
        }
        resetGame(1);
    }

    // Draw middle line
    for (let i = 10; i < board.height; i+=25)
        context.fillRect(board.width/2 - 10, i, 5, 5);

    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(Lplayer.score, board.width/5, 45);
    context.fillText(Rplayer.score, board.width/5 * 4 -45, 45);
}

function freezeAndChangeDir()
{
    let xVeltmp = ball.xVel;
    let yVeltmp = ball.yVel;

    ball.xVel = 0;
    ball.yVel = 0;
    keyState.powerUpInUse = true;

    setTimeout(() => {
        ball.xVel = xVeltmp;
        ball.yVel = yVeltmp * -1;
        keyState.powerUpInUse = false;
    }, 750);
}