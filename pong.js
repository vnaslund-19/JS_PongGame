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
    xSpeed : 1,
    ySpeed: 2
}

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
    speed : 0
}

// Right player
let Rplayer =
{
    x : boardSide - playerWidth - xMargin,
    y : boardSide/2 - playerHeight/2,
    width : playerWidth,
    height : playerHeight,
    speed : 0
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
        Lplayer.speed = -playerSpeed;
    else if (event.code == "KeyS")
        Lplayer.speed = playerSpeed;

    if (event.code == "ArrowUp")
        Rplayer.speed = -playerSpeed;
    else if (event.code == "ArrowDown")
        Rplayer.speed = playerSpeed;
}

// Player stops when button is released/no longer pressed down
function keyUpHandler(event)
{
    if (event.code == "KeyW" || event.code == "KeyS")
        Lplayer.speed = 0;

    if (event.code == "ArrowUp" || event.code == "ArrowDown")
        Rplayer.speed = 0;
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
