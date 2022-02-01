import * as THREE from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import RViewApp from './RViewApp'
// import GlslGrid from './GlslGrid.js'
import GlslLineList from './GlslLineList'
import GlslScreenQuad from './GlslScreenQuad'

function curveToPoints (curve, pointLimit) {
  let rhino3dm = RViewApp.getRhino3dm()
  let pointCount = pointLimit
  let rc = []
  let ts = []

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
      let segmentArray = curveToPoints(segment, pointCount)
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
    if (t === domain[0] || t === domain[1]) {
      ts.push(t)
      continue
    }
    let tan = curve.tangentAt(t)
    let tanVec = new THREE.Vector3(tan[0], tan[1], tan[2])
    let prevTan = curve.tangentAt(ts.slice(-1)[0])
    let prevTanVec = new THREE.Vector3(prevTan[0], prevTan[1], prevTan[2])

    let angle = tanVec.angleTo(prevTanVec)
    if (angle < 0.1) { continue }
    ts.push(t)
  }

  rc = ts.map(t => curve.pointAt(t))
  return rc
}

function getMaterialId (doc, attributes) {
  let materials = doc.materials()
  let material = materials.findFromAttributes(attributes)
  let id = 0
  if (material) {
    id = material.id
    material.delete()
  }
  materials.delete()
  return id
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
      1.0,
      false))

    grid.add(GlslLineList.createThreeObjectFromLines(majorLines,
      new THREE.Color(129 / 255, 134 / 255, 140 / 255),
      1.0,
      false))

    let lineList = new GlslLineList(false)
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
  meshWiresToThreejs (mesh, color) {
    let edges = mesh.topologyEdges()
    const points = []
    for (let i = 0; i < edges.count; i++) {
      const pt0 = edges.edgeLine(i).from
      const pt1 = edges.edgeLine(i).to
      points.push(new THREE.Vector3().fromArray(pt0))
      points.push(new THREE.Vector3().fromArray(pt1))
    }
    const pointGeometry = new THREE.BufferGeometry().setFromPoints(points)
    let threecolor = new THREE.Color(color.r / 255.0, color.g / 255.0, color.b / 255.0)
    let wireMaterial = GlslLineList.getBiasLinesMaterial(threecolor) // new THREE.LineBasicMaterial({ color: threecolor })
    let wires = new THREE.LineSegments(pointGeometry, wireMaterial)
    wires.userData['surfaceWires'] = true
    return wires
  },
  meshToThreejs (mesh, diffuse, materialId) {
    let meshes = mesh
    if (!Array.isArray(mesh)) meshes = [mesh]
    for (let i = 0; i < meshes.length; i++) {
      let textureCoords = meshes[i].textureCoordinates()
      if (textureCoords.count === 0) {
        let rhino3dm = RViewApp.getRhino3dm()
        let sphere = new rhino3dm.Sphere([0, 0, 0], 1000)
        let mapping = rhino3dm.TextureMapping.createSphereMapping(sphere)
        meshes[i].setTextureCoordinates(mapping, null, false)
      }
      textureCoords.delete()
    }
    let rhino3dm = RViewApp.getRhino3dm()
    let loader = new THREE.BufferGeometryLoader()
    let data = rhino3dm.Mesh.toThreejsJSONMerged(meshes, false)
    var geometry = loader.parse(data)
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
    meshObject.userData['materialId'] = materialId
    return meshObject
  },
  createThreeGeometryOnLayer (items, doc, disposablesList) {
    let rhino3dm = RViewApp.getRhino3dm()
    let deleteList = []
    let materials = doc.materials()
    deleteList.push(materials)

    let objectsToAdd = []
    // attempt to merge as much as possible
    let meshes = []
    for (let i = 0; i < items.length; i++) {
      let geometry = items[i][0]
      let attributes = items[i][1]
      const objectType = geometry.objectType
      switch (objectType) {
        case rhino3dm.ObjectType.Brep:
          {
            let color = attributes.drawColor(doc)
            let material = materials.findFromAttributes(attributes)
            deleteList.push(material)
            let faces = geometry.faces()
            for (let faceIndex = 0; faceIndex < faces.count; faceIndex++) {
              let face = faces.get(faceIndex)
              let mesh = face.getMesh(rhino3dm.MeshType.Any)
              if (mesh) {
                meshes.push([color, material, mesh])
              }
              face.delete()
            }
            faces.delete()
          }
          break
        case rhino3dm.ObjectType.Mesh:
          {
            let color = attributes.drawColor(doc)
            let material = materials.findFromAttributes(attributes)
            deleteList.push(material)
            meshes.push([color, material, geometry])
          }
          break
        case rhino3dm.ObjectType.SubD:
          {
            // We can do something smarter in the future. For now just
            // make a level 3 mesh
            geometry.subdivide(3)
            let mesh = rhino3dm.Mesh.createFromSubDControlNet(geometry)
            let color = attributes.drawColor(doc)
            let material = materials.findFromAttributes(attributes)
            deleteList.push(material)
            meshes.push([color, material, mesh])
          }
          break
        case rhino3dm.ObjectType.Extrusion:
          {
            let mesh = geometry.getMesh(rhino3dm.MeshType.Any)
            if (mesh) {
              let color = attributes.drawColor(doc)
              let material = materials.findFromAttributes(attributes)
              deleteList.push(material)
              meshes.push([color, material, mesh])
            }
          }
          break
        default:
          break
      }
    }

    for (let i = 0; i < meshes.length; i++) {
      let [color, material, mesh] = meshes[i]
      let mergeMeshes = [mesh]
      let bbox = mesh.getBoundingBox()
      let materialId = 0
      if (material != null) {
        for (let j = i + 1; j < meshes.length; j++) {
          let [nextColor, nextMaterial, nextMesh] = meshes[j]
          if (nextMaterial === null) {
            break
          }
          if (color.r === nextColor.r && color.g === nextColor.g && color.b === nextColor.b && color.a === nextColor.a &&
            rhino3dm.Material.compareAppearance(material, nextMaterial) === 0) {
            i = j
            mergeMeshes.push(nextMesh)
            let nextbbox = nextMesh.getBoundingBox()
            deleteList.push(nextbbox)
            bbox = rhino3dm.BoundingBox.union(bbox, nextbbox)
            continue
          }
          break
        }
        materialId = material.id
      }
      let threeMesh = this.meshToThreejs(mergeMeshes, color, materialId)
      disposablesList.push(threeMesh.geometry)
      disposablesList.push(threeMesh.material)
      objectsToAdd.push([threeMesh, bbox])
    }

    for (let i = 0; i < items.length; i++) {
      let geometry = items[i][0]
      let attrs = items[i][1]
      let abc = this.createThreeGeometry(geometry, attrs, doc, disposablesList, false)
      objectsToAdd = objectsToAdd.concat(abc)
    }

    for (let i = 0; i < deleteList.length; i++) {
      let itemToDelete = deleteList[i]
      if (itemToDelete != null) itemToDelete.delete()
    }
    return objectsToAdd
  },
  createThreeGeometry (geometry, attributes, doc, disposablesList, createMeshes) {
    let rhino3dm = RViewApp.getRhino3dm()
    let objectsToAdd = []
    let color = attributes.drawColor(doc)
    const objectType = geometry.objectType
    switch (objectType) {
      case rhino3dm.ObjectType.Point:
        {
          let pointMaterial = new THREE.PointsMaterial({ color: color })
          let pt = geometry.location
          const points = []
          points.push(new THREE.Vector3().fromArray(pt))
          const pointGeometry = new THREE.BufferGeometry().setFromPoints(points)
          disposablesList.push(pointMaterial)
          disposablesList.push(pointGeometry)
          objectsToAdd.push([new THREE.Points(pointGeometry, pointMaterial), geometry.getBoundingBox()])
        }
        break
      case rhino3dm.ObjectType.PointSet:
        {
          let pointMaterial = new THREE.PointsMaterial({ color: color })
          disposablesList.push(pointMaterial)
          let count = geometry.count
          const points = []
          for (let i = 0; i < count; i++) {
            let pt = geometry.pointAt(i)
            points.push(new THREE.Vector3(pt[0], pt[1], pt[2]))
            // pointGeometry.vertices.push(new THREE.Vector3(pt[0], pt[1], pt[2]))
          }
          let pointGeometry = new THREE.BufferGeometry().setFromPoints(points)
          disposablesList.push(pointGeometry)
          objectsToAdd.push([new THREE.Points(pointGeometry, pointMaterial), geometry.getBoundingBox()])
        }
        break
      case rhino3dm.ObjectType.Curve:
        {
          let points = curveToPoints(geometry, 100)
          let linelist = new GlslLineList(true)
          let threecolor = new THREE.Color(color.r / 255.0, color.g / 255.0, color.b / 255.0)
          linelist.addPolyline(points, threecolor, 1.5)
          let threeObject = linelist.createThreeObject()
          disposablesList.push(threeObject.geometry)
          disposablesList.push(threeObject.material)
          objectsToAdd.push([threeObject, geometry.getBoundingBox()])
        }
        break
      case rhino3dm.ObjectType.Surface:
        console.warn('TODO: Implement surface')
        break
      case rhino3dm.ObjectType.Brep:
        {
          if (createMeshes) {
            let materialId = getMaterialId(doc, attributes)
            let faces = geometry.faces()
            for (let faceIndex = 0; faceIndex < faces.count; faceIndex++) {
              let face = faces.get(faceIndex)
              let mesh = face.getMesh(rhino3dm.MeshType.Any)
              if (mesh) {
                let threeMesh = this.meshToThreejs(mesh, color, materialId)
                disposablesList.push(threeMesh.geometry)
                disposablesList.push(threeMesh.material)
                objectsToAdd.push([threeMesh, mesh.getBoundingBox()])
                mesh.delete()
              }
              face.delete()
            }
            faces.delete()
          }
          let wires = new THREE.Group()
          wires.userData['surfaceWires'] = true
          let edges = geometry.edges()
          for (let edgeIndex = 0; edgeIndex < edges.count; edgeIndex++) {
            let edge = edges.get(edgeIndex)
            let points = curveToPoints(edge, 100)
            let linelist = new GlslLineList(true)
            let threecolor = new THREE.Color(color.r / 255.0, color.g / 255.0, color.b / 255.0)
            linelist.addPolyline(points, threecolor, 1.5)
            let threeObject = linelist.createThreeObject()
            disposablesList.push(threeObject.geometry)
            disposablesList.push(threeObject.material)
            wires.add(threeObject)
          }
          objectsToAdd.push([wires, geometry.getBoundingBox()])
        }
        break
      case rhino3dm.ObjectType.Mesh:
        if (createMeshes) {
          let materialId = getMaterialId(doc, attributes)
          let threeMesh = this.meshToThreejs(geometry, color, materialId)
          disposablesList.push(threeMesh.geometry)
          disposablesList.push(threeMesh.material)
          objectsToAdd.push([threeMesh, geometry.getBoundingBox()])
        }
        {
          let wires = this.meshWiresToThreejs(geometry, color)
          disposablesList.push(wires.geometry)
          disposablesList.push(wires.material)
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
          let bbox = null
          let group = new THREE.Group()
          let matrix = new THREE.Matrix4()
          matrix.set(xf[0], xf[1], xf[2], xf[3], xf[4], xf[5], xf[6], xf[7],
            xf[8], xf[9], xf[10], xf[11], xf[12], xf[13], xf[14], xf[15])
          group.applyMatrix(matrix)

          let idefTable = doc.instanceDefinitions()
          let objectTable = doc.objects()
          let idef = idefTable.findId(parentId)
          let objectIds = idef.getObjectIds()
          objectIds.forEach((id) => {
            let modelObject = objectTable.findId(id)
            let childGeometry = modelObject.geometry()
            let attr = modelObject.attributes()
            let children = this.createThreeGeometry(childGeometry, attr, doc, disposablesList, true)
            children.forEach((child) => {
              let childBbox = child[1]
              childBbox.transform(geometry.xform)
              if (bbox == null) {
                bbox = childBbox
              } else {
                bbox = rhino3dm.BoundingBox.union(bbox, childBbox)
              }
              group.add(child[0])
            })
          })
          objectsToAdd.push([group, bbox])
          objectTable.delete()
          idefTable.delete()
        }
        break
      case rhino3dm.ObjectType.TextDot:
        let dotDiv = document.createElement('div')
        dotDiv.style.fontFamily = geometry.fontFace
        dotDiv.style.fontSize = `${geometry.fontHeight}px`
        dotDiv.style.marginTop = '-1em'
        dotDiv.style.color = '#FFF'
        dotDiv.style.padding = '2px'
        dotDiv.style.paddingRight = '5px'
        dotDiv.style.paddingLeft = '5px'
        dotDiv.style.borderRadius = '5px'
        dotDiv.style.background = `rgba(${color.r},${color.g},${color.b},${color.a})`
        dotDiv.textContent = geometry.text
        let dot = new CSS2DObject(dotDiv)
        let location = geometry.point
        dot.position.set(location[0], location[1], location[2])
        objectsToAdd.push([dot, null])
        break
      case rhino3dm.ObjectType.Hatch:
        console.warn('TODO: Implement hatch')
        break
      case rhino3dm.ObjectType.SubD:
        if (createMeshes) {
          // We can do something smarter in the future. For now just
          // make a level 3 mesh
          // let wiremesh = rhino3dm.Mesh.createFromSubDControlNet(geometry)
          geometry.subdivide(3)
          let mesh = rhino3dm.Mesh.createFromSubDControlNet(geometry)
          let materialId = getMaterialId(doc, attributes)
          let threeMesh = this.meshToThreejs(mesh, color, materialId)
          disposablesList.push(threeMesh.geometry)
          disposablesList.push(threeMesh.material)
          objectsToAdd.push([threeMesh, geometry.getBoundingBox()])
          mesh.delete()
        }
        // This will create the base control net wires. Not too pretty yet
        /*
        let threecolor = new THREE.Color(color.r / 255.0, color.g / 255.0, color.b / 255.0)
        let linelist = new GlslLineList(true)
        let edges = wiremesh.topologyEdges()
        for (let edgeIndex = 0; edgeIndex < edges.count; edgeIndex++) {
          let edge = edges.edgeLine(edgeIndex)
          let points = [edge.from, edge.to]
          edge.delete()
          linelist.addPolyline(points, threecolor, 1.4)
        }
        let wires = linelist.createThreeObject()
        wires.userData['surfaceWires'] = true
        // let wires = this.meshWiresToThreejs(wiremesh, color)
        objectsToAdd.push([wires, geometry.getBoundingBox()])
        edges.delete()
        wiremesh.delete()
        */
        break
      case rhino3dm.ObjectType.ClipPlane:
        let normal = geometry.normalAt(0, 0)
        let center = geometry.pointAt(0, 0)
        let clippingPlane = new THREE.Plane(new THREE.Vector3(normal[0], normal[1], normal[2]), 0)
        clippingPlane.translate(new THREE.Vector3(center[0], center[1], center[2]))
        objectsToAdd.push([clippingPlane, null])
        break
      case rhino3dm.ObjectType.Extrusion:
        if (createMeshes) {
          let mesh = geometry.getMesh(rhino3dm.MeshType.Any)
          if (mesh) {
            let materialId = getMaterialId(doc, attributes)
            let threeMesh = this.meshToThreejs(mesh, color, materialId)
            disposablesList.push(threeMesh.geometry)
            disposablesList.push(threeMesh.material)
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
  createScreenQuad () {
    return GlslScreenQuad.createThreeObject()
  },
  viewportSize: new THREE.Vector2(0, 0)
}

export default SceneUtilities
