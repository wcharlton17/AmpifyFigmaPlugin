// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

const isRectangleNode = (node: SceneNode): node is RectangleNode => {
  return node.type === "RECTANGLE"
}
const isTextNode = (node: SceneNode): node is TextNode => {
  return node.type === "TEXT"
}

figma.ui.onmessage = async msg => {
  if (msg.type === "process-selected") {
    const currentSelection = figma.currentPage.selection

    const selectedRectNodes: RectangleNode[] = getAllRectangles(currentSelection, [])
    const selectedTextNodes: TextNode[] = figma.currentPage.selection.filter(isTextNode)

    await figma.loadFontAsync({family: 'Roboto', style: 'Regular'})
    console.log("selectedRectNodes", selectedRectNodes)
    selectedRectNodes.forEach((node) => {
      figma.ui.postMessage({type: "get-image", id: node.id})
    })
    selectedTextNodes.forEach((node, index) => {
      figma.ui.postMessage({type: "get-title", index})
    })
  }

  if (msg.type === 'new-image') {
    const node = figma.getNodeById(msg.nodeId) as RectangleNode
    fillWithPack(msg.newBytes, node)
  }

  if (msg.type === 'new-title') {
    const selectedNodes: TextNode[] = figma.currentPage.selection.filter(isTextNode)
    const node = selectedNodes[msg.nodeIndex]
    const font: FontName = {family: 'Roboto', style: 'Regular'}

    node.setRangeFontName(0, node.characters.length, font)
    node.characters = msg.name
  }
};

function getAllRectangles(nodes, rectangles: RectangleNode[]): RectangleNode[] {
  const allRectangles =[...rectangles]


  for (const node of nodes) {
    const children = node.children

    if (isRectangleNode(node)) {
      allRectangles.push(node)
    } else if (children) {
      for (const child of children) {
        console.log('child', child)
        const rects = getAllRectangles([child], [])
        console.log('rects to add', rects)
        allRectangles.push(...rects)
        // allRectangles.push(...getAllRectangles([child], allRectangles))
      }
    }
  }

  console.log(allRectangles)
  return allRectangles
}

function fillWithPack(imageData, node: RectangleNode) {
  const newImage = figma.createImage(imageData)

  const fills = clone(node.fills);

  for (const paint of fills) {
    paint.type = 'IMAGE'
    paint.scaleMode ='FILL'
    delete paint.color
    paint.imageHash = newImage.hash
  }

  node.fills = fills

  return node
}

function clone(val) {
  return JSON.parse(JSON.stringify(val))
}
