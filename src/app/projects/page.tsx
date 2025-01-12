import ProjectCard from '@/app/components/ProjectCard'
import whetstoneImg from '../../../public/images/book-02.png'
import brainrotImg from '../../../public/images/books-01.png'
import wrapItUpImg from '../../../public/images/christmas-01.png'
import studymodeImg from '../../../public/images/circles-01.png'
import timImg from '../../../public/images/clock-01.png'
import superwireImg from '../../../public/images/headphones-02.png'
import brainstormPressImg from '../../../public/images/lightning-01.png'
import personalSiteImg from '../../../public/images/waves-01.png'
import anyzineImg from '../../../public/images/zines-01.png'

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
    description: 'a playful reimagining of canonical texts through the lens of contemporary internet vernacular',
    techStack: ['react', 'next.js', 'tailwindcss'],
    siteUrl: 'https://brainrotpublishing.com',
    codeUrl: 'https://github.com/phrazzld/brainrot-publishing-house',
    imageSrc: brainrotImg.src,
    altText: 'brainrot publishing screenshot'
  },
  {
    title: 'time is money',
    description: 'a chrome extension that translates price tags into hours of your labor, so you see exactly how long you’d need to work to buy that coffee',
    techStack: ['javascript', 'chrome api'],
    siteUrl: 'https://chromewebstore.google.com/detail/time-is-money/ooppbnomdcjmoepangldchpmjhkeendl?hl=en',
    codeUrl: 'https://github.com/phrazzld/timeismoney',
    imageSrc: timImg.src,
    altText: 'time is money extension screenshot'
  },
  {
    title: 'anyzine',
    description: 'a magic zine machine for whatever weird niche you’re into rn',
    techStack: ['node.js', 'express'],
    siteUrl: 'https://anyzine.xyz',
    codeUrl: 'https://github.com/phrazzld/anyzine',
    imageSrc: anyzineImg.src,
    altText: 'anyzine project screenshot'
  },
  {
    title: 'wrap it up',
    description: 'save christmas with your jumping, dodging, and unwrapping skills',
    techStack: ['javascript'],
    siteUrl: 'http://platformer.christmas/',
    codeUrl: 'https://github.com/phrazzld/wrap-it-up',
    imageSrc: wrapItUpImg.src,
    altText: 'wrap it up project screenshot'
  },
  {
    title: 'whetstone',
    description: 'a simple mobile app for more engaged reading',
    techStack: ['react native', 'expo', 'javascript'],
    siteUrl: 'https://phrazzld.github.io/whetstone-splash/',
    codeUrl: 'https://github.com/phrazzld/whetstone',
    imageSrc: whetstoneImg.src,
    altText: 'whetstone project screenshot'
  },
  {
    title: 'studymode',
    description: 'create ai-generated quizzes, tailored to your learning goals, and use spaced repetition to master any subject',
    techStack: ['next.js', 'openai', 'firebase'],
    codeUrl: 'https://github.com/phrazzld/studymode',
    imageSrc: studymodeImg.src,
    altText: 'studymode project screenshot'
  },
  {
    title: 'superwire',
    description: "fully generated podcasts on just what you're interested in",
    techStack: ['next.js', 'openai', 'elevenlabs'],
    siteUrl: 'https://www.superwire.app/',
    codeUrl: 'https://github.com/phrazzld/super-wire',
    imageSrc: superwireImg.src,
    altText: 'superwire project screenshot'
  },
  {
    title: 'brainstorm press',
    description: 'a blogging platform with bitcoin lightning payment support for seamless microtransactions',
    techStack: ['react', 'typescript', 'bitcoin'],
    codeUrl: 'https://github.com/phrazzld/brainstorm-press',
    imageSrc: brainstormPressImg.src,
    altText: 'brainstorm press project screenshot'
  },
  {
    title: 'personal site',
    description: 'my corner of the internet',
    techStack: ['react', 'next.js', 'typescript'],
    siteUrl: 'https://phaedrus.io',
    codeUrl: 'https://github.com/phrazzld/vanity',
    imageSrc: personalSiteImg.src,
    altText: 'vanity project screenshot'
  },
]
