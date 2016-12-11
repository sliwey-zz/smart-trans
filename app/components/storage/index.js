export default class Storage {
  constructor(key) {
    this.key = key;
    this.storage = window.localStorage;
  }

  set(value) {
    this.storage.setItem(this.key, JSON.stringify(value));
  }

  get() {
    return JSON.parse(this.storage.getItem(this.key));
  }
}
