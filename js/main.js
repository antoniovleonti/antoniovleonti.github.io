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

const curPos = new Array(NLINES);
const startPos = new Array(NLINES);
const posAttr = new Array(NLINES);
const curColor = new Array(NLINES);
const colAttr = new Array(NLINES);
const distFromCenter = new Array(NLINES);
for (let i = 0; i < NLINES; i++)
{
    curPos[i] = [
        Math.random()*2-1, Math.random()*2-1, Math.random()*2-1, // random start
        0, 0, 0 // points to center
    ];

    startPos[i] = [curPos[i][0],curPos[i][1],curPos[i][2]];
    distFromCenter[i] = 
        Math.sqrt(  Math.exp(startPos[i][0],2) +
                    Math.exp(startPos[i][1],2));

    posAttr[i] = new THREE.Float32BufferAttribute(curPos[i], 3);
    posAttr[i].setUsage( THREE.StreamDrawUsage );

    //posAttr[i] = positionAttribute;

    curColor[i] = new Float32Array([
        (curPos[i][0]+1)/2*255, (curPos[i][1]+1)/2*255, 0, 255, // color 1
        0, 0, 0, 0 // color 2
    ]);

    colAttr[i] = new THREE.Uint8BufferAttribute( curColor[i], 4 );
    colAttr[i].normalized = true; // maps attribute to [0..1] in shader

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', posAttr[i]);
    geometry.setAttribute('color', colAttr[i]);

    const line = new THREE.Line( geometry, material );
    scene.add( line );
}

// track the mouse position
document.addEventListener('mousemove', () => {
    // 'event' keyword is deprecated but it works :-)
    const x = ( event.clientX / window.innerWidth ) * 2 - 1;
    const y = -( event.clientY / window.innerHeight ) * 2 + 1;

    for(let i = 0; i < NLINES; i++)
    {
        curPos[i][3] = x;
        curPos[i][4] = y;

        // update colors based on mouse pos
        curColor[i][2] = (1-Math.min(1,Math.sqrt(
            Math.pow(x - startPos[i][0],2) +
            Math.pow(y - startPos[i][1],2)
        ))) * 255;
        colAttr[i].set(curColor[i]);
        colAttr[i].needsUpdate = true;
    }
});

const updateLines = function(time)
{
    for (let i = 0; i < NLINES; i++)
    {
        const intensity = 0.01 * (Math.sin(time+distFromCenter[i]*30));
        // offset source based on time and location
        curPos[i][0] = startPos[i][0] + Math.cos(time) * intensity;
        curPos[i][1] = startPos[i][1] + Math.sin(time) * intensity;
        // update attribute
        posAttr[i].set(curPos[i]);
        posAttr[i].needsUpdate = true;
    }
}

// Rendering Function
let time = 0.0;
const rendering = function() 
{
    time += 0.1;
    // Rerender every time the page refreshes (pause when on another tab)
    requestAnimationFrame(rendering);
    updateLines(time);
    renderer.render(scene, camera);
}
rendering();