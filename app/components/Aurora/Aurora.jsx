import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import React, { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
  in vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform float uTime;
  uniform float uAmplitude;
  uniform vec3 uColorStops[3];
  uniform vec2 uResolution;

  // GLSL noise function
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec3 permute(vec3 x) {
    return mod289(((x*34.0)+1.0)*x);
  }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                        -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);

    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                    + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    
    // Create aurora effect
    float noise1 = snoise(vec2(uv.x * 3.0 + uTime * 0.1, uv.y * 3.0 - uTime * 0.2));
    float noise2 = snoise(vec2(uv.x * 2.0 - uTime * 0.15, uv.y * 2.0 + uTime * 0.1));
    float noise3 = snoise(vec2(uv.x * 4.0 + uTime * 0.05, uv.y * 4.0 - uTime * 0.05));
    
    float intensity = (noise1 + noise2 + noise3) / 3.0;
    intensity = intensity * 0.5 + 0.5; // Normalize to 0-1
    
    // Map intensity to colors
    vec3 color;
    if (intensity < 0.5) {
      color = mix(uColorStops[0], uColorStops[1], intensity * 2.0);
    } else {
      color = mix(uColorStops[1], uColorStops[2], (intensity - 0.5) * 2.0);
    }
    
    // Apply amplitude to intensity
    color *= uAmplitude;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function Aurora(props) {
    const {
        colorStops = ['#FF1801', '#0A0A0A', '#1A1A1A'],
        amplitude = 1.0,
        speed = 0.5,
        className = '',
    } = props;

    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const renderer = new Renderer({ alpha: true });
        const gl = renderer.gl;
        containerRef.current.appendChild(gl.canvas);

        // Default sizing
        const resize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', resize);
        resize();

        const geometry = new Triangle(gl);

        const program = new Program(gl, {
            vertex: VERTEX_SHADER,
            fragment: FRAGMENT_SHADER,
            uniforms: {
                uTime: { value: 0 },
                uAmplitude: { value: amplitude },
                uColorStops: {
                    value: colorStops.map(c => new Color(c))
                },
                uResolution: { value: [window.innerWidth, window.innerHeight] }
            },
        });

        const mesh = new Mesh(gl, { geometry, program });

        let time = 0;
        const update = (t) => {
            requestAnimationFrame(update);

            time += 0.01 * speed;
            program.uniforms.uTime.value = time;
            program.uniforms.uResolution.value = [window.innerWidth, window.innerHeight];

            renderer.render({ scene: mesh });
        };
        requestAnimationFrame(update);

        return () => {
            window.removeEventListener('resize', resize);
            if (containerRef.current && gl.canvas) {
                containerRef.current.removeChild(gl.canvas);
            }
        };
    }, [colorStops, amplitude, speed]);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 overflow-hidden ${className}`}
            style={{ zIndex: 0 }}
        />
    );
}
