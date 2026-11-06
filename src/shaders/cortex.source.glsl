// @neuro-kernel
// Same six-stage field and palette progression as the homepage. The only 3D
// adaptation is triplanar sampling plus anatomical lighting. No tubes or sprites.
#define DEBUG_MODE 0
const float NEURO_SCALE = 0.64;
const float NEURO_TIME_SCALE = 0.28;
const float REGION_TINT = 0.28;

vec3 neuroPalette(float x, vec3 wash, vec3 low, vec3 middle, vec3 high) {
 float f=clamp(x,0.0,1.0)*3.0;
 vec3 c=mix(wash,low,smoothstep(0.0,1.0,clamp(f,0.0,1.0)));
 c=mix(c,middle,smoothstep(0.0,1.0,clamp(f-1.0,0.0,1.0)));
 return mix(c,high,smoothstep(0.0,1.0,clamp(f-2.0,0.0,1.0)));
}
float corticalField(vec2 p,float time,float pulse,float tone) {
 float angle=1.94;
 p=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*p;
 float detail=2.05+0.9*tone;
 // Verified noise helpers provide the small organic warp; the main field is
 // the exact shared homepage recurrence, not a newly invented vessel pattern.
 p+=(0.04+0.1*tone)*(vec2(fbm(p*detail+1.0,3),fbm(p*detail+vec2(5.2,1.3),3))-.5);
 return neuroField(p,time*NEURO_TIME_SCALE,.86,.32+.38*pulse*(.65+.5*tone),1.0);
}
vec3 corticalLight(vec3 p,vec3 n,vec3 viewDir,float time,float pulse,float tone,vec3 low,vec3 high,vec3 regionColor,float selection,vec3 wash,vec3 middle,vec3 surfaceNormal) {
 vec3 w=pow(abs(surfaceNormal),vec3(6.0));w/=max(w.x+w.y+w.z,.001);
 p*=NEURO_SCALE;
 float field= w.x*corticalField(p.zy,time,pulse,tone)
             +w.y*corticalField(p.xz,time,pulse,tone)
             +w.z*corticalField(p.xy,time,pulse,tone);
 vec3 c=neuroPalette(field,wash,low,middle,high);
 float lambert=max(dot(n,normalize(vec3(-.6,1.1,2.0))),0.0);
 float rim=pow(1.0-clamp(abs(dot(n,viewDir)),0.0,1.0),2.8);
 // Keep the field's colour language, with stable regional tint for navigation.
 c=mix(c,linearToSrgb(regionColor)*(.35+field*.12),REGION_TINT);
 c*=.72+.28*lambert;
 c+=high*rim*(.065+selection*.10)+regionColor*selection*.035;
 c=(c-.5)*(1.0+.06*pulse)+.5;
 #if DEBUG_MODE == 2
 return n*.5+.5;
 #elif DEBUG_MODE == 5
 return vec3(field);
 #else
 return clamp(c,0.0,1.0);
 #endif
}
vec3 neuralAtmosphere(vec2 uv,float time,float pulse,float tone,vec3 low,vec3 high) {
 float field=corticalField(uv*.7,time,pulse,tone);
 vec3 c=neuroPalette(field,vec3(.55,.09,.28),low,vec3(.027,.012,.051),high);
 return mix(vec3(.025,.018,.030),c,.075);
}

float corticalGrain(vec2 pixel) { return hash12(pixel); }
