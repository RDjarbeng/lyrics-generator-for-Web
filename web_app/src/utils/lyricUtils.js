export const parseLyrics = (text, baseTime, charMultiplier) => {
    if (!text) return [];

    return text.split('\n').filter(line => line.trim() !== '').map(line => {
        const cleanLine = line.trim();

        // Check for silence character
        if (cleanLine === '_') {
            return {
                text: '',
                duration: 1.0 // Fixed 1 second pause
            };
        }

        // Calculate duration: Base + (Length * Multiplier)
        const duration = baseTime + (cleanLine.length * charMultiplier);
        return {
            text: cleanLine,
            duration: parseFloat(duration.toFixed(2))
        };
    });
};

export const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    // Draw lines centered
    const totalHeight = lines.length * lineHeight;
    let startY = y - (totalHeight / 2) + (lineHeight / 2);

    lines.forEach((l, i) => {
        ctx.fillText(l.trim(), x, startY + (i * lineHeight));
    });
};
