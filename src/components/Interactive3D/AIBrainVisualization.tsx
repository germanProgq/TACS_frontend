import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Simple3DObject: React.FC<{
  mousePosition?: { x: number; y: number }
  isActive: boolean
}> = ({ mousePosition, isActive }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current || !isActive) return

    const time = state.clock.elapsedTime
    
    // Rotate the object
    meshRef.current.rotation.x = time * 0.5
    meshRef.current.rotation.y = time * 0.3
    meshRef.current.rotation.z = Math.sin(time * 0.2) * 0.1
    
    // Scale based on mouse interaction
    let scale = 1
    if (mousePosition) {
      const mouseDistance = Math.sqrt(mousePosition.x ** 2 + mousePosition.y ** 2)
      scale = 1 + mouseDistance * 0.3
    }
    
    const pulse = Math.sin(time * 2) * 0.1 + 1
    meshRef.current.scale.setScalar(scale * pulse)
    
    // Color animation
    const material = meshRef.current.material as THREE.MeshBasicMaterial
    const hue = (time * 0.1) % 1
    material.color.setHSL(hue, 0.7, 0.6)
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshBasicMaterial transparent opacity={0.8} />
    </mesh>
  )
}

export { Simple3DObject as NeuralNetworkBrain }