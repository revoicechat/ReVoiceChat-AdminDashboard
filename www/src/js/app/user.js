class User {
  constructor(RVCA) {
    this.RVCA = RVCA
  }

  async load() {
    const result = await this.RVCA.fetcher.fetchCore(`/user/me`, 'GET');

    if (result !== null) {
      this.id = result.id;
      this.displayName = result.displayName;
    }
  }
}

module.exports = { User }