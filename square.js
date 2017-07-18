sigma.canvas.labels.square = function(node, context, settings) {
    // declarations
    var prefix = settings('prefix') || '';
    var size = node[prefix + 'size'];
    var nodeX = node[prefix + 'x'];
    var nodeY = node[prefix + 'y'];
    var textWidth;
    // define settings
    context.fillStyle = node.textColor;
    context.lineWidth = size * 0.1;
    context.font = '400 ' + size + 'px AvenirNext';
    context.textAlign = 'center';
    context.fillText(node.label, nodeX, nodeY + size * 0.375 * 5.);
    // measure text width
    textWidth = context.measureText(node.label).width
    node.labelWidth = textWidth; // important for clicks
};
sigma.canvas.nodes.square = function(node, context, settings) {
    // declarations
    var prefix = settings('prefix') || '';
    var size = node[prefix + 'size'];
    var nodeX = node[prefix + 'x'];
    var nodeY = node[prefix + 'y'];
    var textWidth;
    // define settings
    context.fillStyle = node.fillColor;
    context.strokeStyle = node.color || settings('defaultNodeColor');
    context.lineWidth = size * 0.1;
    context.font = '400 ' + size + 'px AvenirNext';
    // measure text width
    textWidth = context.measureText(node.label).width;
    // draw path
    context.beginPath();
    context.rect(
        nodeX - (textWidth * 1.2) * 0.5,
        nodeY - size * 1.2 * 0.5,
        textWidth * 1.2,
        size * 1.2
    );
    context.closePath();
    context.fill();
    context.stroke();
};