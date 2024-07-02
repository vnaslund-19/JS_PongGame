let predictedY_L;
let predictedY_R;
let AImargin_L;
let AImargin_R;

window.onload = function ()
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

    setInterval(function () {
        predictedY_L = predictFinalYPos(ball, Lplayer);
        predictedY_R = predictFinalYPos(ball, Rplayer);
    }, msAIcalcRefresh);
}

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

    // Bounce off top & bottom
    if (ball.y <= 0 || (ball.y + ball.height >= board.height))
        ball.yVel *= -1;

    simulateAIInput(Lplayer, predictedY_L, 'KeyW', 'KeyS');
    simulateAIInput(Rplayer, predictedY_R, 'ArrowUp', 'ArrowDown');

    // Point scored, player who conceded serves
    if (ball.x < 0) 
    {
        Rplayer.score++;
        if (Rplayer.score >= 5) 
        {
            endGame('Right AI wins!');
            return;
        }
        resetGame(-1);
    }

    if (ball.x + ball.width > boardWidth)
    {
        Lplayer.score++;
        if (Lplayer.score >= 5)
        {
            endGame('Left AI wins!');
            return;
        }
        resetGame(1);
    }

    context.font = "45px sans-serif";
    context.fillText(Lplayer.score, board.width / 5, 45);
    context.fillText(Rplayer.score, board.width / 5 * 4 - 45, 45);

    // Draw middle line
    for (let i = 10; i < board.height; i += 25)
        context.fillRect(board.width / 2 - 10, i, 5, 5);
}

function predictFinalYPos(ball, player)
{
    // AImargin is used in simulateAIinput
    // The calculation is put into this function 
    // to avoid constant recalculation of a random value and thus the AI jittering
    // Randomness (AImargin) makes the AI hit at different angles
    // If you want it to sometimes miss, change the min value to negative
    // For it to regularly miss, the multiple has to be 0.3 or below
    // If getRandom returns -0.1 it only misses for very straight shots
    if (player === Lplayer)
        AImargin_L = playerHeight * getRandomBetween(-0.1, 0.45);
    else
        AImargin_R = playerHeight * getRandomBetween(-0.1, 0.45);

    // If ball is going away from the player
    if ((ball.xVel < 0 && player === Rplayer) || (ball.xVel > 0 && player === Lplayer)) 
        return boardHeight / 2 - ballSide / 2; // Prompt AI to go back to middle

    let timeToOtherSide = Math.abs((player.x - ball.x) / ball.xVel);
    let yMovement = ball.yVel * timeToOtherSide;

    // Simulate bounces off top and bottom walls
    let predictedY = ball.y + yMovement;
    while (predictedY < 0 || predictedY > boardHeight) 
    {
        if (predictedY < 0)
            predictedY = -predictedY;
        else if (predictedY > boardHeight)
            predictedY = 2 * boardHeight - predictedY;
    }
    return predictedY;
}

function simulateAIInput(player, predictedY, upKey, downKey) 
{
    let AImargin = player === Lplayer ? AImargin_L : AImargin_R;

    if (predictedY < player.y + playerHeight - AImargin && predictedY > player.y + AImargin)
    {
        keyUpHandler({ code: upKey });
        keyUpHandler({ code: downKey });
    } 
    else if (predictedY < player.y + playerHeight / 2)
    {
        keyDownHandler({ code: upKey });
        keyUpHandler({ code: downKey });
    } 
    else if (predictedY > player.y + playerHeight / 2) 
    {
        keyDownHandler({ code: downKey });
        keyUpHandler({ code: upKey });
    }
}
