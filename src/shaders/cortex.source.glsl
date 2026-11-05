// Surface detail is a shading effect; branching vessels are separate surface-following geometry.
#define DEBUG_MODE 0
const float FIBER_SCALE = 13.0;
const float FLOW_SPEED = 0.12;
const float RIM_POWER = 2.5;
vec3 corticalLight(vec3 p, vec3 n, vec3 viewDir, float time, float pulse, float tone, vec3 low, vec3 high, vec3 regionColor, float selection) {
 float rim=pow(1.0-clamp(abs(dot(n,viewDir)),0.0,1.0),RIM_POWER);
 vec3 lamp=normalize(vec3(-0.7,1.5,2.0));
 float diffuse=0.25+0.75*max(dot(n,lamp),0.0);
 float grain=fbm(p*3.5,3,2.0,0.5);
 float capillary=1.0-smoothstep(.012,.055,abs(valueNoise(p*FIBER_SCALE+vec3(grain*2.0))-.5));
 vec3 tissue=regionColor*(.25+selection*.12)+low*.028;
 float specular=pow(max(dot(reflect(-lamp,n),viewDir),0.0),30.0);
 vec3 color=tissue*diffuse;
 color+=regionColor*rim*(.12+selection*.15);
 color+=high*(rim*.025+capillary*(.008+tone*.006)+specular*.045);
 color+=mix(vec3(.28,.025,.12),high,.25)*selection*.06;
 color*=1.0+pulse*.06;
 #if DEBUG_MODE == 2
 return n*.5+.5;
 #elif DEBUG_MODE == 5
 return vec3(capillary);
 #else
 return linearToSrgb(color);
 #endif
}
vec3 neuralAtmosphere(vec2 uv,float time,float pulse,float tone,vec3 low,vec3 high){
 float field=fbm(vec3(uv*2.0,time*.025),3,2.0,.5);
 float threads=1.0-smoothstep(.012,.06,abs(sin(uv.x*3.0+uv.y*2.0+field*5.0)));
 float vignette=exp(-dot(uv,uv)*.6);
 return mix(vec3(.018,.009,.026),low*.3,field*vignette*.7)+high*threads*vignette*(.008+tone*.006+pulse*.009);
}
