$(function () {
    noise.seed(Math.random());

    class Terrain {


        constructor() {
            this.scene = new THREE.Scene();

            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.rotation.x = 60 * Math.PI / 180;
            this.stereo = new THREE.StereoCamera();
            this.stereo.aspect = 0.5;

            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(this.renderer.domElement);

            this.camera.position.z = 15;
            this.noise = [];
            this.offset = 0.0;
            this.offset_growth_speed = 0.4;

            this.height_offset = 10;
            this.p_smoothing = 15;


            this.bindFuncs();
        }

        bindFuncs() {
            this.animate = this.animate.bind(this);
            this.buildGeom = this.buildGeom.bind(this);
            this.buildTerrain = this.buildTerrain.bind(this);
            this.buildLight = this.buildLight.bind(this);
        }

        buildGeom() {
            this.buildTerrain();
            this.buildLight();
        }

        buildLight() {
            const light = new THREE.PointLight(0xffffff, 5, 100);
            light.position.set(0, 0, 10);
            this.scene.add(light);
        }

        buildTerrain() {
            const material = new THREE.MeshLambertMaterial({
                wireframe: true,
                color: 0xadaaaa
            });

            const plane = new THREE.PlaneGeometry(150, 300, 100, 100);
            for (let i = 0, l = plane.vertices.length; i < l; i ++) {
                const {x, y} = plane.vertices[i];
                const noiseVal = noise.perlin2(x / this.p_smoothing, y / this.p_smoothing) * this.height_offset;
                this.noise.push(noiseVal);
                plane.vertices[i].z = noiseVal;
            }

            this.terrain = new THREE.Mesh(plane, material);
            this.terrain.castShadow = true;
            this.terrain.receiveShadow = true;
            this.terrain.rotateZ(270 * Math.PI / 180);
            this.scene.add(this.terrain);
        }

        animate() {
            //Problem might be that when it ends the noise array it just starts it again?
            this.noise.forEach((noiseVal, index) => {
                const planeIndex = Math.floor((index + this.offset) % this.terrain.geometry.vertices.length);
                this.terrain.geometry.vertices[planeIndex].z = noiseVal;
                const {x, y} = this.terrain.geometry.vertices[planeIndex];
            });
            console.log(this.noise);

            this.offset += this.offset_growth_speed;

            this.terrain.geometry.verticesNeedUpdate = true;

            requestAnimationFrame(this.animate);

            let size = new THREE.Vector2;
            this.renderer.getSize(size);
            this.renderer.setScissorTest(true);
            this.renderer.setScissor(0, 0, size.width, size.height);
            this.renderer.setViewport(0, 0, size.width, size.height);
            this.renderer.render(this.scene, this.camera);
            this.renderer.setScissorTest(false);


        }

    }

    const msObj = new Terrain();
    msObj.buildGeom();
    msObj.animate();

});
	