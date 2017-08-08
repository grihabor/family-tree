function get_canvas_labels() {

    var fill_text = centered_multiline_fill_text;

    return function (node, context, settings) {
        var fontSize,
            prefix = settings('prefix') || '',
            size = node[prefix + 'size'];

        if (size < settings('labelThreshold') && !node.forceDrawLabels)
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
