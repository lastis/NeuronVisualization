var megagen = (function() {

  var scene;
  var camera;
  var renderer;
  var neuron;
  var axisHelper;
  var stats;
  var lastTime = 0;
  var angularSpeed = 0.01;
  var neuronLoaded = false;
  var potentialLoaded = false;

  return {
    
    drawNeuron: function() {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 3000 );
      camera.position.z = 400;
      camera.position.y = 000;
      
      renderer = new THREE.WebGLRenderer();
      renderer.setSize( window.innerWidth, window.innerHeight );

      document.body.appendChild( renderer.domElement );

      loadNeuronMesh(draw);
    }

  }

  function loadNeuronMesh(callback) {
    d3.csv('morph.csv', function(data){
      data.forEach(function(d) {
        d.x = +d.x;
        d.y = +d.y;
        d.z = +d.z;
        d.diam = +d.diam;
      });

      var zAxis = new THREE.Vector3(0,0,1);
      var xAxis = new THREE.Vector3(1,0,0);
      var yAxis = new THREE.Vector3(0,1,0);
      var mergedGeometry = new THREE.Geometry();
      var material = new THREE.MeshNormalMaterial();
      // Make the neuron mesh
      var indx = 0;
      for (i = 0; i < data.length-1; i++) {
        var r1 = data[indx].diam;
        var r2 = data[indx+1].diam;
        if (r1 != 0 && r2 != 0){
          var dx = data[indx+1].x-data[indx].x;
          var dy = data[indx+1].y-data[indx].y;
          var dz = data[indx+1].z-data[indx].z;
          var len = Math.sqrt(
            Math.pow(dx,2) + 
            Math.pow(dy,2) + 
            Math.pow(dz,2)
            ); 
          dx = dx/2;
          dy = dy/2;
          dz = dz/2;
          var x = data[indx].x;
          var y = data[indx].y;
          var z = data[indx].z;
          var x2 = data[indx+1].x;
          var y2 = data[indx+1].y;
          var z2 = data[indx+1].z;
          var xAngle = Math.atan2(Math.sqrt(dx*dx+dz*dz),dy);
          var yAngle = Math.atan2(dx,dz);

          var cylinderGeo = new THREE.CylinderGeometry(r1,r2,len,8,1,false);
          var cylinder = new THREE.Mesh(cylinderGeo,material);
          cylinder.position.set(x+dx,y+dy,z+dz);
          rotateAroundWorldAxis(cylinder,xAxis,xAngle+Math.PI);
          rotateAroundWorldAxis(cylinder,yAxis,yAngle);

          cylinder.updateMatrix();
          mergedGeometry.merge(cylinder.geometry,cylinder.matrix);

          var sphereGeo = new THREE.SphereGeometry(r1);
          var sphere = new THREE.Mesh(sphereGeo,material);
          sphere.position.set(x,y,z);
          sphere.updateMatrix();
          mergedGeometry.merge(sphere.geometry,sphere.matrix);
        }
        if (r1 != 0 && r2 == 0) {
          var sphereGeo = new THREE.SphereGeometry(r1);
          var sphere = new THREE.Mesh(sphereGeo,material);
          sphere.position.set(data[indx].x,data[indx].y,data[indx].z);
          sphere.updateMatrix();
          mergedGeometry.merge(sphere.geometry,sphere.matrix);
        }
        indx++;
      }
      neuron = new THREE.Mesh(mergedGeometry,material);

      axisHelper = new THREE.AxisHelper(20);
      axisHelper.position.x = -50;
      neuron.rotation.z = -1.7*Math.PI/4;

      callback();
    });
  }

  function draw(){
    scene.add(neuron);
    scene.add(axisHelper);

    stats = new Stats();
    stats.setMode(1);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

//     var loader = new THREE.JSONLoader();
//     var newmesh; 
//     var edges;
//     loader.load("potshape.js", function (geo){
//       console.log(geo.vertices);
//       newmesh = new THREE.Mesh(geo, new THREE.MeshNormalMaterial());
//       newmesh.scale.set(10,10,10);
//       edges = new THREE.EdgesHelper(newmesh, 0x00ff00 );
//       scene.add(edges);
//       scene.add(newmesh);
//     });
    requestAnimationFrame(animate);
  }

  function animate(){
    stats.begin();
    // update
    var time = (new Date()).getTime();
    var timeDiff = time - lastTime;
    var angleChange = angularSpeed * timeDiff * 2 * Math.PI / 1000;
    neuron.rotation.y += angleChange;
    axisHelper.rotation.y += angleChange;
    lastTime = time;

    renderer.render(scene, camera);
    stats.end();

    requestAnimationFrame(animate);
  }

  function loadPotentialMesh(callback) {

  }

})();


function rotateAroundObjectAxis(object, axis, radians) {
    var rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
    // new code for Three.JS r55+:
    object.matrix.multiply(rotObjectMatrix);

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js r50-r58:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // new code for Three.js r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}

function rotateAroundWorldAxis(object, axis, radians) {
    var rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    //  rotWorldMatrix.multiply(object.matrix);
    // new code for Three.JS r55+:
    rotWorldMatrix.multiply(object.matrix);                // pre-multiply

    object.matrix = rotWorldMatrix;

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js pre r59:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // code for r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}