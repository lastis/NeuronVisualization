THREE.PotentialGeometry = function ( filename ) {
  THREE.Geometry.call(this);

  this.type = 'PotentialGeometry';

  this.paramters = {
    filename : filename
  };

  var verts = this.vertices;
  var faces = this.faces;
  var uvs = this.faceVertxUvs[0];

  var i, j, p;
  var u, v;
}