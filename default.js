
function get_label_size(context, node, size, fontSize) {
    var i,
        label_size,
        label_line,
        textWidth,
        maxTextWidth = 0,
        label_lines = node.label.split(' ');

    

    for (i in label_lines) {
        label_line = label_lines[i];
        textWidth = context.measureText(label_line).width;
        if (maxTextWidth < textWidth) {
            maxTextWidth = textWidth;
        }
    }

    label_size = {};
    label_size.width = maxTextWidth;
    label_size.line_height = fontSize * 1.2;
    label_size.height = label_lines.length * label_size.line_height;
    label_size.height_offset = size * 2;
    return label_size;
}

function get_rect(context, node, prefix, size, fontSize) {
    var rect = {},
        label_size = get_label_size(context, node, size, fontSize);

    rect.width = label_size.width * 1.2;
    rect.height = label_size.height + fontSize * 0.6;
    rect.x = node[prefix + 'x'] - rect.width / 2;
    rect.y = node[prefix + 'y'] + label_size.height_offset - fontSize * 1.2;
    return rect;
}


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
        label_lines = node.label.split(' '),
        label_size = get_label_size(context, node, size, fontSize);

    context.textAlign = 'center';

    for (i in label_lines) {
        label_line = label_lines[i];

        context.fillText(
            label_line,
            Math.round(node[prefix + 'x']),
            Math.round(node[prefix + 'y'] + label_size.height_offset
                + label_size.line_height * parseInt(i))
        );
    }

    node.labelWidth = label_size.width; // important for clicks
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

function default_shadow(context, node, prefix, size, fontSize) {
    var x,
        y,
        w,
        h,
        e;
        
    x = Math.round(node[prefix + 'x'] - fontSize / 2 - 2);
    y = Math.round(node[prefix + 'y'] - fontSize / 2 - 2);
    w = Math.round(
                context.measureText(node.label).width + fontSize / 2 + size + 7
            );
    h = Math.round(fontSize + 4);
    e = Math.round(fontSize / 2 + 2);

            context.moveTo(x, y + e);  // leftmost point
            context.arcTo(x, y, x + e, y, e);  // quarter of circle to the top of the node circle
            context.lineTo(x + w, y);
            context.lineTo(x + w, y + h);
            context.lineTo(x + e, y + h);
            context.arcTo(x, y + h, x, y + h - e, e);
            context.lineTo(x, y + e);
}




function centered_shadow(context, node, prefix, size, fontSize) {
    var x,
        y,
        grid_x,
        grid_y,
        diameter,
        radius,
        rect = get_rect(context, node, prefix, size, fontSize);

    diameter = fontSize + 4;
    radius = diameter / 2;
    x = node[prefix + 'x'];
    y = node[prefix + 'y'];


    grid_x = [
        Math.round(x - rect.width / 2),
        Math.round(x - radius),
        Math.round(x),
        Math.round(x + radius),
        Math.round(x + rect.width / 2)
    ];
    grid_y = [
        Math.round(y - radius),
        Math.round(y),
        Math.round(rect.y),
        Math.round(rect.y + rect.height)
    ];
    radius = Math.round(radius);


    context.moveTo(grid_x[2], grid_y[0]);
    context.arcTo(
        grid_x[3], grid_y[0],
        grid_x[3], grid_y[1],
        radius
    );
    context.lineTo(grid_x[3], grid_y[2]);
    context.lineTo(grid_x[4], grid_y[2]);
    context.lineTo(grid_x[4], grid_y[3]);
    context.lineTo(grid_x[0], grid_y[3]);
    context.lineTo(grid_x[0], grid_y[2]);
    context.lineTo(grid_x[1], grid_y[2]);
    context.lineTo(grid_x[1], grid_y[1]);
    context.arcTo(
        grid_x[1], grid_y[0],
        grid_x[2], grid_y[0],
        radius
    );
}


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

