export const fetchJobs = async (role) => {
    try {
        const keyword = encodeURIComponent(role || 'developer');
        // Remotive provides a free, unauthenticated jobs API for remote roles
        const response = await fetch(`https://remotive.com/api/remote-jobs?search=${keyword}&limit=6`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        if (data && data.jobs) {
            return data.jobs.slice(0, 6); // ensure we only show top 6
        }
        
        return [];
    } catch (error) {
        console.error('Failed to fetch remote jobs:', error);
        return [];
    }
};
