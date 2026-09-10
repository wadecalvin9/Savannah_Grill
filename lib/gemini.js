/**
 * lib/gemini.js
 * 
 * Compatibility wrapper re-exporting the internal culinary recommendation engine.
 * Recommendations are powered directly on-device by lib/recommendations.js with zero
 * external API dependencies, avoiding network latency, rate limits, and 400/403 errors.
 */

export {
    inferCategoryType,
    getFallbackRecommendations,
    getPersonalizedRecommendations,
    getPersonalizedRecommendationsSync,
    getDishPairings,
    getDishPairingsSync,
} from './recommendations.js';
