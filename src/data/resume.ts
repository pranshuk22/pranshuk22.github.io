export type ResumeVariant = 'software' | 'ml'

export type ResumeVariantInfo = {
  label: string
  path: string
  downloadName: string
}

export const resumeVariants: Record<ResumeVariant, ResumeVariantInfo> = {
  software: {
    label: 'Software Engineering',
    path: '/data/resume-software.pdf',
    downloadName: 'Pranshu-Kumar-Software-Engineering-Resume.pdf',
  },
  ml: {
    label: 'Machine Learning',
    path: '/data/resume-ml.pdf',
    downloadName: 'Pranshu-Kumar-Machine-Learning-Resume.pdf',
  },
}

export const defaultResumeVariant: ResumeVariant = 'software'
