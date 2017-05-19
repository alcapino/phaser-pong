//var game = new Phaser.Game(400, 300, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });
var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });

var MOV_SPEED = 550;
var BALL_SPEED = 400;
var gold =0;
var red = 0;

function preload() {
    game.load.image('star','res/star.png');
    game.load.image('paddle','res/paddle.png');
    game.load.image('enemy','res/enemy.png');
    
}

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //enemy
    enemy = game.add.sprite(Math.ceil(game.world.centerX) - 32, 80, 'enemy');
    enemy.anchor.setTo(0.5, 0.5);
    game.physics.enable(enemy, Phaser.Physics.ARCADE);
    enemy.body.collideWorldBounds = true;
    enemy.body.checkCollision.up = false;
    enemy.body.immovable = true;

    //player
    paddle = game.add.sprite(game.world.centerX - 32, game.world.height - 80, 'paddle');
    paddle.anchor.setTo(0.5, 0.5);
    game.physics.enable(paddle, Phaser.Physics.ARCADE);
    paddle.body.collideWorldBounds = true;
    paddle.body.checkCollision.down = false;
    paddle.body.immovable = true;

    //ball
    star = game.add.sprite(game.world.centerX, game.world.centerY, 'star');
    game.physics.enable(star, Phaser.Physics.ARCADE);
    star.body.velocity.setTo(BALL_SPEED, BALL_SPEED);
    star.body.collideWorldBounds = true;
    star.body.bounce.set(1);

    //pointer
    game.input.addPointer();

    //scoreboard
    sb = game.add.text(game.world.width * 0.01,game.world.height * 0.01,"Gold: 0\n Red: 0", {fill: "#ffffff"});

}

function update() {
    game.physics.arcade.collide(star, paddle, ballHitPaddle, null, this);
    game.physics.arcade.collide(star, enemy);
    //game.physics.arcade.collide(enemy, paddle);
    
    // Right adjustments
    var enemy_X_right = enemy.body.x+64;
    var star_X_right = star.body.x+24;

    //enemy AI
    //TODO: fix,nanginginig-nginig pa
    game.physics.arcade.moveToXY(enemy, star.body.x , 80, MOV_SPEED);
    // if enemy paddle overtakes the ball to the right or left, stop
    if (enemy.body.x < star.body.x && (enemy_X_right) > star_X_right) {
        enemy.body.velocity.setTo(0, 0); 
    }

    //paddle control
    if(game.input.activePointer.isDown) {
        game.physics.arcade.moveToXY(paddle, game.input.activePointer.x, game.world.height - 80, MOV_SPEED);
        if (Phaser.Rectangle.contains(paddle.body, game.input.activePointer.x, game.world.height - 80)) {
            paddle.body.velocity.setTo(0, 0);
        }
    }
    else {
        paddle.body.velocity.setTo(0, 0);
    }

    //pointer
    if(star.body.y == 0) {
        gold += 1;
        updatescore();
    }else if (star.body.y == game.world.height - star.body.height) {
        red += 1;
        updatescore();
    }

}

function render() {
    game.debug.spriteInfo(star, 32, 32);
    game.debug.spriteInfo(enemy, 32, 132);
    game.debug.pointer( game.input.activePointer );
}

function ballHitPaddle (_ball, _paddle) {

    var diff = 0;
    var ball_center = _ball.x+12;
    var paddle_center = _paddle.x+32;


    if (ball_center < paddle_center)
    {
        //  Ball is on the left-hand side of the paddle
        diff = paddle_center - ball_center;
        _ball.body.velocity.x = (-10 * diff);
    }
    else if (ball_center > paddle_center)
    {
        //  Ball is on the right-hand side of the paddle
        diff = ball_center -paddle_center;
        _ball.body.velocity.x = (10 * diff);
    }
    else
    {
        //  Ball is perfectly in the middle
        //  Add a little random X to stop it bouncing straight up!
        _ball.body.velocity.x = 2 + Math.random() * 8;
    }

}

function followPoint(pointer) {
    game.physics.arcade.moveToPointer(paddle, MOV_SPEED);
    if (Phaser.Rectangle.contains(padle.body, game.input.x, game.input.y)) {
        player.body.velocity.setTo(0, 0);
    }
}

function updatescore(){
    //star.kill();
    //score += 10;
    sb.text = "Gold: "+gold+"\n Red: "+red;
}