import { useRef, useMemo, useCallback, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface IntelligentParticle {
  id: string
  position: THREE.Vector3
  velocity: THREE.Vector3
  acceleration: THREE.Vector3
  age: number
  maxAge: number
  size: number
  color: THREE.Color
  intelligence: number
  behavior: 'seeker' | 'explorer' | 'follower' | 'leader' | 'swarm'
  energy: number
  connections: string[]
  memory: THREE.Vector3[]
  decision: number
}

interface AIBehaviorState {
  globalAttractor: THREE.Vector3
  swarmCenters: THREE.Vector3[]
  predatorPositions: THREE.Vector3[]
  foodSources: THREE.Vector3[]
  obstacles: THREE.Vector3[]
}

const AIParticleSystem: React.FC<{
  count?: number
  mousePosition?: { x: number; y: number }
  isActive: boolean
  mode?: 'emergence' | 'evolution' | 'consciousness' | 'quantum'
}> = ({ count = 500, mousePosition, isActive, mode = 'emergence' }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const particlesRef = useRef<IntelligentParticle[]>([])
  const behaviorStateRef = useRef<AIBehaviorState>({
    globalAttractor: new THREE.Vector3(),
    swarmCenters: [],
    predatorPositions: [],
    foodSources: [],
    obstacles: []
  })
  const { raycaster, camera, gl } = useThree()
  const [repelPoint, setRepelPoint] = useState<THREE.Vector3 | null>(null)
  const [repelStrength, setRepelStrength] = useState(0)

  // Use useState to prevent particle reinitialization on re-renders
  const [particlesInitialized, setParticlesInitialized] = useState(false)

  // Handle click to repel particles
  const handlePointerDown = useCallback((event: PointerEvent) => {
    event.stopPropagation()
    
    // Convert screen coordinates to world coordinates
    const mouse = new THREE.Vector2()
    mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1
    mouse.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1
    
    raycaster.setFromCamera(mouse, camera)
    
    // Create repel point in world space
    const clickPoint = new THREE.Vector3(mouse.x * 10, mouse.y * 10, 0)
    setRepelPoint(clickPoint)
    setRepelStrength(5) // Strong initial repulsion
    
    // Gradually reduce repel strength over time
    const interval = setInterval(() => {
      setRepelStrength(prev => {
        const newStrength = prev * 0.9
        if (newStrength < 0.1) {
          setRepelPoint(null)
          clearInterval(interval)
          return 0
        }
        return newStrength
      })
    }, 50)
  }, [raycaster, camera, gl])

  // Set up click listener
  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('pointerdown', handlePointerDown)
    
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [gl, handlePointerDown])

  // Initialize particles with AI behaviors - only once
  useMemo(() => {
    // Only initialize if not already done
    if (particlesInitialized || particlesRef.current.length > 0) return particlesRef.current
    
    const initialParticles: IntelligentParticle[] = []
    
    for (let i = 0; i < count; i++) {
      const behaviors: IntelligentParticle['behavior'][] = ['seeker', 'explorer', 'follower', 'leader', 'swarm']
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)]
      
      const particle: IntelligentParticle = {
        id: `particle-${i}`,
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        acceleration: new THREE.Vector3(),
        age: 0,
        maxAge: 10000 + Math.random() * 5000, // Much longer lifespans
        size: 0.02 + Math.random() * 0.05,
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
        intelligence: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
        behavior,
        energy: 50 + Math.random() * 50,
        connections: [],
        memory: [],
        decision: 0
      }
      
      initialParticles.push(particle)
    }
    
    particlesRef.current = initialParticles
    setParticlesInitialized(true)
    return initialParticles
  }, [count, particlesInitialized])

  // AI Decision Making System
  const makeDecision = useCallback((particle: IntelligentParticle, neighbors: IntelligentParticle[]) => {
    const decisions = {
      seek: 0,
      flee: 0,
      align: 0,
      separate: 0,
      cohere: 0,
      explore: 0,
      reproduce: 0,
      rest: 0
    }

    // Behavior-based decision weights
    switch (particle.behavior) {
      case 'seeker':
        decisions.seek = 0.4
        decisions.explore = 0.3
        decisions.align = 0.2
        decisions.separate = 0.1
        break
      case 'explorer':
        decisions.explore = 0.5
        decisions.seek = 0.2
        decisions.separate = 0.3
        break
      case 'follower':
        decisions.align = 0.4
        decisions.cohere = 0.4
        decisions.seek = 0.2
        break
      case 'leader':
        decisions.seek = 0.3
        decisions.separate = 0.3
        decisions.explore = 0.2
        decisions.align = 0.2
        break
      case 'swarm':
        decisions.cohere = 0.3
        decisions.align = 0.3
        decisions.separate = 0.2
        decisions.seek = 0.2
        break
    }

    // Environmental influences
    if (particle.energy < 30) {
      decisions.seek += 0.3
      decisions.rest += 0.2
    }

    if (neighbors.length > 8) {
      decisions.separate += 0.3
    } else if (neighbors.length < 2) {
      decisions.cohere += 0.3
    }

    // Find highest decision
    let maxDecision = 0
    let chosenAction = 'explore'
    
    Object.entries(decisions).forEach(([action, weight]) => {
      if (weight > maxDecision) {
        maxDecision = weight
        chosenAction = action
      }
    })

    return chosenAction
  }, [])

  // Advanced Flocking with AI
  const calculateForces = useCallback((particle: IntelligentParticle, neighbors: IntelligentParticle[]) => {
    const forces = {
      separation: new THREE.Vector3(),
      alignment: new THREE.Vector3(),
      cohesion: new THREE.Vector3(),
      seek: new THREE.Vector3(),
      flee: new THREE.Vector3(),
      wander: new THREE.Vector3(),
      repel: new THREE.Vector3()
    }

    // Click repulsion force
    if (repelPoint && repelStrength > 0) {
      const distance = particle.position.distanceTo(repelPoint)
      const repelRadius = 3 // Particles within this radius are affected
      
      if (distance < repelRadius) {
        const repelDirection = particle.position.clone().sub(repelPoint).normalize()
        const falloff = Math.max(0, (repelRadius - distance) / repelRadius) // Stronger when closer
        const repelForce = repelDirection.multiplyScalar(repelStrength * falloff * 2)
        forces.repel.add(repelForce)
      }
    }

    // Separation - avoid crowding
    if (neighbors.length > 0) {
      const separationRadius = 2
      neighbors.forEach(neighbor => {
        const distance = particle.position.distanceTo(neighbor.position)
        if (distance < separationRadius && distance > 0) {
          const diff = particle.position.clone().sub(neighbor.position)
          diff.normalize().divideScalar(distance) // Weight by distance
          forces.separation.add(diff)
        }
      })
      forces.separation.multiplyScalar(1.5)
    }

    // Alignment - steer towards average heading
    if (neighbors.length > 0) {
      neighbors.forEach(neighbor => {
        forces.alignment.add(neighbor.velocity)
      })
      forces.alignment.divideScalar(neighbors.length)
      forces.alignment.normalize().multiplyScalar(0.3)
    }

    // Cohesion - steer towards average position
    if (neighbors.length > 0) {
      const center = new THREE.Vector3()
      neighbors.forEach(neighbor => {
        center.add(neighbor.position)
      })
      center.divideScalar(neighbors.length)
      forces.cohesion = center.sub(particle.position).normalize().multiplyScalar(0.2)
    }

    // Wander behavior for exploration
    const wanderStrength = 0.1 + Math.sin(particle.age * 0.1) * 0.05
    forces.wander.set(
      (Math.random() - 0.5) * wanderStrength,
      (Math.random() - 0.5) * wanderStrength,
      (Math.random() - 0.5) * wanderStrength
    )

    return forces
  }, [repelPoint, repelStrength])

  // Quantum Behavior Mode
  const applyQuantumBehavior = useCallback((particle: IntelligentParticle) => {
    if (mode !== 'quantum') return

    // Quantum tunneling effect
    if (Math.random() < 0.001) {
      particle.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      )
    }

    // Quantum entanglement - particles affect each other instantly
    const entangled = particlesRef.current.find(p => 
      p.id !== particle.id && Math.random() < 0.01
    )
    
    if (entangled) {
      const influence = 0.1
      particle.velocity.lerp(entangled.velocity, influence)
      particle.color.lerp(entangled.color, influence)
    }

    // Wave-particle duality
    const waveInfluence = Math.sin(particle.age * 0.5) * 0.3
    particle.size = particle.size * (1 + waveInfluence)
  }, [mode])

  // Evolution System
  const evolveParticle = useCallback((particle: IntelligentParticle) => {
    if (mode !== 'evolution') return

    // Fitness based on survival time and energy
    const fitness = (particle.age / particle.maxAge) * (particle.energy / 100)
    
    if (fitness > 0.8 && Math.random() < 0.005) {
      // Reproduce - create offspring with mutations
      const offspring = {
        ...particle,
        id: `offspring-${Math.random().toString(36).substr(2, 9)}`,
        position: particle.position.clone().add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          )
        ),
        age: 0,
        intelligence: Math.min(1, particle.intelligence + (Math.random() - 0.5) * 0.1),
        energy: 50,
        size: particle.size * (0.9 + Math.random() * 0.2)
      }
      
      particlesRef.current.push(offspring)
    }
  }, [mode])

  useFrame((state) => {
    if (!isActive || !meshRef.current) return

    const deltaTime = state.clock.getDelta()

    // Update behavior state
    if (mousePosition) {
      behaviorStateRef.current.globalAttractor.set(
        mousePosition.x * 10,
        mousePosition.y * 10,
        0
      )
    }

    // Update particles
    particlesRef.current.forEach((particle, index) => {
      // Find neighbors
      const neighbors = particlesRef.current.filter(p => 
        p.id !== particle.id && 
        particle.position.distanceTo(p.position) < 3
      )

      // AI Decision making
      const decision = makeDecision(particle, neighbors)
      particle.decision = decision === 'seek' ? 1 : decision === 'flee' ? -1 : 0

      // Calculate forces
      const forces = calculateForces(particle, neighbors)

      // Apply forces based on AI decision
      particle.acceleration.set(0, 0, 0)
      
      // Always apply repel force first (highest priority)
      if (forces.repel.length() > 0) {
        particle.acceleration.add(forces.repel.multiplyScalar(3)) // Strong repulsion
      } else {
        // Normal AI behavior when not being repelled
        switch (decision) {
          case 'seek':
            particle.acceleration.add(forces.seek.multiplyScalar(2))
            particle.acceleration.add(forces.separation.multiplyScalar(0.5))
            break
          case 'flee':
            particle.acceleration.add(forces.flee.multiplyScalar(1.5))
            particle.acceleration.add(forces.separation.multiplyScalar(1))
            break
          case 'align':
            particle.acceleration.add(forces.alignment.multiplyScalar(1.5))
            particle.acceleration.add(forces.separation.multiplyScalar(0.8))
            break
          case 'cohere':
            particle.acceleration.add(forces.cohesion.multiplyScalar(1.5))
            particle.acceleration.add(forces.alignment.multiplyScalar(0.5))
            break
          case 'separate':
            particle.acceleration.add(forces.separation.multiplyScalar(2))
            break
          case 'explore':
            particle.acceleration.add(forces.wander.multiplyScalar(1.5))
            particle.acceleration.add(forces.separation.multiplyScalar(0.3))
            break
        }
      }

      // Limit acceleration
      particle.acceleration.clampLength(0, 0.5)

      // Update physics
      particle.velocity.add(particle.acceleration.clone().multiplyScalar(deltaTime))
      particle.velocity.clampLength(0, 2 + particle.intelligence)
      particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime))

      // Boundary conditions with intelligent response
      const bounds = 15
      if (Math.abs(particle.position.x) > bounds) {
        particle.position.x = Math.sign(particle.position.x) * bounds
        particle.velocity.x *= -0.8
      }
      if (Math.abs(particle.position.y) > bounds) {
        particle.position.y = Math.sign(particle.position.y) * bounds
        particle.velocity.y *= -0.8
      }
      if (Math.abs(particle.position.z) > bounds) {
        particle.position.z = Math.sign(particle.position.z) * bounds
        particle.velocity.z *= -0.8
      }

      // Update particle properties - much slower aging and energy loss
      particle.age += deltaTime * 0.1 // Age 10x slower
      particle.energy = Math.max(20, particle.energy - deltaTime * 0.01) // Lose energy 10x slower and never go below 20

      // Color based on behavior and state
      const hue = particle.behavior === 'seeker' ? 0.3 :
                  particle.behavior === 'explorer' ? 0.6 :
                  particle.behavior === 'leader' ? 0.1 :
                  particle.behavior === 'follower' ? 0.7 : 0.8
      
      const saturation = 0.7 + particle.intelligence * 0.3
      const lightness = 0.3 + particle.energy / 100 * 0.5
      
      particle.color.setHSL(hue, saturation, lightness)

      // Apply mode-specific behaviors
      applyQuantumBehavior(particle)
      evolveParticle(particle)

      // Update instance matrix
      const matrix = new THREE.Matrix4()
      matrix.setPosition(particle.position)
      matrix.scale(new THREE.Vector3(particle.size, particle.size, particle.size))
      meshRef.current!.setMatrixAt(index, matrix)
      meshRef.current!.setColorAt(index, particle.color)
    })

    // Disabled particle removal/spawning to eliminate lag
    // Particles now have very long lifespans and maintain minimum energy
    // This prevents the constant recreation that was causing lag every 2 seconds

    meshRef.current!.instanceMatrix.needsUpdate = true
    if (meshRef.current!.instanceColor) {
      meshRef.current!.instanceColor.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial transparent opacity={0.8} />
    </instancedMesh>
  )
}

export { AIParticleSystem }