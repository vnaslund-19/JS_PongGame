// Board

let board;
let context;

let boardWidth = 700;
let boardHeight = 500;
let xMargin = 10;

let ballSide = 10;
// Velocity
let xStartVel = 3.5;
let yStartVel = 4.5;

// Pythagoras theorem
startSpeed = Math.sqrt(Math.pow(xStartVel, 2) + Math.pow(yStartVel, 2));
console.log(startSpeed);

let ball = 
{
    x : boardWidth / 2 - ballSide / 2,
    y : boardHeight / 2 - ballSide / 2,
    width : ballSide,
    height : ballSide,
    xVel : xStartVel,
    yVel: yStartVel,
    speed : startSpeed
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
    y : boardHeight/2 - playerHeight/2,
    width : playerWidth,
    height : playerHeight,
    speed : 0,
    score: 0
}

// Right player
let Rplayer =
{
    x : boardWidth - playerWidth - xMargin,
    y : boardHeight/2 - playerHeight/2,
    width : playerWidth,
    height : playerHeight,
    speed : 0,
    score : 0
}

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
    ball.x += ball.xVel;
    ball.y += ball.yVel;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    // Bounce of top & bottom
    if (ball.y <= 0 || (ball.y + ball.height >= board.height))
        ball.yVel *= -1;

    handlePaddleHit(ball, Lplayer);
    if (handlePaddleHit(ball, Rplayer))
        ball.xVel *= -1;
        

    // Point scored
    if (ball.x < 0)
    {
        Rplayer.score++;
        resetGame(xStartVel);
    }

    if (ball.x + ball.width > board.width)
    {
        Lplayer.score++;
        resetGame(-xStartVel);
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

        // Push to closest edge of paddle when it hits the bottom of the paddle
        if (ball.x < player.x)
            ball.x = player.x - ball.width;
        else if (ball.x + ball.width > player.x + player.width)
            ball.x = player.x + player.width;

        // Position of the middle of the ball in relation to the middle of the paddle (-playerHeight/2 - ballSide/2 & playerHeight/2 + ballside/2)
        let collisionPoint = ball.y - player.y - playerHeight/2 + ballSide/2;
        if (collisionPoint > playerHeight/2)
            collisionPoint = playerHeight/2;
        else if (collisionPoint < -playerHeight/2)
            collisionPoint = -playerHeight/2;

        // Convert to index between -1 & 1
        collisionPoint /= playerHeight/2;

        // Rebound angle, depends on where it hits the paddle
        // Max 45 deg, min -45 deg if it hits the edges
        let radAngle = (Math.PI/4) * collisionPoint;

        // Speed increases with every hit
        ball.speed *= 1.035;

        // x & y component calc, x speed is flipped for the ball to bounce
        ball.xVel = ball.speed * Math.cos(radAngle);
        ball.yVel = ball.speed * Math.sin(radAngle);
        return true;
    }
    return false;
}

function resetGame(direction)
{
    ball = 
    {
        x : boardWidth / 2 - ballSide / 2,
        y : boardHeight / 2 - ballSide / 2,
        width : ballSide,
        height : ballSide,
        xVel : direction,
        yVel: yStartVel,
        speed: startSpeed
    }
}
