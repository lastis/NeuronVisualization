function start() {

}

function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  var files = evt.dataTransfer.files;

  var output = [];
//   for (var i = 0, f; f = files[i]; i++) {
  f = files[0];
    output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
      f.size, ' bytes, last modified: ',
      f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
      '</li>');
//   }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function drawNeuron(data) {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 3000 );
  camera.position.z = 300;

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  
  document.body.appendChild( renderer.domElement );
  
  var mergedGeometry = new THREE.Geometry();
  var material = new THREE.MeshNormalMaterial();
  var zAxis = new THREE.Vector3(0,0,1);
  var xAxis = new THREE.Vector3(1,0,0);
  var yAxis = new THREE.Vector3(0,1,0);
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

      var x = data[indx].x;
      var y = data[indx].y;
      var z = data[indx].z;
      var x2 = data[indx+1].x;
      var y2 = data[indx+1].y;
      var z2 = data[indx+1].z;
      var zAngle = Math.atan2(dx,dy);
      var yAngle = Math.atan2(dz,dx);

      var cylinderGeo = new THREE.CylinderGeometry(r1,r2,len,8,1,false);
      var cylinder = new THREE.Mesh(cylinderGeo,material);
      cylinder.position.set(x+dx/2,y+dy/2,z+dz/2);
//       cylinder.position.set(x,y,z);
      cylinder.rotation.z = -zAngle + Math.PI;
//       cylinder.rotation.x = Math.PI/4;
      cylinder.rotation.y = -yAngle;
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
  var merged = new THREE.Mesh(mergedGeometry,material);
//   merged.rotation.z = -1.7*Math.PI/4;
  scene.add(merged);

  var axisHelper = new THREE.AxisHelper(20);
  axisHelper.position.x = -50;
  scene.add(axisHelper);

  var angularSpeed = 0.01;
  var lastTime = 0;

  var stats = new Stats();
  stats.setMode(1);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);
  
  function animate(){
    stats.begin();
    // update
    var time = (new Date()).getTime();
    var timeDiff = time - lastTime;
    var angleChange = angularSpeed * timeDiff * 2 * Math.PI / 1000;
    merged.rotation.x += angleChange;
//     merged.rotation.y += angleChange;
    lastTime = time;

    // render
    renderer.render(scene, camera);

    stats.end();
    // request new frame
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// Rotate an object around an arbitrary axis in world space       
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


    function handleFiles(files) {
      // Check for the various File API support.
      if (window.FileReader) {
          // FileReader are supported.
          getAsText(files[0]);
      } else {
          alert('FileReader are not supported in this browser.');
      }
    }

    function getAsText(fileToRead) {
      var reader = new FileReader();
      // Read file into memory as UTF-8      
      reader.readAsText(fileToRead);
      // Handle errors load
      reader.onload = loadHandler;
      reader.onerror = errorHandler;
    }

    function loadHandler(event) {
      var csv = event.target.result;
      processData(csv);
    }

    function processData(csv) {
      var data = d3.csv.parse(csv);
      data.forEach(function(d) {
          d.x = +d.x;
          d.y = +d.y;
          d.z = +d.z;
          d.diam = +d.diam;
        });
      drawNeuron(data);
    }

    function errorHandler(evt) {
      if(evt.target.error.name == "NotReadableError") {
          alert("Canno't read file !");
      }
    }