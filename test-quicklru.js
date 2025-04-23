import QuickLRU from '@alloc/quick-lru';

// Create a new LRU cache with a max size of 3
const lru = new QuickLRU({ maxSize: 3 });

// Set some values
lru.set('a', 1);
lru.set('b', 2);
lru.set('c', 3);

console.log('Initial cache:', Array.from(lru.entries()));

// Access 'a' to make it most recently used
lru.get('a');

// Add another item, causing the least recently used ('b') to be evicted
lru.set('d', 4);

console.log('Cache after adding d:', Array.from(lru.entries()));

// Test expiration (if supported)
// lru.set('e', 5, { maxAge: 100 }); // Uncomment if you want to test maxAge
// setTimeout(() => {
//   console.log('Cache after expiration:', Array.from(lru.entries()));
// }, 200);
