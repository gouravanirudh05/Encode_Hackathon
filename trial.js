const nlp = require('compromise'); // Simple NLP library

function extractKeywords(question) {
  const doc = nlp(question);
  return {
    entities: doc.nouns().out('array'), // Extract nouns (e.g., 'laptops', 'HP')
    numbers: doc.numbers().out('array'), // Extract numbers (e.g., '75000')
    adjectives: doc.adjectives().out('array'), // Extract adjectives (e.g., 'top-rated')
  };
}

// Example usage
const question = "What are the touch screen laptops from HP under ₹75,000?";
//console.log(extractKeywords(question));
// Output: { entities: ['laptops', 'HP'], numbers: ['75000'], adjectives: ['top-rated'] }

const synonymMapping = {
    laptops: ['laptop', 'notebook', 'PC'],
    HP: ['HP', 'Hewlett-Packard'],
    price: ['₹', 'rupees', 'price', 'cost', 'under', 'below'],
    topRated: ['top-rated', 'best', 'highest-rated'],
    outOfStock: ['out-of-stock', 'unavailable', 'sold out'],
    touchscreen: ['touchscreen', 'touch display'],
  };
  
  function mapKeywordsToFields(keywords) {
    const fieldMapping = {
      laptops: { category: 'laptop' },
      HP: { brand: 'HP' },
      price: number => ({ price: { $lt: parseInt(number) } }), // Handle dynamic ranges
      topRated: { rating: { $gte: 4.0 } },
      outOfStock: { stock: 0 },
      touchscreen: { "specifications.touchscreen": true },
    };
  
    const mappedFields = [];
  
    // Match entities to field mappings or synonyms
    keywords.entities.forEach(entity => {
      for (const [field, synonyms] of Object.entries(synonymMapping)) {
        if (synonyms.includes(entity.toLowerCase())) {
          mappedFields.push(fieldMapping[field]);
        }
      }
    });
  
    // Process numeric values (e.g., prices)
    keywords.numbers.forEach(number => {
      if (number) {
        mappedFields.push(fieldMapping.price(number)); // Use the dynamic handler
      }
    });
  
    // Handle adjectives or descriptive terms
    keywords.adjectives.forEach(adj => {
      for (const [field, synonyms] of Object.entries(synonymMapping)) {
        if (synonyms.includes(adj.toLowerCase())) {
          mappedFields.push(fieldMapping[field]);
        }
      }
    });
  
    // Remove undefined mappings
    return mappedFields.filter(field => field);
  }
  
  // Example usage
  const keywords = {
    entities: ['laptops', 'HP'],
    numbers: ['75000'],
    adjectives: ['top-rated'],
  };
  
  console.log(mapKeywordsToFields(keywords));
  
  
  // Example usage
  //const keywords = extractKeywords(question);
//   console.log(keywords);
//   console.log(mapKeywordsToFields(keywords));
  // Output: [{ category: 'laptop' }, { brand: 'HP' }, { price: { $lt: 75000 } }, { rating: { $gte: 4.0 } }]

//   function buildQuery(mappedFields) {
//     const query = {};
//     mappedFields.forEach(field => {
//       for (const [key, value] of Object.entries(field)) {
//         if (query[key]) {
//           // Handle merging for conflicting fields
//           Object.assign(query[key], value);
//         } else {
//           query[key] = value;
//         }
//       }
//     });
//     return query;
//   }
  
//   // Example usage
//   const mappedFields = mapKeywordsToFields(keywords);
//   console.log(buildQuery(mappedFields));
//   // Output: { category: 'laptop', brand: 'HP', price: { $lt: 75000 }, rating: { $gte: 4.0 } }
      