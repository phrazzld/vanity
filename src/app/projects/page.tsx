import ProjectCard from '@/app/components/ProjectCard'
import anyzineImg from '../../../public/images/anyzine-home-02.png'
import brainrotImg from '../../../public/images/brainrot-home-02.png'
import timImg from '../../../public/images/timeismoney-banner.jpg'
import whetstoneImg from '../../../public/images/whetstone-01.png'
import wrapItUpImg from '../../../public/images/wrap-it-up-screenshot-01.png'

export default function ProjectsPage() {
  return (
    <section>
      <h1 className="medium-heading">projects</h1>
      <div className="projects-grid">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.title} {...project} />
        ))}
      </div>
    </section>
  )
}

const PROJECTS = [
  {
    title: 'brainrot publishing',
    description: 'zoomer translations of classic literature, so you can read, like, shakespeare but in hypebeast slang.',
    techStack: ['react', 'next.js', 'tailwindcss'],
    siteUrl: 'https://brainrotpublishing.com',
    codeUrl: 'https://github.com/phrazzld/brainrot-publishing-house',
    imageSrc: brainrotImg.src,
    altText: 'brainrot publishing screenshot'
  },
  {
    title: 'time is money',
    description: 'a chrome extension that slaps a $ value on your wasted minutes, inspiring hustle or existential dread.',
    techStack: ['javascript', 'chrome api'],
    siteUrl: 'https://chromewebstore.google.com/detail/time-is-money/ooppbnomdcjmoepangldchpmjhkeendl?hl=en',
    codeUrl: 'https://github.com/phrazzld/timeismoney',
    imageSrc: timImg.src,
    altText: 'time is money extension screenshot'
  },
  {
    title: 'anyzine',
    description: 'ad-hoc on-demand zines about anything. plug in your favorite topic, watch the ephemeral magic unfold.',
    techStack: ['node.js', 'express'],
    siteUrl: 'https://anyzine.xyz',
    codeUrl: 'https://github.com/phrazzld/anyzine',
    imageSrc: anyzineImg.src,
    altText: 'anyzine project screenshot'
  },
  {
    title: 'wrap it up',
    description: 'christmas platformer game',
    techStack: ['javascript'],
    siteUrl: 'http://platformer.christmas/',
    codeUrl: 'https://github.com/phrazzld/wrap-it-up',
    imageSrc: wrapItUpImg.src,
    altText: 'wrap it up project screenshot'
  },
  {
    title: 'whetstone',
    description: 'simple mobile app for reading more intentionally',
    techStack: ['react native', 'expo', 'javascript'],
    siteUrl: 'https://phrazzld.github.io/whetstone-splash/',
    codeUrl: 'https://github.com/phrazzld/whetstone',
    imageSrc: whetstoneImg.src,
    altText: 'whetstone project screenshot'
  },
]
