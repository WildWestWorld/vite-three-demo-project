precision lowp float;
varying vec2 vUv;
varying float vElevation;

uniform sampler2D uTexture;
void main() {

    float height = vElevation + 0.05 * 20.0;
    vec4 textureColor = texture2D(uTexture, vUv);
    textureColor.rgb *= height;
    gl_FragColor = textureColor;
}