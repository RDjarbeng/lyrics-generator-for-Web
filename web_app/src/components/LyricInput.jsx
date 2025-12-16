import React from 'react';

const LyricInput = ({ value, onChange }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Lyrics</h2>
            <textarea
                className="w-full h-64 bg-gray-700 text-white p-4 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono text-sm"
                placeholder="Paste your lyrics here...&#10;One line per screen."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-2">
                Tip: Each line will be displayed as a separate scene.
            </p>
        </div>
    );
};

export default LyricInput;
