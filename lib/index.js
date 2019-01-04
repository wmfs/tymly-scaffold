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

const PACKAGE_JSON_KEYS = [
  'author',
  'description'
]

const blueprintJsonTemplate = require('./templates/root/blueprint.json')
const packageJsonTemplate = require('./templates/root/package_template.json')

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

  // TODO: Control package.json dependencies depending on options
  // TODO: Bring blueprint categories into package.json keywords
  // TODO: Review .gitignore template
  // TODO: Pick different licenses (remember package.json)
  // TODO: Make README license a link to GitHub (or if no gitHubOwner then some standard resource)
  // TODO: Add Travis badge if that's the ciProfile

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

    ctx.packageJson = {
      name: options.npmOrg ? `@${options.npmOrg}/${this.blueprintName}` : this.blueprintName,
      version: options.semanticVersioning ? '0.0.0-semantically-released' : '0.0.0'
    }

    PACKAGE_JSON_KEYS.forEach((key) => {
      if (options.hasOwnProperty(key)) {
        ctx.packageJson[key] = options[key]
      } else {
        ctx.packageJson[key] = packageJsonTemplate[key]
      }
    })

    if (options.gitHubOwner) {
      ctx.packageJson.homepage = `https://github.com/${options.gitHubOwner}/${this.blueprintName}#readme`
      ctx.packageJson.repository = {
        type: 'git',
        url: `https://github.com/${options.gitHubOwner}/${this.blueprintName}.git`
      }
      ctx.packageJson.bugs = {
        url: `https://github.com/${options.gitHubOwner}/${this.blueprintName}/issues`
      }
    }

    this._rootExtendCopy('blueprint.json', 'blueprint.json', ctx.blueprintJson)
    this._rootExtendCopy('package_template.json', 'package.json', ctx.packageJson)
    this._rootTemplateCopy('gitignore.ejs', '.gitignore', ctx)
    this._rootTemplateCopy('index.js.ejs', 'index.js', ctx)
    this._rootTemplateCopy('LICENSE.ejs', 'LICENSE', ctx)
    this._rootTemplateCopy('README.md.ejs', 'README.md', ctx)
    this._rootExtendCopy('releaserc.json', '.releaserc.json', {})

    if (options.ciProfile) {
      switch (options.ciProfile) {
        case 'travis':
          this._rootTemplateCopy('travis.yml.ejs', '.travis.yml')
      }
    }
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
