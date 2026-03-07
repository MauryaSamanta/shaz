class Queue {
  constructor() {
    this.items = {};
    this.head = 0;
    this.tail = 0;
  }

  enqueue(item) {
    this.items[this.tail] = item;
    this.tail++;
  }

  dequeue() {
    if (this.isEmpty()) return null;

    const item = this.items[this.head];
    delete this.items[this.head];
    this.head++;
    return item;
  }

  peek() {
    if (this.isEmpty()) return null;
    return this.items[this.head];
  }

  size() {
    return this.tail - this.head;
  }

  isEmpty() {
    return this.size() === 0;
  }

  toArray() {
    const arr = [];
    for (let i = this.head; i < this.tail; i++) {
      if (this.items[i] !== undefined) {
        arr.push(this.items[i]);
      }
    }
    return arr;
  }

  getIds() {
    const ids = [];
    for (let i = this.head; i < this.tail; i++) {
      if (this.items[i]) {
        ids.push(this.items[i].item_id);
      }
    }
    return ids;
  }

  clear() {
    this.items = {};
    this.head = 0;
    this.tail = 0;
  }
}

export default Queue;