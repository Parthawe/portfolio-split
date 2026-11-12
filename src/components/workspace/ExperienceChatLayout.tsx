import { Outlet } from 'react-router-dom'
import PortfolioChat from './PortfolioChat'
import { useExperienceNavigation } from '../../hooks/useExperienceNavigation'

export default function ExperienceChatLayout() {
  useExperienceNavigation()
  return <><div id="site-zoom-stage"><Outlet /></div><PortfolioChat /></>
}
