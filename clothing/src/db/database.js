import Dexie from 'dexie';
import SHOP_DATA from '../shop-data';

// Dexie IndexedDB database - replaces Firebase/Firestore entirely
// Provides offline-first, instant queries with zero network latency
const db = new Dexie('MajorClothingDB');

db.version(1).stores({
  users: '++id, uid, email, displayName, createdAt',
  categories: '++id, &title',
  products: '++id, name, price, categoryTitle',
  cart: '++id, productId',
});

// Seed categories and products from shop-data on first load
export const initializeDatabase = async () => {
  const categoryCount = await db.categories.count();
  if (categoryCount > 0) return;

  const categories = SHOP_DATA.map(({ title, items }) => ({ title: title.toLowerCase() }));
  const products = SHOP_DATA.flatMap(({ title, items }) =>
    items.map((item) => ({ ...item, categoryTitle: title.toLowerCase() }))
  );

  await db.categories.bulkAdd(categories);
  await db.products.bulkAdd(products);
};

// User operations
export const createUser = async (userData) => {
  return db.users.put(userData);
};

export const getUserByUid = async (uid) => {
  return db.users.where('uid').equals(uid).first();
};

export const getUserByEmail = async (email) => {
  return db.users.where('email').equals(email).first();
};

// Category operations
export const getCategoriesMap = async () => {
  const categories = await db.categories.toArray();
  const map = {};

  for (const cat of categories) {
    const products = await db.products
      .where('categoryTitle')
      .equals(cat.title)
      .toArray();
    map[cat.title] = products;
  }

  return map;
};

// Cart persistence operations
export const saveCart = async (items) => {
  await db.cart.clear();
  if (items.length > 0) {
    await db.cart.bulkAdd(
      items.map((item) => ({
        productId: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        price: item.price,
        quantity: item.quantity,
      }))
    );
  }
};

export const loadCart = async () => {
  return db.cart.toArray();
};

// Auth simulation (replaces Firebase Auth)
export const simulateAuthWithEmail = async (email, password, userData = {}) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const existing = await db.users.where('email').equals(email).first();
  if (existing) {
    // Sign in
    return existing;
  }

  // Sign up
  const uid = 'uid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const newUser = {
    uid,
    email,
    displayName: userData.displayName || email.split('@')[0],
    createdAt: new Date().toISOString(),
    ...userData,
  };
  await db.users.put(newUser);
  return newUser;
};

export const logoutUser = () => {
  // Local auth - just clear session
  localStorage.removeItem('currentUser');
};

export { db };
export default db;