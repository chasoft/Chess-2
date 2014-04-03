function Board(list) {
  this.scene = new THREE.Scene();
  this.camera = new THREE.PerspectiveCamera(75,width/ height,0.1,1000);
  this.game = {};

  this.camera.position.z = 17;
  this.camera.position.y = 8;
  this.scene.add(this.camera);

  this.tileList = [];

  this.pieces = {};
  this.pieceList = list;
  this.pieceList.setColumn(["name","type","pos"]);

  this.spotLight = new THREE.SpotLight(0xf00ff0,16,36,Math.PI/6,500);
  light = new THREE.DirectionalLight(0xffffff,4);
  light.position.set(0, 5, 0).normalize();
  this.scene.add(light);

  cvs = document.getElementById("cvs");
  renderer = new THREE.WebGLRenderer( {antialias: true} );
  renderer.setSize(width,height);
  renderer.shadowMapEnabled = true;

  board.board = new Piece(this.scene,"board",{x:-1.6,y:-3.4,z:1});

  cvs.appendChild(renderer.domElement);
}

Board.prototype.selectWithId = function (id) {
  var target = this.getPieceWithId(id).pos;
  this.setLight(target.n,target.m);
};

Board.prototype.setLight = function(n,m){
  this.spotLight.position = {x:(n-4)*2.5,y:20,z:(m-3)*2.5};
  this.spotLight.target.position = {x:(n-4)*2.5,y:0,z:(m-3)*2.5};
  this.scene.add(this.spotLight);
};

Board.prototype.setTile = function (n,m) {
  var geometry = new THREE.CubeGeometry(2.5,0.3,2.5); 
  var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } ); 
  var tile = new THREE.Mesh( geometry, material );
  tile.position = {x:(n-4)*2.5,y:-0.5,z:(m-3)*2.5};
  this.tileList.push(tile);
  board.scene.add(tile);
};

Board.prototype.removeAllTile = function () {
 for(i in this.tileList){
    board.scene.remove(this.tileList[i]);
 }
 this.tileList = [];
};

Board.prototype.linesUp = function(){
  var workQueue = [];
  var i=0;
  for(p in this.pieces){
    var d = $.Deferred();
    (function(i,d,p){
      this.pieces[p].promise.done(function(){
        this.pieces[p].setPos(i%8,Math.floor(i/8));
        d.resolve(); 
      }.bind(this));  
    }.bind(this)(i,d,p))
    workQueue.push(d.promise());
    i++;
  }
  return $.when.apply(this,workQueue);
};

Board.prototype.render = function() {
  var r = 15;
  this.camera.position.x = Math.sin(theta)*r; 
  this.camera.position.z = Math.cos(theta)*r ;
  this.camera.position.y = Math.cos(theta/3)*4+10;
  theta += 0.005;
  this.camera.lookAt(lookAt);
  this.draw();
};

Board.prototype.draw = function (){
  renderer.render(this.scene,this.camera);
};

Board.prototype.move = function(name,m,n){
  this.pieceList.getRowFromValue("name",name).setValue("pos", "{m:"+m+",n:"+n+"}");
  this.pieces[name].setPos(m,n);    
}

Board.prototype.readBoard = function(b){
  for(i in b){
    this.move(b[i].name,b[i].m,b[i].n);
  }
}

Board.prototype.getPieceWithId = function(id){
  var pieces = this.pieces;
  for(i in pieces){
    if(pieces[i].mesh.id == id)return pieces[i];
  }
};

//------------------------------Overload Methods
addMethod(Board.prototype,"addPiece",function(name,type,pos){
  this.pieceList.appendRow({name:name,type:type,pos:expandObject(pos)});
  this.pieces[name] = new Piece(this.scene,type,pos); 
});

addMethod(Board.prototype,"addPiece",function(name,type){
  this.pieceList.appendRow({name:name,type:type,pos:"{m:0,n:0}"});
  this.pieces[name] = new Piece(this.scene,{m:0,n:0},type); 
});


