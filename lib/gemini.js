/**
 * lib/gemini.js
 * 
 * Culinary recommendation service for Savannah Grill powered by Gemini 3.1 Flash-Lite (Free Tier).
 * Provides order-history-based and dish-pairing recommendations with zero "AI" buzzwords in the UI.
 */

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "AIzaSyCDEZWtmaSbYh8KbWJfjbqHgVjZ3RIOZIU";
const MODEL_NAME = "gemini-3.1-flash-lite";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

// In-memory cache to prevent unnecessary API calls and stay well within free tier
const memoryCache = new Map();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Clean and parse JSON response safely from Gemini output
 */
const safeParseJson = (rawText) => {
    if (!rawText) return null;
    try {
        // Strip markdown code blocks like ```json ... ```
        const clean = rawText
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
        return JSON.parse(clean);
    } catch (e) {
        console.warn('Gemini JSON parse warning:', e?.message);
        return null;
    }
};

/**
 * Fallback recommendations when user has no orders or network/AI is unavailable
 */
const getFallbackRecommendations = (allMenuItems = [], limit = 4, excludeId = null) => {
    const pool = (allMenuItems || []).filter(item => item && item.$id !== excludeId);
    if (pool.length === 0) return [];

    // Sort by rating desc, or highest rated
    const sorted = [...pool].sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    const fallbackNotes = [
        "House favorite",
        "Chef's signature cut",
        "Savory grill classic",
        "Popular guest pairing"
    ];

    return sorted.slice(0, limit).map((item, idx) => ({
        ...item,
        curatedReason: fallbackNotes[idx % fallbackNotes.length],
    }));
};

/**
 * Get personalized recommendations for a customer based on their past orders
 * 
 * @param {Array} myOrders - List of user's past order objects from GlobalContext
 * @param {Array} allMenuItems - List of all active menu items
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Promise<Array>} Array of menu items with curatedReason attached
 */
export const getPersonalizedRecommendations = async ({ myOrders = [], allMenuItems = [], limit = 4 }) => {
    if (!allMenuItems || allMenuItems.length === 0) return [];

    // 1. Extract previously ordered dish names
    const orderedDishNames = [];
    const orderedDishIds = new Set();

    (myOrders || []).forEach(order => {
        const items = order.items || [];
        items.forEach(it => {
            if (it?.name && !orderedDishNames.includes(it.name)) {
                orderedDishNames.push(it.name);
            }
            if (it?.$id) orderedDishIds.add(it.$id);
            if (it?.id) orderedDishIds.add(it.id);
        });
    });

    // If customer has no previous orders, return top signature dishes
    if (orderedDishNames.length === 0) {
        return getFallbackRecommendations(allMenuItems, limit);
    }

    // 2. Check cache
    const cacheKey = `curated_${orderedDishNames.sort().join('_')}_${limit}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        return cached.items;
    }

    // 3. Prepare compact menu summary for the prompt
    const menuSummary = allMenuItems.map(m => 
        `ID: ${m.$id} | Name: ${m.name} | Category: ${m.category_name || m.categories || 'Grill'} | Price: KES ${m.price} | Desc: ${m.description ? m.description.slice(0, 70) : ''}`
    ).join('\n');

    const prompt = `You are the executive culinary director at Savannah Grill.
Based on this customer's past orders: ${orderedDishNames.join(', ')}.
Recommend ${limit} items from the available menu that best complement and elevate their dining profile.

Available Menu:
${menuSummary}

Rules:
1. Select exactly ${limit} different items by their exact ID from the available menu.
2. For each item, provide a short, appetizing culinary note (max 6 words, e.g. "Smoky pairing for grilled steaks", "Crisp palate cleanser", "Rich & tender house cut").
3. DO NOT mention "AI", "algorithm", "data", or "machine learning". Keep the language natural and culinary.
4. Respond ONLY with a valid JSON array of objects:
[
  { "id": "exact_item_id", "reason": "Short culinary note" }
]`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 500,
                }
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn(`Gemini recommendations HTTP ${response.status}`);
            return getFallbackRecommendations(allMenuItems, limit);
        }

        const data = await response.json();
        const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = safeParseJson(rawContent);

        if (Array.isArray(parsed) && parsed.length > 0) {
            const menuMap = new Map(allMenuItems.map(m => [m.$id, m]));
            const results = [];

            for (const rec of parsed) {
                const menuItem = menuMap.get(rec.id);
                if (menuItem && !results.some(r => r.$id === menuItem.$id)) {
                    results.push({
                        ...menuItem,
                        curatedReason: rec.reason || "Pairs with your favorites",
                    });
                }
            }

            if (results.length > 0) {
                // If AI returned fewer than requested, fill with top rated
                if (results.length < limit) {
                    const existingIds = new Set(results.map(r => r.$id));
                    const fillers = allMenuItems.filter(m => !existingIds.has(m.$id));
                    results.push(...fillers.slice(0, limit - results.length).map(f => ({
                        ...f,
                        curatedReason: "Guest favorite"
                    })));
                }

                memoryCache.set(cacheKey, { timestamp: Date.now(), items: results });
                return results;
            }
        }

        return getFallbackRecommendations(allMenuItems, limit);
    } catch (err) {
        console.warn('Gemini recommendation notice (fallback used):', err?.message);
        return getFallbackRecommendations(allMenuItems, limit);
    }
};

/**
 * Get culinary pairings for a specific menu item (used on menu/[id].jsx)
 * 
 * @param {Object} currentItem - Currently viewed dish object
 * @param {Array} allMenuItems - List of all active menu items
 * @param {number} limit - Number of pairings to return
 * @returns {Promise<Array>} Array of paired menu items
 */
export const getDishPairings = async ({ currentItem, allMenuItems = [], limit = 3 }) => {
    if (!currentItem || !allMenuItems || allMenuItems.length === 0) return [];

    const cacheKey = `pairing_${currentItem.$id}_${limit}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        return cached.items;
    }

    const availablePool = allMenuItems.filter(m => m.$id !== currentItem.$id);
    if (availablePool.length <= limit) return availablePool;

    const menuSummary = availablePool.map(m => 
        `ID: ${m.$id} | Name: ${m.name} | Category: ${m.category_name || m.categories || 'Grill'}`
    ).join('\n');

    const prompt = `You are Savannah Grill's executive chef.
A customer is ordering: "${currentItem.name}" (${currentItem.description || ''}).
Select ${limit} complementary items from the menu that pair best with this dish (such as refreshing sides, sauces, drinks, or complementary cuts).

Menu:
${menuSummary}

Respond ONLY with a valid JSON array of ${limit} strings representing the exact IDs:
["id1", "id2", "id3"]`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2, maxOutputTokens: 200 }
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return getFallbackRecommendations(availablePool, limit, currentItem.$id);
        }

        const data = await response.json();
        const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = safeParseJson(rawContent);

        if (Array.isArray(parsed) && parsed.length > 0) {
            const menuMap = new Map(availablePool.map(m => [m.$id, m]));
            const results = [];

            for (const id of parsed) {
                const item = menuMap.get(id);
                if (item && !results.some(r => r.$id === item.$id)) {
                    results.push(item);
                }
            }

            if (results.length > 0) {
                memoryCache.set(cacheKey, { timestamp: Date.now(), items: results });
                return results;
            }
        }

        return getFallbackRecommendations(availablePool, limit, currentItem.$id);
    } catch (err) {
        return getFallbackRecommendations(availablePool, limit, currentItem.$id);
    }
};
