#version 400
#pragma include "../libs/noise3d.frag"
uniform int useReadColor;
uniform vec4 bgColor;
uniform vec4 edgeColor;

uniform sampler2DRect tex;
uniform sampler2DRect colorTex;
uniform sampler2DRect positionTex;
uniform sampler2DRect normalAndDepthTex;

const vec2 offsetCoord[9] = vec2[](
    vec2(-1., -1.), vec2(-1., 0.), vec2(-1., 1.),
    vec2(0., 1.),   vec2(0., 0.),  vec2(0., 1.),
    vec2(1., -1.),  vec2(1., 0.),  vec2(1., 1.)
);

const float weight[9] = float[](
    -1., -1., -1.,
    -1., 8., -1.,
    -1., -1., -1.
);

in vec2 vTexCoord;
out vec4 outputColor;

void main(){
    vec4 col = texture(colorTex, vTexCoord);
    if (col.a < 0.001) {
        outputColor = texture(tex, vTexCoord);
        return;
    }

    float depthEdge = 0.;
    vec3 normalSum = vec3(0.);
    float normalEdge = 0.;

    for (int i = 0; i < 9; i++) {
        vec2 uv = vTexCoord + offsetCoord[i];
        vec4 nd =  texture(normalAndDepthTex, uv);
        depthEdge += nd.a * weight[i];
        normalSum += nd.rgb * weight[i];
    }

    normalEdge = dot(abs(normalSum), vec3(1.)) / 3.;
    depthEdge = step(0.02, abs(depthEdge));
    vec3 bg = useReadColor == 1 ? col.rgb : bgColor.rgb;

    float edge = (1. - depthEdge) * (1. - normalEdge);
    outputColor = vec4(mix(edgeColor.rgb, bg, edge), 1.);

}