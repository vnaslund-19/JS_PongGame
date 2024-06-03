// Board

let board;
let context;

let boardSide = 500;
let xMargin = 10;
let yMargin = 5;

let playerHeight = 50;
let playerWidth = 10;
let playerSpeed = 3;


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
