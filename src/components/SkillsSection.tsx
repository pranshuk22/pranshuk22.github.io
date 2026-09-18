import type { CSSProperties } from 'react'

type Skill = {
  name: string
  image: string
  iconBackground: string
}

type SkillGroup = {
  id: string
  name: string
  skills: Skill[]
}

const skillGroups: SkillGroup[] = [
  {
    id: 'languages-title',
    name: 'Languages',
    skills: [
      { name: 'Python', image: '/tech-icons/python.svg', iconBackground: '#1f4565' },
      { name: 'C++/C', image: '/tech-icons/cpp.svg', iconBackground: '#173852' },
      { name: 'Go', image: '/tech-icons/go.svg', iconBackground: '#163a42' },
      {
        name: 'TypeScript,\nJavaScript',
        image: '/tech-icons/typescript.svg',
        iconBackground: '#1f568a',
      },
    ],
  },
  {
    id: 'backend-title',
    name: 'Backend & Databases',
    skills: [
      { name: 'Next.js', image: '/tech-icons/nextjs.svg', iconBackground: '#1c1c1c' },
      { name: 'NestJS', image: '/tech-icons/nestjs.svg', iconBackground: '#4a1520' },
      { name: 'PostgreSQL', image: '/tech-icons/postgresql.svg', iconBackground: '#1d3749' },
      { name: 'Prisma', image: '/tech-icons/prisma.svg', iconBackground: '#14203a' },
    ],
  },
  {
    id: 'ml-robotics-title',
    name: 'Machine Learning & Robotics',
    skills: [
      { name: 'PyTorch', image: '/tech-icons/pytorch.svg', iconBackground: '#5c2a1d' },
      { name: 'scikit-learn', image: '/tech-icons/scikit-learn.svg', iconBackground: '#4b2f16' },
      { name: 'OpenCV', image: '/tech-icons/opencv.svg', iconBackground: '#143e39' },
      { name: 'ROS / ROS2', image: '/tech-icons/ros.svg', iconBackground: '#1b3a4b' },
    ],
  },
  {
    id: 'scientific-computing-title',
    name: 'Scientific Computing',
    skills: [
      { name: 'NumPy', image: '/tech-icons/numpy.svg', iconBackground: '#1e4772' },
      { name: 'Pandas', image: '/tech-icons/pandas.svg', iconBackground: '#ddd9ef' },
      { name: 'Matplotlib', image: '/tech-icons/matplotlib.svg', iconBackground: '#1c3450' },
      { name: 'MATLAB', image: '/tech-icons/matlab.svg', iconBackground: '#5c2413' },
    ],
  },
  {
    id: 'systems-devops-title',
    name: 'Systems & DevOps',
    skills: [
      { name: 'gRPC', image: '/tech-icons/grpc.svg', iconBackground: '#1a3f63' },
      { name: 'Docker', image: '/tech-icons/docker.svg', iconBackground: '#164563' },
      { name: 'Kubernetes', image: '/tech-icons/kubernetes.svg', iconBackground: '#243d7a' },
      { name: 'Linux (Ubuntu)', image: '/tech-icons/linux.svg', iconBackground: '#f2f4f7' },
    ],
  },
  {
    id: 'developer-tools-title',
    name: 'Developer Tools',
    skills: [
      { name: 'Git', image: '/tech-icons/git.svg', iconBackground: '#5a2c20' },
      { name: 'GitHub', image: '/tech-icons/github.svg', iconBackground: '#f5f6f9' },
      { name: 'Postman', image: '/tech-icons/postman.svg', iconBackground: '#5c3018' },
      { name: 'Bash', image: '/tech-icons/bash.svg', iconBackground: '#1c2b22' },
    ],
  },
]

function SkillsSection() {
  return (
    <section className="content-section" id="skills" aria-labelledby="skills-title">
      <h2 id="skills-title">Skills</h2>

      <div className="skills-groups">
        {skillGroups.map((group) => (
          <section className="skill-group" key={group.id} aria-labelledby={group.id}>
            <h3 id={group.id}>{group.name}</h3>
            <ul className="skills-grid">
              {group.skills.map((skill) => (
                <li className="skill-card" key={skill.name}>
                  <span
                    className="skill-card__icon-frame"
                    style={{ '--skill-icon-bg': skill.iconBackground } as CSSProperties}
                  >
                    <img
                      className="skill-card__icon"
                      src={skill.image}
                      alt=""
                    />
                  </span>
                  <span className="skill-card__name">{skill.name}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  )
}

export default SkillsSection
