import type { Monaco } from "@monaco-editor/react";

// MongoDB Query Operators
export const queryOperators = [
  { label: "$eq", detail: "Matches values equal to a specified value", insertText: "\\$eq: " },
  { label: "$ne", detail: "Matches values not equal to a specified value", insertText: "\\$ne: " },
  { label: "$gt", detail: "Matches values greater than a specified value", insertText: "\\$gt: " },
  { label: "$gte", detail: "Matches values greater than or equal to a specified value", insertText: "\\$gte: " },
  { label: "$lt", detail: "Matches values less than a specified value", insertText: "\\$lt: " },
  { label: "$lte", detail: "Matches values less than or equal to a specified value", insertText: "\\$lte: " },
  { label: "$in", detail: "Matches any of the values in an array", insertText: "\\$in: [$1]" },
  { label: "$nin", detail: "Matches none of the values in an array", insertText: "\\$nin: [$1]" },
  { label: "$exists", detail: "Matches documents that have the specified field", insertText: "\\$exists: true" },
  { label: "$type", detail: "Selects documents if a field is of the specified type", insertText: "\\$type: \"$1\"" },
  { label: "$regex", detail: "Selects documents where values match a specified regex", insertText: "\\$regex: /$1/" },
  { label: "$and", detail: "Joins query clauses with a logical AND", insertText: "\\$and: [{ $1 }]" },
  { label: "$or", detail: "Joins query clauses with a logical OR", insertText: "\\$or: [{ $1 }]" },
  { label: "$not", detail: "Inverts the effect of a query expression", insertText: "\\$not: { $1 }" },
  { label: "$nor", detail: "Joins query clauses with a logical NOR", insertText: "\\$nor: [{ $1 }]" },
  { label: "$all", detail: "Matches arrays that contain all specified elements", insertText: "\\$all: [$1]" },
  { label: "$elemMatch", detail: "Matches documents with an array field element matching all conditions", insertText: "\\$elemMatch: { $1 }" },
  { label: "$size", detail: "Matches arrays with specified number of elements", insertText: "\\$size: $1" },
];

// MongoDB Aggregation Stages
export const aggregationStages = [
  { label: "$match", detail: "Filters documents to pass only matching documents", insertText: "{ \\$match: { $1 } }" },
  { label: "$group", detail: "Groups documents by specified expression", insertText: "{ \\$group: { _id: \"$${1:field}\", ${2:result}: { \\$sum: 1 } } }" },
  { label: "$project", detail: "Reshapes documents by including/excluding fields", insertText: "{ \\$project: { ${1:field}: 1 } }" },
  { label: "$sort", detail: "Reorders documents by specified sort key(s)", insertText: "{ \\$sort: { ${1:field}: ${2|-1,1|} } }" },
  { label: "$limit", detail: "Limits the number of documents", insertText: "{ \\$limit: ${1:10} }" },
  { label: "$skip", detail: "Skips over specified number of documents", insertText: "{ \\$skip: ${1:0} }" },
  { label: "$lookup", detail: "Performs a left outer join to another collection", insertText: "{ \\$lookup: { from: \"${1:collection}\", localField: \"${2:field}\", foreignField: \"${3:_id}\", as: \"${4:result}\" } }" },
  { label: "$unwind", detail: "Deconstructs an array field into multiple documents", insertText: "{ \\$unwind: \"$${1:arrayField}\" }" },
  { label: "$addFields", detail: "Adds new fields to documents", insertText: "{ \\$addFields: { ${1:newField}: \"$${2:existingField}\" } }" },
  { label: "$count", detail: "Returns count of documents", insertText: "{ \\$count: \"${1:total}\" }" },
  { label: "$facet", detail: "Processes multiple aggregation pipelines", insertText: "{ \\$facet: { ${1:output1}: [{ \\$match: {} }] } }" },
  { label: "$bucket", detail: "Categorizes documents into groups (buckets)", insertText: "{ \\$bucket: { groupBy: \"$${1:field}\", boundaries: [${2:0, 100, 200}], default: \"Other\" } }" },
  { label: "$replaceRoot", detail: "Replaces the input document with specified document", insertText: "{ \\$replaceRoot: { newRoot: \"$${1:field}\" } }" },
  { label: "$out", detail: "Writes the result to a collection", insertText: "{ \\$out: \"${1:collectionName}\" }" },
  { label: "$merge", detail: "Writes the result to a collection with merge options", insertText: "{ \\$merge: { into: \"${1:collection}\" } }" },
];

// Aggregation Accumulator Operators (for use in $group)
export const accumulatorOperators = [
  { label: "$sum", detail: "Returns the sum of numeric values", insertText: "\\$sum: \"$${1:field}\"" },
  { label: "$avg", detail: "Returns the average of numeric values", insertText: "\\$avg: \"$${1:field}\"" },
  { label: "$min", detail: "Returns the minimum value", insertText: "\\$min: \"$${1:field}\"" },
  { label: "$max", detail: "Returns the maximum value", insertText: "\\$max: \"$${1:field}\"" },
  { label: "$first", detail: "Returns the first value in a group", insertText: "\\$first: \"$${1:field}\"" },
  { label: "$last", detail: "Returns the last value in a group", insertText: "\\$last: \"$${1:field}\"" },
  { label: "$push", detail: "Returns an array of all values in a group", insertText: "\\$push: \"$${1:field}\"" },
  { label: "$addToSet", detail: "Returns an array of unique values in a group", insertText: "\\$addToSet: \"$${1:field}\"" },
  { label: "$count", detail: "Returns the count of documents", insertText: "\\$count: {}" },
];

// MongoDB Methods
export const mongoMethods = [
  { label: "find", detail: "Selects documents in a collection", insertText: "find({ $1 })" },
  { label: "findOne", detail: "Returns one document that satisfies the query", insertText: "findOne({ $1 })" },
  { label: "insertOne", detail: "Inserts a single document into a collection", insertText: "insertOne({ $1 })" },
  { label: "insertMany", detail: "Inserts multiple documents into a collection", insertText: "insertMany([{ $1 }])" },
  { label: "updateOne", detail: "Updates a single document", insertText: "updateOne({ ${1:filter} }, { \\$set: { ${2:field}: ${3:value} } })" },
  { label: "updateMany", detail: "Updates all matching documents", insertText: "updateMany({ ${1:filter} }, { \\$set: { ${2:field}: ${3:value} } })" },
  { label: "deleteOne", detail: "Removes a single document", insertText: "deleteOne({ $1 })" },
  { label: "deleteMany", detail: "Removes all matching documents", insertText: "deleteMany({ $1 })" },
  { label: "aggregate", detail: "Performs aggregation operations", insertText: "aggregate([\n  $1\n])" },
  { label: "countDocuments", detail: "Returns the count of matching documents", insertText: "countDocuments({ $1 })" },
  { label: "distinct", detail: "Returns distinct values for a field", insertText: "distinct(\"${1:field}\", { $2 })" },
  { label: "sort", detail: "Specifies the order of documents", insertText: "sort({ ${1:field}: ${2|-1,1|} })" },
  { label: "limit", detail: "Constrains the size of the result set", insertText: "limit(${1:10})" },
  { label: "skip", detail: "Skips documents in the result set", insertText: "skip(${1:0})" },
  { label: "explain", detail: "Reports on the query execution plan", insertText: "explain(\"executionStats\")" },
];

// Collection fields by collection name
export const collectionFields: Record<string, string[]> = {
  users: ["_id", "email", "name", "role", "createdAt", "address", "address.street", "address.city", "address.country", "preferences", "preferences.newsletter", "preferences.notifications"],
  products: ["_id", "name", "sku", "price", "category", "stock", "ratings", "ratings.average", "ratings.count", "tags"],
  orders: ["_id", "userId", "status", "total", "items", "items.productId", "items.quantity", "items.price", "createdAt", "shippedAt", "deliveredAt"],
  reviews: ["_id", "productId", "userId", "rating", "comment", "createdAt"],
  events: ["_id", "type", "timestamp", "userId", "sessionId", "data"],
  sessions: ["_id", "userId", "startTime", "endTime", "duration", "device"],
  pageviews: ["_id", "sessionId", "url", "timestamp", "referrer"],
  posts: ["_id", "title", "slug", "author", "content", "status", "views", "likes", "createdAt", "updatedAt", "tags"],
  comments: ["_id", "postId", "author", "content", "createdAt"],
  authors: ["_id", "name", "email", "bio", "avatar"],
  categories: ["_id", "name", "slug", "description"],
  tags: ["_id", "name", "slug", "count"],
};

interface CompletionSuggestion {
  label: string;
  kind: number;
  detail: string;
  insertText: string;
  insertTextRules?: number;
  range: {
    startLineNumber: number;
    endLineNumber: number;
    startColumn: number;
    endColumn: number;
  };
}

export function createMongoCompletionProvider(
  monaco: Monaco,
  getActiveCollection: () => string | null
) {
  return {
    triggerCharacters: [".", "$", '"', "'"],
    provideCompletionItems: (
      model: { getWordUntilPosition: (pos: { lineNumber: number; column: number }) => { startColumn: number; endColumn: number }; getLineContent: (line: number) => string },
      position: { lineNumber: number; column: number }
    ) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const lineContent = model.getLineContent(position.lineNumber);
      const textBeforeCursor = lineContent.substring(0, position.column - 1);

      const suggestions: CompletionSuggestion[] = [];

      // After "db." suggest collection names
      if (textBeforeCursor.match(/db\.$/)) {
        const collections = Object.keys(collectionFields);
        collections.forEach((col) => {
          suggestions.push({
            label: col,
            kind: monaco.languages.CompletionItemKind.Class,
            detail: "Collection",
            insertText: col,
            range,
          });
        });
        return { suggestions };
      }

      // After "db.collection." suggest methods
      if (textBeforeCursor.match(/db\.\w+\.$/)) {
        mongoMethods.forEach((method) => {
          suggestions.push({
            label: method.label,
            kind: monaco.languages.CompletionItemKind.Method,
            detail: method.detail,
            insertText: method.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          });
        });
        return { suggestions };
      }

      // Inside aggregate array, suggest stages
      if (textBeforeCursor.match(/aggregate\s*\(\s*\[/) || textBeforeCursor.match(/,\s*$/)) {
        aggregationStages.forEach((stage) => {
          suggestions.push({
            label: stage.label,
            kind: monaco.languages.CompletionItemKind.Function,
            detail: stage.detail,
            insertText: stage.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          });
        });
      }

      // $ operator suggestions
      if (textBeforeCursor.match(/\$\w*$/) || textBeforeCursor.match(/[{,]\s*$/)) {
        // Query operators
        queryOperators.forEach((op) => {
          suggestions.push({
            label: op.label,
            kind: monaco.languages.CompletionItemKind.Operator,
            detail: op.detail,
            insertText: op.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          });
        });

        // Accumulator operators (for $group)
        accumulatorOperators.forEach((op) => {
          suggestions.push({
            label: op.label,
            kind: monaco.languages.CompletionItemKind.Operator,
            detail: `Accumulator: ${op.detail}`,
            insertText: op.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          });
        });
      }

      // Field suggestions after quotes or $ for field references
      const activeCollection = getActiveCollection();
      if (activeCollection && collectionFields[activeCollection]) {
        if (textBeforeCursor.match(/["']\s*$/) || textBeforeCursor.match(/\$\s*$/)) {
          collectionFields[activeCollection].forEach((field) => {
            suggestions.push({
              label: field,
              kind: monaco.languages.CompletionItemKind.Field,
              detail: `Field in ${activeCollection}`,
              insertText: field,
              range,
            });
          });
        }
      }

      return { suggestions };
    },
  };
}
