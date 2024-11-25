"use strict";
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
    width: 280,
    height: 342,
});
const isRectangleNode = (node) => {
    return node.type === "RECTANGLE";
};
const isTextNode = (node) => {
    return node.type === "TEXT";
};
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg.type === "add-images") {
        const currentSelection = figma.currentPage.selection;
        const selectedRectNodes = getAllRectangles(currentSelection, []);
        selectedRectNodes.forEach((node) => {
            figma.ui.postMessage({ type: "get-image", id: node.id });
        });
    }
    if (msg.type === "add-text") {
        const currentSelection = figma.currentPage.selection;
        const selectedTextNodes = figma.currentPage.selection.filter(isTextNode);
        yield figma.loadFontAsync({ family: "Roboto", style: "Regular" });
        selectedTextNodes.forEach((node, index) => {
            figma.ui.postMessage({ type: "get-title", index });
        });
    }
    if (msg.type === "new-image") {
        const node = figma.getNodeById(msg.nodeId);
        fillWithPack(msg.newBytes, node);
    }
    if (msg.type === "new-title") {
        const selectedNodes = figma.currentPage.selection.filter(isTextNode);
        const node = selectedNodes[msg.nodeIndex];
        const font = { family: "Roboto", style: "Regular" };
        node.setRangeFontName(0, node.characters.length, font);
        node.characters = msg.name;
    }
});
function getAllRectangles(nodes, rectangles) {
    const allRectangles = [...rectangles];
    for (const node of nodes) {
        const children = node.children;
        if (isRectangleNode(node)) {
            allRectangles.push(node);
        }
        else if (children) {
            for (const child of children) {
                console.log("child", child);
                const rects = getAllRectangles([child], []);
                console.log("rects to add", rects);
                allRectangles.push(...rects);
                // allRectangles.push(...getAllRectangles([child], allRectangles))
            }
        }
    }
    console.log(allRectangles);
    return allRectangles;
}
function fillWithPack(imageData, node) {
    const newImage = figma.createImage(imageData);
    const fills = clone(node.fills);
    for (const paint of fills) {
        paint.type = "IMAGE";
        paint.scaleMode = "FILL";
        delete paint.color;
        paint.imageHash = newImage.hash;
    }
    node.fills = fills;
    return node;
}
function clone(val) {
    return JSON.parse(JSON.stringify(val));
}
