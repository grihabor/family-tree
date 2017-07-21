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
            Math.round(node[prefix + 'y'] + label_size.height_offset +
                label_size.line_height * parseInt(i))
        );
    }

    node.labelWidth = label_size.width; // important for clicks
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

    context.moveTo(x, y + e); // leftmost point
    context.arcTo(x, y, x + e, y, e); // quarter of circle to the top of the node circle
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


