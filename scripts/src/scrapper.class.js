module.exports = class Scrapper {
  constructor ({ github, context, core, glob, io, exec }) {
    this.io = io
    this.core = core
    this.exec = exec
    this.glob = glob
    this.github = github
    this.context = context

    this.data = {}
  }

  static load (...args) {
    const instance = new RunInformation(...args)
    instance.setup()
    return instance
  }

  add (key, data) {
    if (!this.data[key]) this.data[key] = {}

    this.data[key] = {
      ...this.data[key],
      ...data
    }

    return this
  }

  // overwrite
  setup () {}
}