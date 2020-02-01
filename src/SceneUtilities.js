import * as THREE from 'three'
import RhinoApp from './RhinoApp.js'

function curveToPoints (curve, pointLimit) {
  let rhino3dm = RhinoApp.getRhino3dm()
  let pointCount = pointLimit
  let rc = []

  if (curve instanceof rhino3dm.LineCurve) {
    return [curve.pointAtStart, curve.pointAtEnd]
  }

  if (curve instanceof rhino3dm.PolylineCurve) {
    pointCount = curve.pointCount
    for (let i = 0; i < pointCount; i++) {
      rc.push(curve.point(i))
    }
    return rc
  }

  if (curve instanceof rhino3dm.PolyCurve) {
    let segmentCount = curve.segmentCount
    for (let i = 0; i < segmentCount; i++) {
      let segment = curve.segmentCurve(i)
      let segmentArray = curveToPoints(segment)
      rc = rc.concat(segmentArray)
      segment.delete()
    }
    return rc
  }

  if (curve instanceof rhino3dm.NurbsCurve && curve.degree === 1) {
    console.info('degree 1 curve')
  }

  let domain = curve.domain
  let divisions = pointCount - 1.0
  for (let j = 0; j < pointCount; j++) {
    let t = domain[0] + (j / divisions) * (domain[1] - domain[0])
    rc.push(curve.pointAt(t))
  }
  return rc
}

let SceneUtilities = {
  createGrid (gridSpacing = 1.0, gridLineCount = 70, gridThickFrequency = 5) {
    const xMin = -gridLineCount * gridSpacing
    const yMin = xMin
    const xMax = gridLineCount * gridSpacing
    const yMax = xMax
    let grid = new THREE.Group()
    let minorLines = []
    let majorLines = []
    for (let i = -gridLineCount; i <= gridLineCount; i++) {
      let x = i * gridSpacing
      let y = i * gridSpacing
      if (i === 0) {
        majorLines.push(new THREE.Vector3(0, yMin, 0))
        majorLines.push(new THREE.Vector3(0, 0, 0))
        majorLines.push(new THREE.Vector3(xMin, 0, 0))
        majorLines.push(new THREE.Vector3(0, 0, 0))
        continue
      }

      if (i % gridThickFrequency === 0) {
        majorLines.push(new THREE.Vector3(x, yMin, 0))
        majorLines.push(new THREE.Vector3(x, yMax, 0))
        majorLines.push(new THREE.Vector3(xMin, y, 0))
        majorLines.push(new THREE.Vector3(xMax, y, 0))
      } else {
        minorLines.push(new THREE.Vector3(x, yMin, 0))
        minorLines.push(new THREE.Vector3(x, yMax, 0))
        minorLines.push(new THREE.Vector3(xMin, y, 0))
        minorLines.push(new THREE.Vector3(xMax, y, 0))
      }
    }
    let majorMaterial = new THREE.LineBasicMaterial({
      color: 0x111111,
      depthTest: false,
      depthWrite: false
    })
    let positions = new Float32Array(majorLines.length * 3)
    for (let i = 0; i < majorLines.length; i++) {
      positions[i * 3] = majorLines[i].x
      positions[i * 3 + 1] = majorLines[i].y
      positions[i * 3 + 2] = majorLines[i].z
    }
    let geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    let major = new THREE.LineSegments(geometry, majorMaterial)  // eslint-disable-line

    let minorMaterial = new THREE.LineBasicMaterial({
      color: 0x777777,
      depthTest: false,
      depthWrite: false
    })
    positions = new Float32Array(minorLines.length * 3)
    for (let i = 0; i < minorLines.length; i++) {
      positions[i * 3] = minorLines[i].x
      positions[i * 3 + 1] = minorLines[i].y
      positions[i * 3 + 2] = minorLines[i].z
    }
    geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    let minor = new THREE.LineSegments(geometry, minorMaterial) // eslint-disable-line
    grid.add(major)
    grid.add(minor)

    positions = new Float32Array([0, 0, 0, xMax, 0, 0])
    geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    let xMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(150 / 255, 75 / 255, 75 / 255),
      depthTest: false,
      depthWrite: false
    })
    grid.add(new THREE.LineSegments(geometry, xMaterial))

    positions = new Float32Array([0, 0, 0, 0, yMax, 0])
    geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    let yMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(75 / 255, 150 / 255, 75 / 255),
      depthTest: false,
      depthWrite: false
    })
    grid.add(new THREE.LineSegments(geometry, yMaterial))
    return grid
  },
  curveToBufferGeometry (curve, pointLimit) {
    let pointArray = curveToPoints(curve, pointLimit)
    let points = new THREE.BufferGeometry()
    let verts = new Float32Array(pointArray.length * 3)
    for (let i = 0; i < pointArray.length; i++) {
      verts[i * 3] = pointArray[i][0]
      verts[i * 3 + 1] = pointArray[i][1]
      verts[i * 3 + 2] = pointArray[i][2]
    }
    points.setAttribute('position', new THREE.BufferAttribute(verts, 3))
    return points
  },
  meshToThreejs (mesh, diffuse) {
    let loader = new THREE.BufferGeometryLoader()
    var geometry = loader.parse(mesh.toThreejsJSON())
    if (diffuse.r === 0 && diffuse.g === 0 && diffuse.b === 0) {
      diffuse.r = 255
      diffuse.g = 255
      diffuse.b = 255
    }
    let diffusecolor = new THREE.Color(diffuse.r / 255.0, diffuse.g / 255.0, diffuse.b / 255.0)
    let material = new THREE.MeshPhongMaterial({
      color: diffusecolor,
      side: THREE.DoubleSide
    })
    let meshObject = new THREE.Mesh(geometry, material)
    meshObject.userData['diffuse'] = diffuse
    return meshObject
  },
  createThreeGeometry (geometry, color, doc) {
    let rhino3dm = RhinoApp.getRhino3dm()
    let objectsToAdd = []
    const objectType = geometry.objectType
    switch (objectType) {
      case rhino3dm.ObjectType.Point:
        {
          let pointMaterial = new THREE.PointsMaterial({ color: color })
          let pointGeometry = new THREE.Geometry()
          let pt = geometry.location
          pointGeometry.vertices.push(new THREE.Vector3(pt[0], pt[1], pt[2]))
          objectsToAdd.push([new THREE.Points(pointGeometry, pointMaterial), geometry.getBoundingBox()])
        }
        break
      case rhino3dm.ObjectType.PointSet:
        {
          let pointMaterial = new THREE.PointsMaterial({ color: color })
          let pointGeometry = new THREE.Geometry()
          let count = geometry.count
          for (let i = 0; i < count; i++) {
            let pt = geometry.pointAt(i)
            pointGeometry.vertices.push(new THREE.Vector3(pt[0], pt[1], pt[2]))
          }
          objectsToAdd.push([new THREE.Points(pointGeometry, pointMaterial), geometry.getBoundingBox()])
        }
        break
      case rhino3dm.ObjectType.Curve:
        {
          let points = this.curveToBufferGeometry(geometry, 32)
          let threecolor = new THREE.Color(color.r / 255.0, color.g / 255.0, color.b / 255.0)
          let wireMaterial = new THREE.LineBasicMaterial({ color: threecolor })
          let polyline = new THREE.Line(points, wireMaterial)
          objectsToAdd.push([polyline, geometry.getBoundingBox()])
        }
        break
      case rhino3dm.ObjectType.Surface:
        console.warn('TODO: Implement surface')
        break
      case rhino3dm.ObjectType.Brep:
        {
          let faces = geometry.faces()
          for (let faceIndex = 0; faceIndex < faces.count; faceIndex++) {
            let face = faces.get(faceIndex)
            let mesh = face.getMesh(rhino3dm.MeshType.Any)
            if (mesh) {
              let threeMesh = this.meshToThreejs(mesh, color)
              objectsToAdd.push([threeMesh, mesh.getBoundingBox()])
              mesh.delete()
            }
            face.delete()
          }
          faces.delete()
        }
        break
      case rhino3dm.ObjectType.Mesh:
        {
          let threeMesh = this.meshToThreejs(geometry, color)
          objectsToAdd.push([threeMesh, geometry.getBoundingBox()])
        }
        break
      case rhino3dm.ObjectType.Light:
        console.warn('TODO: Implement light')
        break
      case rhino3dm.ObjectType.Annotation:
        console.warn('TODO: Implement annotation')
        break
      case rhino3dm.ObjectType.InstanceReference:
        {
          let parentId = geometry.parentIdefId
          let xf = geometry.xform.toFloatArray(true)
          let group = new THREE.Group()
          let matrix = new THREE.Matrix4()
          matrix.set(xf[0], xf[1], xf[2], xf[3], xf[4], xf[5], xf[6], xf[7],
            xf[8], xf[9], xf[10], xf[11], xf[12], xf[13], xf[14], xf[15])
          group.applyMatrix(matrix)
          objectsToAdd.push([group, null])

          let idefTable = doc.instanceDefinitions()
          let objectTable = doc.objects()
          let idef = idefTable.findId(parentId)
          let objectIds = idef.getObjectIds()
          objectIds.forEach((id) => {
            let modelObject = objectTable.findId(id)
            let childGeometry = modelObject.geometry()
            let attr = modelObject.attributes()
            let childColor = attr.drawColor(doc)
            let children = this.createThreeGeometry(childGeometry, childColor, doc)
            children.forEach((child) => {
              group.add(child[0])
            })
          })
          objectTable.delete()
          idefTable.delete()
        }
        break
      case rhino3dm.ObjectType.TextDot:
        console.warn('TODO: Implement dot')
        break
      case rhino3dm.ObjectType.Hatch:
        console.warn('TODO: Implement hatch')
        break
      case rhino3dm.ObjectType.SubD:
        console.warn('TODO: Implement SubD')
        break
      case rhino3dm.ObjectType.ClipPlane:
        console.warn('TODO: Implement clipplane')
        break
      case rhino3dm.ObjectType.Extrusion:
        {
          let mesh = geometry.getMesh(rhino3dm.MeshType.Any)
          if (mesh) {
            let threeMesh = this.meshToThreejs(mesh, color)
            objectsToAdd.push([threeMesh, mesh.getBoundingBox()])
            mesh.delete()
          }
        }
        break
      default:
        break
    }
    return objectsToAdd
  },
  createPBRMaterial (name) {
    let material = new THREE.MeshPhysicalMaterial()
    let tl = new THREE.TextureLoader()

    tl.setPath('statics/materials/PBR/' + name + '/')
    material.map = tl.load(name + '_base.png')
    material.aoMmap = tl.load(name + '_ao.png')
    material.normalMap = tl.load(name + '_normal.png')
    material.metalnessMap = tl.load(name + '_metallic.png')

    material.metalness = 0.75
    material.roughness = 0.15
    material.normalScale.x = 1.0
    material.normalScale.y = 1.0
    // material.envMap = scene.background
    return material
  }
}

export default SceneUtilities
