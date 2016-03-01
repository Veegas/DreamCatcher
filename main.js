

$(window).load(function () {


  var endGameDoc = $("#end-game-svg")[0].contentDocument;
  var highScoreDoc = $("#high-score-svg")[0].contentDocument;
    $("#loading").fadeOut();
    $("#start-menu").fadeIn();


  $("#start-btn").on("click", function (event) {
    $("#start-menu").hide();
    $("#instructions-menu").fadeIn();

    setTimeout(function () {
      _triggerGameEvent("gameStart");
      $("#menu").hide();
      $("#game-canvas").show();
    }, 4000);
  });

  endGameDoc.getElementById('restart-btn').addEventListener("click", function (event) {
    _triggerGameEvent("gameRestart");
    $(".end-game").removeClass("show");
    $("#game-canvas").removeClass("background-blur");
  });
  highScoreDoc.getElementById('restart-btn').addEventListener("click", function (event) {
    _triggerGameEvent("gameRestart");
    $(".end-game").removeClass("show");
    $("#game-canvas").removeClass("background-blur");
  });
  endGameDoc.getElementById('leader-board').addEventListener("click", function (event) {

  });
  endGameDoc.getElementById('fb-btn').addEventListener("click", function (event) {

  });

  document.addEventListener("gameEnd", function (event) {
    $("#game-canvas").addClass("background-blur");
    $("#end-game").addClass("show");

    if (event.detail.highScore.new) {
      $("#high-score-svg").addClass("show");
      writeHighScore("#high-score-svg", event.detail.highScore.score);
    } else {
      $("#end-game-svg").addClass("show");
      writeHighScore("#end-game-svg",event.detail.highScore.score);
      writeScore("#end-game-svg",event.detail.score);
    }


  });

})

function _triggerGameEvent(type, data) {
  var detail = data || {};
  var ev = new CustomEvent(type, {"detail": detail, "bubbles":true, "cancelable":false});
  document.dispatchEvent(ev);
}

function writeHighScore(element, value) {
  var endGameDoc = $(element)[0].contentDocument;

  var highScore = endGameDoc.getElementById("high-score");
  var highScoreSpan = highScore.firstElementChild;
  console.log(highScoreSpan);
  var x = highScoreSpan.getAttributeNS(null, "x");
  var y = highScoreSpan.getAttributeNS(null, "y");
  var fontSize = highScoreSpan.getAttributeNS(null, "font-size");
  var style = highScoreSpan.getAttributeNS(null, "style");
  var newText = document.createElementNS("http://www.w3.org/2000/svg","tspan");
  newText.setAttributeNS(null,"x",x);
  newText.setAttributeNS(null,"y",y);
  newText.setAttributeNS(null,"font-size",fontSize);
  newText.setAttributeNS(null,"style",style);
  var textNode = document.createTextNode(value);
  newText.appendChild(textNode);
  highScore.appendChild(newText);
  highScore.removeChild(highScoreSpan);
}
function writeScore(element, value) {
  var endGameDoc = $(element)[0].contentDocument;
  var currentScore = endGameDoc.getElementById("current-score");
  var currentScoreSpan = currentScore.firstElementChild;
  var x = currentScoreSpan.getAttributeNS(null, "x");
  var y = currentScoreSpan.getAttributeNS(null, "y");
  var newText = document.createElementNS("http://www.w3.org/2000/svg","tspan");
  var textNode = document.createTextNode(value);
  newText.appendChild(textNode);
  currentScore.appendChild(newText);
  currentScore.removeChild(currentScoreSpan);
}
