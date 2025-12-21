import React from 'react';
import { Edit3, MonitorPlay } from 'lucide-react';

const MobileTabControl = ({ activeTab, onTabChange }) => {
    return (
        <div className="lg:hidden flex bg-gray-800 p-1 rounded-lg mb-4 sticky top-0 z-50 shadow-lg border border-gray-700">
            <button
                onClick={() => onTabChange('editor')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'editor'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-400 hover:text-gray-200'
                    }`}
            >
                <Edit3 size={16} />
                Editor
            </button>
            <button
                onClick={() => onTabChange('preview')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'preview'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-400 hover:text-gray-200'
                    }`}
            >
                <MonitorPlay size={16} />
                Preview
            </button>
        </div>
    );
};

export default MobileTabControl;
