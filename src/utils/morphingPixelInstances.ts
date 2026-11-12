import * as THREE from 'three'

export type MorphingPixel = {
  solidPos: [number, number, number]
  scatterPos: [number, number, number]
  color: string
  delay: number
}

/** Preserve each cube's original transform and glow in one physical-material draw. */
export function updateMorphingPixels(mesh: THREE.InstancedMesh, pixels: MorphingPixel[], hover: number, time: number, dark: boolean, scratch: THREE.Object3D) {
  const glow = mesh.geometry.getAttribute('instanceEmissive') as THREE.InstancedBufferAttribute
  pixels.forEach((pixel, index) => {
    const raw = Math.min(1, Math.max(0, hover * 2.5 - pixel.delay * 0.8))
    const eased = 1 - Math.pow(1 - raw, 3)
    scratch.position.set(
      pixel.solidPos[0] + (pixel.scatterPos[0] - pixel.solidPos[0]) * eased,
      pixel.solidPos[1] + (pixel.scatterPos[1] - pixel.solidPos[1]) * eased,
      pixel.solidPos[2] + (pixel.scatterPos[2] - pixel.solidPos[2]) * eased,
    )
    if (hover < 0.1) scratch.position.y += Math.sin(time * 1.5 + pixel.solidPos[0] * 8 + pixel.solidPos[2] * 8) * 0.008
    const seed = Math.sin(index * 7 * 127.1 + index * 7 * 311.7) * 43758.5453
    const spin = (seed - Math.floor(seed)) * 0.3 + 0.1
    scratch.rotation.set(eased * time * spin, 0, eased * time * spin * 0.7)
    scratch.scale.setScalar(1 + eased * 0.3)
    scratch.updateMatrix()
    mesh.setMatrixAt(index, scratch.matrix)
    glow.setX(index, eased * (dark ? 0.6 : 0.35))
  })
  mesh.instanceMatrix.needsUpdate = true
  glow.needsUpdate = true
}

export function addInstanceEmissive(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.vertexShader = 'attribute float instanceEmissive;\nvarying float vInstanceEmissive;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvInstanceEmissive = instanceEmissive;')
  shader.fragmentShader = 'varying float vInstanceEmissive;\n' + shader.fragmentShader.replace('vec3 totalEmissiveRadiance = emissive;', 'vec3 totalEmissiveRadiance = emissive * vInstanceEmissive;')
}
