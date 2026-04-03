/**
 * AI Matching Engine using TF-IDF cosine similarity
 * Matches company needs against other companies' offerings
 */

function tokenize(text) {
  if (!text) return [];
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
}

function buildTFIDF(docs) {
  const N = docs.length;
  const df = {};
  const tfs = docs.map((doc) => {
    const tokens = tokenize(doc);
    const tf = {};
    tokens.forEach((t) => { tf[t] = (tf[t] || 0) + 1; });
    Object.keys(tf).forEach((t) => { tf[t] /= tokens.length || 1; });
    return tf;
  });
  tfs.forEach((tf) => {
    Object.keys(tf).forEach((t) => { df[t] = (df[t] || 0) + 1; });
  });
  return tfs.map((tf) => {
    const tfidf = {};
    Object.keys(tf).forEach((t) => {
      tfidf[t] = tf[t] * Math.log((N + 1) / (df[t] + 1));
    });
    return tfidf;
  });
}

function cosineSimilarity(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, magA = 0, magB = 0;
  keys.forEach((k) => {
    const a = vecA[k] || 0;
    const b = vecB[k] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Rank companies for a given company based on needs vs offerings
 * @param {Object} targetCompany - the company to find matches for
 * @param {Array} allCompanies - all other companies
 * @returns {Array} sorted matches with scores
 */
function rankMatches(targetCompany, allCompanies) {
  const others = allCompanies.filter((c) => c.id !== targetCompany.id);
  if (others.length === 0) return [];

  // Build corpus: target needs vs others' offerings
  const targetNeeds = targetCompany.needs || '';
  const targetOfferings = targetCompany.offerings || '';

  const results = others.map((company) => {
    const companyOfferings = company.offerings || '';
    const companyNeeds = company.needs || '';

    // Score 1: target needs vs company offerings
    const docs1 = [targetNeeds, companyOfferings];
    const [v1, v2] = buildTFIDF(docs1);
    const needsScore = cosineSimilarity(v1, v2);

    // Score 2: company needs vs target offerings (mutual benefit)
    const docs2 = [companyNeeds, targetOfferings];
    const [v3, v4] = buildTFIDF(docs2);
    const offeringsScore = cosineSimilarity(v3, v4);

    // Also check product names/descriptions
    const productText = (company.product_names || '').toLowerCase();
    const docs3 = [targetNeeds, productText];
    const [v5, v6] = buildTFIDF(docs3);
    const productScore = cosineSimilarity(v5, v6);

    const finalScore = (needsScore * 0.45) + (offeringsScore * 0.35) + (productScore * 0.2);

    return {
      company,
      score: parseFloat(finalScore.toFixed(4)),
      needsScore: parseFloat(needsScore.toFixed(4)),
      offeringsScore: parseFloat(offeringsScore.toFixed(4)),
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

module.exports = { rankMatches };
