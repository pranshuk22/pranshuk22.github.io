import type { Project } from '../types/project'

// Project cards are generated from this collection so content stays separate from layout
export const projects: Project[] = [
  {
    title: 'Counselling Management Platform',
    description: 'A full-stack platform to digitize and centralize privacy-sensitive counselling operations for a 10-provider mental health center',
    highlights: [
      'Architected a full-stack system with **TypeScript**, **Next.js**, **NestJS**, **PostgreSQL**, and **Prisma**, with modular REST APIs and concurrency-safe appointment booking using **ACID transactions** and row-level locking',
      'Engineered privacy-preserving data access with **field-level encryption** and **HMAC-based blind indexing**, plus multi-device **JWT** authentication with session tracking and revocation',
      'Built real-time **WebSocket** notifications, automated email workflows, and an automated test suite spanning unit, integration, and end-to-end coverage',
    ],
    technologies: ['Next.js', 'NestJS', 'TypeScript', 'PostgreSQL', 'Prisma', 'WebSockets', 'JWT'],
    liveUrl: '',
    sourceUrl: '',
  },
  {
    title: 'Computer Graphics: WebGL2 Rendering Engine',
    description: 'A modular WebGL2 rendering engine implementing 2D/3D transformations, programmable shaders, lighting, and real-time rendering',
    highlights: [
      'Implemented **GLSL** shader pipelines for Flat, Gouraud, and Phong shading, plus ray tracing with reflections, shadows, and **shadow mapping** via framebuffer objects',
      'Built reusable geometry, buffer, matrix, and scene-management abstractions supporting texture/environment mapping and interactive camera controls',
    ],
    technologies: ['WebGL2', 'GLSL', 'JavaScript'],
    liveUrl: '',
    sourceUrl: 'https://github.com/pranshuk22/CS360',
  },
  {
    title: 'Parallel Computing: 3D Stencil in MPI',
    description: 'A parallelized 3D stencil computation in C/MPI benchmarked for scalability across dozens of processes',
    highlights: [
      'Parallelized a 3D stencil computation using **domain decomposition** and flattened, padded 1D arrays for contiguous memory access and cache locality',
      'Implemented **non-blocking halo exchange** to overlap boundary communication with interior computation, with deadlock-safe handling for generalized d-point stencils',
      'Benchmarked scalability across **32–96 processes** and grids up to 240³ on PARAM Rudra, identifying network communication as the primary bottleneck',
    ],
    technologies: ['C', 'MPI', 'Parallel Computing'],
    liveUrl: '',
    sourceUrl: 'https://github.com/pranshuk22/CS633-Assignments',
  },
  {
    title: 'Model-Based & Policy-Gradient RL',
    description: 'Value/Policy Iteration and a REINFORCE policy-gradient agent evaluated across large discrete state spaces',
    highlights: [
      'Implemented **Value Iteration** and **Policy Iteration** with sparse transition kernels and vectorized linear algebra, scaling to **390,625 states**',
      'Trained a **PyTorch** policy network with **REINFORCE**, automating a **48-configuration hyperparameter sweep** comparing SGA and Adam convergence',
    ],
    technologies: ['Python', 'PyTorch', 'Reinforcement Learning'],
    liveUrl: '',
    sourceUrl: 'https://github.com/pranshuk22/EE675-Project',
  },
  {
    title: 'Prototype Learning for Sequential Classification',
    description: 'A continual-learning pipeline evaluating prototype-based classifiers under distribution shift across 20 sequential datasets',
    highlights: [
      'Built a continual-learning pipeline with pretrained **MobileNet** features, **PCA**-based dimensionality reduction, and prototype-based classification',
      'Evaluated adaptation across **20 sequential datasets**, achieving **96.4%** same-distribution accuracy and **94.9%** after a shifted-domain adaptation',
    ],
    technologies: ['Python', 'PyTorch', 'Machine Learning'],
    liveUrl: '',
    sourceUrl: 'https://github.com/pranshuk22/CS771-Project-2',
  },
  {
    title: 'Birdcall Recognition Model',
    description: 'A neural network that classifies bird species from audio recordings using spectrogram-based deep learning',
    highlights: [
      'Preprocessed **21K+** audio clips into **Mel-spectrograms** with **PyTorch** and **OpenCV**, capturing birdcall patterns for classification',
      'Fine-tuned a pretrained **ResNet** augmented with a CNN, achieving **61.6%+** accuracy across diverse bird species on the test set',
    ],
    technologies: ['Python', 'PyTorch', 'OpenCV', 'Deep Learning'],
    liveUrl: '',
    sourceUrl: '',
  },
  {
    title: 'Deep Learning & Domain Adaptation: DeepCDA Reproduction',
    description: 'A reproduction of the DeepCDA compound-protein affinity model with cross-domain adaptation via ADDA',
    highlights: [
      'Rebuilt parallel **CNN-LSTM** encoders with two-sided attention for compound-protein affinity prediction in a configuration-driven **PyTorch** pipeline',
      'Implemented **ADDA**-based domain adaptation with adversarial discriminator training, evaluating robustness under cross-domain distribution shifts',
      'Reduced training cost by **5×** via partial-batch epochs, achieving a **0.841** Concordance Index on the benchmark evaluation',
    ],
    technologies: ['Python', 'PyTorch', 'Deep Learning'],
    liveUrl: '',
    sourceUrl: 'https://github.com/pranshuk22/DeepCDA',
  },
  {
    title: 'Binary Classification with Multi-Modal Features',
    description: 'Binary classification across three distinct feature representations, comparing individual and combined-dataset model performance',
    highlights: [
      'Trained and evaluated **SVM**, **Logistic Regression**, **Random Forest**, **XGBoost**, and **LSTM** models across emoticon, deep-feature, and text-sequence datasets',
      'Applied **PCA**, CountVectorizer, and dimensionality reduction, achieving **98.7%** accuracy with flattened deep features and logistic regression',
    ],
    technologies: ['Python', 'Scikit-learn', 'XGBoost'],
    liveUrl: '',
    sourceUrl: 'https://github.com/pranshuk22/CS771-Project-1',
  },
  {
    title: 'Bayesian Modeling & Data Analysis',
    description: 'Hierarchical and Bayesian models analyzing cognitive load, pupil size, and lexical recognition time data',
    highlights: [
      'Built hierarchical **Bayesian models** in **Stan** correlating cognitive load with pupil-size intercepts and slopes',
      'Used **Poisson regression** and Bayesian inference to estimate cross-dependency rates and word/non-word recognition times, supporting lexical-access hypotheses',
    ],
    technologies: ['R', 'Stan', 'Bayesian Statistics'],
    liveUrl: '',
    sourceUrl: '',
  },
  {
    title: 'Convex Optimization',
    description: 'Constrained convex optimization formulations spanning sparse recovery, relaxation, and robust regression',
    highlights: [
      'Solved **sparse recovery** and **robust regression** problems using L1/L2-regularized optimization and **CVXPY**',
      'Solved a **Boolean Quadratic Program** via semidefinite relaxation and formulated a wireless power-allocation problem as a **geometric program**',
    ],
    technologies: ['Python', 'CVXPY', 'Convex Optimization'],
    liveUrl: '',
    sourceUrl: '',
  },
  {
    title: 'Magnetic Levitation Platform',
    description: 'A PID-controlled electromagnetic levitation system with real-time position feedback',
    highlights: [
      'Selected optimal electromagnet core materials and used **Hall sensors** for magnetic-field feedback',
      'Implemented a **PID controller** and drove electromagnet strength/polarity via **L298N motor drivers** for precise position control',
    ],
    technologies: ['PID Control', 'Embedded Systems'],
    liveUrl: '',
    sourceUrl: '',
  },
  {
    title: "Albatross Energetics' HVAC Challenge, Inter IIT Tech Meet 13.0",
    description: 'An energy-efficient vapor-compression HVAC system with adaptive dual-PID control, awarded Bronze Medal among 23 IITs',
    highlights: [
      'Developed a closed-loop **Simulink/MATLAB** model with dual **PID control** for adaptive compressor and fan RPM based on temperature/humidity deviation',
      'Implemented a safety subsystem for **leak detection** and automated shutdown, achieving a COP of **3.33** and **1,095 kWh** in annual energy savings',
    ],
    technologies: ['MATLAB', 'Simulink', 'Controls'],
    liveUrl: '',
    sourceUrl: '',
  },
]

export const featuredProjects = projects.slice(0, 2)
