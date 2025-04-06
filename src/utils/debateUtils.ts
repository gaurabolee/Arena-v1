
// Format a date to a relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  let counter;
  for (const [unit, seconds] of Object.entries(intervals)) {
    counter = Math.floor(diffInSeconds / seconds);
    if (counter > 0) {
      return counter === 1 
        ? `1 ${unit} ago` 
        : `${counter} ${unit}s ago`;
    }
  }
  
  return 'just now';
};

// Limit text to a certain number of words
export const truncateText = (text: string, wordLimit: number): string => {
  const words = text.split(' ');
  if (words.length <= wordLimit) {
    return text;
  }
  
  return words.slice(0, wordLimit).join(' ') + '...';
};

// Generate a unique ID for messages or other elements
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Sort debates by activity (most recent first)
export const sortDebatesByActivity = <T extends { messages: number }>(debates: T[]): T[] => {
  return [...debates].sort((a, b) => b.messages - a.messages);
};

// Sort debates by popularity (most participants first)
export const sortDebatesByPopularity = <T extends { participants: number }>(debates: T[]): T[] => {
  return [...debates].sort((a, b) => b.participants - a.participants);
};

// Filter debates by status
export const filterDebatesByStatus = <T extends { status: string }>(
  debates: T[],
  status: string
): T[] => {
  if (status === 'all') {
    return debates;
  }
  
  return debates.filter(debate => debate.status === status);
};

// Filter debates by category
export const filterDebatesByCategory = <T extends { category: string }>(
  debates: T[],
  category: string
): T[] => {
  if (category === 'All') {
    return debates;
  }
  
  return debates.filter(debate => debate.category === category);
};

// Search debates by term
export const searchDebatesByTerm = <T extends { title: string; description: string }>(
  debates: T[],
  term: string
): T[] => {
  if (!term) {
    return debates;
  }
  
  const lowercaseTerm = term.toLowerCase();
  return debates.filter(debate => 
    debate.title.toLowerCase().includes(lowercaseTerm) ||
    debate.description.toLowerCase().includes(lowercaseTerm)
  );
};
