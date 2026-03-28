export const getMediaUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Fallback to localhost if no env variable is set
    const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    return `${backendUrl}${path}`;
};
