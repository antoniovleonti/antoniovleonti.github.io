import * as THREE from "https://cdn.skypack.dev/three@0.132.2";
import { TrackballControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/TrackballControls.js";

const NLINES = 500;
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1200);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("bg-canvas"),
    antialias: true
});
renderer.setClearColor("#000000"); // Set background colour
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); // Add renderer to HTML as a canvas element

// Make Canvas Responsive
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight); // Update size
    camera.aspect = window.innerWidth / window.innerHeight; // Update aspect ratio
    camera.updateProjectionMatrix(); // Apply changes
})

const material = new THREE.RawShaderMaterial({
    fragmentShader: document.getElementById("lineFrag").textContent,
    vertexShader: document.getElementById("lineVert").textContent,
    transparent: true
});
material.vertexColors = true;


let pointsArr = []
let sourcesArr = []
let posiAttrArr = []
let geometryArr = []
for (let i = 0; i < NLINES; i++)
{
    const points = [
        Math.random()*2-1, Math.random()*2-1, Math.random()*2-1, // random start
        0, 0, 0 // points to center
    ];
    pointsArr.push(points);
    sourcesArr.push([points[0],points[1],points[2]]);

    const positionAttribute = new THREE.Float32BufferAttribute(points, 3);
    posiAttrArr.push(positionAttribute);

    let colors = new Float32Array([
        (points[0]+1)/2*255, (points[1]+1)/2*255, 255, 255, // color 1
        0, 0, 0, 0 // color 2
    ]);
    const colorAttribute = new THREE.Uint8BufferAttribute( colors, 4 );
    colorAttribute.normalized = true; // maps attribute to [0..1] in shader


    const geometry = new THREE.BufferGeometry();
    geometryArr.push(geometry);

    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('color', colorAttribute);

    const line = new THREE.Line( geometry, material );
    scene.add( line );
}

// keep track of the mouse position
const mouse = new THREE.Vector2();
document.addEventListener('mousemove', () => {
    // 'event' keyword is deprecated but it works :-)
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

    for(let i = 0; i < NLINES; i++)
    {
        pointsArr[i][3] = mouse.x;
        pointsArr[i][4] = mouse.y;
        posiAttrArr[i].set(pointsArr[i]);
    }
}, false);

const updateLineSources = function(time)
{
    for (let i = 0; i < NLINES; i++)
    {
        const distFromCenter = Math.sqrt(Math.exp(sourcesArr[i][0],2)+Math.exp(sourcesArr[i][1],2));
        const intensity = (Math.sin(time+distFromCenter*10) + 1)/2;
        // offset source based on time and location
        pointsArr[i][0] = sourcesArr[i][0] + Math.cos(time)*0.01*intensity;
        pointsArr[i][1] = sourcesArr[i][1] + Math.sin(time)*0.01*intensity;
        // update attribute
        posiAttrArr[i] = new THREE.Float32BufferAttribute( pointsArr[i], 3 );
        geometryArr[i].setAttribute("position", posiAttrArr[i]);
    }
}

// Rendering Function
let time = 0.0;
const rendering = function() 
{
    time += 0.1;
    // Rerender every time the page refreshes (pause when on another tab)
    requestAnimationFrame(rendering);
    updateLineSources(time);
    renderer.render(scene, camera);
}
rendering();