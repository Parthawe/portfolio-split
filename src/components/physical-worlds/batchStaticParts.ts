import * as T from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export function batchStaticParts(group:T.Group) {
  group.updateMatrixWorld(true)
  const inverse=group.matrixWorld.clone().invert(),buckets=new Map<T.Material,T.Mesh[]>()
  group.traverse(object=>{
    if(!(object instanceof T.Mesh)||Array.isArray(object.material))return
    let ancestor:T.Object3D|null=object
    while(ancestor&&ancestor!==group){if(ancestor.userData.animated||ancestor.userData.control!==undefined)return;ancestor=ancestor.parent}
    const bucket=buckets.get(object.material)??[];bucket.push(object);buckets.set(object.material,bucket)
  })
  for(const [material,parts]of buckets){
    if(parts.length<2)continue
    const geometries=parts.map(part=>{const geometry=part.geometry.index?part.geometry.toNonIndexed():part.geometry.clone();return geometry.applyMatrix4(inverse.clone().multiply(part.matrixWorld))})
    const merged=mergeGeometries(geometries,false);geometries.forEach(geometry=>geometry.dispose())
    if(!merged)continue
    parts.forEach(part=>{part.removeFromParent();part.geometry.dispose()})
    const mesh=new T.Mesh(merged,material);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh)
  }
}
