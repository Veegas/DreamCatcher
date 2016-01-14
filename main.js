

$(window).load(function () {

  setTimeout(function () {
    $("#loading").fadeOut();
    $("#start-btn").fadeIn();

  }, 1000);


  $("#start-btn").on("click", function (event) {
    $("#menu").hide();
    startGame();
    $("#game-canvas").show();
  })

})
