var CANVAS_WIDTH, CANVAS_HEIGHT;


var background = new Image();
background.src = "images/skyline.svg";

// When window resizes change canvas size to match it's parent
$(window).resize(function(event) {
  resizeCanvas();
  repositionHouses();
});

// This is to just list the available game events that occur
var gameEvents = {
  gameStart: "gameStart",
  gameEnd: "gameEnd",
  gameRestart: "gameRestart",
  gamePause: "gamePause",
  gameResume: "gameResume"
}

window.onBlur = gamePause;
window.onFocus = gameResume;

document.addEventListener("gameStart", gameStart);
document.addEventListener("gameEnd", gameEnd);
document.addEventListener("gameRestart", gameRestart);
document.addEventListener("gamePause", gamePause);
document.addEventListener("gameResume", gameResume);

// Called when Game Starts
function gameStart(event) {
  resizeCanvas();
  init();
}
// Called when game ends
function gameEnd(event) {
  _triggerGameEvent("gamePause");
  console.log(event);
  $("#score").html(event.detail.score);
}

// called when game restarts
function gameRestart(event) {
  resetVariables();
  init();
}

// Called when game paused
function gamePause(event) {
  gameState = 2;
  ctx.save();
}

// Called when game Resumed
function gameResume(event) {
  gameState = 1;
  ctx.restore();
}


// Create the canvas
var canvas = $("#game-canvas");
var container = $(canvas).parent();
var ctx = canvas[0].getContext("2d");

// Game Variables
var houses = [];
var dreams = [];
var keysPressed = {
  37: false,
  38: false,
  39: false,
  40: false
};
var startTime = Date.now();
var currentTime;
var sendDreamTimer = 1.5;
var lastDreamTime = 0;
var score = 0;
var livesLeft = 3;
var dreamVelocity = 1;
var dreamsOnScreen = 0;
var dreamsAllowedOnScreen = 5;
var dreamsProduced = 0;
var redDreamsCaught = 0;
var dreamsCaughtFlag = true;
var sendDreamFlag = false;

var gameState = 1;


function resetVariables() {
  houses = [];
  dreams = [];
  keysPressed = {
    37: false,
    38: false,
    39: false,
    40: false
  };
  startTime = Date.now();
  currentTime;
  sendDreamTimer = 1.5;
  lastDreamTime = 0;
  score = 0;
  livesLeft = 3;
  dreamsOnScreen = 0;
  dreamsAllowedOnScreen = 5;
  dreamsProduced = 0;
  redDreamsCaught = 0;
  dreamsCaughtFlag = true;
  sendDreamFlag = false;

  gameState = 1;
}

function resizeCanvas() {
  CANVAS_WIDTH = $(container).width();
  CANVAS_HEIGHT = $(container).height();
  $(canvas).attr({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT
  });
  console.log(CANVAS_HEIGHT);
  draw();
};

/* Initialize game at first */
function init() {
  $(document).keydown(keysDown).keyup(keysUp);
  canvas[0].addEventListener("mousemove", getMousePosition);
  canvas[0].addEventListener("touchmove", getTouchPosition);
  canvas[0].addEventListener("touchend", endTouchListener);
  initializeHouses();
  draw();
}

// Drawing and animation in Canvas

var dreamCatcher = {
  x: 50,
  y: 30,
  width: 50,
  height: 100,
  velocity: 15,
  image: "images/dreamcatcher.svg",
  moveLeft: function moveLeft() {
    if (dreamCatcher.x > 0) {
      dreamCatcher.x -= dreamCatcher.velocity;
    }
  },
  moveRight: function moveRight() {
    if (dreamCatcher.x < CANVAS_WIDTH - dreamCatcher.width) {
      dreamCatcher.x += dreamCatcher.velocity;
    }
  },
  moveUp: function moveUp() {
    if (dreamCatcher.y > 0) {
      dreamCatcher.y -= dreamCatcher.velocity;
    }
  },
  moveDown: function moveDown() {
    if (dreamCatcher.y + dreamCatcher.height < CANVAS_HEIGHT) {
      dreamCatcher.y += dreamCatcher.velocity;
    }
  }
}

function House(x, y) {
  this.width = 40;
  this.height = 120;
  this.x = x;
  this.y = CANVAS_HEIGHT - this.height;
  this.image = "images/building.svg";


  this.drawHouse = function() {
    ctx.fillStyle = "#000"; // Set color to black
    var houseImage = new Image();
    houseImage.src = this.image;
    ctx.drawImage(houseImage, this.x, this.y, this.width, this.height);
  }

}

function Dream(houseIndex, width, height, type, velocity) {
  var correspondingHouse = houses[houseIndex];
  this.x = correspondingHouse.x + correspondingHouse.width / 2;
  this.y = correspondingHouse.y;
  this.width = width;
  this.height = height;
  this.velocity = velocity;
  // type 1 => Green Dream, type 2 => Red Dream
  this.type = type;
  this.active = true;
  dreamsOnScreen++;
  this.moveDream = function() {
    this.initialPosition = correspondingHouse.y
    if (this.y <= 0) {
      reachedSky(this);
      this.resetDream();
    } else if (this.active) {
      this.y -= this.velocity;
    }
  };

  this.resetDream = function() {
    var dreamIndex = dreams.indexOf(this);
    dreams.splice(dreamIndex, 1);
  }

  this.drawDream = function drawDream() {
    var gradient = ctx.createRadialGradient(this.x, this.y, this.width / 10, this.x, this.y, this.width);
    gradient.addColorStop(0, 'white');

    if (this.type == 2) {
      gradient.addColorStop(1, "#B50000");
    } else if (this.type == 1) {
      gradient.addColorStop(1, "#00B500");
    }
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }
}

function initializeHouses() {

  housesX = [CANVAS_WIDTH / 8, 3 * CANVAS_WIDTH / 8, 5 * CANVAS_WIDTH / 8, 7 * CANVAS_WIDTH / 8];
  housesX.forEach(function(houseX) {
    var house = new House(houseX);
    houses.push(house);
  })
}

function repositionHouses() {
  housesX = [CANVAS_WIDTH / 8, 3 * CANVAS_WIDTH / 8, 5 * CANVAS_WIDTH / 8, 7 * CANVAS_WIDTH / 8];
  houses.map(function (house, index) {
    house.x = housesX[index];
    house.y = CANVAS_HEIGHT - house.height;
    return house;
  })
}

function moveDreamCatcher(event) {

  switch (event.which) {
    // ArrowLeft
    case 37:
      dreamCatcher.moveLeft();
      break;
    case 38:
      dreamCatcher.moveUp();
      break;
      // ArrowRight
    case 39:
      dreamCatcher.moveRight();
      break;
      // ArrowUp
      // Arrow Down
    case 40:
      // alert("DOWN");
      dreamCatcher.moveDown();
      break;
      // P key
    case 80:
      if (gameState == 1) {
        _triggerGameEvent("gamePause");
      } else {
        _triggerGameEvent("gameResume");
      }
      break;
    default:

  }

  switch (event.key) {
    case "ArrowLeft":
      dreamCatcher.moveLeft();
      break;
    case "ArrowRight":
      dreamCatcher.moveRight();
      break;
    case "ArrowUp":
      dreamCatcher.moveUp();
      break;
    case "ArrowDown":
      dreamCatcher.moveDown();
      break;
  }
  // Left key
  if (event.key == "ArrowLeft") {
    // Right Key
  } else if (event.key == "ArrowRight") {
    dreamCatcher.moveRight();
  }

  // else if (event.)

}

function keysDown(event) {
  // moveDreamCatcher(event);

  if (event.which in keysPressed) {
    keysPressed[event.which] = true;

    if (keysPressed[37]) {
      dreamCatcher.moveLeft();
    }
    if (keysPressed[38]) {
      dreamCatcher.moveUp();
    }
    if (keysPressed[39]) {
      dreamCatcher.moveRight();
    }
    if (keysPressed[40]) {
      dreamCatcher.moveDown();
    }
  } else {
    switch (event.which) {
      case 80:
        if (gameState == 1) {
          _triggerGameEvent("gamePause");
        } else {
          _triggerGameEvent("gameResume");
        }
        break;
      default:
    }
  }
}

function keysUp(event) {
  if (event.which in keysPressed) {
    keysPressed[event.which] = false;
  }
}


function drawDreamCatcher() {
  ctx.fillStyle = "#000"; // Set color to black
  // Initializing Images
  var dreamCatcherImage = new Image();
  dreamCatcherImage.src = dreamCatcher.image;
  ctx.drawImage(dreamCatcherImage, dreamCatcher.x, dreamCatcher.y, dreamCatcher.width, dreamCatcher.height)
}

function drawHouses() {
  houses.forEach(function(house) {
    house.drawHouse();
  })
}


function drawDreams() {
  dreams.forEach(function(dream) {
    dream.drawDream();
  })
}



function moveDreams() {
  dreams.forEach(function(dream) {
    dream.moveDream();
  })
}

function checkDreamsCollision() {
  dreams.forEach(function(dream) {
    checkCatcherCollision(dream);
  })
}

function checkCatcherCollision(dream) {
  var dreamCatcherBottom = dreamCatcher.y + dreamCatcher.height;
  var dreamCatcherTop = dreamCatcher.y;
  var dreamCatcherCenter = dreamCatcher.y + (dreamCatcher.height / 4);
  var dreamBottom = dream.y - dream.width;
  if (dream.x > dreamCatcher.x - 5 && dream.x < dreamCatcher.x + dreamCatcher.width + 5) {
    if (dreamCatcherCenter - dreamBottom < 20 && dreamCatcherCenter - dreamBottom >= -20) {
      catchDream(dream);
      dream.resetDream();
    }
  }
}

function catchDream(dream) {
  dreamsOnScreen--;
  if (dream.type == 1) {
    score -= 5;
  } else if (dream.type == 2) {
    score += 10;
    redDreamsCaught++;
  }
}

function sendDream() {
  if (dreamsOnScreen < dreamsAllowedOnScreen) {
    dreamsProduced++;
    var houseIndex = Math.floor(Math.random() * houses.length);
    var velocities = [dreamVelocity, dreamVelocity + 0.5];
    var veloctiyIndex = Math.floor(Math.random() * 2);
    var dreamType = chooseDreamType();
    var dreamWidth = 20;
    var dreamHeight = 20;
    var newDream = new Dream(houseIndex, dreamWidth, dreamHeight, dreamType, velocities[veloctiyIndex]);
    dreams.push(newDream);

  }
}

// Function to randomly generate a dream type but constrained
function chooseDreamType() {
  var random = Math.random();
  var goodDreamsPercentage = 0.7;
  if (random < goodDreamsPercentage) {
    return 1;
  } else {
    return 2;
  }
}

function updateClock() {
  currentTime = Date.now() - startTime;
  var currentTimeTengthSeconds = Math.floor(currentTime / 100);
  var sendDreamTimerTength = sendDreamTimer * 10;
  var sendDreamTimerMilli = sendDreamTimer * 1000;

  var randomTolerance = Math.floor((Math.random() * sendDreamTimerTength) + 1);

  if (currentTime % sendDreamTimerMilli >= 0 && currentTime % sendDreamTimerMilli < 10) {
    console.log("Current Time: ", currentTime, "sendDreamTimer", sendDreamTimerMilli, "currentTime % sendDreamTimerMilli", currentTime % sendDreamTimerMilli );
    sendDream();
    sendDreamFlag = true;
  }

  // if (currentTimeTengthSeconds % sendDreamTimerTength - randomTolerance == 0 && !sendDreamFlag) {
  //   sendDream();
  //   sendDreamFlag = true;
  // }
  // if (currentTimeTengthSeconds % sendDreamTimerTength == sendDreamTimerTength - (sendDreamTimerTength - 1)) {
  //   sendDreamFlag = false;
  // }


  if (dreamsProduced % 5 == 0 && !dreamsCaughtFlag) {
    nextLevel();
    dreamsCaughtFlag = true;
  }
  if (dreamsProduced % 5 == 4) {
    dreamsCaughtFlag = false;
  }
}

function nextLevel() {
  if (dreamVelocity < 5) {
    dreamVelocity += 0.7;
    dreamsAllowedOnScreen += 1;
  }
  if (sendDreamTimer > 0.4) {
    sendDreamTimer -= 0.24;
  }
}

function reachedSky(dream) {
  dreamsOnScreen--;
  if (dream.type == 1) {
    score += 10;
  }
  if (dream.type == 2) {
    livesLeft--;
    if (livesLeft == 0) {
      _triggerGameEvent('gameEnd', {"score": score});
    }
  }
}

function getMousePosition(event) {
  var nx  =   ny  =   0;

    if(event.pageX) {
        nx  =   event.pageX;
        ny  =   event.pageY;
    } else {
        nx  =   event.clientX;
        ny  =   event.clientY;
    }


    nx  -=  canvas.offset().left;
    ny  -=  canvas.offset().top;

    dreamCatcher.x = nx - (dreamCatcher.width /2);
    dreamCatcher.y = ny - (3 * dreamCatcher.height / 4);

}

function getTouchPosition(event) {
  event.preventDefault();
  var touch = event.touches[0];
  nx = touch.pageX;
  ny = touch.pageY;

  nx  -=  canvas.offset().left;
  ny  -=  canvas.offset().top;

  dreamCatcher.x = nx - (dreamCatcher.width /2);
  dreamCatcher.y = ny - dreamCatcher.height;
}

function endTouchListener(event) {
  event.preventDefault();
}

function drawText() {
  ctx.fillStyle = "#000";
  ctx.font = "24px Hero";
  ctx.textBaseline = "top";
  var text = "Score: " + score;
  ctx.fillText(text, CANVAS_WIDTH - ctx.measureText(text).width - 15, 15);
  text = "Lives: " + livesLeft;
  ctx.fillText(text, CANVAS_WIDTH - ctx.measureText(text).width - 15, 40);
  text = "Between Dreams: " + sendDreamTimer;
  ctx.fillText(text, CANVAS_WIDTH - ctx.measureText(text).width - 15, 70);
  text = "Dream Velocity: " + dreamVelocity;
  ctx.fillText(text, CANVAS_WIDTH - ctx.measureText(text).width - 15, 100);
}



function update() {

  if (gameState == 1) {
    updateClock();
    checkDreamsCollision();
    moveDreams();
    draw();
  } else {
    requestAnimationFrame(update);
  }
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  var backgroundGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  backgroundGradient.addColorStop(0, '#9FC2FF');
  backgroundGradient.addColorStop(0.5, '#9FC2FF');
  backgroundGradient.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = backgroundGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawDreamCatcher();
  drawHouses();
  drawDreams();
  drawText();
  requestAnimationFrame(update);

}

function _triggerGameEvent(type, data) {
  var detail = data || {};
  var ev = new CustomEvent(type, {"detail": detail, "bubbles":true, "cancelable":false});
  document.dispatchEvent(ev);
}
