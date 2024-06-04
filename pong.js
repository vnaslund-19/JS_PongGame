// Board

let board;
let context;

let boardSide = 500;
let xMargin = 10;

let ballSide = 10;

let ball = 
{
    x : boardSide / 2 - ballSide / 2,
    y : boardSide / 2 - ballSide / 2,
    width : ballSide,
    height : ballSide,
    xSpeed : 1.5,
    ySpeed: 3
}

let keyState = 
{
    w: false,
    s: false,
    up: false,  // ArrowUp
    down: false // ArrowDown
};

let playerHeight = 50;
let playerWidth = 10;
let playerSpeed = 5;

// Left player
let Lplayer =
{
    x : xMargin,
    y : boardSide/2 - playerHeight/2,
    width : playerWidth,
    height : playerHeight,
    speed : 0,
    score: 0
}

// Right player
let Rplayer =
{
    x : boardSide - playerWidth - xMargin,
    y : boardSide/2 - playerHeight/2,
    width : playerWidth,
    height : playerHeight,
    speed : 0,
    score : 0
}

window.onload = function()
{
    board = document.getElementById("board");
    board.height = boardSide;
    board.width = boardSide;
    context = board.getContext("2d");

    // draw players
    context.fillStyle = "turquoise";
    context.fillRect(Lplayer.x, Lplayer.y, Lplayer.width, Lplayer.height);
    context.fillRect(Rplayer.x, Rplayer.y, Rplayer.width, Rplayer.height);

    requestAnimationFrame(update);
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
}

function update()
{
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
    ball.x += ball.xSpeed;
    ball.y += ball.ySpeed;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    // Bounce of top & bottom
    if (ball.y <= 0 || (ball.y + ball.height >= board.height))
        ball.ySpeed *= -1;

    handlePaddleHit(ball, Lplayer);
    handlePaddleHit(ball, Rplayer);

    // Point scored
    if (ball.x < 0)
    {
        Rplayer.score++;
        resetGame(1.5);
    }

    if (ball.x + ball.width > board.width)
    {
        Lplayer.score++;
        resetGame(-1.5);
    }

    context.font = "45px sans-serif";
    context.fillText(Lplayer.score, board.width/5, 45);
    context.fillText(Rplayer.score, board.width/5 * 4 -45, 45);

    // Draw middle line
    for (let i = 10; i < board.height; i+=25)
        context.fillRect(board.width/2 - 10, i, 5, 5);
}

function fixOutOfBounds(player, yMax)
{
    if (player.y < 0)
        player.y = 0;
    else if (player.y > yMax)
        player.y = yMax;
}

function keyDownHandler(event)
{
    if (event.code == "KeyW")
    {
        Lplayer.speed = -playerSpeed;
        keyState.w = true;
    }
    else if (event.code == "KeyS")
    {
        Lplayer.speed = playerSpeed;
        keyState.s = true;
    }
    if (event.code == "ArrowUp")
    {
        Rplayer.speed = -playerSpeed;
        keyState.up = true;
    }
    else if (event.code == "ArrowDown")
    {
        Rplayer.speed = playerSpeed;
        keyState.down = true;
    }
}

// Player stops when button is released/no longer pressed down FIX DOUBLE HOLD DOWN RELEASE
function keyUpHandler(event)
{
    if (event.code == "KeyW")
    {
        keyState.w = false;
        if (keyState.s == true)
            Lplayer.speed = playerSpeed;
        else
            Lplayer.speed = 0;
    }

    if (event.code == "KeyS")
    {
        keyState.s = false;
        if (keyState.w == true)
            Lplayer.speed = -playerSpeed;
        else
            Lplayer.speed = 0;
    }

    if (event.code == "ArrowUp")
    {
        keyState.up = false;
        if (keyState.down == true)
            Rplayer.speed = playerSpeed;
        else
            Rplayer.speed = 0;
    }

    if (event.code == "ArrowDown")
    {
        keyState.down = false;
        if (keyState.up == true)
            Rplayer.speed = -playerSpeed;
        else
            Rplayer.speed = 0;
    }
}

function handlePaddleHit(ball, player)
{
    if ((ball.x < player.x + player.width) &&  // The ball's top left corner doesn't reach the paddles top right corner
        (ball.x + ball.width > player.x) &&    // The ball's top right corner passes the paddles top left corner
        (ball.y < player.y + player.height) && // The ball's top left corner doesn't reach the paddles bottom left corner
        (ball.y + ball.height > player.y))     // The ball's bottom left corner passes the paddles top left corner
    {
        ball.xSpeed *= -1.1;

        // Push to closest edge of paddle
        if (ball.x < player.x) 
            ball.x = player.x - ball.width;
        else if (ball.x + ball.width > player.x + player.width)
            ball.x = player.x + player.width;
    }
}

function resetGame(direction)
{
    ball = 
    {
        x : boardSide / 2 - ballSide / 2,
        y : boardSide / 2 - ballSide / 2,
        width : ballSide,
        height : ballSide,
        xSpeed : direction,
        ySpeed: 3
    }
}
