import React from 'react';

const LyricInput = ({ value, onChange }) => {
    return (
        <div className="bg-gray-800 p-3 lg:p-6 rounded-lg shadow-lg flex flex-col">
            <h2 className="text-xl font-semibold mb-2 lg:mb-4 text-white">Lyrics</h2>
            <textarea
                className="w-full bg-gray-700 text-white p-3 lg:p-4 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm resize-y"
                placeholder="Paste your lyrics here...&#10;One line per screen."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={6}
            />
            <p className="text-xs text-gray-400 mt-2 space-y-1">
                <span className="block">Tip: Each line will be displayed as a separate scene.</span>
                <span className="block text-blue-400">Tip: Use a single underscore (_) on a line to create a 1-second pause.</span>
            </p>
        </div>
    );
};

export default LyricInput;
