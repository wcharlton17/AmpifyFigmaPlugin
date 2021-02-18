// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__);
const isRectangleNode = (node) => {
    return node.type === "RECTANGLE";
};
figma.ui.onmessage = msg => {
    if (msg.type === "process-selected") {
        const selectedNodes = figma.currentPage.selection.filter(isRectangleNode);
        selectedNodes.forEach((node, index) => {
            figma.ui.postMessage({ type: "get-image", nodeIndex: index });
        });
    }
    if (msg.type === 'new-image') {
        const selectedNodes = figma.currentPage.selection.filter(isRectangleNode);
        const node = selectedNodes[msg.nodeIndex];
        fillWithPack(msg.newBytes, node);
    }
};
function fillWithPack(imageData, node) {
    const newImage = figma.createImage(imageData);
    const fills = clone(node.fills);
    for (const paint of fills) {
        paint.type = 'IMAGE';
        paint.scaleMode = 'FILL';
        delete paint.color;
        paint.imageHash = newImage.hash;
    }
    node.fills = fills;
    return node;
}
function clone(val) {
    return JSON.parse(JSON.stringify(val));
}
