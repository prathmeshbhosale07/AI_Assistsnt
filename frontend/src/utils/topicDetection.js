export const TOPIC_BACKGROUNDS = {
  default: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=100&w=3840&auto=format&fit=crop", 
  robotics: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?q=100&w=3840&auto=format&fit=crop", 
  coding: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=100&w=3840&auto=format&fit=crop", 
  nature: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=100&w=3840&auto=format&fit=crop", 
  space: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=100&w=3840&auto=format&fit=crop",
  travel: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=100&w=3840&auto=format&fit=crop", // Vintage travel van landscape
  music: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=100&w=3840&auto=format&fit=crop", // DJ booth / music concert
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=100&w=3840&auto=format&fit=crop", // Athletic runner track sunset
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=100&w=3840&auto=format&fit=crop", // Gorgeous flatlay food prep
  science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=100&w=3840&auto=format&fit=crop" // Glowing scientific imagery
};

const TOPIC_KEYWORDS = {
  robotics: ["robot", "robotics", "ai", "artificial intelligence", "machine learning", "automation", "android", "cybernetics"],
  coding: ["code", "programming", "developer", "software", "javascript", "python", "react", "html", "css", "database", "api"],
  nature: ["nature", "mountain", "forest", "tree", "ocean", "river", "animal", "wildlife", "landscape", "earth", "environment"],
  space: ["space", "galaxy", "universe", "planet", "star", "astronomy", "cosmos", "orbit", "moon", "sun", "alien"],
  travel: ["travel", "trip", "vacation", "flight", "hotel", "beach", "city", "tourist", "tourism", "adventure", "explore", "country"],
  music: ["music", "song", "album", "artist", "band", "guitar", "piano", "sing", "concert", "dj", "audio", "sound"],
  sports: ["sports", "football", "basketball", "soccer", "baseball", "tennis", "gym", "workout", "fitness", "athlete", "run", "swim", "play"],
  food: ["food", "eat", "cook", "recipe", "restaurant", "meal", "dinner", "lunch", "breakfast", "delicious", "kitchen", "chef"],
  science: ["science", "physics", "biology", "chemistry", "experiment", "laboratory", "research", "scientist", "quantum", "molecule"]
};

/**
 * Detects the most prominent topic from a given string.
 * @param {string} text - The user message text
 * @returns {string} The detected topic key, or "default" if none found.
 */
export const detectTopic = (text) => {
  if (!text) return "default";
  
  const lowercaseText = text.toLowerCase();
  
  // Count matches for each topic
  const scores = Object.keys(TOPIC_KEYWORDS).map(topic => {
    const keywords = TOPIC_KEYWORDS[topic];
    let score = 0;
    
    for (const keyword of keywords) {
      // Create word boundary regex to find whole words only
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowercaseText.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    
    return { topic, score };
  });
  
  // Sort by highest score
  scores.sort((a, b) => b.score - a.score);
  
  // Return the highest scoring topic if score is > 0
  if (scores[0].score > 0) {
    return scores[0].topic;
  }
  
  return "default";
};
