// Mock MongoDB data for demonstration

export interface Database {
  name: string;
  collections: Collection[];
}

export interface Collection {
  name: string;
  documentCount: number;
  size: string;
}

export interface Document {
  _id: string;
  [key: string]: unknown;
}

export const mockDatabases: Database[] = [
  {
    name: "ecommerce",
    collections: [
      { name: "users", documentCount: 15420, size: "2.4 MB" },
      { name: "products", documentCount: 3847, size: "12.8 MB" },
      { name: "orders", documentCount: 48291, size: "45.2 MB" },
      { name: "reviews", documentCount: 12650, size: "8.1 MB" },
    ],
  },
  {
    name: "analytics",
    collections: [
      { name: "events", documentCount: 1250000, size: "890 MB" },
      { name: "sessions", documentCount: 350000, size: "120 MB" },
      { name: "pageviews", documentCount: 5200000, size: "1.2 GB" },
    ],
  },
  {
    name: "blog",
    collections: [
      { name: "posts", documentCount: 842, size: "4.5 MB" },
      { name: "comments", documentCount: 12500, size: "3.2 MB" },
      { name: "authors", documentCount: 45, size: "128 KB" },
      { name: "categories", documentCount: 24, size: "12 KB" },
      { name: "tags", documentCount: 156, size: "48 KB" },
    ],
  },
];

export const mockDocuments: Record<string, Document[]> = {
  "ecommerce.users": [
    {
      _id: "64f8a2b3c1234567890abcd1",
      email: "john.doe@example.com",
      name: "John Doe",
      role: "customer",
      createdAt: "2024-01-15T10:30:00Z",
      address: {
        street: "123 Main St",
        city: "New York",
        country: "USA",
      },
      preferences: {
        newsletter: true,
        notifications: ["email", "push"],
      },
    },
    {
      _id: "64f8a2b3c1234567890abcd2",
      email: "jane.smith@example.com",
      name: "Jane Smith",
      role: "admin",
      createdAt: "2024-01-10T08:15:00Z",
      address: {
        street: "456 Oak Ave",
        city: "Los Angeles",
        country: "USA",
      },
      preferences: {
        newsletter: false,
        notifications: ["email"],
      },
    },
    {
      _id: "64f8a2b3c1234567890abcd3",
      email: "bob.wilson@example.com",
      name: "Bob Wilson",
      role: "customer",
      createdAt: "2024-02-20T14:45:00Z",
      address: {
        street: "789 Pine Rd",
        city: "Chicago",
        country: "USA",
      },
      preferences: {
        newsletter: true,
        notifications: ["push"],
      },
    },
  ],
  "ecommerce.products": [
    {
      _id: "64f8a2b3c1234567890prod1",
      name: "Wireless Bluetooth Headphones",
      sku: "WBH-001",
      price: 79.99,
      category: "Electronics",
      stock: 145,
      ratings: { average: 4.5, count: 234 },
      tags: ["wireless", "audio", "bluetooth"],
    },
    {
      _id: "64f8a2b3c1234567890prod2",
      name: "Ergonomic Office Chair",
      sku: "EOC-002",
      price: 299.99,
      category: "Furniture",
      stock: 32,
      ratings: { average: 4.8, count: 89 },
      tags: ["office", "ergonomic", "chair"],
    },
    {
      _id: "64f8a2b3c1234567890prod3",
      name: "Mechanical Keyboard RGB",
      sku: "MKR-003",
      price: 149.99,
      category: "Electronics",
      stock: 78,
      ratings: { average: 4.6, count: 412 },
      tags: ["keyboard", "mechanical", "rgb", "gaming"],
    },
  ],
  "ecommerce.orders": [
    {
      _id: "64f8a2b3c1234567890ord1",
      userId: "64f8a2b3c1234567890abcd1",
      status: "delivered",
      total: 229.98,
      items: [
        { productId: "64f8a2b3c1234567890prod1", quantity: 1, price: 79.99 },
        { productId: "64f8a2b3c1234567890prod3", quantity: 1, price: 149.99 },
      ],
      createdAt: "2024-03-01T16:20:00Z",
      shippedAt: "2024-03-02T09:00:00Z",
      deliveredAt: "2024-03-05T14:30:00Z",
    },
    {
      _id: "64f8a2b3c1234567890ord2",
      userId: "64f8a2b3c1234567890abcd2",
      status: "processing",
      total: 299.99,
      items: [
        { productId: "64f8a2b3c1234567890prod2", quantity: 1, price: 299.99 },
      ],
      createdAt: "2024-03-10T11:45:00Z",
      shippedAt: null,
      deliveredAt: null,
    },
  ],
  "blog.posts": [
    {
      _id: "64f8a2b3c1234567890post1",
      title: "Getting Started with MongoDB",
      slug: "getting-started-mongodb",
      author: "64f8a2b3c1234567890auth1",
      content: "MongoDB is a document-oriented NoSQL database...",
      status: "published",
      views: 15420,
      likes: 342,
      createdAt: "2024-01-05T09:00:00Z",
      updatedAt: "2024-01-06T14:30:00Z",
      tags: ["mongodb", "database", "nosql", "tutorial"],
    },
    {
      _id: "64f8a2b3c1234567890post2",
      title: "Advanced Aggregation Pipelines",
      slug: "advanced-aggregation-pipelines",
      author: "64f8a2b3c1234567890auth2",
      content: "Learn how to use MongoDB's powerful aggregation framework...",
      status: "published",
      views: 8750,
      likes: 189,
      createdAt: "2024-02-12T10:15:00Z",
      updatedAt: "2024-02-12T10:15:00Z",
      tags: ["mongodb", "aggregation", "advanced"],
    },
  ],
};

export const sampleQueries = [
  {
    name: "Find all users",
    query: 'db.users.find({})',
  },
  {
    name: "Find by email",
    query: 'db.users.find({ email: "john.doe@example.com" })',
  },
  {
    name: "Find products under $100",
    query: 'db.products.find({ price: { $lt: 100 } })',
  },
  {
    name: "Count orders by status",
    query: `db.orders.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])`,
  },
  {
    name: "Sort products by rating",
    query: 'db.products.find({}).sort({ "ratings.average": -1 })',
  },
];

export const queryHistory = [
  { query: 'db.users.find({})', timestamp: "2024-03-10 14:32:15", duration: "23ms" },
  { query: 'db.products.find({ category: "Electronics" })', timestamp: "2024-03-10 14:30:45", duration: "18ms" },
  { query: 'db.orders.find({ status: "delivered" })', timestamp: "2024-03-10 14:28:10", duration: "45ms" },
  { query: 'db.users.findOne({ email: "jane.smith@example.com" })', timestamp: "2024-03-10 14:25:30", duration: "12ms" },
];
