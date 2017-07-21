function get_canvas_hovers() {
    var fill_text = centered_multiline_fill_text;
    var custom_shadow = centered_shadow;

    return function (node, context, settings) {
        var fontStyle = settings('hoverFontStyle') || settings('fontStyle'),
            prefix = settings('prefix') || '',
            size = node[prefix + 'size'],
            fontSize = (settings('labelSize') === 'fixed') ?
                settings('defaultLabelSize') :
                settings('labelSizeRatio') * size;

        // Label background:
        context.font = (fontStyle ? fontStyle + ' ' : '') +
            fontSize + 'px ' + (settings('hoverFont') || settings('font'));

        context.beginPath();
        context.fillStyle = settings('labelHoverBGColor') === 'node' ?
            (node.color || settings('defaultNodeColor')) :
            settings('defaultHoverLabelBGColor');

        if (node.label && settings('labelHoverShadow')) {
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.shadowBlur = 8;
            context.shadowColor = settings('labelHoverShadowColor');
        }

        if (node.label && typeof node.label === 'string') {
            custom_shadow(context, node, prefix, size, fontSize);

            context.closePath();
            context.fill();

            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.shadowBlur = 0;
        }

        // Node border:
        if (settings('borderSize') > 0) {
            context.beginPath();
            context.fillStyle = settings('nodeBorderColor') === 'node' ?
                (node.color || settings('defaultNodeColor')) :
                settings('defaultNodeBorderColor');
            context.arc(
                node[prefix + 'x'],
                node[prefix + 'y'],
                size + settings('borderSize'),
                0,
                Math.PI * 2,
                true
            );
            context.closePath();
            context.fill();
        }

        // Node:
        var nodeRenderer = sigma.canvas.nodes[node.type] || sigma.canvas.nodes.def;
        // nodeRenderer(node, context, settings);

        // Display the label:
        if (node.label && typeof node.label === 'string') {
            context.fillStyle = (settings('labelHoverColor') === 'node') ?
                (node.color || settings('defaultNodeColor')) :
                settings('defaultLabelHoverColor');

            fill_text(context, node, prefix, size, fontSize);
        }
    };
}