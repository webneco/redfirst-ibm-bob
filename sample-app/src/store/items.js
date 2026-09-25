'use strict';

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../../data/items.json');

// In-memory store — loaded from disk at startup
let items = [];

function loadItems() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    items = JSON.parse(raw);
  } catch (_) {
    items = [];
  }
}

function saveItems() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
}

function getAllItems() {
  return items;
}

function getItemById(id) {
  return items.find((item) => item.id === id);
}

function createItem(data) {
  const item = { id: uuidv4(), ...data };
  items.push(item);
  saveItems();
  return item;
}

// BUG-04: replaces the stored item with { id, ...patch } instead of
// merging with the existing item — omitted fields are lost.
function updateItem(id, patch) {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const updated = { ...items[index], ...patch };
  items[index] = updated;
  saveItems();
  return updated;
}

// BUG-03: removes item from in-memory array but does NOT call saveItems(),
// so the item reappears from disk after a process restart.
function deleteItem(id) {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return false;
  items.splice(index, 1);
  // BUG-03: saveItems() intentionally omitted here
  return true;
}

// Load on module initialisation
loadItems();

module.exports = {
  loadItems,
  saveItems,
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
