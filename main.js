

$(window).load(function () {


  var endGameDoc = $("#end-game-svg")[0].contentDocument;
    $("#loading").fadeOut();
    $("#start-btn").fadeIn();


  $("#start-btn").on("click", function (event) {
    _triggerGameEvent("gameStart");
    $("#menu").hide();
    $("#game-canvas").show();
  });

  endGameDoc.getElementById('restart-btn').addEventListener("click", function (event) {
    _triggerGameEvent("gameRestart");
    $("#end-game").addClass("hidden");
    $("#end-game").removeClass("show");

  });
  endGameDoc.getElementById('leader-board').addEventListener("click", function (event) {

  });
  endGameDoc.getElementById('fb-btn').addEventListener("click", function (event) {

  });

  document.addEventListener("gameEnd", function (event) {
    $("#end-game").removeClass("hidden");
    $("#end-game").addClass("show");
    console.log($("#end-game-svg"));
    writeHighScore(200);
    writeScore(event.detail.score);


  });

})

function _triggerGameEvent(type, data) {
  var detail = data || {};
  var ev = new CustomEvent(type, {"detail": detail, "bubbles":true, "cancelable":false});
  document.dispatchEvent(ev);
}

function writeHighScore(value) {
  var endGameDoc = $("#end-game-svg")[0].contentDocument;

  var highScoreSpan = endGameDoc.getElementById("high-score-span");
  var highScore = endGameDoc.getElementById("high-score");
  var x = highScoreSpan.getAttributeNS(null, "x");
  var y = highScoreSpan.getAttributeNS(null, "y");
  var newText = document.createElementNS("http://www.w3.org/2000/svg","tspan");
  newText.setAttributeNS(null,"x",x);
  newText.setAttributeNS(null,"y",y);
  var textNode = document.createTextNode(value);
  newText.appendChild(textNode);
  highScore.appendChild(newText);
  highScore.removeChild(highScoreSpan);
}
function writeScore(value) {
  var endGameDoc = $("#end-game-svg")[0].contentDocument;

  var currentScoreSpan = endGameDoc.getElementById("current-score-span");
  var currentScore = endGameDoc.getElementById("current-score");
  var x = currentScoreSpan.getAttributeNS(null, "x");
  var y = currentScoreSpan.getAttributeNS(null, "y");
  var newText = document.createElementNS("http://www.w3.org/2000/svg","tspan");
  newText.setAttributeNS(null,"x",x);
  newText.setAttributeNS(null,"y",y);
  var textNode = document.createTextNode(value);
  newText.appendChild(textNode);
  currentScore.appendChild(newText);
  currentScore.removeChild(currentScoreSpan);
}
