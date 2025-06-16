import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface AboutProps {
  mousePosition: { x: number; y: number }
  isActive: boolean
}

export const About = ({ mousePosition, isActive }: AboutProps) => {
  const [activeAlgorithm, setActiveAlgorithm] = useState(0)
  const [showResearch, setShowResearch] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const containerRef = useRef(null)
  const algorithmsRef = useRef(null)
  const technologyRef = useRef(null)
  const researchRef = useRef(null)
  const contactRef = useRef(null)
  
  const { resolvedTheme } = useTheme()
  const getAccentColor = () => resolvedTheme === 'light' ? '#2d5a4a' : '#00ff88'
  
  const isInView = useInView(containerRef, { once: false, amount: 0.1 })
  const isAlgorithmsInView = useInView(algorithmsRef, { once: false, amount: 0.1 })
  const isTechnologyInView = useInView(technologyRef, { once: false, amount: 0.1 })
  const isResearchInView = useInView(researchRef, { once: false, amount: 0.1, margin: "0px 0px 200px 0px" })
  const isContactInView = useInView(contactRef, { once: false, amount: 0.05, margin: "0px 0px 400px 0px" })

  const algorithms = [
    {
      name: "YOLOv3-Ultra",
      category: "Object Detection",
      description: "Custom lightweight YOLO architecture optimized for real-time traffic detection",
      details: [
        "7-layer convolutional backbone with depthwise separable convolutions",
        "3-head detection system for multi-scale object recognition (13×13, 26×26, 52×52)",
        "Anchor-based prediction with 9 anchors per scale (3 per detection head)",
        "GIoU loss function: L_box = 1 - IoU + |C - (A ∪ B)|/|C|",
        "Non-Maximum Suppression with confidence threshold σ=0.5, IoU threshold τ=0.45",
        "Batch normalization: y = γ(x-μ)/σ + β for training stability"
      ],
      performance: "6.3ms inference time, 94.2% mAP @ IoU=0.5",
      optimization: "8-9x computational reduction: O(H×W×C×K²) → O(H×W×C×K) via depthwise convolution",
      complexity: "Time: O(n) linear scaling with input size, Space: O(C×H×W) where C=channels, H×W=spatial dimensions"
    },
    {
      name: "Hungarian Assignment",
      category: "Object Tracking",
      description: "Optimal bipartite matching algorithm for multi-object tracking consistency",
      details: [
        "Kuhn-Munkres algorithm: O(n³) worst-case, O(n²) average-case complexity",
        "Cost matrix C[i,j] = 1 - IoU(detection_i, track_j) + λ×d_mahalanobis",
        "Mahalanobis distance: d² = (x-μ)ᵀΣ⁻¹(x-μ) for motion prediction",
        "Assignment matrix A where A[i,j] = 1 if detection i assigned to track j",
        "Track confidence decay: conf(t) = conf(t-1) × α^(age) where α=0.98",
        "Gating threshold: reject assignments where cost > 0.7"
      ],
      performance: "0.01ms per frame (10 objects), 0.10ms (50 objects) - subquadratic scaling",
      optimization: "SIMD vectorization: 4x float32 operations using AVX2, 8x using NEON on ARM",
      complexity: "Time: O(n³) Hungarian, O(n²) IoU computation, Space: O(n²) for cost matrix"
    },
    {
      name: "Kalman Filtering",
      category: "State Estimation",
      description: "6D state tracking system with motion prediction and uncertainty quantification",
      details: [
        "State vector x = [px, vx, py, vy, w, h]ᵀ ∈ ℝ⁶ with position, velocity, dimensions",
        "Process model: x(k+1) = F×x(k) + w(k) where F is state transition matrix",
        "Measurement model: z(k) = H×x(k) + v(k) with observation matrix H",
        "Prediction: x̂⁻ = F×x̂, P⁻ = F×P×Fᵀ + Q (process noise Q)",
        "Update: K = P⁻×Hᵀ×(H×P⁻×Hᵀ + R)⁻¹, x̂ = x̂⁻ + K×(z - H×x̂⁻)",
        "Adaptive noise: Q = diag([σ²ₓ, σ²ᵥ, σ²ᵧ, σ²ᵥ, σ²w, σ²h]) based on object class"
      ],
      performance: "< 1ms prediction updates, 6D matrix operations in 0.1ms",
      optimization: "Memory pool allocation: O(1) allocation time, cache-friendly matrix operations",
      complexity: "Time: O(k³) for k×k matrices (k=6), Space: O(k²) for covariance matrices"
    },
    {
      name: "A2C Reinforcement Learning",
      category: "Traffic Optimization",
      description: "Advantage Actor-Critic with multi-agent coordination for traffic signal control",
      details: [
        "Policy network: Multi-layer perceptron with Softmax output",
        "Value network: State value estimation for advantage calculation",
        "Experience replay with prioritized sampling and importance weighting",
        "Peer-to-peer voting system for distributed decision making",
        "Emergency override mechanisms for accident scenarios"
      ],
      performance: "0.041ms decision latency, real-time adaptation",
      optimization: "Elastic Weight Consolidation for catastrophic forgetting prevention"
    },
    {
      name: "ONNX Runtime Engine",
      category: "Deployment",
      description: "Custom inference engine with hardware acceleration and cross-platform support",
      details: [
        "Manual ONNX graph parsing and optimization",
        "Operator fusion for reduced memory bandwidth",
        "Constant folding and dead code elimination",
        "Hardware-specific kernel selection (CPU/GPU/NPU/TPU)",
        "Dynamic batching with memory pooling"
      ],
      performance: "<1ms inference across all models",
      optimization: "TensorRT integration for NVIDIA GPU acceleration"
    },
    {
      name: "Federated Learning Protocol",
      category: "Distributed Training",
      description: "Decentralized knowledge sharing with privacy-preserving model aggregation",
      details: [
        "FedAvg algorithm with weighted model averaging",
        "Knowledge distillation for cross-domain adaptation",
        "Differential privacy mechanisms for data protection",
        "Model versioning with SHA256 integrity verification",
        "Automatic rollback on performance degradation (>5% AUC drop)"
      ],
      performance: "Real-time model synchronization",
      optimization: "V2X protocol integration for vehicle-to-everything communication"
    }
  ]

  const technologies = [
    {
      category: "Core AI Framework",
      items: [
        { name: "C++17", purpose: "High-performance system programming with modern features" },
        { name: "SIMD Intrinsics", purpose: "AVX2/NEON vectorization for parallel computation" },
        { name: "OpenMP", purpose: "Multi-threading and parallel processing optimization" },
        { name: "Custom Memory Management", purpose: "Zero-allocation inference with memory pooling" }
      ]
    },
    {
      category: "Neural Networks",
      items: [
        { name: "Manual Implementation", purpose: "From-scratch neural network layers without frameworks" },
        { name: "FP16/INT8 Quantization", purpose: "Reduced precision for mobile and edge deployment" },
        { name: "Batch Normalization", purpose: "Training stability and convergence acceleration" },
        { name: "Leaky ReLU Activation", purpose: "Gradient flow preservation in deep networks" }
      ]
    },
    {
      category: "Computer Vision",
      items: [
        { name: "Convolution Kernels", purpose: "Custom optimized 2D convolution with cache efficiency" },
        { name: "Image Preprocessing", purpose: "Normalization, augmentation, and format conversion" },
        { name: "Non-Maximum Suppression", purpose: "Duplicate detection removal and confidence filtering" },
        { name: "Anchor Generation", purpose: "Multi-scale object detection with aspect ratio handling" }
      ]
    },
    {
      category: "Deployment Infrastructure",
      items: [
        { name: "ONNX Export/Import", purpose: "Cross-platform model portability and standardization" },
        { name: "Edge Runtime", purpose: "Embedded system deployment with resource constraints" },
        { name: "Hardware Abstraction", purpose: "CPU/GPU/NPU/TPU automatic optimization selection" },
        { name: "Container Orchestration", purpose: "Docker/Kubernetes deployment and scaling" }
      ]
    }
  ]

  const researchPapers = [
    {
      title: "Real-time Traffic Flow Optimization using Federated Reinforcement Learning",
      authors: "TACS Research Team",
      year: "2024",
      abstract: "Novel approach combining edge AI with distributed learning for traffic management.",
      citations: 47
    },
    {
      title: "Ultra-lightweight Object Detection for Autonomous Vehicle Systems",
      authors: "Neural Networks & Computer Vision Lab",
      year: "2024",
      abstract: "Depthwise separable convolutions achieving 8x speedup with minimal accuracy loss.",
      citations: 23
    },
    {
      title: "Multi-Agent Coordination in Smart Traffic Infrastructure",
      authors: "Distributed Systems Research Group",
      year: "2023",
      abstract: "Peer-to-peer consensus mechanisms for intersection-level traffic optimization.",
      citations: 91
    }
  ]

  return (
    <div className="about-section" ref={containerRef} style={{ minHeight: '100vh', background: 'var(--glass-bg)' }}>
      <motion.div
        className="about-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: isInView || isActive ? 1 : 0, y: isInView || isActive ? 0 : -50 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="section-title"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          Advanced AI Algorithms & Technologies
        </motion.h2>
        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView || isActive ? 1 : 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Production-ready implementations of cutting-edge computer vision, machine learning, and distributed systems algorithms
        </motion.p>
      </motion.div>

      {/* Algorithm Deep Dive */}
      <motion.div
        className="algorithms-showcase"
        ref={algorithmsRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: isAlgorithmsInView || isActive ? 1 : 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div className="algorithm-selector">
          {algorithms.map((algorithm, index) => (
            <motion.button
              key={algorithm.name}
              className={`algorithm-tab ${activeAlgorithm === index ? 'active' : ''}`}
              onClick={() => setActiveAlgorithm(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: isAlgorithmsInView || isActive ? 1 : 0, x: isAlgorithmsInView || isActive ? 0 : -50 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
            >
              <div className="algorithm-category">{algorithm.category}</div>
              <div className="algorithm-name">{algorithm.name}</div>
            </motion.button>
          ))}
        </div>

        <motion.div
          className="algorithm-details"
          key={activeAlgorithm}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="algorithm-header">
            <h3>{algorithms[activeAlgorithm].name}</h3>
            <span className="category-badge">{algorithms[activeAlgorithm].category}</span>
          </div>
          
          <p className="algorithm-description">
            {algorithms[activeAlgorithm].description}
          </p>

          <div className="algorithm-specifications">
            <div className="spec-section">
              <h4>Technical Implementation</h4>
              <ul>
                {algorithms[activeAlgorithm].details.map((detail, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isAlgorithmsInView || isActive ? 1 : 0, x: isAlgorithmsInView || isActive ? 0 : -20 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    {detail}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="performance-metrics">
              <div className="metric">
                <span className="metric-label">Performance</span>
                <span className="metric-value">{algorithms[activeAlgorithm].performance}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Optimization</span>
                <span className="metric-value">{algorithms[activeAlgorithm].optimization}</span>
              </div>
              {algorithms[activeAlgorithm].complexity && (
                <div className="metric">
                  <span className="metric-label">Complexity Analysis</span>
                  <span className="metric-value">{algorithms[activeAlgorithm].complexity}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Technology Stack */}
      <motion.div
        className="technology-stack"
        ref={technologyRef}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isTechnologyInView || isActive ? 1 : 0, y: isTechnologyInView || isActive ? 0 : 50 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <h3>Complete Technology Stack</h3>
        <div className="tech-categories">
          {technologies.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              className="tech-category"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isTechnologyInView || isActive ? 1 : 0, scale: isTechnologyInView || isActive ? 1 : 0.8 }}
              transition={{ delay: 0.2 + categoryIndex * 0.2, duration: 0.6 }}
              whileHover={{ 
                scale: 1.02,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
            >
              <h4>{category.category}</h4>
              <div className="tech-items">
                {category.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.name}
                    className="tech-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isTechnologyInView || isActive ? 1 : 0, y: isTechnologyInView || isActive ? 0 : 20 }}
                    transition={{ delay: 0.4 + categoryIndex * 0.2 + itemIndex * 0.1, duration: 0.4 }}
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: resolvedTheme === 'light' ? 'rgba(45, 90, 74, 0.1)' : 'rgba(0, 255, 136, 0.1)',
                      transition: { duration: 0.2 }
                    }}
                  >
                    <span className="tech-name">{item.name}</span>
                    <span className="tech-purpose">{item.purpose}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Research Publications */}
      <motion.div
        className="research-section"
        ref={researchRef}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isResearchInView ? 1 : 0, y: isResearchInView ? 0 : 50 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <motion.div
          className="section-header-with-toggle"
          initial={{ opacity: 0 }}
          animate={{ opacity: isResearchInView ? 1 : 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h3>Public Research & Citations</h3>
          <motion.button
            className="section-toggle-button"
            onClick={() => setShowResearch(!showResearch)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              backgroundColor: showResearch ? getAccentColor() : resolvedTheme === 'light' ? 'rgba(45, 90, 74, 0.2)' : 'rgba(0, 255, 136, 0.2)',
              color: showResearch ? (resolvedTheme === 'light' ? '#fff' : '#000') : getAccentColor()
            }}
            transition={{ duration: 0.3 }}
          >
            {showResearch ? 'Hide Papers' : 'Show Papers'}
          </motion.button>
        </motion.div>
        <motion.div 
          className="research-papers"
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: showResearch ? 'auto' : 0,
            opacity: showResearch ? 1 : 0
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          {researchPapers.map((paper, index) => (
            <motion.div
              key={paper.title}
              className="research-paper"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: showResearch ? 1 : 0, x: showResearch ? 0 : -30 }}
              transition={{ delay: 0.1 + index * 0.1, duration: 0.6 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: resolvedTheme === 'light' ? '0 10px 30px rgba(45, 90, 74, 0.2)' : '0 10px 30px rgba(0, 255, 136, 0.2)',
                transition: { duration: 0.3 }
              }}
            >
              <div className="paper-header">
                <h4>{paper.title}</h4>
                <div className="paper-meta">
                  <span className="paper-year">{paper.year}</span>
                  <span className="paper-citations">{paper.citations} citations</span>
                </div>
              </div>
              <p className="paper-authors">{paper.authors}</p>
              <p className="paper-abstract">{paper.abstract}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        className="contact-section"
        ref={contactRef}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isContactInView ? 1 : 0, y: isContactInView ? 0 : 50 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className="contact-content">
          <motion.div
            className="section-header-with-toggle"
            initial={{ opacity: 0 }}
            animate={{ opacity: isContactInView ? 1 : 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h3>Report Issues & Collaborate</h3>
            <motion.button
              className="section-toggle-button"
              onClick={() => setShowContact(!showContact)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                backgroundColor: showContact ? getAccentColor() : resolvedTheme === 'light' ? 'rgba(45, 90, 74, 0.2)' : 'rgba(0, 255, 136, 0.2)',
                color: showContact ? (resolvedTheme === 'light' ? '#fff' : '#000') : getAccentColor()
              }}
              transition={{ duration: 0.3 }}
            >
              {showContact ? 'Hide Contact' : 'Show Contact'}
            </motion.button>
          </motion.div>
          <motion.div
            className="contact-details-wrapper"
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: showContact ? 'auto' : 0,
              opacity: showContact ? 1 : 0
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ marginTop: '20px' }}>
              Found a bug or have suggestions for improvement? We value community feedback 
              and are committed to continuous enhancement of the TACS AI system.
            </p>
            
            <motion.div
              className="contact-methods"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContact ? 1 : 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
            <motion.a
              href="mailto:gvinok@duck.com"
              className="contact-method primary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showContact ? 1 : 0, y: showContact ? 0 : 20 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: resolvedTheme === 'light' ? '0 10px 30px rgba(45, 90, 74, 0.3)' : '0 10px 30px rgba(0, 255, 136, 0.3)',
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="contact-icon">📧</div>
              <div className="contact-info">
                <span className="contact-label">Technical Support</span>
                <span className="contact-value">gvinok@duck.com</span>
              </div>
            </motion.a>

            <motion.div
              className="contact-method"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showContact ? 1 : 0, y: showContact ? 0 : 20 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="contact-icon">🔒</div>
              <div className="contact-info">
                <span className="contact-label">Secure Communication</span>
                <span className="contact-value">End-to-end encrypted via DuckDuckGo Email</span>
              </div>
            </motion.div>

            <motion.div
              className="contact-method"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showContact ? 1 : 0, y: showContact ? 0 : 20 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="contact-icon">⚡</div>
              <div className="contact-info">
                <span className="contact-label">Response Time</span>
                <span className="contact-value">Within 24 hours for critical issues</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="contribution-guidelines"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showContact ? 1 : 0, y: showContact ? 0 : 20 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h4>When reporting issues, please include:</h4>
            <ul>
              <li>Detailed description of the problem or suggestion</li>
              <li>System specifications (OS, browser, hardware)</li>
              <li>Steps to reproduce (if applicable)</li>
              <li>Expected vs actual behavior</li>
              <li>Performance metrics or logs (if relevant)</li>
            </ul>
          </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Interactive Background Elements */}
      <motion.div
        className="about-background-effects"
        animate={{
          rotateX: mousePosition.y * 2,
          rotateY: mousePosition.x * 2
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
      >
        {/* Algorithm Visualization Network */}
        <div className="algorithm-visualization">
          {algorithms.map((_, index) => (
            <motion.div
              key={index}
              className={`algo-node ${index === activeAlgorithm ? 'active' : ''}`}
              style={{
                left: `${20 + index * 15}%`,
                top: `${30 + Math.sin(index) * 20}%`
              }}
              animate={{
                scale: index === activeAlgorithm ? [1, 1.2, 1] : 1,
                opacity: index === activeAlgorithm ? [0.8, 1, 0.8] : 0.6,
                rotate: index === activeAlgorithm ? [0, 360, 0] : 0,
                filter: index === activeAlgorithm ? 
                  ['hue-rotate(0deg)', 'hue-rotate(180deg)', 'hue-rotate(360deg)'] : 
                  'hue-rotate(0deg)'
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3
              }}
              whileHover={{
                scale: 1.5,
                zIndex: 10,
                filter: 'brightness(1.5)',
                transition: { duration: 0.2 }
              }}
            />
          ))}
          
          {/* Connection Lines Between Nodes */}
          <svg className="algo-connections" viewBox="0 0 100 100" style={{ position: 'absolute', width: '100%', height: '100%' }}>
            {algorithms.map((_, index) => {
              if (index === algorithms.length - 1) return null
              const x1 = 20 + index * 15
              const y1 = 30 + Math.sin(index) * 20
              const x2 = 20 + (index + 1) * 15
              const y2 = 30 + Math.sin(index + 1) * 20
              
              return (
                <motion.line
                  key={`connection-${index}`}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke={resolvedTheme === 'light' ? 'rgba(45, 90, 74, 0.3)' : 'rgba(0, 255, 136, 0.3)'}
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: activeAlgorithm === index || activeAlgorithm === index + 1 ? 0.8 : 0.3,
                    stroke: activeAlgorithm === index || activeAlgorithm === index + 1 ? 
                      getAccentColor() : resolvedTheme === 'light' ? 'rgba(45, 90, 74, 0.3)' : 'rgba(0, 255, 136, 0.3)'
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: index * 0.2,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                />
              )
            })}
          </svg>
        </div>

        {/* Floating Tech Particles */}
        <div className="tech-particles">
          {technologies.flatMap((category, catIndex) =>
            category.items.map((_, itemIndex) => (
              <motion.div
                key={`particle-${catIndex}-${itemIndex}`}
                className="tech-particle"
                style={{
                  position: 'absolute',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: '4px',
                  height: '4px',
                  backgroundColor: getAccentColor(),
                  borderRadius: '50%',
                  boxShadow: `0 0 10px ${getAccentColor()}`
                }}
                animate={{
                  x: [0, Math.sin(itemIndex) * 50, 0],
                  y: [0, Math.cos(itemIndex) * 30, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1.2, 0.5]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: catIndex * 0.5 + itemIndex * 0.2,
                  ease: 'easeInOut'
                }}
              />
            ))
          )}
        </div>

        {/* Data Flow Streams */}
        <div className="data-streams">
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={`stream-${index}`}
              className="data-stream"
              style={{
                position: 'absolute',
                left: `${10 + index * 15}%`,
                top: '0%',
                width: '2px',
                height: '100%',
                background: `linear-gradient(to bottom, transparent, ${getAccentColor()}, transparent)`,
                opacity: 0.5
              }}
              animate={{
                scaleY: [0, 1, 0],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Performance Metrics Visualization */}
        <motion.div
          className="performance-visualization"
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
          }}
        >
          {algorithms.map((_, index) => (
            <motion.div
              key={`perf-${index}`}
              className="performance-bar"
              style={{
                width: '150px',
                height: '8px',
                backgroundColor: resolvedTheme === 'light' ? 'rgba(45, 90, 74, 0.2)' : 'rgba(0, 255, 136, 0.2)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  backgroundColor: index === activeAlgorithm ? getAccentColor() : resolvedTheme === 'light' ? 'rgba(45, 90, 74, 0.5)' : 'rgba(0, 255, 136, 0.5)',
                  borderRadius: '4px'
                }}
                animate={{
                  width: index === activeAlgorithm ? '100%' : `${50 + Math.random() * 50}%`,
                  opacity: index === activeAlgorithm ? 1 : 0.6
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Neural Network Background Pattern */}
        <motion.div
          className="neural-background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.1,
            pointerEvents: 'none'
          }}
          animate={{
            background: [
              `radial-gradient(circle at 20% 20%, ${getAccentColor()} 1px, transparent 1px)`,
              `radial-gradient(circle at 80% 80%, ${getAccentColor()} 1px, transparent 1px)`,
              `radial-gradient(circle at 20% 20%, ${getAccentColor()} 1px, transparent 1px)`
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </motion.div>
    </div>
  )
}