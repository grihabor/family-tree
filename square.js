sigma.canvas.nodes.square = function (node, context, settings) {
    var prefix = settings('prefix') || '',
        size = node[prefix + 'size'];

    context.fillStyle = node.color || settings('defaultNodeColor');
    context.beginPath();
    context.rect(
        node[prefix + 'x'] - size,
        node[prefix + 'y'] - size,
        size * 2,
        size * 2
    );

    context.closePath();
    context.fill();
};
