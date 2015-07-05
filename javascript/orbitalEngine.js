// Global stuff
var friction = 0.8;
var destination = null;
var animationSlowing = 10;

// Ball object
function Ball(p, v, r) {
  this.point = p;
  this.vector = v;
  this.radius = r;
  this.dest = null;
  this.force = new Point({
    length: 0,
    angle: 0
  });

  this.path = new Path.Circle(this.point, this.radius);
  this.path.style = {
    strokeColor: "black",
    strokeWidth: 2
  };

  this.destPath = new Path([this.point, this.point + this.vector]);
  this.destPath.style = {
    strokeColor: "green",
    strokeWidth: 1
  }
}
Ball.prototype = {

  iterate: function() {
    // update dest and apply any force
    // this.updateDest();

    // update vector
    if (this.dest === null) {
      // no destination, so just slow to a stop
      this.vector.length *= .4;
    }
    else {
      destVector = this.dest - this.point;
      this.vector.length = destVector.length / animationSlowing;
      // "animate" the angle to correct orientation
      this.vector.angle += this.vector.getDirectedAngle(destVector) / (animationSlowing / 2);
    }

    // apply any force that's present
    this.applyForce();

    // update position
    this.point += this.vector;
    this.path.position = this.point;

    // finally draw the dest vector
    this.drawVector();
  },

  setForce: function(newForce) {
    this.force = newForce.clone();
  },

  applyForce: function() {
    // minimum threshold for force
    if (this.force.length < 0.01) {
      return;
    }

    // add the force to the vector
    this.vector += this.force;

    // decay the force
    this.force *= 0.8;
  },

  updateDest: function() {
    if (destination === null) {
      this.dest = null;
      return;
    }
    this.dest = destination.clone();
  },

  drawVector: function() {
    var segments = this.destPath.segments;
    segments[0].point = this.point;
    segments[1].point = (this.dest !== null ? this.dest : this.point);
  }
}

/*
 * Object creation:
 */
var ballArray = [];
var ballCount = 100;
for (var i = 0; i < ballCount; i++) {
  var randNum = Math.random();
  var randNum2 = Math.random();
  var newBall = new Ball(
    new Point(randNum*view.viewSize.width, randNum2*view.viewSize.height),
    new Point({angle: 360*randNum, length: 0}), 30);
  newBall.dest = newBall.point.clone();
  ballArray.push(newBall);
}


var mousePoint = new Shape.Circle(new Point(0, 0), 10);
mousePoint.style = {
  fillColor: new Color(1, 0, 0, 0.4),
  strokeColor: new Color(1, 0, 0),
  strokeWidth: 2,
}
mousePoint.visible = false;
var mouseDown = false;
function onMouseDown(event) {
  mousePoint.visible = true;

  // set down position
  mousePoint.position = event.point.clone();
  mousePoint.radius = 0;

  // start building mouse force
  mouseDown = true;
}

function onMouseUp(event) {
  // apply force to all the balls inside the mousePoint circle
  for (var j = 0; j < ballCount; j++) {
    var curBall = ballArray[j];
    var mouseVector = curBall.point - mousePoint.position;
    if (mouseVector.length < mousePoint.radius) {
      // apply force inversely proportional to the distance from mouse event
      curBall.setForce(mouseVector.normalize(mousePoint.radius - mouseVector.length));
    }
  }

  mousePoint.visible = false;
  mouseDown = false;
}

/*
 * Main looping:
 */
function onFrame() {
  for (var j = 0; j < ballCount; j++) {
    ballArray[j].iterate();
  }
  if (mouseDown) {
    mousePoint.radius += (view.viewSize.width - mousePoint.radius) * 0.01;
  }
}
