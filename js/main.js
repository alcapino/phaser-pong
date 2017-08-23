var game = new Phaser.Game(500, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });
//var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });

var MOV_SPEED = 400;
var BALL_SPEED = 550;
var gold =0;
var red = 0;
var updateCount = 0;
var generation = 0;

var moves = ["L","R","S"];
var p;
p = Population(clone(moves));

function preload() {
    game.load.image('star','res/star.png');
    game.load.image('paddle','res/paddle.png');
    game.load.image('enemy','res/enemy.png');
}

function clone(obj) {
    obj = JSON.parse(JSON.stringify(obj));
    return obj;
}

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    showStartButton();
    gameSet();

    //pointer
    game.input.addPointer();

    //scoreboard
    sb = game.add.text(game.world.width * 0.01,game.world.height * 0.01,"Gold: 0\n Red: 0", {fill: "#ffffff"});
    ending = game.add.text(game.world.centerX,game.world.centerY,"", {fill: "#ffffff"});
    ending.visible = false;
    
}

function update() {
    // check game end
    if (gold == 5 || red == 5){
        gameEnd();
        return;
    }

    game.physics.arcade.collide(star, paddle, ballHitPaddle, null, this);
    //game.physics.arcade.collide(star, paddle);
    game.physics.arcade.collide(star, enemy, ballHitPaddle, null, this);
    //game.physics.arcade.collide(enemy, paddle);
    
    //enemy AI
    chaseMove(enemy, 80);
    

    //paddle control
    if (updateCount == 8) {
        //make AI do something
        updateCount = 0;
        playerMove(paddle, game.world.height - 80);
    }
    else updateCount++;
    // DISABLED MUNA, AI TRAINING IN PROGRESS
    /*if(game.input.activePointer.isDown) {
        game.physics.arcade.moveToXY(paddle, game.input.activePointer.x, game.world.height - 80, MOV_SPEED);
        if (Phaser.Rectangle.contains(paddle.body, game.input.activePointer.x, game.world.height - 80)) {
            paddle.body.velocity.setTo(0, 0);
        }
    }
    else {
        paddle.body.velocity.setTo(0, 0);
    }*/

    //pointer
    if(star.body.y == 0 && star.alive) {
        gold += 1;
        updatescore();
    }else if (star.body.y == game.world.height - star.body.height && star.alive) {
        red += 1;
        updatescore();
    }

}

function render() {
    //game.debug.spriteInfo(star, 32, 32);
    //game.debug.spriteInfo(enemy, 32, 132);
    game.debug.pointer( game.input.activePointer );
}

function ballHitPaddle (_ball, _paddle) {

    var diff = 0;
    var ball_center = _ball.centerX;
    var paddle_center = _paddle.centerX;
    console.log("diff:"+(ball_center-paddle_center)+" ballc:"+ball_center+" paddlec:"+paddle_center);

    if (ball_center < paddle_center) {
        //  Ball is on the left-hand side of the paddle
        diff = paddle_center - ball_center;
        _ball.body.velocity.x = (-10 * diff);
        //console.log('hit on LEFT -> '+_ball.body.velocity.x);
    }
    else if (ball_center > paddle_center) {
        //  Ball is on the right-hand side of the paddle
        diff = ball_center -paddle_center;
        _ball.body.velocity.x = (10 * diff);
        //console.log('hit on RIGHT -> '+_ball.body.velocity.x);
    }
    else {
        //  Ball is perfectly in the middle
        //  Add a little random X to stop it bouncing straight up!
        //console.log('hit on CENTER');
        _ball.body.velocity.x = 2 + Math.random() * 8;
    }
    console.log("x_velocity:"+_ball.body.velocity.x);

}

// make paddle chase the ball
function chaseMove(player,yloc){
    // Right adjustments
    var player_X_right = player.body.x+64;
    var star_X_right = star.body.x+24;
    //TODO: fix,nanginginig-nginig pa
    game.physics.arcade.moveToXY(player, star.body.x , yloc, MOV_SPEED);
    // if enemy paddle overtakes the ball to the right or left, stop
    if (player.body.x < star.body.x && player_X_right > star_X_right) {
        player.body.velocity.setTo(0, 0); 
    }
}

function Chromosome(genes){
    this.genes = genes;
    this.fitness = 0;
    this.members = [];
    this.getFitness = function(){
        //
    };
    
    this.mutate = function(){
        //
    };

}

function Population(){
    this.size = 50;
    this.elements = [];
    this.fill = function(){
        //
    };
    this.kill = function(){
        //
    };
    this.generate = function(){
        this.sort();
        this.kill();
        this.mate();
        this.fill();
        this.sort();
    };
    this.mate = function(){
        //
    };
    this.sort = function(){
        //
    };
}

function followPoint(pointer) {
    game.physics.arcade.moveToPointer(paddle, MOV_SPEED);
    if (Phaser.Rectangle.contains(padle.body, game.input.x, game.input.y)) {
        player.body.velocity.setTo(0, 0);
    }
}

function gameEnd(){
    console.log("END");
    ending.visible = true;
    ending.text = "Gold: "+gold+"\n Red: "+red;
    ending.anchor.setTo(0.5, 1);
    ending.bringToTop();
}

function gameSet(){
    //enemy
    enemy = game.add.sprite(Math.ceil(game.world.centerX), 80, 'enemy');
    enemy.anchor.setTo(0.5, 1);
    game.physics.enable(enemy, Phaser.Physics.ARCADE);
    enemy.body.collideWorldBounds = true;
    enemy.body.checkCollision.up = false;
    enemy.body.immovable = true;

    //player
    paddle = game.add.sprite(game.world.centerX, game.world.height - 80, 'paddle');
    paddle.anchor.setTo(0.5, 0);
    game.physics.enable(paddle, Phaser.Physics.ARCADE);
    paddle.body.collideWorldBounds = true;
    paddle.body.checkCollision.down = false;
    paddle.body.immovable = true;
    //paddle.scale.setTo(9,1);

    //ball
    star = game.add.sprite(game.world.centerX, game.world.centerY, 'star');
    star.anchor.setTo(0.5, 0);
    game.physics.enable(star, Phaser.Physics.ARCADE);
    //star.body.velocity.setTo(0, BALL_SPEED);
    star.body.collideWorldBounds = true;
    star.body.bounce.set(1);

    //
    p = new Population();
    p.fill();
}

function playerMove(player,yloc){
    // Right adjustments
    var player_X_right = player.body.x+64;
    var star_X_right = star.body.x+24;
    if (player_X_right > star_X_right) playerMoveL(player,yloc);
    if (player.body.x < star.body.x) playerMoveR(player,yloc);
    if (player.body.x < star.body.x && (player_X_right) > star_X_right) {
        playerMoveStop(player);
    }
}

function playerMoveL(player,yloc){
    game.physics.arcade.moveToXY(player, 0, yloc, MOV_SPEED);
}

function playerMoveR(player,yloc){
    game.physics.arcade.moveToXY(player, game.width-player.width, yloc, MOV_SPEED);
}

function playerMoveStop(player){
    player.body.velocity.setTo(0, 0);
}

function showStartButton(){
    //buttons
    replayBtn = game.add.text(game.world.centerX, game.world.centerY, "start", { font: "65px Arial", fill: "#ffffff", align: "center" });
    replayBtn.inputEnabled = true;
    replayBtn.events.onInputUp.add(startGame, this);
    replayBtn.anchor.setTo(0.5, 0);
}

function startGame(){
    replayBtn.kill();
    game.time.events.add(Phaser.Timer.SECOND * 1, serveBall, this);
}

function serveBall(){
    console.log("START");
    star.body.velocity.setTo(0, BALL_SPEED);
}

function updatescore(){
    console.log("SET");
    star.kill();
    enemy.kill();
    paddle.kill();
    //score += 10;
    sb.text = "Gold: "+gold+"\n Red: "+red;
    gameSet();
    // check game end
    if (gold == 5 || red == 5){
        gameEnd();
    }
    else game.time.events.add(Phaser.Timer.SECOND * 1, serveBall, this);
}

