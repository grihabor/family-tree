
// shared between labels and hovers
function default_fill_text(context, node, prefix, size, fontSize) {
        context.fillText(
            node.label,
            Math.round(node[prefix + 'x'] + size + 3),
            Math.round(node[prefix + 'y'] + fontSize / 3)
        );
    }

function centered_multiline_fill_text(context, node, prefix, size, fontSize) {
        var i,
            label_line,
            maxTextWidth = 0,
            label_lines = node.label.split(' ');

        context.textAlign = 'center';

        for (i in label_lines) {
            label_line = label_lines[i];
            context.fillText(
                label_line,
                Math.round(node[prefix + 'x']),
                Math.round(node[prefix + 'y'] + size * 2 + fontSize * 1.2 * parseInt(i))
            );
            textWidth = context.measureText(label_line).width;
            if (maxTextWidth < textWidth) {
                maxTextWidth = textWidth;
            }
        }

        node.labelWidth = maxTextWidth; // important for clicks
    }
    
    
function get_canvas_labels() {
    
    var fill_text = centered_multiline_fill_text;

    return function (node, context, settings) {
        var fontSize,
            prefix = settings('prefix') || '',
            size = node[prefix + 'size'];

        if (size < settings('labelThreshold'))
            return;

        if (!node.label || typeof node.label !== 'string')
            return;

        fontSize = (settings('labelSize') === 'fixed') ?
            settings('defaultLabelSize') :
            settings('labelSizeRatio') * size;

        context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
            fontSize + 'px ' + settings('font');
        context.fillStyle = (settings('labelColor') === 'node') ?
            (node.color || settings('defaultNodeColor')) :
            settings('defaultLabelColor');


        fill_text(context, node, prefix, size, fontSize);

    };
}


function get_canvas_nodes() {
    return function (node, context, settings) {
        var prefix = settings('prefix') || '';

        context.fillStyle = node.color || settings('defaultNodeColor');
        context.beginPath();
        context.arc(
            node[prefix + 'x'],
            node[prefix + 'y'],
            node[prefix + 'size'],
            0,
            Math.PI * 2,
            true
        );

        context.closePath();
        context.fill();
    };
}

function get_canvas_hovers() {
    
    var fill_text = centered_multiline_fill_text;
    
    return function (node, context, settings) {
        var x,
            y,
            w,
            h,
            e,
            fontStyle = settings('hoverFontStyle') || settings('fontStyle'),
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
            x = Math.round(node[prefix + 'x'] - fontSize / 2 - 2);
            y = Math.round(node[prefix + 'y'] - fontSize / 2 - 2);
            w = Math.round(
                context.measureText(node.label).width + fontSize / 2 + size + 7
            );
            h = Math.round(fontSize + 4);
            e = Math.round(fontSize / 2 + 2);

            context.moveTo(x, y + e);
            context.arcTo(x, y, x + e, y, e);
            context.lineTo(x + w, y);
            context.lineTo(x + w, y + h);
            context.lineTo(x + e, y + h);
            context.arcTo(x, y + h, x, y + h - e, e);
            context.lineTo(x, y + e);

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
        nodeRenderer(node, context, settings);

        // Display the label:
        if (node.label && typeof node.label === 'string') {
            context.fillStyle = (settings('labelHoverColor') === 'node') ?
                (node.color || settings('defaultNodeColor')) :
                settings('defaultLabelHoverColor');

            fill_text(context, node, prefix, size, fontSize);
        }
    };
}

