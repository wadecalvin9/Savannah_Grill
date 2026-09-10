/**
 * lib/recommendations.js
 * 
 * High-performance, offline-capable internal culinary recommendation engine for Savannah Grill.
 * Replaces external cloud LLM calls with rule-based flavor profiling, category affinity scoring,
 * and order history intelligence. Zero latency, 100% reliable, zero API key dependencies.
 */

/**
 * Infer the culinary category type of a menu item from its metadata
 */
export const inferCategoryType = (item) => {
    if (!item) return 'main';

    // 1. First check explicit category name if available
    const catName = [
        item.category_name,
        typeof item.categories === 'string' ? item.categories : item.categories?.name,
    ].filter(Boolean).join(' ').toLowerCase();

    if (/\b(beverage|drink|cocktail|mocktail|wine|beer|bar|juice|coffee|tea)s?\b/i.test(catName)) return 'beverage';
    if (/\b(dessert|sweet|cake|pastr)s?\b/i.test(catName)) return 'dessert';
    if (/\b(side|starter|appetizer|extra)s?\b/i.test(catName)) return 'side';
    if (/\b(burger|sandwich|wrap)s?\b/i.test(catName)) return 'burger';
    if (/\b(grill|steak|rib|bbq|meat)s?\b/i.test(catName)) return 'grill';
    if (/\b(chicken|poultry)s?\b/i.test(catName)) return 'chicken';
    if (/\b(fish|seafood)s?\b/i.test(catName)) return 'seafood';

    // 2. Fall back to item name & description analysis with word boundaries
    const combined = [item.name, item.description].filter(Boolean).join(' ').toLowerCase();

    if (/\b(drink|beverage|cocktail|mocktail|wine|beer|shake|smoothie|juice|soda|water|coffee|tea|cider)s?\b/i.test(combined)) {
        return 'beverage';
    }
    if (/\b(dessert|cake|ice cream|chocolate|pudding|sweet|brownie|pie|cheesecake|waffle)s?\b/i.test(combined)) {
        return 'dessert';
    }
    if (/\b(side|fries|onion ring|chips|mash|potato|salad|sauce|starter|appetizer|wings?|bread|soup|slaw)s?\b/i.test(combined)) {
        return 'side';
    }
    if (/\b(burger|sandwich|slider|wrap|roll)s?\b/i.test(combined)) {
        return 'burger';
    }
    if (/\b(steak|rib|ribeye|grill|bbq|pork|chop|sirloin|t-bone|tomahawk|lamb|beef|brisket|ny strip|fillet)s?\b/i.test(combined)) {
        return 'grill';
    }
    if (/\b(chicken|poultry|roast chicken)s?\b/i.test(combined)) {
        return 'chicken';
    }
    if (/\b(fish|salmon|tilapia|shrimp|prawn|seafood|calamari)s?\b/i.test(combined)) {
        return 'seafood';
    }
    return 'main';
};

/**
 * Complementary pairing matrix: which category pairs best with which
 */
const COMPLEMENTARY_WEIGHTS = {
    grill: { side: 45, beverage: 35, dessert: 20, grill: 10, main: 10, burger: 5 },
    burger: { side: 45, beverage: 40, dessert: 20, burger: 10, main: 10, grill: 5 },
    chicken: { side: 40, beverage: 35, dessert: 20, grill: 15, burger: 10 },
    seafood: { side: 40, beverage: 35, dessert: 20, salad: 30, grill: 10 },
    main: { side: 40, beverage: 35, dessert: 20, main: 10 },
    side: { grill: 45, burger: 40, chicken: 35, beverage: 30, side: 10 },
    beverage: { grill: 40, burger: 40, dessert: 35, side: 25, beverage: 10 },
    dessert: { beverage: 50, dessert: 15, grill: 5, burger: 5 },
};

/**
 * Keyword harmony boosts for flavor pairings
 */
const PAIRING_KEYWORDS = [
    { target: /\b(steak|beef|grill|rib|meat)\b/i, matches: [/\bsauce\b/i, /\bfries\b/i, /\bmash\b/i, /\bwine\b/i, /\bbeer\b/i, /\bspinach\b/i, /\bsalad\b/i], boost: 20 },
    { target: /\bburger\b/i, matches: [/\bfries\b/i, /\bring\b/i, /\bshake\b/i, /\bsoda\b/i, /\bcoke\b/i, /\bslaw\b/i, /\bwings?\b/i], boost: 20 },
    { target: /\bchicken\b/i, matches: [/\bslaw\b/i, /\bfries\b/i, /\blemon\b/i, /\bgarlic\b/i, /\bsalad\b/i, /\btea\b/i], boost: 18 },
    { target: /\b(fish|seafood)\b/i, matches: [/\blemon\b/i, /\btartar\b/i, /\bsalad\b/i, /\brice\b/i, /\bwhite wine\b/i], boost: 18 },
    { target: /\b(dessert|cake|pie)\b/i, matches: [/\bcoffee\b/i, /\bespresso\b/i, /\bice cream\b/i, /\bshake\b/i, /\btea\b/i], boost: 22 },
];

/**
 * Dynamic culinary badge generator based on item and context
 */
const getBadgeReason = (item, type, isComplementary = false, isFavoriteCategory = false) => {
    switch (type) {
        case 'grill':
            if (isFavoriteCategory) return "Chef's signature cut";
            return (item.rating && item.rating >= 4.8) ? "Master grill cut" : "Savory grill classic";
        case 'burger':
            return isFavoriteCategory ? "Top burger pick" : "House craft burger";
        case 'side':
            return isComplementary ? "Crisp companion side" : "Chef's side selection";
        case 'beverage':
            return isComplementary ? "Refreshing pairing" : "Signature thirst quencher";
        case 'dessert':
            return "Sweet finish";
        case 'seafood':
            return "Ocean fresh cut";
        case 'chicken':
            return "Golden flame roasted";
        default:
            return "House favorite";
    }
};

/**
 * Fallback recommendations: balanced signature picks across diverse categories
 */
export const getFallbackRecommendations = (allMenuItems = [], limit = 4, excludeId = null) => {
    const pool = (allMenuItems || []).filter(item => item && item.$id !== excludeId);
    if (pool.length === 0) return [];

    // Group items by category type to ensure variety
    const categorized = new Map();
    pool.forEach(item => {
        const type = inferCategoryType(item);
        if (!categorized.has(type)) categorized.set(type, []);
        categorized.get(type).push(item);
    });

    // Sort items within each category by rating desc
    categorized.forEach((items) => {
        items.sort((a, b) => (parseFloat(b.rating) || 4.5) - (parseFloat(a.rating) || 4.5));
    });

    // Preferred diverse category order for the showcase
    const priorityTypes = ['grill', 'burger', 'side', 'beverage', 'dessert', 'chicken', 'seafood', 'main'];
    const results = [];
    const usedIds = new Set();

    // Round 1: Take the top rated item from distinct categories
    for (const type of priorityTypes) {
        if (results.length >= limit) break;
        const list = categorized.get(type);
        if (list && list.length > 0) {
            const pick = list.find(it => !usedIds.has(it.$id));
            if (pick) {
                usedIds.add(pick.$id);
                results.push({
                    ...pick,
                    curatedReason: getBadgeReason(pick, type, false, true),
                });
            }
        }
    }

    // Round 2: Fill remaining slots with the highest rated overall
    if (results.length < limit) {
        const remaining = pool
            .filter(item => !usedIds.has(item.$id))
            .sort((a, b) => (parseFloat(b.rating) || 4.5) - (parseFloat(a.rating) || 4.5));

        for (const item of remaining) {
            if (results.length >= limit) break;
            usedIds.add(item.$id);
            const itemType = inferCategoryType(item);
            results.push({
                ...item,
                curatedReason: getBadgeReason(item, itemType),
            });
        }
    }

    return results;
};

/**
 * Get personalized culinary recommendations based on user's past orders
 * 
 * @param {Array} myOrders - List of user's past order objects from GlobalContext
 * @param {Array} allMenuItems - List of all active menu items
 * @param {number} limit - Maximum number of recommendations to return
 */
export const getPersonalizedRecommendationsSync = ({ myOrders = [], allMenuItems = [], limit = 4 }) => {
    if (!allMenuItems || allMenuItems.length === 0) return [];

    // Extract ordered items
    const orderedDishIds = new Set();
    const orderedDishNames = new Set();
    const categoryFrequency = {};
    let totalSpend = 0;
    let totalItems = 0;

    (myOrders || []).forEach(order => {
        const items = order.items || [];
        items.forEach(it => {
            if (!it) return;
            if (it.$id) orderedDishIds.add(it.$id);
            if (it.id) orderedDishIds.add(it.id);
            if (it.name) orderedDishNames.add(it.name.toLowerCase());

            const cat = inferCategoryType(it);
            categoryFrequency[cat] = (categoryFrequency[cat] || 0) + (it.quantity || 1);

            const price = parseFloat(it.price) || 0;
            if (price > 0) {
                totalSpend += price * (it.quantity || 1);
                totalItems += (it.quantity || 1);
            }
        });
    });

    // If user has no orders, provide balanced signature showcase
    if (orderedDishNames.size === 0) {
        return getFallbackRecommendations(allMenuItems, limit);
    }

    // Identify user's top preferred category
    let topCategory = 'grill';
    let maxCount = 0;
    for (const [cat, count] of Object.entries(categoryFrequency)) {
        if (count > maxCount) {
            maxCount = count;
            topCategory = cat;
        }
    }

    const avgPrice = totalItems > 0 ? (totalSpend / totalItems) : 1000;
    const complementaryMap = COMPLEMENTARY_WEIGHTS[topCategory] || {};

    // Score every candidate menu item
    const scored = allMenuItems.map(item => {
        let score = 0;
        const itemType = inferCategoryType(item);
        const hasOrdered = orderedDishIds.has(item.$id) || orderedDishNames.has((item.name || '').toLowerCase());

        // 1. Category affinity
        if (itemType === topCategory) {
            score += 35; // Direct favorite category
        } else if (complementaryMap[itemType]) {
            score += complementaryMap[itemType]; // Complementary companion category
        } else {
            score += 10;
        }

        // 2. Discovery vs Repeat
        if (!hasOrdered) {
            score += 25; // Novelty bonus: encourage trying new dishes
        } else {
            score += 15; // Proven favorite bonus
        }

        // 3. Rating boost (0 to 25 points)
        const rating = parseFloat(item.rating) || 4.5;
        score += (rating / 5) * 25;

        // 4. Price affinity (within +/- 35% of avg order item price)
        const price = parseFloat(item.price) || 0;
        if (price > 0 && Math.abs(price - avgPrice) / avgPrice <= 0.35) {
            score += 15;
        }

        // Generate customized badge
        let reason;
        if (hasOrdered) {
            reason = "Your repeat favorite";
        } else if (itemType === topCategory) {
            reason = `Top pick in ${topCategory.charAt(0).toUpperCase() + topCategory.slice(1)}s`;
        } else if (complementaryMap[itemType]) {
            reason = itemType === 'side' ? "Pairs with your favorites" :
                     itemType === 'beverage' ? "Refreshing pairing" :
                     itemType === 'dessert' ? "Sweet complement" : "Curated pairing";
        } else {
            reason = "Crafted for your palate";
        }

        return {
            item,
            itemType,
            score,
            reason,
        };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Pick recommendations enforcing category diversity (max 2 items of same category type)
    const results = [];
    const categoryCount = {};
    const usedIds = new Set();

    for (const candidate of scored) {
        if (results.length >= limit) break;
        if (usedIds.has(candidate.item.$id)) continue;

        const currentCount = categoryCount[candidate.itemType] || 0;
        if (currentCount < 2) {
            categoryCount[candidate.itemType] = currentCount + 1;
            usedIds.add(candidate.item.$id);
            results.push({
                ...candidate.item,
                curatedReason: candidate.reason,
            });
        }
    }

    // Fill any remaining slots if diversity was too restrictive
    if (results.length < limit) {
        for (const candidate of scored) {
            if (results.length >= limit) break;
            if (!usedIds.has(candidate.item.$id)) {
                usedIds.add(candidate.item.$id);
                results.push({
                    ...candidate.item,
                    curatedReason: candidate.reason,
                });
            }
        }
    }

    return results;
};

/**
 * Get culinary dish pairings for a specific dish
 * 
 * @param {Object} currentItem - Currently viewed dish object
 * @param {Array} allMenuItems - List of all active menu items
 * @param {number} limit - Number of pairings to return
 */
export const getDishPairingsSync = ({ currentItem, allMenuItems = [], limit = 3 }) => {
    if (!currentItem || !allMenuItems || allMenuItems.length === 0) return [];

    const availablePool = allMenuItems.filter(m => m && m.$id !== currentItem.$id);
    if (availablePool.length <= limit) return availablePool;

    const currentType = inferCategoryType(currentItem);
    const complementaryMap = COMPLEMENTARY_WEIGHTS[currentType] || {};
    const currentNameAndDesc = `${currentItem.name || ''} ${currentItem.description || ''}`.toLowerCase();

    const scored = availablePool.map(item => {
        let score = 0;
        const candidateType = inferCategoryType(item);

        // 1. Complementary category boost
        if (complementaryMap[candidateType]) {
            score += complementaryMap[candidateType];
        } else if (candidateType === currentType) {
            score += 10; // Avoid identical category dominance
        } else {
            score += 15;
        }

        // 2. Flavor keyword resonance
        const candidateText = `${item.name || ''} ${item.description || ''}`.toLowerCase();
        for (const rule of PAIRING_KEYWORDS) {
            if (rule.target.test(currentNameAndDesc)) {
                for (const matchRegex of rule.matches) {
                    if (matchRegex.test(candidateText)) {
                        score += rule.boost;
                        break;
                    }
                }
            }
        }

        // 3. Rating weight
        const rating = parseFloat(item.rating) || 4.5;
        score += (rating / 5) * 20;

        // Contextual pairing reason
        let reason = "Chef's recommended pairing";
        if (candidateType === 'side') reason = "Savory companion side";
        else if (candidateType === 'beverage') reason = "Refreshing beverage pairing";
        else if (candidateType === 'dessert') reason = "Delightful sweet finish";

        return {
            item,
            candidateType,
            score,
            reason,
        };
    });

    // Sort by score desc
    scored.sort((a, b) => b.score - a.score);

    // Pick top items ensuring no more than 2 of identical type
    const results = [];
    const typeCount = {};
    const usedIds = new Set();

    for (const c of scored) {
        if (results.length >= limit) break;
        if (usedIds.has(c.item.$id)) continue;

        const count = typeCount[c.candidateType] || 0;
        if (count < 2) {
            typeCount[c.candidateType] = count + 1;
            usedIds.add(c.item.$id);
            results.push({
                ...c.item,
                curatedReason: c.reason,
            });
        }
    }

    if (results.length < limit) {
        for (const c of scored) {
            if (results.length >= limit) break;
            if (!usedIds.has(c.item.$id)) {
                usedIds.add(c.item.$id);
                results.push({
                    ...c.item,
                    curatedReason: c.reason,
                });
            }
        }
    }

    return results;
};

/**
 * Async wrappers for compatibility with existing async calls
 */
export const getPersonalizedRecommendations = async (params) => {
    return getPersonalizedRecommendationsSync(params);
};

export const getDishPairings = async (params) => {
    return getDishPairingsSync(params);
};
