import type { ComponentType } from 'react'

type ProjectRoute = {
  slug: string
  page: () => Promise<{ default: ComponentType }>
}

/**
 * Lightweight route manifest for the app shell. Keep this in sync with the
 * publicly routable entries in projects.ts; the route QA checks every entry.
 */
export const projectRoutes: ProjectRoute[] = [
  { slug: 'mentra', page: () => import('../pages/projects/MentraPage') },
  { slug: 'mentra-miniapps', page: () => import('../pages/projects/MentraMiniAppsPage') },
  { slug: 'transfi-project', page: () => import('../pages/projects/TransfiPage') },
  { slug: 'zentipay', page: () => import('../pages/projects/ZentipayPage') },
  { slug: 'clawed-chat', page: () => import('../pages/projects/ClawedChatPage') },
  { slug: 'executivelens', page: () => import('../pages/projects/ExecutiveLensPage') },
  { slug: 'org-dashboard', page: () => import('../pages/projects/OrgDashboardPage') },
  { slug: 'cuetv', page: () => import('../pages/projects/CueTvPage') },
  { slug: 'healthapp', page: () => import('../pages/projects/HealthAppPage') },
  { slug: 'medimorpho', page: () => import('../pages/projects/MediMorphoPage') },
  { slug: 'ibm', page: () => import('../pages/projects/IbmPage') },
  { slug: 'ballah-code', page: () => import('../pages/projects/BallahCodePage') },
  { slug: 'ai-voice', page: () => import('../pages/projects/AiVoicePage') },
  { slug: 'raahi-project', page: () => import('../pages/projects/RaahiPage') },
  { slug: 'the-point-cdc', page: () => import('../pages/projects/ThePointCdcPage') },
  { slug: 'office-of-diversity', page: () => import('../pages/projects/OfficeOfDiversityPage') },
  { slug: 'jugalbandi', page: () => import('../pages/projects/JugalbandiPage') },
  { slug: 'vj-software', page: () => import('../pages/projects/VjSoftwarePage') },
  { slug: 'enigma', page: () => import('../pages/projects/EnigmaPage') },
  { slug: 'shuffle', page: () => import('../pages/projects/ShufflePage') },
  { slug: 'making-of-time', page: () => import('../pages/projects/MakingOfTimePage') },
  { slug: 'sea-of-salt', page: () => import('../pages/projects/SeaOfSaltPage') },
  { slug: 'flow-fields', page: () => import('../pages/projects/FlowFieldsPage') },
  { slug: 'embodied-web', page: () => import('../pages/projects/EmbodiedWebPage') },
  { slug: 'feeling-patterns', page: () => import('../pages/projects/FeelingPatternsPage') },
  { slug: 'performance-by-design', page: () => import('../pages/projects/PerformanceByDesignPage') },
  { slug: 'on-becoming', page: () => import('../pages/projects/OnBecomingPage') },
  { slug: 'storytelling', page: () => import('../pages/projects/StorytellingPage') },
  { slug: 'dna-speculative', page: () => import('../pages/projects/DnaPage') },
  { slug: 'comp-media', page: () => import('../pages/projects/IntroCompMediaPage') },
  { slug: 'hypercinema', page: () => import('../pages/projects/HypercinemaPage') },
  { slug: 'applications', page: () => import('../pages/projects/ApplicationsPage') },
  { slug: 'messy-humans', page: () => import('../pages/projects/MessyHumansPage') },
  { slug: 'production-studio', page: () => import('../pages/projects/ProductionStudioPage') },
  { slug: 'arcade-lab', page: () => import('../pages/projects/ArcadeLabPage') },
  { slug: 'black-hole', page: () => import('../pages/projects/BlackHolePage') },
  { slug: 'uv-light', page: () => import('../pages/projects/UvLightPage') },
  { slug: 'the-omakase', page: () => import('../pages/projects/TheOmakasePage') },
  { slug: 'revolving-stage', page: () => import('../pages/projects/RevolvingStagePage') },
  { slug: 'moniac-machine', page: () => import('../pages/projects/MoniacMachinePage') },
  { slug: 'dumb-waiter-set-design', page: () => import('../pages/projects/DumbWaiterPage') },
  { slug: 'drowning', page: () => import('../pages/projects/DrowningPage') },
  { slug: 'sculpture', page: () => import('../pages/projects/SculpturePage') },
  { slug: 'mentra-brand', page: () => import('../pages/projects/MentraBrandPage') },
  { slug: 'tedx', page: () => import('../pages/projects/TedxPage') },
  { slug: 'code-for-build', page: () => import('../pages/projects/CodeForBuildPage') },
  { slug: 'typeface', page: () => import('../pages/projects/TypefacePage') },
  { slug: 'atps', page: () => import('../pages/projects/AtpsPage') },
  { slug: 'vishwaconclave', page: () => import('../pages/projects/VishwaConclavePage') },
  { slug: 'glassly', page: () => import('../pages/projects/GlasslyPage') },
]
