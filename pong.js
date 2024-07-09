// Board
let board;
let context;

const boardWidth = 700;
const boardHeight = 500;
const xMargin = 10; // Margin from paddle to side of board

const ballSide = 10;

const startSpeed = 7.5;
const speedUpMultiple = 1.02;
const serveSpeedMultiple = 0.4;

let startRadAngle = getRandomBetween((-Math.PI/4), (Math.PI/4));

let xStartVel = startSpeed * Math.cos(startRadAngle) * getRandomEitherOr(-1, 1);
let yStartVel = startSpeed * Math.sin(startRadAngle);

let ball = 
{
    x : boardWidth / 2 - ballSide / 2,
    y : boardHeight / 2 - ballSide / 2,
    width : ballSide,
    height : ballSide,
    xVel : xStartVel,
    yVel : yStartVel,
    speed : startSpeed,
    serve : true
}

let keyState = 
{
    w: false,
    s: false,
    up: false,  // ArrowUp
    down: false, // ArrowDown
    lPowerUpUsed : false,
    rPowerUpUsed : false,
    powerUpInUse : false
};

const playerHeight = 50;
const playerWidth = 10;
const playerSpeed = 5;

// Left player
let Lplayer =
{
    x : xMargin,
    y : boardHeight/2 - playerHeight/2,
    width : playerWidth,
    height : playerHeight,
    speed : 0,
    score: 0
};

// Right player
let Rplayer =
{
    x : boardWidth - playerWidth - xMargin,
    y : boardHeight/2 - playerHeight/2,
    width : playerWidth,
    height : playerHeight,
    speed : 0,
    score : 0
};

let gameEnded = false;

function fixOutOfBounds(player, yMax)
{
    if (player.y < 0)
        player.y = 0;
    else if (player.y > yMax)
        player.y = yMax;
}

function handlePaddleHit(ball, player)
{
    if (keyState.powerUpInUse) // To avoid glitch with multiple speed ups at once
        return ;

    if ((ball.x < player.x + player.width) &&  // The ball's top left corner doesn't reach the paddle's top right corner
        (ball.x + ball.width > player.x) &&    // The ball's top right corner passes the paddle's top left corner
        (ball.y < player.y + player.height) && // The ball's top left corner doesn't reach the paddle's bottom left corner
        (ball.y + ball.height > player.y)) {   // The ball's bottom left corner passes the paddle's top left corner

        // Position of the middle of the ball in relation to the middle of the paddle
        let collisionPoint = ball.y - player.y - playerHeight / 2 + ballSide / 2;
        if (collisionPoint > playerHeight / 2)
            collisionPoint = playerHeight / 2;
        else if (collisionPoint < -playerHeight / 2)
            collisionPoint = -playerHeight / 2;

        // Convert to index between -1 & 1
        collisionPoint /= playerHeight / 2;

        // Rebound angle, depends on where it hits the paddle
        // Max 45 deg, min -45 deg if it hits the edges
        let radAngle = (Math.PI / 4) * collisionPoint;

        // Speed increases with every hit
        ball.speed *= speedUpMultiple;

        // x & y component calc, x speed is flipped for the ball to bounce
        ball.xVel = ball.speed * Math.cos(radAngle);
        ball.yVel = ball.speed * Math.sin(radAngle);
        ball.serve = false;
        return true;
    }
    return false;
}

function resetGame(direction)
{
    startRadAngle = getRandomBetween((-Math.PI / 4), (Math.PI / 4));
    xStartVel = startSpeed * Math.cos(startRadAngle) * direction;
    yStartVel = startSpeed * Math.sin(startRadAngle);

    ball = {
        x: boardWidth / 2 - ballSide / 2,
        y: boardHeight / 2 - ballSide / 2,
        width: ballSide,
        height: ballSide,
        xVel: xStartVel,
        yVel: yStartVel,
        speed: startSpeed,
        serve: true
    }

    keyState.lPowerUpUsed = false;
    keyState.rPowerUpUsed = false;
}

function endGame(winner)
{
    gameEnded = true;
    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);
    context.fillStyle = "white";
    context.font = "50px sans-serif";
    context.fillText(winner, board.width / 2 - (winner.length / 2 * 25), board.height / 2);

    // Wait for 3 seconds before redirecting to pong.html
    setTimeout(() => { window.location.href = 'pong.html'; }, 3000);
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

// Player stops when button is released/no longer pressed down
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

    if (event.code == "KeyD")
        {
            if (ball.xVel > 0 && !keyState.lPowerUpUsed)
            {
                keyState.lPowerUpUsed = true;
                freezeAndChangeDir();
            }
        }
        
    if (event.code == "ArrowLeft")
    {
        if (ball.xVel < 0 && !keyState.rPowerUpUsed)
        {
            keyState.rPowerUpUsed = true;
            freezeAndChangeDir();
        }
    }
}

function freezeAndChangeDir()
{
    keyState.powerUpInUse = true;

    ball.yVel *= -1;
    setTimeout(() => 
    {
        keyState.powerUpInUse = false;
    }, 750);
}

function getRandomBetween(min, max) 
{
    return (Math.random() * (max - min) + min);
}

function getRandomEitherOr(value1, value2)
{
    if (Math.random() > 0.5)
        return (value1);
    else
        return (value2);
}