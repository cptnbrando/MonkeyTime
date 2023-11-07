<script lang="ts">
    import * as THREE from "three";
    import { onMount } from "svelte";
    import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
    import { AmbientLight, DirectionalLight } from "three";

    let el: any;
    onMount(() => {
        createScene(el);
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    // scene.background = new THREE.Color(0xff0000);
    // scene.backgroundIntensity = 10;

    // Add light to see monkey
    let defaultLight = new DirectionalLight(0xfff6e0, 7);
    scene.add(new AmbientLight(0xfff6e0, 1.5));
    scene.add(defaultLight);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    let renderer: any;
    scene.add(cube);
    camera.position.z = 5;

    // Load in our monkey
    const loader = new GLTFLoader();
    let punk: THREE.Group<THREE.Object3DEventMap>;

    loader.load( '/monkey_punk.glb', function (gltf) {
        scene.add(gltf.scene);
        punk = gltf.scene;
        // punk.scale.set(2, 2, 2);
    }, undefined, function (error) {
        console.error(error);
    });

    const animate = () => {
        requestAnimationFrame(animate);
        punk.rotation.x += 0.01;
        punk.rotation.y += 0.01;
        renderer.render(scene, camera);
    };

    const resize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    };

    export const createScene = (el: any) => {
        renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el });
        resize();
        animate();
    };
</script>

<canvas bind:this={el} />
