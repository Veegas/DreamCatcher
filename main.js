

$(window).load(function () {

  // setTimeout(function () {
    $("#loading").fadeOut();
    $("#start-btn").fadeIn();

  //
  // }, 1000);


  $("#start-btn").on("click", function (event) {
    _triggerGameEvent("gameStart");
    $("#menu").hide();
    $("#game-canvas").show();
  })

  $("#restart-btn").on("click", function (event) {
    _triggerGameEvent("gameRestart");
    $("#end-game").hide();
  })

  $(document).on("gameEnd", function (event) {
    $("#end-game").fadeIn();
  })

})

function _triggerGameEvent(type) {
  var ev = new Event(type, {"bubbles":true, "cancelable":false});
  document.dispatchEvent(ev);
}
