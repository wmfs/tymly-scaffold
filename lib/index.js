const memFs = require('mem-fs')
const editor = require('mem-fs-editor')
const path = require('path')
const _ = require('lodash')
const util = require('util')

const BLUEPRINT_JSON_KEYS = [
  'label',
  'version',
  'author',
  'organisation',
  'description',
  'tags'
]

const blueprintJsonTemplate = require('./templates/root/blueprint.json')
module.exports = class Scaffold {
  constructor (options) {
    this.options = options
    this.base = options.basePath
    this.store = memFs.create()
    this.fs = editor.create(this.store)
    this.commit = util.promisify(this.fs.commit)
  }

  _rootFile (filename) {
    return path.join(__dirname, 'templates', 'root', filename)
  }

  _destFile (filename) {
    return path.join(this.base, this.blueprintName, filename)
  }

  _rootTemplateCopy (sourceFilename, destFilename, ctx) {
    this.fs.copyTpl(
      this._rootFile(sourceFilename), // from
      this._destFile(destFilename), // to
      ctx
    )
  }

  _rootExtendCopy (sourceFilename, destFilename, obj) {
    const destFile = this._destFile(destFilename)
    this.fs.copy(
      this._rootFile(sourceFilename), // from
      destFile // to
    )
    this.fs.extendJSON(
      destFile, // to
      obj
    )
  }

  async addBlueprint (options) {
    this.setBlueprint(options.name)
    const now = new Date()

    // Create a context for use with ejs templates
    const ctx = _.cloneDeep(options)
    ctx.year = now.getFullYear()
    ctx.blueprintJson = {
      name: this.blueprintName,
      namespace: options.namespace
    }

    BLUEPRINT_JSON_KEYS.forEach((key) => {
      if (options.hasOwnProperty(key)) {
        ctx.blueprintJson[key] = options[key]
      } else {
        ctx.blueprintJson[key] = blueprintJsonTemplate[key]
      }
    })

    this._rootExtendCopy('blueprint.json', 'blueprint.json', ctx.blueprintJson)
    this._rootTemplateCopy('gitignore.ejs', '.gitignore', ctx)
    this._rootTemplateCopy('index.js.ejs', 'index.js', ctx)
    this._rootTemplateCopy('LICENSE.ejs', 'LICENSE', ctx)
    this._rootExtendCopy('package_template.json', 'package.json', {})
    this._rootTemplateCopy('README.md.ejs', 'README.md', ctx)
    this._rootExtendCopy('releaserc.json', '.releaserc.json', {})
    this._rootTemplateCopy('travis.yml.ejs', '.travis.yml')
  }

  setBlueprint (blueprintName) {
    this.blueprintName = _.kebabCase(blueprintName)
  }

  async addModel (options) {
  }

  async getModel (modelName) {
  }

  async addSeedData (options) {
  }

  async addRoleTemplate (options) {
  }

  async makeEditable (options) {
  }

  async makeCreatable (options) {
  }

  async makeQueryable (options) {
  }

  async commit () {
    return this.commit
  }
}
