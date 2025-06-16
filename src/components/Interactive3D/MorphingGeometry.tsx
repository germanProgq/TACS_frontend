import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface MorphTarget {
  name: string
  vertices: Float32Array
  weight: number
  complexity: number
}

const AdvancedMorphingGeometry: React.FC<{
  mousePosition?: { x: number; y: number }
  isActive: boolean
  interactionType?: 'touch' | 'hover' | 'click' | 'scroll'
  morphMode?: 'organic' | 'geometric' | 'fractal' | 'neural' | 'quantum'
}> = ({ 
  mousePosition, 
  isActive, 
  interactionType = 'hover',
  morphMode = 'organic'
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometryRef = useRef<THREE.BufferGeometry>(null)

  // Create base geometry with high detail
  const baseGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(3, 4) // High subdivision
    const positionAttribute = geo.getAttribute('position')
    const vertexCount = positionAttribute.count
    
    // Store original positions
    const originalPositions = new Float32Array(vertexCount * 3)
    for (let i = 0; i < vertexCount; i++) {
      originalPositions[i * 3] = positionAttribute.getX(i)
      originalPositions[i * 3 + 1] = positionAttribute.getY(i)
      originalPositions[i * 3 + 2] = positionAttribute.getZ(i)
    }
    
    geo.userData.originalPositions = originalPositions
    return geo
  }, [])

  // Generate morph targets based on mode
  const morphTargets = useMemo(() => {
    const targets: MorphTarget[] = []
    const positionAttribute = baseGeometry.getAttribute('position')
    const vertexCount = positionAttribute.count

    // Organic morphing patterns
    if (morphMode === 'organic') {
      // Breathing pattern
      const breathingVertices = new Float32Array(vertexCount * 3)
      for (let i = 0; i < vertexCount; i++) {
        const x = positionAttribute.getX(i)
        const y = positionAttribute.getY(i)
        const z = positionAttribute.getZ(i)
        const distance = Math.sqrt(x * x + y * y + z * z)
        const scale = 1 + Math.sin(distance * 0.5) * 0.3
        breathingVertices[i * 3] = x * scale
        breathingVertices[i * 3 + 1] = y * scale
        breathingVertices[i * 3 + 2] = z * scale
      }
      targets.push({ name: 'breathing', vertices: breathingVertices, weight: 0, complexity: 1 })

      // Wave pattern
      const waveVertices = new Float32Array(vertexCount * 3)
      for (let i = 0; i < vertexCount; i++) {
        const x = positionAttribute.getX(i)
        const y = positionAttribute.getY(i)
        const z = positionAttribute.getZ(i)
        const wave = Math.sin(x * 0.8 + y * 0.6) * 0.5
        waveVertices[i * 3] = x + Math.sin(y * 2) * 0.2
        waveVertices[i * 3 + 1] = y + wave
        waveVertices[i * 3 + 2] = z + Math.cos(x * 1.5) * 0.3
      }
      targets.push({ name: 'wave', vertices: waveVertices, weight: 0, complexity: 2 })

      // Spike pattern
      const spikeVertices = new Float32Array(vertexCount * 3)
      for (let i = 0; i < vertexCount; i++) {
        const x = positionAttribute.getX(i)
        const y = positionAttribute.getY(i)
        const z = positionAttribute.getZ(i)
        const spikeFactor = 1 + Math.random() * 1.5
        spikeVertices[i * 3] = x * spikeFactor
        spikeVertices[i * 3 + 1] = y * spikeFactor
        spikeVertices[i * 3 + 2] = z * spikeFactor
      }
      targets.push({ name: 'spikes', vertices: spikeVertices, weight: 0, complexity: 3 })
    }

    // Neural network patterns
    if (morphMode === 'neural') {
      const neuralVertices = new Float32Array(vertexCount * 3)
      for (let i = 0; i < vertexCount; i++) {
        const x = positionAttribute.getX(i)
        const y = positionAttribute.getY(i)
        const z = positionAttribute.getZ(i)
        
        // Create neural-like connections
        const activation = Math.sin(x * 0.5) * Math.cos(y * 0.5) * Math.sin(z * 0.5)
        const expansion = 1 + activation * 0.8
        
        neuralVertices[i * 3] = x * expansion + Math.sin(i * 0.1) * 0.1
        neuralVertices[i * 3 + 1] = y * expansion + Math.cos(i * 0.1) * 0.1
        neuralVertices[i * 3 + 2] = z * expansion + Math.sin(i * 0.15) * 0.1
      }
      targets.push({ name: 'neural', vertices: neuralVertices, weight: 0, complexity: 4 })
    }

    // Fractal patterns
    if (morphMode === 'fractal') {
      const fractalVertices = new Float32Array(vertexCount * 3)
      for (let i = 0; i < vertexCount; i++) {
        const x = positionAttribute.getX(i)
        const y = positionAttribute.getY(i)
        const z = positionAttribute.getZ(i)
        
        // Mandelbrot-inspired distortion
        let zx = x * 0.3
        let zy = y * 0.3
        let iteration = 0
        const maxIterations = 10
        
        while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
          const temp = zx * zx - zy * zy + x * 0.1
          zy = 2 * zx * zy + y * 0.1
          zx = temp
          iteration++
        }
        
        const fractalFactor = 1 + (iteration / maxIterations) * 0.5
        fractalVertices[i * 3] = x * fractalFactor
        fractalVertices[i * 3 + 1] = y * fractalFactor
        fractalVertices[i * 3 + 2] = z * fractalFactor
      }
      targets.push({ name: 'fractal', vertices: fractalVertices, weight: 0, complexity: 5 })
    }

    // Quantum field patterns
    if (morphMode === 'quantum') {
      const quantumVertices = new Float32Array(vertexCount * 3)
      for (let i = 0; i < vertexCount; i++) {
        const x = positionAttribute.getX(i)
        const y = positionAttribute.getY(i)
        const z = positionAttribute.getZ(i)
        
        // Quantum field fluctuations
        const fieldStrength = Math.sin(x * y * z * 0.1) * Math.cos(x + y + z)
        const uncertainty = (Math.random() - 0.5) * 0.3 // Heisenberg uncertainty
        
        quantumVertices[i * 3] = x + fieldStrength * 0.5 + uncertainty
        quantumVertices[i * 3 + 1] = y + Math.sin(fieldStrength * Math.PI) * 0.3 + uncertainty
        quantumVertices[i * 3 + 2] = z + Math.cos(fieldStrength * Math.PI) * 0.3 + uncertainty
      }
      targets.push({ name: 'quantum', vertices: quantumVertices, weight: 0, complexity: 6 })
    }

    return targets
  }, [morphMode, baseGeometry])

  // Advanced interaction response system
  useFrame((state) => {
    if (!isActive || !meshRef.current || !geometryRef.current) return

    const time = state.clock.elapsedTime
    const deltaTime = state.clock.getDelta()

    // Calculate interaction intensity
    let interactionIntensity = 0
    let targetComplexity = 1

    if (mousePosition) {
      const distance = Math.sqrt(mousePosition.x * mousePosition.x + mousePosition.y * mousePosition.y)
      interactionIntensity = Math.min(distance * 2, 1)
      
      // Different responses based on interaction type
      switch (interactionType) {
        case 'touch':
          targetComplexity = 3 + interactionIntensity * 3
          break
        case 'hover':
          targetComplexity = 1 + interactionIntensity * 2
          break
        case 'click':
          targetComplexity = 4 + Math.sin(time * 5) * 2
          break
        case 'scroll':
          targetComplexity = 2 + Math.abs(Math.sin(time * 2)) * 3
          break
      }
    }

    // Smooth morphing between targets
    const currentTarget = Math.floor(time * 0.3) % morphTargets.length
    const nextTarget = (currentTarget + 1) % morphTargets.length
    const morphProgress = (time * 0.3) % 1

    // Update morph weights with AI-like decision making
    morphTargets.forEach((target, index) => {
      let targetWeight = 0
      
      if (index === currentTarget) {
        targetWeight = 1 - morphProgress
      } else if (index === nextTarget) {
        targetWeight = morphProgress
      }
      
      // Apply interaction intensity
      targetWeight *= interactionIntensity * 0.8 + 0.2
      
      // Smooth weight transitions
      target.weight = THREE.MathUtils.lerp(target.weight, targetWeight, deltaTime * 3)
    })

    // Apply morphing to geometry
    const positionAttribute = geometryRef.current.getAttribute('position')
    const originalPositions = baseGeometry.userData.originalPositions
    const vertexCount = positionAttribute.count

    for (let i = 0; i < vertexCount; i++) {
      let finalX = originalPositions[i * 3]
      let finalY = originalPositions[i * 3 + 1]
      let finalZ = originalPositions[i * 3 + 2]

      // Apply weighted morph targets
      morphTargets.forEach(target => {
        if (target.weight > 0.01) {
          finalX += (target.vertices[i * 3] - originalPositions[i * 3]) * target.weight
          finalY += (target.vertices[i * 3 + 1] - originalPositions[i * 3 + 1]) * target.weight
          finalZ += (target.vertices[i * 3 + 2] - originalPositions[i * 3 + 2]) * target.weight
        }
      })

      // Add real-time procedural noise
      const noiseScale = 0.1 * interactionIntensity
      const noiseX = Math.sin(time * 2 + i * 0.1) * noiseScale
      const noiseY = Math.cos(time * 1.5 + i * 0.15) * noiseScale
      const noiseZ = Math.sin(time * 3 + i * 0.05) * noiseScale

      positionAttribute.setXYZ(i, finalX + noiseX, finalY + noiseY, finalZ + noiseZ)
    }

    positionAttribute.needsUpdate = true
    geometryRef.current.computeVertexNormals()

    // Dynamic material properties
    const material = meshRef.current.material as THREE.MeshBasicMaterial
    if (material) {
      // Color based on interaction and morph state
      const hue = (time * 0.1 + interactionIntensity * 0.3) % 1
      const saturation = 0.6 + interactionIntensity * 0.4
      const lightness = 0.4 + Math.sin(time * 2) * 0.2 + interactionIntensity * 0.3
      
      material.color.setHSL(hue, saturation, lightness)
      material.opacity = 0.7 + interactionIntensity * 0.3
      
      // Wireframe toggle based on complexity
      material.wireframe = targetComplexity > 4
    }

    // Dynamic scaling and rotation
    meshRef.current.scale.setScalar(0.8 + interactionIntensity * 0.4)
    meshRef.current.rotation.x += deltaTime * (0.2 + interactionIntensity * 0.3)
    meshRef.current.rotation.y += deltaTime * (0.15 + interactionIntensity * 0.25)
    meshRef.current.rotation.z += deltaTime * (0.1 + interactionIntensity * 0.2)

    // Floating motion
    meshRef.current.position.y = Math.sin(time * 0.8) * 0.5 + interactionIntensity * 2
    meshRef.current.position.x = Math.cos(time * 0.6) * 0.3
    meshRef.current.position.z = Math.sin(time * 0.4) * 0.2
  })

  return (
    <mesh ref={meshRef}>
      <primitive object={baseGeometry} ref={geometryRef} />
      <meshBasicMaterial 
        transparent 
        side={THREE.DoubleSide}
        vertexColors={false}
      />
    </mesh>
  )
}

// Morphing environment that responds to interactions
const MorphingEnvironment: React.FC<{
  mousePosition?: { x: number; y: number }
  isActive: boolean
  count?: number
}> = ({ mousePosition, isActive, count = 5 }) => {
  const groupRef = useRef<THREE.Group>(null)

  const morphingObjects = useMemo(() => {
    const objects = []
    const modes: Array<'organic' | 'geometric' | 'fractal' | 'neural' | 'quantum'> = 
      ['organic', 'geometric', 'fractal', 'neural', 'quantum']
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 8 + Math.sin(i) * 2
      const mode = modes[i % modes.length]
      
      objects.push({
        id: i,
        position: [
          Math.cos(angle) * radius,
          Math.sin(i * 0.5) * 3,
          Math.sin(angle) * radius
        ] as [number, number, number],
        morphMode: mode,
        interactionType: ['touch', 'hover', 'click', 'scroll'][i % 4] as 'touch' | 'hover' | 'click' | 'scroll'
      })
    }
    
    return objects
  }, [count])

  useFrame((state) => {
    if (groupRef.current && isActive) {
      const time = state.clock.elapsedTime
      groupRef.current.rotation.y = time * 0.1
      
      // Responsive positioning based on mouse
      if (mousePosition) {
        groupRef.current.position.x = mousePosition.x * 2
        groupRef.current.position.z = mousePosition.y * 2
      }
    }
  })

  return (
    <group ref={groupRef}>
      {morphingObjects.map(obj => (
        <group key={obj.id} position={obj.position}>
          <AdvancedMorphingGeometry
            mousePosition={mousePosition}
            isActive={isActive}
            morphMode={obj.morphMode}
            interactionType={obj.interactionType}
          />
        </group>
      ))}
    </group>
  )
}

export { AdvancedMorphingGeometry, MorphingEnvironment }