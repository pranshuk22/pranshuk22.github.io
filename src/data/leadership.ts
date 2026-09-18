export type LeadershipRole = {
  organization: string
  role: string
  date: string
  highlights: string[]
}

export const leadershipRoles: LeadershipRole[] = [
  {
    organization: 'Center for Mental Health and Wellbeing, IIT Kanpur',
    role: 'Coordinator',
    date: 'Apr 2025 to Apr 2026',
    highlights: [
      'Led a **3-tier team** of 22 Core Members and 350+ Student Guides and Academic Mentors, managing a budget of **INR 40L+** for campus-wide emotional and academic support',
      'Spearheaded an end-to-end **website revamp** for CMHW, redesigning content, structure, and functionality and driving a **183%** increase in user engagement',
      'Broadened access to counselling services, contributing to a **340%** increase in CMHW\'s reach and **3,000+** counselling sessions',
    ],
  },
  {
    organization: "Students' Placement Office, IIT Kanpur",
    role: 'Company Coordinator',
    date: 'Jun 2023 to May 2024',
    highlights: [
      'Served as the primary point of contact for recruiters including **Microsoft**, **Oracle**, **Amazon**, and **Qualcomm**, collaborating with a team of 150+ members',
      'Facilitated internships for **1,100+** students and secured placements for **2,000+** students across the placement cycle',
    ],
  },
]
