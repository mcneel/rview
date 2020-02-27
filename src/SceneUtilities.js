import * as THREE from 'three'
import RhinoApp from './RhinoApp.js'
// import GlslGrid from './GlslGrid.js'
import GlslLineList from './GlslLineList.js'

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

    grid.add(GlslLineList.createThreeObjectFromLines(minorLines,
      new THREE.Color(147 / 255, 153 / 255, 160 / 255),
      1.0))

    grid.add(GlslLineList.createThreeObjectFromLines(majorLines,
      new THREE.Color(129 / 255, 134 / 255, 140 / 255),
      1.0))

    let lineList = new GlslLineList()
    lineList.addLine(new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(xMax, 0, 0),
      new THREE.Color(150 / 255, 75 / 255, 75 / 255),
      2.0)
    lineList.addLine(new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, yMax, 0),
      new THREE.Color(75 / 255, 150 / 255, 75 / 255),
      2.0)
    grid.add(lineList.createThreeObject())

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
  meshWiresToThreejs (mesh, color) {
    let edges = mesh.topologyEdges()
    let edgeCount = edges.count
    let verts = new Float32Array(edgeCount * 2 * 3)
    for (let i = 0; i < edgeCount; i++) {
      let line = edges.edgeLine(i)
      verts[i * 6] = line.from[0]
      verts[i * 6 + 1] = line.from[1]
      verts[i * 6 + 2] = line.from[2]
      verts[i * 6 + 3] = line.to[0]
      verts[i * 6 + 4] = line.to[1]
      verts[i * 6 + 5] = line.to[2]
    }
    edges.delete()
    let points = new THREE.BufferGeometry()
    points.setAttribute('position', new THREE.BufferAttribute(verts, 3))
    let threecolor = new THREE.Color(color.r / 255.0, color.g / 255.0, color.b / 255.0)
    let wireMaterial = new THREE.LineBasicMaterial({ color: threecolor })
    let wires = new THREE.LineSegments(points, wireMaterial)
    wires.userData['surfaceWires'] = true
    return wires
  },
  meshToThreejs (mesh, diffuse) {
    let textureCoords = mesh.textureCoordinates()
    if (textureCoords.count === 0) {
      let rhino3dm = RhinoApp.getRhino3dm()
      let sphere = new rhino3dm.Sphere([0, 0, 0], 1000)
      let mapping = rhino3dm.TextureMapping.createSphereMapping(sphere)
      mesh.setTextureCoordinates(mapping, null, false)
    }
    textureCoords.delete()

    let loader = new THREE.BufferGeometryLoader()
    var geometry = loader.parse(mesh.toThreejsJSON())
    let diffusecolor = new THREE.Color(diffuse.r / 255.0, diffuse.g / 255.0, diffuse.b / 255.0)
    if (diffuse.r === 0 && diffuse.g === 0 && diffuse.b === 0) {
      diffusecolor.r = 1
      diffusecolor.g = 1
      diffusecolor.b = 1
    }
    let material = new THREE.MeshPhongMaterial({
      color: diffusecolor,
      side: THREE.DoubleSide
    })
    let meshObject = new THREE.Mesh(geometry, material)
    meshObject.userData['diffuse'] = diffusecolor
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
          let wires = new THREE.Group()
          wires.userData['surfaceWires'] = true
          let edges = geometry.edges()
          for (let edgeIndex = 0; edgeIndex < edges.count; edgeIndex++) {
            let edge = edges.get(edgeIndex)
            let points = this.curveToBufferGeometry(edge, 32)
            let threecolor = new THREE.Color(color.r / 255.0, color.g / 255.0, color.b / 255.0)
            let wireMaterial = new THREE.LineBasicMaterial({ color: threecolor })
            let polyline = new THREE.Line(points, wireMaterial)
            wires.add(polyline)
          }
          objectsToAdd.push([wires, geometry.getBoundingBox()])
        }
        break
      case rhino3dm.ObjectType.Mesh:
        {
          let threeMesh = this.meshToThreejs(geometry, color)
          objectsToAdd.push([threeMesh, geometry.getBoundingBox()])
          let wires = this.meshWiresToThreejs(geometry, color)
          objectsToAdd.push([wires, geometry.getBoundingBox()])
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
        console.log('TODO: Implement dots')
        // let dotDiv = document.createElement('div')
        // dotDiv.style.marginTop = '-1em'
        // dotDiv.style.color = '#FFF'
        // dotDiv.style.fontFamily = 'sans-serif'
        // dotDiv.style.padding = '2px'
        // dotDiv.style.background = 'rgba(0,0,0,.6)'
        // dotDiv.textContent = geometry.text
        // let dot = new CSS2DObject(dotDiv)
        // let location = geometry.point
        // dot.position.set(location[0], location[1], location[2])
        // objectsToAdd.push([dot, null])
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
  createPBRMaterial (name, apply) {
    let material = new THREE.MeshPhysicalMaterial()
    material.metalness = 0.75
    material.roughness = 0.15
    material.normalScale.x = 1.0
    material.normalScale.y = 1.0
    // material.envMap = scene.background

    let tl = new THREE.TextureLoader()
    tl.setPath('statics/materials/PBR/' + name + '/')
    material.aoMmap = tl.load(name + '_ao.png')
    material.normalMap = tl.load(name + '_normal.png')
    material.metalnessMap = tl.load(name + '_metallic.png')

    tl.load(name + '_base.png', (texture) => {
      material.map = texture
      apply(material)
    })
  },
  viewportSize: new THREE.Vector2(0, 0)
}

export default SceneUtilities
