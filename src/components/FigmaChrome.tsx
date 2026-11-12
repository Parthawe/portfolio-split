import FigmaContextMenu from './FigmaContextMenu'
import FigmaHUD from './FigmaHUD'
import FigmaRuler from './FigmaRuler'
import FigmaZoom from './FigmaZoom'

export default function FigmaChrome() {
  return (
    <>
      <FigmaContextMenu />
      <FigmaHUD />
      <FigmaRuler />
      <FigmaZoom />
    </>
  )
}
