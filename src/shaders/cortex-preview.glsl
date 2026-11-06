// Preview controls: BPM = beat frequency; HRV = flow complexity; SLEEP = filament tint.
const float BPM = 43.0;
const float HRV = 63.0;
const float SLEEP = 6.8;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
 vec2 uv=(2.0*fragCoord-iResolution.xy)/iResolution.y;
 float tone=clamp((HRV-20.0)/70.0,0.0,1.0);
 float pulse=pow(0.5+0.5*sin(iTime*BPM/60.0*6.2831853),12.0);
 vec3 low=vec3(0.14,0.03,0.2);
 vec3 high=vec3(1.0,0.855,0.475)*(1.0+min(0.0,(SLEEP-7.2)/2.4)*0.55);
 vec3 color=neuralAtmosphere(uv,iTime,pulse,tone,low,high);
 float r=length(uv);
 if(r<0.85){vec3 n=normalize(vec3(uv,sqrt(max(0.001,0.85*0.85-r*r))));color=corticalLight(vec3(uv,n.z),n,vec3(0.0,0.0,1.0),iTime,pulse,tone,low,high,vec3(0.4,0.3,0.2),0.0,vec3(.55,.09,.28),vec3(.027,.012,.051),n);}
 fragColor=vec4(color,1.0);
}
