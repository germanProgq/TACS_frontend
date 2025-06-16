import { useRef, useState, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface RipplePoint {
  x: number
  y: number
  z: number
  intensity: number
  time: number
  id: string
}

const RippleShader = {
  uniforms: {
    time: { value: 0 },
    ripples: { value: [] },
    resolution: { value: new THREE.Vector2() }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec2 resolution;
    uniform vec3 ripples[10];
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vec2 center = vUv - 0.5;
      float dist = length(center);
      
      float ripple = 0.0;
      for(int i = 0; i < 10; i++) {
        if(ripples[i].z > 0.0) {
          float rippleDist = distance(vUv, ripples[i].xy);
          float wave = sin(rippleDist * 20.0 - time * 5.0) * exp(-rippleDist * 5.0);
          ripple += wave * ripples[i].z;
        }
      }
      
      vec3 color = mix(
        vec3(0.0, 0.1, 0.2), 
        vec3(0.0, 1.0, 0.5), 
        abs(ripple)
      );
      
      gl_FragColor = vec4(color, 0.8 + ripple * 0.2);
    }
  `
}

const RippleMesh: React.FC<{ ripples: RipplePoint[] }> = ({ ripples }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime
      materialRef.current.uniforms.resolution.value.set(size.width, size.height)
      
      // Update ripple positions and intensities
      const rippleData = ripples.slice(0, 10).map(ripple => 
        new THREE.Vector3(ripple.x, ripple.y, ripple.intensity)
      )
      while (rippleData.length < 10) {
        rippleData.push(new THREE.Vector3(0, 0, 0))
      }
      materialRef.current.uniforms.ripples.value = rippleData
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <planeGeometry args={[20, 20, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        {...RippleShader}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export const Ripple3D: React.FC<{
  onInteraction?: (point: { x: number; y: number; z: number }) => void
  mousePosition?: { x: number; y: number }
}> = ({ onInteraction, mousePosition }) => {
  const [ripples, setRipples] = useState<RipplePoint[]>([])

  const addRipple = useCallback((x: number, y: number, z: number = 0, intensity: number = 1) => {
    const newRipple: RipplePoint = {
      x: x * 0.5 + 0.5,
      y: y * 0.5 + 0.5,
      z,
      intensity,
      time: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    }

    setRipples(prev => [...prev, newRipple])
    onInteraction?.({ x, y, z })

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 2000)
  }, [onInteraction])

  const handlePointerDown = (event: { point?: { x: number; y: number; z: number } }) => {
    if (event.point) {
      addRipple(event.point.x / 10, event.point.y / 10, event.point.z / 10, 1.5)
    }
  }

  // Add automatic ripples based on mouse movement
  useMemo(() => {
    if (mousePosition) {
      const shouldAddRipple = Math.random() < 0.1 // 10% chance
      if (shouldAddRipple) {
        addRipple(mousePosition.x, mousePosition.y, 0, 0.5)
      }
    }
  }, [mousePosition, addRipple])

  return (
    <group>
      <RippleMesh ripples={ripples} />
      <mesh
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
        visible={false}
      >
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}