function Other() {}

function A() {
  this.c =5
}

function B() {}
B.prototype = new A;
B.prototype.constructor = B;

function C() {}
C.prototype = new B;
C.prototype.constructor = C;

let d = new C;

console.log(d instanceof Other);