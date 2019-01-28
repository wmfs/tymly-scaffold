const memFs = require('mem-fs')
const editor = require('mem-fs-editor')
const path = require('path')
const _ = require('lodash')
const util = require('util')
const jsonSchemaMaker = require('@wmfs/json-schema-builder')
const jsonSchemaToCardscript = require('@wmfs/json-schema-to-cardscript')

const BLUEPRINT_JSON_KEYS = [
  'namespace',
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

const TEMPLATE_ROLE_KEYS = [
  'label',
  'description'
]

const blueprintJsonTemplate = require('./templates/blueprint.json')
const packageJsonTemplate = require('./templates/package-template.json')

module.exports = class Scaffold {
  static ModelTypes () {
    return jsonSchemaMaker.TYPES
  }

  constructor (options) {
    this.options = options || {}
    this.base = this.options.basePath
    this.store = memFs.create()
    this.fs = editor.create(this.store)
    this.commit = util.promisify(this.fs.commit)
  }

  _safeFilename (filename) {
    return _.kebabCase(filename)
  }

  _templateFile (filename) {
    return path.join(__dirname, 'templates', filename)
  }

  _destFile (filename, componentDirName) {
    let fullPath = path.join(this.base, this.blueprintName)
    if (componentDirName) {
      fullPath = path.join(fullPath, componentDirName)
    }
    return path.join(fullPath, filename)
  }

  _templateCopy (sourceFilename, destFilename, ctx) {
    this.fs.copyTpl(
      this._templateFile(sourceFilename), // from
      this._destFile(destFilename), // to
      ctx
    )
  }

  _extendFile (destFilename, obj, componentDir) {
    const destFile = this._destFile(destFilename, componentDir)
    this.fs.extendJSON(
      destFile, // to
      obj
    )
  }

  _extendCopy (sourceFilename, destFilename, obj, componentDir) {
    const destFile = this._destFile(destFilename, componentDir)
    this.fs.copy(
      this._templateFile(sourceFilename), // from
      destFile // to
    )
    this.fs.extendJSON(
      destFile, // to
      obj
    )
  }

  addBlueprint (options) {
    // TODO: Add option validation
    // TODO: Control package.json dependencies depending on options
    // TODO: Bring blueprint categories into package.json keywords
    // TODO: Review .gitignore template
    // TODO: Pick different licenses (remember package.json)
    // TODO: Make README license a link to GitHub (or if no gitHubOwner then some standard resource)
    // TODO: Add Travis badge if that's the ciProfile

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

    this._extendCopy('blueprint.json', 'blueprint.json', ctx.blueprintJson)
    this._extendCopy('package-template.json', 'package.json', ctx.packageJson)
    this._templateCopy('gitignore.ejs', '.gitignore', ctx)
    this._templateCopy('index.js.ejs', 'index.js', ctx)
    this._templateCopy('LICENSE.ejs', 'LICENSE', ctx)
    this._templateCopy('README.md.ejs', 'README.md', ctx)
    this._extendCopy('releaserc.json', '.releaserc.json', {})

    if (options.ciProfile) {
      switch (options.ciProfile) {
        case 'travis':
          this._templateCopy('travis.yml.ejs', '.travis.yml')
      }
    }
  }

  setBlueprint (blueprintName) {
    this.blueprintName = this._safeFilename(blueprintName)
  }

  loadModel (modelName) {
    return this.getComponentJson('models', modelName)
  }

  getComponentJson (componentDirName, modelName) {
    const modelPath = this._destFile(
      this._safeFilename(modelName) + '.json',
      componentDirName
    )
    return this.fs.readJSON(modelPath)
  }

  addModel (options) {
    this._extendFile(
      this._safeFilename(options.name) + '.json',
      jsonSchemaMaker(options),
      'models'
    )
  }

  addSeedData (options) {
    const modelSchema = this.getComponentJson('models', options.modelName)
    const seed = {
      propertyNames: [],
      data: []
    }

    const demoData = []

    for (const [key, property] of Object.entries(modelSchema.properties)) {
      if (property.type !== 'array' && property.type !== 'object') {
        // Just keeping it to simple, atomic values.
        seed.propertyNames.push(key)

        let suggestion = null
        if (property.hasOwnProperty('examples')) {
          suggestion = property.examples[0]
        } else if (property.hasOwnProperty('default')) {
          suggestion = property.default
        } else if (property.hasOwnProperty('minimum')) {
          suggestion = property.minimum
        }
        demoData.push(suggestion)
      }
    }
    seed.data.push(demoData)

    this._extendFile(
      this._safeFilename(options.modelName) + '.json',
      seed,
      'seed-data'
    )
  }

  async addRoleTemplate (options) {
    const templateRole = {}
    TEMPLATE_ROLE_KEYS.forEach((key) => {
      if (options.hasOwnProperty(key)) {
        templateRole[key] = options[key]
      }
    })
    templateRole.grants = []

    this._extendFile(
      this._safeFilename(options.name) + '.json',
      templateRole,
      'template-roles'
    )
  }

  async makeEditable (options) {
    const modelSchema = options.modelSchema || this.loadModel(options.modelName)
    const cardscript = jsonSchemaToCardscript(modelSchema, options)
    const filename = options.filename || `${this._safeFilename(options.modelName)}-editing-form.json`

    this._extendFile(
      filename,
      cardscript,
      'card-templates'
    )
  }

  setBlueprintDir (blueprintPath) {
    blueprintPath = path.resolve(blueprintPath)
    this.base = path.resolve(blueprintPath, '..')
    this.setBlueprint(path.basename(blueprintPath))
  }

  async makeCreatable (options) {
  }

  async makeQueryable (options) {
  }

  async commit () {
    return this.commit
  }
}
