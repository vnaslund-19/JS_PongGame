let predictedY;
let AImargin;

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

    setInterval(function() 
    { predictedY = predictFinalYPos();}, msAIcalcRefresh);
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
    if (keyState.powerUpInUse)
        context.fillStyle = "red";
    else
        context.fillStyle = "white";

    if (ball.serve && !keyState.powerUpInUse)
    {
        ball.x += ball.xVel * serveSpeedMultiple;
        ball.y += ball.yVel * serveSpeedMultiple;
    }
    else if (!keyState.powerUpInUse)
    {
        ball.x += ball.xVel;
        ball.y += ball.yVel;
    }
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    if (ball.xVel < 0)
        handlePaddleHit(ball, Lplayer)
    else
    {
        if (handlePaddleHit(ball, Rplayer))
            ball.xVel *= -1;
    }

    // Bounce of top & bottom
    if (ball.y <= 0 || (ball.y + ball.height >= board.height))
        ball.yVel *= -1;

    simulateAIInput();

    // Point scored, player who conceded serves
    if (ball.x < 0)
    {
        Rplayer.score++;
        if (Rplayer.score >= 5) 
        {
            endGame('AI wins!');
            return;
        }
        resetGame(-1);
    }
    
    if (ball.x + ball.width > board.width)
    {
        Lplayer.score++;
        if (Lplayer.score >= 5)
        {
            endGame('You win!');
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

function predictFinalYPos()
{
    // AImargin is used in simulateAIinput
    // The calculation is put into this function 
    // to avoid constant recalculation of a random value and thus the AI jittering
    // Randomness (AImargin) makes the AI hit at different angles
    // If you want it to sometimes miss, change the min value to negative
    // For it to regularly miss, the multiple has to be -0.3 or below
    // If getRandom returns -0.1 it only misses for very straight shots
    AImargin = playerHeight * getRandomBetween(-0.1, 0.45);

    // As AI can only refresh its view every time predicFinalYPos is called the AI uses its PowerUp here
    // ball.yVel > 3 as its only logical to use the powerUp when the ball is moving at a steep angle 
    // ball.x checks are that so the power up is only used on opponents side but not too close to opponent
    if (!keyState.rPowerUpUsed && ball.xVel < 0 && !ball.serve && ball.x < boardWidth/2 && ball.x > boardWidth/7 && Math.abs(ball.yVel) > 3)
        keyDownHandler({ code : "ArrowLeft" });

    if (ball.xVel < 0) // If ball is going away from AI
        return (boardHeight / 2 - playerHeight / 2); // Prompt AI to go back to middle

    // Amount of times the screen refreshes before ball reaches other side: Length / xVel
    let refreshes = (boardWidth - xMargin - playerWidth - ball.x) / ball.xVel;
    let yMovement = (ball.yVel * refreshes);
    
    let finalYPos = ball.y + ballSide / 2;

    while (true) 
    {
        if (yMovement < 0 && finalYPos + yMovement < ballSide/2) // Bounce off top
        {
            yMovement += finalYPos - ballSide/2;
            yMovement *= -1;
            finalYPos = ballSide/2;
        } 
        else if (yMovement > 0 && finalYPos + yMovement > boardHeight - ballSide/2) // Bounce off bottom
        {
            yMovement -= (boardHeight - finalYPos - ballSide/2);
            yMovement *= -1;
            finalYPos = boardHeight - ballSide/2;
        } 
        else 
        {
            finalYPos += yMovement;
            break;
        }
    }
    console.log("Predicted Y: " + finalYPos + "  (" + ball.xVel + ")");
    return (finalYPos);
}

function simulateAIInput() 
{
    if (predictedY < Rplayer.y + playerHeight - AImargin && predictedY > Rplayer.y + AImargin)
    {
        keyUpHandler({ code: "ArrowUp" });
        keyUpHandler({ code: "ArrowDown" });
    }
    else if (predictedY < Rplayer.y + playerHeight/2)
    {
        keyDownHandler({ code: "ArrowUp" });
        keyUpHandler({ code: "ArrowDown" });
    } 
    else if (predictedY > Rplayer.y + playerHeight/2) 
    {
        keyDownHandler({ code: "ArrowDown" });
        keyUpHandler({ code: "ArrowUp" });
    }
}
