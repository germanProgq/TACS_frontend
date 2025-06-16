import { useRef, useEffect, useState, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Box, Sphere, Cylinder } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from '../contexts/ThemeContext'

interface TrafficSceneProps {
  mousePosition: { x: number; y: number }
  isActive: boolean
}

interface Vehicle {
  id: number
  position: THREE.Vector3
  velocity: THREE.Vector3
  type: 'car' | 'truck' | 'bike'
  color: string
  detected: boolean
}

interface TrafficLight {
  position: THREE.Vector3
  state: 'red' | 'yellow' | 'green'
  timer: number
}

export const TrafficScene = ({ mousePosition, isActive }: TrafficSceneProps) => {
  const { resolvedTheme } = useTheme()
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([
    { position: new THREE.Vector3(-5, 0, -5), state: 'red', timer: 0 },
    { position: new THREE.Vector3(5, 0, -5), state: 'green', timer: 0 },
    { position: new THREE.Vector3(-5, 0, 5), state: 'green', timer: 0 },
    { position: new THREE.Vector3(5, 0, 5), state: 'red', timer: 0 }
  ])
  
  const [aiAnalysis, setAiAnalysis] = useState({
    detectedObjects: 0,
    trafficFlow: 85,
    accidents: 0,
    weatherCondition: 'clear'
  })

  // Helper function for theme-aware colors
  const getAccentColor = useCallback(() => resolvedTheme === 'light' ? '#2d5a4a' : '#00ff88', [resolvedTheme])
  const getTrafficGreenColor = () => resolvedTheme === 'light' ? '#2d5a4a' : '#00ff00'
  const getRoadColor = () => resolvedTheme === 'light' ? '#4a5568' : '#333333'
  const getRoadMarkingColor = () => resolvedTheme === 'light' ? '#fbbf24' : '#ffff00'
  const getTrafficLightBodyColor = () => resolvedTheme === 'light' ? '#374151' : '#222222'
  const getTrafficLightBoxColor = () => resolvedTheme === 'light' ? '#1f2937' : '#111111'

  useEffect(() => {
    if (!isActive) return

    const spawnVehicle = () => {
      const types: ('car' | 'truck' | 'bike')[] = ['car', 'truck', 'bike']
      const colors = [resolvedTheme === 'light' ? '#dc2626' : '#ff4757', getAccentColor(), resolvedTheme === 'light' ? '#2563eb' : '#3742fa', resolvedTheme === 'light' ? '#f59e0b' : '#ffa502', resolvedTheme === 'light' ? '#ea580c' : '#ff6b00']
      
      const vehicle: Vehicle = {
        id: Math.random(),
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          0.5,
          (Math.random() - 0.5) * 20
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          0,
          (Math.random() - 0.5) * 0.1
        ),
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        detected: Math.random() > 0.08 // 92% detection rate
      }
      
      setVehicles(prev => [...prev.slice(-19), vehicle]) // Keep last 20 vehicles
    }

    const interval = setInterval(spawnVehicle, 800)
    return () => clearInterval(interval)
  }, [isActive, resolvedTheme, getAccentColor])

  useFrame((state, delta) => {
    if (!isActive || !groupRef.current) return

    // Rotate scene based on mouse movement
    groupRef.current.rotation.y = mousePosition.x * 0.3
    groupRef.current.rotation.x = -mousePosition.y * 0.1

    // Update vehicles
    setVehicles(prev => prev.map(vehicle => {
      const newPos = vehicle.position.clone().add(vehicle.velocity)
      
      // Wrap around screen
      if (Math.abs(newPos.x) > 12) newPos.x = -Math.sign(newPos.x) * 12
      if (Math.abs(newPos.z) > 12) newPos.z = -Math.sign(newPos.z) * 12
      
      return {
        ...vehicle,
        position: newPos
      }
    }))

    // Update traffic lights
    setTrafficLights(prev => prev.map(light => {
      const newTimer = light.timer + delta
      let newState = light.state
      
      if (newTimer > 3) {
        switch (light.state) {
          case 'red':
            newState = 'green'
            break
          case 'green':
            newState = 'yellow'
            break
          case 'yellow':
            newState = 'red'
            break
        }
        return { ...light, state: newState, timer: 0 }
      }
      
      return { ...light, timer: newTimer }
    }))

    // Update AI analysis
    setAiAnalysis(prev => ({
      ...prev,
      detectedObjects: vehicles.filter(v => v.detected).length,
      trafficFlow: Math.max(60, Math.min(95, 85 + Math.sin(state.clock.elapsedTime * 0.5) * 10))
    }))


    // Camera movement
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 8
    camera.position.z = Math.cos(state.clock.elapsedTime * 0.2) * 8
    camera.position.y = 6 + Math.sin(state.clock.elapsedTime * 0.15) * 2
    camera.lookAt(0, 0, 0)
  })

  return (
    <group ref={groupRef}>
      {/* Road Network */}
      <Box args={[24, 0.1, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color={getRoadColor()} />
      </Box>
      <Box args={[2, 0.1, 24]} position={[0, 0, 0]}>
        <meshStandardMaterial color={getRoadColor()} />
      </Box>

      {/* Road Markings */}
      {[-8, -4, 4, 8].map(x => (
        <Box key={x} args={[0.2, 0.11, 24]} position={[x, 0, 0]}>
          <meshStandardMaterial color={getRoadMarkingColor()} />
        </Box>
      ))}
      {[-8, -4, 4, 8].map(z => (
        <Box key={z} args={[24, 0.11, 0.2]} position={[0, 0, z]}>
          <meshStandardMaterial color={getRoadMarkingColor()} />
        </Box>
      ))}

      {/* Traffic Lights */}
      {trafficLights.map((light, index) => (
        <group key={index} position={light.position.toArray()}>
          <Cylinder args={[0.1, 0.1, 3]} position={[0, 1.5, 0]}>
            <meshStandardMaterial color={getTrafficLightBodyColor()} />
          </Cylinder>
          <Box args={[0.6, 1.2, 0.3]} position={[0, 3, 0]}>
            <meshStandardMaterial color={getTrafficLightBoxColor()} />
          </Box>
          <Sphere args={[0.15]} position={[0, 3.4, 0.2]}>
            <meshStandardMaterial 
              color={light.state === 'red' ? (resolvedTheme === 'light' ? '#dc2626' : '#ff0000') : (resolvedTheme === 'light' ? '#7f1d1d' : '#330000')}
              emissive={light.state === 'red' ? (resolvedTheme === 'light' ? '#dc2626' : '#ff0000') : '#000000'}
              emissiveIntensity={light.state === 'red' ? 0.5 : 0}
            />
          </Sphere>
          <Sphere args={[0.15]} position={[0, 3, 0.2]}>
            <meshStandardMaterial 
              color={light.state === 'yellow' ? getRoadMarkingColor() : (resolvedTheme === 'light' ? '#78716c' : '#333300')}
              emissive={light.state === 'yellow' ? getRoadMarkingColor() : '#000000'}
              emissiveIntensity={light.state === 'yellow' ? 0.5 : 0}
            />
          </Sphere>
          <Sphere args={[0.15]} position={[0, 2.6, 0.2]}>
            <meshStandardMaterial 
              color={light.state === 'green' ? getTrafficGreenColor() : (resolvedTheme === 'light' ? '#14532d' : '#003300')}
              emissive={light.state === 'green' ? getTrafficGreenColor() : '#000000'}
              emissiveIntensity={light.state === 'green' ? 0.5 : 0}
            />
          </Sphere>
        </group>
      ))}

      {/* Vehicles */}
      {vehicles.map(vehicle => (
        <group key={vehicle.id} position={vehicle.position.toArray()}>
          <group>
            {vehicle.type === 'car' && (
              <Box args={[0.8, 0.4, 1.6]}>
                <meshStandardMaterial color={vehicle.color} />
              </Box>
            )}
            {vehicle.type === 'truck' && (
              <Box args={[1, 0.8, 2.4]}>
                <meshStandardMaterial color={vehicle.color} />
              </Box>
            )}
            {vehicle.type === 'bike' && (
              <Box args={[0.3, 0.2, 0.8]}>
                <meshStandardMaterial color={vehicle.color} />
              </Box>
            )}
          </group>

          {/* Detection Box */}
          {vehicle.detected && (
            <group>
              <Box args={[1.2, 1, 2]} position={[0, 0.5, 0]}>
                <meshBasicMaterial 
                  color={getAccentColor()}
                  transparent
                  opacity={0.2}
                  wireframe
                />
              </Box>
            </group>
          )}
        </group>
      ))}

      {/* AI Analysis Overlay */}
      <group position={[-8, 4, -8]}>
        <Text
          fontSize={0.3}
          color={getAccentColor()}
          anchorX="left"
          anchorY="top"
        >
          {`TACS AI Analysis\nDetected: ${aiAnalysis.detectedObjects} objects\nFlow: ${aiAnalysis.trafficFlow.toFixed(1)}%\nAccidents: ${aiAnalysis.accidents}\nWeather: ${aiAnalysis.weatherCondition}`}
        </Text>
      </group>

      {/* Neural Network Visualization */}
      <group position={[8, 2, 8]}>
        {[...Array(12)].map((_, i) => (
          <group
            key={i}
            position={[
              Math.cos(i * Math.PI / 6) * 2,
              Math.sin(i * Math.PI / 6) * 2,
              0
            ]}
          >
            <Sphere args={[0.1]}>
              <meshStandardMaterial 
                color={resolvedTheme === 'light' ? '#0066cc' : '#0088ff'}
                emissive={resolvedTheme === 'light' ? '#0066cc' : '#0088ff'}
                emissiveIntensity={0.3}
              />
            </Sphere>
          </group>
        ))}
      </group>

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 8, 0]} intensity={0.5} color={getAccentColor()} />

      {/* Environment Effects */}
      <group>
        {[...Array(20)].map((_, i) => (
          <group
            key={i}
            position={[
              Math.cos(i * Math.PI / 10) * 15,
              Math.random() * 5 + 2,
              Math.sin(i * Math.PI / 10) * 15
            ]}
          >
            <Sphere args={[0.05]}>
              <meshBasicMaterial 
                color={resolvedTheme === 'light' ? '#ffffff' : '#ffffff'}
                transparent
                opacity={0.6}
              />
            </Sphere>
          </group>
        ))}
      </group>
    </group>
  )
}