var CANVAS_WIDTH, CANVAS_HEIGHT;
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

// var background = new Image();
// if (CANVAS_WIDTH > 750) {
//   background.src = "images/skyline.png";
// } else if (CANVAS_WIDTH > 350) {
//   background.src = "images/skyline-m.png";
// } else {
//   background.src = "images/skyline-s.png";
// }

// var housesImage = new Image();
// housesImage.src = "images/houses.png";

var goodDreamImage = new Image();
var badDreamImage = new Image();
goodDreamImage.src = "images/goodDream.svg";
badDreamImage.src = "images/badDream.svg";

var dreamCatcherCenterImage = new Image();
var dreamCatcherLeftImage = new Image();
var dreamCatcherRightImage = new Image();

dreamCatcherLeftImage.src = "images/dreamCatcherLeft.svg";
dreamCatcherRightImage.src = "images/dreamCatcherRight.svg";
dreamCatcherCenterImage.src = "images/dreamCatcherCenter.svg";

var lifeLeftImage = new Image();
var lifeLostImage = new Image();

lifeLostImage.src = "images/lifeLost.svg";
lifeLeftImage.src = "images/lifeLeft.svg";


var badDreamSpriteSheet = {
  frame: {
    width: 200,
    height: 117,
  },
  src: "images/badDreamSprite10.svg"
}
var goodDreamSpriteSheet = {
  frame: {
    width: 200,
    height: 155,
  },
  src: "images/goodDreamSprite10.svg"
}


// When window resizes change canvas size to match it's parent
$(window).resize(function(event) {
  resizeCanvas();
  repositionHouses();
});

// list of available game events that occur
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
  setVariables();
  resizeCanvas();
  init();
}
// Called when game ends
function gameEnd(event) {
  _triggerGameEvent("gamePause");
  backgroundSound.pause();
  $("#score").html(event.detail.score);
}

// called when game restarts
function gameRestart(event) {
  setVariables();
  initializeHouses();
  draw();
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

// Audio Variables

var badDreamSound = new Audio('audio/sound2.wav');
var goodDreamSound = new Audio('audio/sound1.wav');

// Game Variables
var houses;
var dreams;
var keysPressed;
var startTime;
var currentTime;
var sendDreamTimer;
var lastDreamTime;
var score;
var livesLeft;
var dreamVelocity;
var dreamsOnScreen;
var dreamsAllowedOnScreen;
var dreamsProduced;
var lastDreamsProduced;
var redDreamsCaught;
var dreamsCaughtFlag;
var sendDreamFlag;
var gameState;
var dreamsProducedToNextLevel;
var currentLevel;
var maxLevels;
var goodDreamsPercentage;
var frameCount;




function setVariables() {
  houses = [];
  dreams = [];
  keysPressed = {
    37: false,
    38: false,
    39: false,
    40: false
  };
  startTime = window.performance.now();
  currentTime;
  sendDreamTimer = 1;
  lastDreamTime = 0;
  score = 0;
  livesLeft = 3;
  dreamVelocity = 1;
  dreamsOnScreen = 0;
  dreamsProduced = 0;
  dreamsAllowedOnScreen = 5;
  lastDreamsProduced = 0;
  redDreamsCaught = 0;
  dreamsCaughtFlag = true;
  sendDreamFlag = false;
  gameState = 1;
  dreamsProducedToNextLevel = 6;
  currentLevel = 1;
  maxLevels = 7;
  goodDreamsPercentage = 0.7;
  frameCount = 0;

}

function resizeCanvas() {
  CANVAS_WIDTH = $(container).width();
  CANVAS_HEIGHT = $(container).height();
  $(canvas).attr({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT
  });
  draw();
};

/* Initialize game at first */
function init() {
  $(document).keydown(keysDown).keyup(keysUp);
  canvas[0].addEventListener("mousemove", getMousePosition);
  canvas[0].addEventListener("touchmove", getTouchPosition);
  canvas[0].addEventListener("touchend", endTouchListener);
  initializeHouses();
  update();
}

// Drawing and animation in Canvas

var dreamCatcher = {
  y: 30,
  width: 100,
  x: 50,
  height: 130,
  velocity: 15,
  image: dreamCatcherCenterImage,
  moveLeft: function moveLeft() {
    dreamCatcher.image = dreamCatcherLeftImage;
  },
  moveRight: function moveRight() {
    dreamCatcher.image = dreamCatcherRightImage;
  },
  rest: function rest() {
    dreamCatcher.image = dreamCatcherCenterImage;
  },
}

function House(x, y) {
  this.width = 40;
  this.height = 120;
  this.x = x;
  this.y = CANVAS_HEIGHT - this.height;
  this.image = "images/building.png";


  this.drawHouse = function() {
    ctx.fillStyle = "#000"; // Set color to black
    var houseImage = new Image();
    houseImage.src = this.image;
    ctx.drawImage(houseImage, this.x, this.y, this.width, this.height);
  }

}

function Dream(houseIndex, type, velocity) {
  var correspondingHouse = houses[houseIndex];
  this.x = Math.floor(correspondingHouse.x + correspondingHouse.width / 2);
  this.y = correspondingHouse.y;
  this.velocity = velocity;
  this.active = true;
  this.type = type;
  this.ticksLived = 0;
  this.ticksPerFrame = 15;
  this.currentFrame = 0;
  // Width & height of each frame inside sprite
  // type 1 => Good Dream, type 2 => Bad Dream
  if (type == 1) {
    this.width = 75;
    this.height = 60;
    this.sprite = goodDreamSpriteSheet;
    this.totalFrames = 10;
  } else {
    this.width = 75;
    this.height = 45;
    this.sprite = badDreamSpriteSheet;
    this.totalFrames = 10;
  }


  // match speed of frames of sprite to match the speed of flapping of wings
  var distanceMoved = velocity * 30;
  var numberOfFlaps = Math.floor(distanceMoved / 5);
  this.ticksPerFrame = Math.ceil(30 / numberOfFlaps);

  dreamsOnScreen++;
  this.moveDream = function() {
    this.initialPosition = correspondingHouse.y
    if (this.y <= 0) {
      reachedSky(this);
      this.resetDream();
    } else if (this.active) {
      this.y = Math.floor(this.y - this.velocity);
    }
  };

  this.resetDream = function() {
    var dreamIndex = dreams.indexOf(this);
    dreams.splice(dreamIndex, 1);
  }

  this.drawDream = function drawDream() {

    /*********** SPRITE IMAGE DREAMS ******************/
    this.handleSpriteFrames();
    var dreamImage = new Image();

    if (this.type == 2) {
      ctx.fillStyle = "#000"; // Set color to black
    } else if (this.type == 1) {
      ctx.fillStyle = "#F00"; // Set color to black
    }
    dreamImage.src = this.sprite.src;
    ctx.drawImage(dreamImage, this.currentFrame * this.sprite.frame.width, 0, this.sprite.frame.width, this.sprite.frame.height, this.x, this.y, this.width, this.height);
    /***************************************************/


    /*********** Gradient DREAMS ******************/
    // var gradient = ctx.createRadialGradient(this.x, this.y, this.width / 10, this.x, this.y, this.width);
    // gradient.addColorStop(0, 'white');
    //
    // if (this.type == 2) {
    //   gradient.addColorStop(1, "#B50000");
    // } else if (this.type == 1) {
    //   gradient.addColorStop(1, "#0000B5");
    // }
    // ctx.fillStyle = gradient;
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
    // ctx.fill();
    // ctx.closePath();
    /***************************************************/

    /*********** SIMPLE IMAGE DREAMS ******************/

    //   console.log("DREAM X: ", this.x, " Dream Y: ", this.y);
    // if (this.type == 2) {
    //   ctx.drawImage(badDreamImage, this.x, this.y, this.width, this.height);
    // } else if (this.type == 1) {
    //   ctx.drawImage(goodDreamImage, this.x, this.y, this.width, this.height);
    // }

    /***************************************************/


  }

  this.handleSpriteFrames = function handleSpriteFrames() {
    this.ticksLived++;


    if (this.ticksLived % this.ticksPerFrame == 0) {
      if (this.currentFrame < this.totalFrames - 1) {
        this.currentFrame++;
      } else {
        this.currentFrame = 0;
      }
    }
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
  houses.map(function(house, index) {
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
  ctx.drawImage(dreamCatcher.image, dreamCatcher.x, dreamCatcher.y, dreamCatcher.width, dreamCatcher.height)
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
  var dreamCatcherCenter = dreamCatcher.y - (dreamCatcher.height / 2);
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
    goodDreamSound.currentTime = 0;
    goodDreamSound.play();
  } else if (dream.type == 2) {
    score += 10;
    redDreamsCaught++;
    badDreamSound.currentTime = 0;
    badDreamSound.play();
  }
}

function sendDream() {
  if (dreamsOnScreen < dreamsAllowedOnScreen) {
    dreamsProduced++;
    var houseIndex = Math.floor(Math.random() * houses.length);
    var velocities = [dreamVelocity, dreamVelocity + 0.5];
    var veloctiyIndex = Math.floor(Math.random() * 2);
    var dreamType = chooseDreamType();
    var newDream = new Dream(houseIndex, dreamType, velocities[veloctiyIndex]);
    dreams.push(newDream);

  }
}

// Function to randomly generate a dream type but constrained
function chooseDreamType() {
  var random = Math.random();
  if (random < goodDreamsPercentage) {
    return 1;
  } else {
    return 2;
  }
}

function updateClock() {
  frameCount++;
  var lastCurrentTime = currentTime || 0;
  currentTime = window.performance.now() - startTime;
  var currentTimeTengthSeconds = Math.floor(currentTime / 100);
  var sendDreamTimerTength = sendDreamTimer * 10;
  var sendDreamTimerMilli = sendDreamTimer * 1000;

  var timeBetweenFrames = Math.ceil(currentTime - lastCurrentTime) || 16;


  console.log("TIME BETWEEN FRAMES: ", timeBetweenFrames);


  // Sending dreams using current time % dream interval == 0 doesn't work as currentTime doesn't increase every constant frame
  // Get the time difference between the last two frames and assume it's the same for this one to give you the tolerance
  if (frameCount % 30 == 0) {
    sendDream();
    sendDreamFlag = true;
  }


  if (dreamsProduced % 6 == 0 && !dreamsCaughtFlag) {
    nextLevel();
    dreamsCaughtFlag = true;
  }
  if (dreamsProduced % 6 == 5) {
    dreamsCaughtFlag = false;
  }
}

function nextLevel() {

  var velocityStep = calculateLevelStep(1, 7, maxLevels);
  var timerStep = calculateLevelStep(1, 0.3, maxLevels);
  var goodDreamsPercentageStep = calculateLevelStep(0.7, 0.6, maxLevels);

  if (currentLevel <= maxLevels) {
    dreamVelocity += velocityStep;
    sendDreamTimer += timerStep;
    dreamsAllowedOnScreen += 1;
    goodDreamsPercentage += goodDreamsPercentageStep;
    currentLevel++;
  }
}

function calculateLevelStep(min, max, levels) {
  return ((max - min) / levels);
}

function reachedSky(dream) {
  dreamsOnScreen--;
  if (dream.type == 1) {
    score += 10;
  }
  if (dream.type == 2) {
    livesLeft--;
    if (livesLeft == 0) {
      _triggerGameEvent('gameEnd', {
        "score": score
      });
    }
  }
}

function getMousePosition(event) {
  var nx = ny = 0;

  if (event.pageX) {
    nx = event.pageX;
    ny = event.pageY;
  } else {
    nx = event.clientX;
    ny = event.clientY;
  }


  nx -= canvas.offset().left;
  ny -= canvas.offset().top;

  var newDreamCatcherX = nx - (dreamCatcher.width / 2);

  if (dreamCatcher.x - newDreamCatcherX > 1) {
    dreamCatcher.moveLeft();
  } else if (dreamCatcher.x - newDreamCatcherX < -1) {
    dreamCatcher.moveRight();
  } else {
    dreamCatcher.rest();
  }
  dreamCatcher.x = newDreamCatcherX;
  dreamCatcher.y = ny - (3 * dreamCatcher.height / 4);

}

function getTouchPosition(event) {
  event.preventDefault();
  var touch = event.touches[0];
  nx = touch.pageX;
  ny = touch.pageY;

  nx -= canvas.offset().left;
  ny -= canvas.offset().top;

  var newDreamCatcherX = nx - (dreamCatcher.width / 2);

  if (dreamCatcher.x - newDreamCatcherX > 1) {
    dreamCatcher.moveLeft();
  } else if (dreamCatcher.x - newDreamCatcherX < -1) {
    dreamCatcher.moveRight();
  } else {
    dreamCatcher.rest();
  }

  dreamCatcher.x = newDreamCatcherX;
  dreamCatcher.y = ny - dreamCatcher.height;
}

function endTouchListener(event) {
  event.preventDefault();
}

function drawText() {
  ctx.fillStyle = "#FFF";
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
  text = "Good Dream Percentage: " + goodDreamsPercentage * 100;
  ctx.fillText(text, CANVAS_WIDTH - ctx.measureText(text).width - 15, 130);
}

function drawHUD() {
  drawText();

  var livesImages = [lifeLostImage, lifeLostImage, lifeLostImage];

  for (var i = 0; i < livesLeft; i++) {
    livesImages[i] = lifeLeftImage;
  }

  ctx.drawImage(livesImages[2], CANVAS_WIDTH - 60, 10, 35, 50);
  ctx.drawImage(livesImages[1], CANVAS_WIDTH - 110, 10, 35, 50);
  ctx.drawImage(livesImages[0], CANVAS_WIDTH - 160, 10, 35, 50);


}



function update() {

  if (gameState == 1) {
    updateClock();
    checkDreamsCollision();
    moveDreams();
    draw();
  }
  requestAnimFrame(update);
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // ctx.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // ctx.drawImage(housesImage, 0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);

  drawDreamCatcher();
  drawDreams();
  drawHUD();


}

//  Function to trigger custom event targeting the document
//  type: Name of the event, data: Object to send extra details
function _triggerGameEvent(type, data) {
  var detail = data || {};
  var ev = new CustomEvent(type, {
    "detail": detail,
    "bubbles": true,
    "cancelable": false
  });
  document.dispatchEvent(ev);
}
