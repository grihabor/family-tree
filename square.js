
rect_renderer = function(node, context, settings) {
    context.save();
    // declarations
    var prefix = settings('prefix') || '';
    var size = node[prefix + 'size'];
    var nodeX = node[prefix + 'x'];
    var nodeY = node[prefix + 'y'];
    var textWidth;
    // define settings
    context.fillStyle = "#ffffff";//node.fillColor;
    context.strokeStyle = node.color || settings('defaultNodeColor');
    context.lineWidth = size * 0.1;
    context.font = '400 ' + size + 'px AvenirNext';
    // measure text width
    textWidth = context.measureText(node.label).width;
    // draw path
    context.beginPath();
    context.rect(
        Math.round(nodeX - (textWidth * .6) * 0.5),
        Math.round(nodeY + size * .7),
        Math.round(textWidth * .6),
        Math.round(size * 4)
    );
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
};

text_renderer = function(node, context, settings) {
    context.save();
    // declarations
    var prefix = settings('prefix') || '';
    var size = node[prefix + 'size'];
    var nodeX = node[prefix + 'x'];
    var nodeY = node[prefix + 'y'];
    var textWidth;

    var label = node.label.split(' ');
    var i;
    var maxTextWidth = 0;

    // define settings
    context.fillStyle = node.textColor;
    context.lineWidth = size * 0.1;
    context.font = '400 ' + size + 'px AvenirNext';
    context.textAlign = 'center';
    // console.log(label, node.label);
    for (i in label){
        context.fillText(
            label[i],
            Math.round(nodeX),
            Math.round(nodeY + size * (2 + parseInt(i)))
        );
        textWidth = context.measureText(label[i]).width;
        if (maxTextWidth < textWidth) {
            maxTextWidth = textWidth;
        }
    }

    node.labelWidth = maxTextWidth; // important for clicks
    context.stroke();
    context.restore();
};



sigma.canvas.nodes.square = function(node, context, settings) {
    rect_renderer(node, context, settings);
};


sigma.canvas.labels.square = function(node, context, settings) {
    // text_renderer(node, context, settings);
};


sigma.canvas.hovers.square = function(node, context, settings) {
    rect_renderer(node, context, settings);
    text_renderer(node, context, settings);
};
