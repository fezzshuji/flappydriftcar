// i need the main game stage
// i need the car
// i need the barrier
// i need to use Tween to animate the car and the barrier
// i need to define collision using createJS
// i need a score tracker
// i need to add event listeners to the car for mousedown function to work

// global variables 
let stage = 0; //stage
let loader = 0; //loads 
let car = 0 ; //car
let jumpListener = 0; //listener
let barrierCreator = 0; //make the barrier
let score = 0 ; //score
let scoreText = 0; //displays score
let scroeTextOutline = 0; //highlights score
let started = false; //start set to false

//initialize the game
function init() {
  stage = new createjs.StageGL("gameCanvas"); //use StageGL in createJS to implement a new stage

  createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED; //createjs time mode using Ticker from creatjs library
  createjs.Ticker.framerate = 60; //set framerate of the game
  createjs.Ticker.addEventListener("tick", stage); //adds event listener to recognize the ticks caused by the collision

  //creates a background with createjs shape
 let background = new createjs.Shape();
  background.graphics.beginLinearGradientFill(["#616161", "#8c8c8c", "#616161"], [0, 0.85, 1], 0, 0, 0, 480).drawRect(0, 0, 320, 480); //drawrect to make the game window
  background.x = 0; 
  background.y = 0;
  background.name = "background";
  background.cache(0, 0, 320, 480); //cache to allow this to be displayed in the browser

  stage.addChild(background); //add background as a child to stage

  //this enables the sprites to be displayed on game window and with id assigned to each element
 let manifest = [
    { "src": "crowd.png", "id": "crowd" }, //crowd sprite
    { "src": "car.png", "id": "car" }, //car sprite
    { "src": "barrier.png", "id": "barrier" }, //barrier sprite
  ];

  loader = new createjs.LoadQueue(true); //loads the program into the queue using preload.js
  loader.addEventListener("complete", handleComplete); //triggered when a queue handleComplete finish loading all files
  loader.loadManifest(manifest, true, "./img/"); //this will load all the sprites in img folder
}

//handle function to start the game
function handleComplete() {
  started = false;
  createCar();
  createScore();
  jumpListener = stage.on("stagemousedown", driftCar); //on mouse down car will drift
  //createjs.Ticker.addEventListener("tick", checkCollision);
}

// creates the car and add it to the stage
function createCar() {
  car = new createjs.Bitmap(loader.getResult("car")); //using Bitmap method of createjs to create car sprite
  car.regX = car.image.width / 2;
  car.regY = car.image.height / 2;
  car.x = stage.canvas.width / 2;
  car.y = stage.canvas.height / 2;
  stage.addChild(car); //adds car as child to the stage
}

// creates the drifting car animation using Tween library
function driftCar() {
  if (!started) { //if not yet started
    startGame(); //start game
  }
  //using Tween to animate the car sprite
  createjs.Tween
  .get(car, { override: true })
  .to({ y: car.y - 90, rotation: -20 }, 500, createjs.Ease.getPowOut(2)) 
  .to({ y: stage.canvas.height + (car.image.width / 2), rotation: 60 }, 4500, createjs.Ease.getPowIn(2))
  .call(gameOver);
}

//this function will randomly create the barriers using tween
function createBarriers() {
  let topBarrier, bottomBarrier; // declare top and bottom barrier
  let position = Math.floor(Math.random() * 280 + 100); //position of car barriers are set randomly

  // creates the top portion of the barriers
  topBarrier = new createjs.Bitmap(loader.getResult("barrier"));
  topBarrier.y = position - 75; //moves y axis 75 pixel down
  topBarrier.x = stage.canvas.width + (topBarrier.image.width / 2); //set x axis in the middle
  topBarrier.rotation = 180;
  topBarrier.name = "barrier";

  // creates the bottom portion of the barriers
  bottomBarrier = new createjs.Bitmap(loader.getResult("barrier"));
  bottomBarrier.y = position + 75; //moves y axis 75 pixel up
  bottomBarrier.x = stage.canvas.width + (bottomBarrier.image.width / 2); //set x axis in the middle
  bottomBarrier.skewY = 180;
  bottomBarrier.name = "barrier";

  topBarrier.regX = bottomBarrier.regX = topBarrier.image.width / 2;

  createjs.Tween.get(topBarrier).to({ x: 0 - topBarrier.image.width }, 10000).call(function() { removeBarrier(topBarrier); }).addEventListener("change", updateBarrier);
  createjs.Tween.get(bottomBarrier).to( { x: 0 - bottomBarrier.image.width }, 10000).call(function() { removeBarrier(bottomBarrier); });

  let scoreIndex = stage.getChildIndex(scoreText);
  stage.addChildAt(bottomBarrier, topBarrier, scoreIndex);
}

//this function removes the barrier
function removeBarrier(barrier) {
  stage.removeChild(barrier);
}

//this function updates the barrier
function updateBarrier(event) {
  let barrierUpdated = event.target.target;
  //if the x-axis of the barrier passes by the car sprite the event listener will be removed and addScore will run adding points each cycle
  if ((barrierUpdated.x - barrierUpdated.regX + barrierUpdated.image.width) < (car.x - car.regX)) {
    event.target.removeEventListener("change", updateBarrier);
    console.log(car.x);
    console.log(barrierUpdated.x);
    addScore();
  }
}

//this function increments score and update the score
function addScore() {
    score++;
    scoreText.text = scoreTextOutline.text = score;
    scoreText.updateCache();
    scoreTextOutline.updateCache();
  }
  
  //this function starts the game and will create new barriers every five seconds
  function startGame() {
    started = true; 
    createBarriers();
    barrierCreator = setInterval(createBarriers, 5000); //every five seconds
  }
  
  //this function creates the score
  function createScore() {
  score = 0;
  scoreText = new createjs.Text(score, "bold 48px Courier", "#007878");
  scoreText.textAlign = "center";
  scoreText.textBaseline = "middle";
  scoreText.x = 300;
  scoreText.y = 430;
  let bounds = scoreText.getBounds();
  scoreText.cache(-30, -30, bounds.width*3 + Math.abs(bounds.x), bounds.height + Math.abs(bounds.y)); //cache to show score

  scoreTextOutline = scoreText.clone();
  scoreTextOutline.color = "#000000";
  scoreTextOutline.outline = 2;
  bounds = scoreTextOutline.getBounds();
  scoreTextOutline.cache(-40, -40, bounds.width*3 + Math.abs(bounds.x), bounds.height + Math.abs(bounds.y)); //cache to show score outline

  stage.addChild(scoreText, scoreTextOutline);
}

//feature to checkCollision
function checkCollision() {
  let leftX = car.x - car.regX + 5; 
  let leftY = car.y - car.regY + 5;
  
  //define the collision points using createjs library
  let points = [
    new createjs.Point(leftX, leftY),
    new createjs.Point(leftX + car.image.width - 10, leftY),
    new createjs.Point(leftX, leftY + car.image.height - 10),
    new createjs.Point(leftX + car.image.width - 10, leftY + car.image.height - 10)
  ];
//iterate through the points 
  for (let i = 0; i < points.length; i++) {
    let objects = stage.getObjectsUnderPoint(points[i].x, points[i].y);
    //if any part of the object touches the barrier whereby the points distance is less than zero
    if (objects.filter((object) => object.name == "barrier").length > 0) {
      gameOver(); //run the gameover function
      return; //return null
    }
  }
}

//gameover if collision is detected
function gameOver() {
    //this will remove all the tweens
  createjs.Tween.removeAllTweens();
  // stage will
  stage.off("stagemousedown", jumpListener);

  //clear all the barriers
  clearInterval(barrierCreator);

  //remove the event listener
  createjs.Ticker.removeEventListener("tick", checkCollision);

  //asynchronous function
  setTimeout(function () {
    stage.on("stagemousedown", resetGame, null, true); //resets game after 2 ms.
  }, 2000);
}

//resets the game, removes all element except the background
function resetGame() {
  let childrenToRemove = stage.children.filter((child) => child.name != "background");
  //iterate through the childs and remove all the childs
  for (let i = 0; i < childrenToRemove.length; i++) {
    stage.removeChild(childrenToRemove[i]);
  }
  handleComplete(); //runs handle function to re-run the game
}
