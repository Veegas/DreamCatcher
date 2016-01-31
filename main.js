

$(window).load(function () {

    $("#loading").fadeOut();
    $("#start-btn").fadeIn();



  $("#start-btn").on("click", function (event) {
    _triggerGameEvent("gameStart");
    $("#menu").hide();
    $("#game-canvas").show();
  });

  $("#restart-btn").on("click", function (event) {
    _triggerGameEvent("gameRestart");
    $("#end-game").hide();
  });

  document.addEventListener("gameEnd", function (event) {
    $("#end-game").fadeIn();
    $("#score").html(event.detail.score);
  });

})

function _triggerGameEvent(type, data) {
  var detail = data || {};
  var ev = new CustomEvent(type, {"detail": detail, "bubbles":true, "cancelable":false});
  document.dispatchEvent(ev);
}
