import { isExperimental } from '../config/portfolio'

export const homepageEntrance = isExperimental
  ? {
      intro: 'I build things that answer back: instruments, light sculptures, and playable simulations.',
      label: 'Watch the duet',
      to: '/jugalbandi/#cs-film',
    }
  : {
      intro: 'I design interfaces that help people understand what a system is doing and what to do next.',
      label: 'See Mentra before and after',
      to: '/mentra/#cs-design-proof',
    }

export const heroObjectStories = isExperimental
  ? [
      { description: 'Draw a letter and see how the sculpture lights up.', label: 'Draw a letter in Enigma', to: '/enigma/#cs-interactive' },
      { description: 'A musician improvises and robotic instruments answer.', label: 'Watch the Jugalbandi duet', to: '/jugalbandi/#cs-film' },
      { description: 'Slide the story forward and watch the mill grind faster.', label: 'Try Why the Sea is Salt', to: '/sea-of-salt/#cs-try' },
      { description: 'Follow a gesture from the controller to the acoustic instruments.', label: 'Explore the Hexa-18 mechanism', to: '/jugalbandi/#cs-instrument' },
      { description: 'Move one fader and watch the others respond.', label: 'Play the Shuffle simulation', to: '/shuffle/simulation/' },
      { description: 'See a handwritten letter pass through 200 points of light.', label: 'Watch Enigma light up', to: '/enigma/#cs-film' },
    ]
  : [
      { description: 'TransFi separates what you pay, what you receive, and what the fees cost.', label: 'Compare the TransFi buy quote', to: '/transfi-project/#transfi-quote-title' },
      { description: 'Raahi carries the same route information across three interfaces.', label: 'Follow one trip in Raahi', to: '/raahi-project/#cs-raahi-trip' },
      { description: 'Mentra puts MiniApps first and keeps glasses status visible.', label: 'Compare the Mentra home screens', to: '/mentra/#cs-design-proof' },
      { description: 'Mentra’s packaging is the first step in setting up the glasses.', label: 'See the Mentra packaging', to: '/mentra-brand/#cs-packaging' },
      { description: 'MiniApps let people use tools like captions and translation on their glasses.', label: 'See how MiniApps work', to: '/mentra-miniapps/' },
      { description: 'Clawed guides users through choosing where their assistant runs.', label: 'Follow Clawed’s Mac setup', to: '/clawed-chat/#cs-clawed-setup' },
    ]
