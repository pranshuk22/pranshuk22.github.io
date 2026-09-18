export type Experience = {
  company: string
  linkedinUrl?: string
  role: string
  date: string
  highlights: string[]
}

export const experiences: Experience[] = [
  {
    company: 'Samsara',
    linkedinUrl: 'https://www.linkedin.com/company/samsara/',
    role: 'Software Engineering Intern',
    date: 'May 2026 to Jul 2026',
    highlights: [
      'Redesigned a large-scale public API, replacing entity-based pagination with **point-bounded pagination** by engineering a reusable **Go** time-series pagination engine over a byte-budgeted reader',
      'Added a **gRPC** method to integrate the pagination engine across microservices with backward compatibility, validated through **property-based**, integration, end-to-end, and race testing',
      'Reduced **p90 per-page latency by 91.1%** versus the legacy implementation while preserving point-count parity across **200M+** datapoints',
    ],
  },
  {
    company: 'Event-Driven Kinetic Monte Carlo Simulation Engine',
    role: 'Undergraduate Researcher',
    date: 'Jan 2025 to Nov 2025',
    highlights: [
      'Implemented a **Binary Sum Tree** and a **Numba**-backed dynamic event catalog, reducing event selection and rate updates from **O(N) to O(log N)**',
      'JIT-compiled the simulation kernel with **Numba @njit** and built a **C++** kernel for comparison, profiling the hot path to identify dominant runtime costs',
      'Improved event-processing throughput from ~10 to **>100,000 events/second** (a **10⁴-fold speedup**) while cutting memory footprint from GBs to KBs through online aggregation',
    ],
  },
  {
    company: 'Multi-Robot Target Surveillance',
    role: 'Undergraduate Researcher',
    date: 'May 2025 to Jul 2025',
    highlights: [
      'Designed and tuned **PID controllers** for TurtleBot3 in **ROS2** and **Gazebo**, extending teleoperation to go-to-position and path-following control',
      'Implemented a **multi-robot control framework** in Python with range-based control and target-reassignment logic, generalized to any number of robots and targets',
      'Achieved smooth path-following and trajectory switching across multiple TurtleBots, validated with **OptiTrack** motion capture',
    ],
  },
]
