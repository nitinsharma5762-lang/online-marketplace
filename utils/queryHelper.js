/**
 * Reusable Mongoose query utility for advanced filtering, sorting, searching, and pagination.
 * 
 * @param {import("mongoose").Model} model - Mongoose model to query
 * @param {Object} reqQuery - Request query parameters (req.query)
 * @param {Array<string>} searchFields - Schema fields to search against
 * @returns {Promise<{data: Array, pagination: Object}>} Query result and pagination metadata
 */
export const applyQueryPipeline = async (model, reqQuery, searchFields = []) => {
  let { page = 1, limit = 10, sort, search, ...filters } = reqQuery;

  // Formatting pagination bounds
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  const skip = (page - 1) * limit;

  // Build MongoDB query object
  const findQuery = {};

  // 1. Text Searching
  if (search && searchFields.length > 0) {
    findQuery.$or = searchFields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }

  // 2. Custom filter handling for Offers
  if (filters.hasOffer === "true") {
    findQuery.originalPrice = { $gt: 0 };
    findQuery.$expr = { $gt: ["$originalPrice", "$price"] };
    delete filters.hasOffer;
  } else if (filters.hasOffer === "false") {
    findQuery.$or = [
      { originalPrice: { $exists: false } },
      { originalPrice: 0 },
      { $expr: { $lte: ["$originalPrice", "$price"] } }
    ];
    delete filters.hasOffer;
  }

  // 3. Regular Filters (handling lists like seasons=summer,winter or exact string values)
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== undefined && filters[key] !== "") {
      if (typeof filters[key] === "string" && filters[key].includes(",")) {
        findQuery[key] = { $in: filters[key].split(",") };
      } else {
        // If it is a string representation of boolean, convert it
        if (filters[key] === "true") findQuery[key] = true;
        else if (filters[key] === "false") findQuery[key] = false;
        else findQuery[key] = filters[key];
      }
    }
  });

  // Execute total counts before executing limit query
  const totalItems = await model.countDocuments(findQuery);

  // 4. Mongoose Query Initialization
  let mongooseQuery = model.find(findQuery);

  // 5. Sorting
  if (sort) {
    const sortBy = sort.split(",").join(" ");
    mongooseQuery = mongooseQuery.sort(sortBy);
  } else {
    mongooseQuery = mongooseQuery.sort("-createdAt"); // default latest first
  }

  // 6. Pagination & Data retrieval
  const data = await mongooseQuery.skip(skip).limit(limit).lean();
  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
