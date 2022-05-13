precision mediump float;
precision mediump int;

varying vec4 vColor;

void main()	{
    vec4 color = vec4( vColor );
    gl_FragColor = color;
}