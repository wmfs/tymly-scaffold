const memFs = require('mem-fs')
const editor = require('mem-fs-editor')
const path = require('path')
const _ = require('lodash')
const util = require('util')
const fs = require('fs-extra')
const { dslToJsonSchema, dataTypes } = require('@wmfs/json-schema-builder')
const jsonSchemaToCardscript = require('@wmfs/json-schema-to-cardscript')

const scaffoldPackage = require('../package')
const scaffoldVersion = `${scaffoldPackage.name} ${scaffoldPackage.version}`

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

const blueprintJsonTemplate = require('./templates/blueprint.json')
const packageJsonTemplate = require('./templates/package-template.json')

const TemplateDir = path.join(__dirname, 'templates')
const StateMachineDir = path.join(TemplateDir, 'state-machines')

function readStateMachineMeta (stateMachineName) {
  const metaFileName = path.join(StateMachineDir, `${stateMachineName}-meta.json`)

  const meta = fs.pathExistsSync(metaFileName)
    ? fs.readJsonSync(metaFileName)
    : { label: _.upperFirst(stateMachineName) }

  meta.name = stateMachineName

  return meta
} // readStateMachineMeta

module.exports = class Scaffold {
  static TypeDomains () {
    return dataTypes.getDomains()
  }
  static TypeCategories (dataDomains) {
    return dataTypes.getCategories({ domainRestriction: dataDomains })
  }
  static ModelTypes (dataDomains, typeCategory) {
    return dataTypes.getDataTypes({
      category: typeCategory,
      domainRestriction: dataDomains
    })
  }

  static StateMachines () {
    const machines = fs.readdirSync(StateMachineDir)
      .filter(f => f.endsWith('.json.ejs'))
      .map(f => f.replace('.json.ejs', ''))
      .map(name => readStateMachineMeta(name))

    return machines
  } // StateMachines

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

  _templateFile (filename, componentDirName) {
    return componentDirName
      ? path.join(TemplateDir, componentDirName, filename)
      : path.join(TemplateDir, filename)
  }

  _destFile (filename, componentDirName) {
    let fullPath = path.join(this.base, this.blueprintName)
    if (componentDirName) {
      fullPath = path.join(fullPath, componentDirName)
    }
    return path.join(fullPath, filename)
  }

  _templateCopy (sourceFilename, destFilename, ctx, componentDirName) {
    this.fs.copyTpl(
      this._templateFile(sourceFilename, componentDirName), // from
      this._destFile(destFilename, componentDirName), // to
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

    ctx.blueprintJson.meta = _.defaults(
      {
        generatedOn: now.toLocaleString(),
        generatedWith: scaffoldVersion
      },
      options.meta || {}
    )

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
    const model = dslToJsonSchema(options)
    this._extendFile(
      this._safeFilename(options.name) + '.json',
      model,
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

  addRoleTemplate (options) {
    const memberships = (Array.isArray(options.roleMemberships)) ? options.roleMemberships : [(options.roleMemberships || '')]

    options.memberships = memberships
      .filter(m => m)
      .map(m => `"${m}"`)
      .join(',\n    ')

    this._templateCopy(
      'role.json.ejs',
      `${this._safeFilename(options.name)}.json`,
      options,
      'template-roles')
  }

  makeEditable (options) {
    this._makeForm(options, 'editing')
  }

  makeViewable (options) {
    this._makeForm(options, 'viewing')
  }

  _makeForm (options, purpose) {
    const filename = options.filename ||
      `${this._safeFilename(options.modelName)}-${purpose}-form.json`

    const modelSchema = options.modelSchema || this.loadModel(options.modelName)
    options.generator = scaffoldVersion
    options.purpose = purpose
    options.name = options.name || filename.substring(0, filename.lastIndexOf('.'))

    const cardscript = jsonSchemaToCardscript(modelSchema, options)

    this._extendFile(
      filename,
      cardscript,
      'card-templates'
    )
  } // _makeForm

  setBlueprintDir (blueprintPath) {
    blueprintPath = path.resolve(blueprintPath)
    this.base = path.resolve(blueprintPath, '..')
    this.setBlueprint(path.basename(blueprintPath))
  }

  async makeCreatable (options) {
  }

  async makeQueryable (options) {
  }

  makeStateMachine (options) {
    const machineName = options.stateMachine
    const formName = path.basename(options.formName)
    const uiName = `${options.namespace}_${_.camelCase(formName)}`
    const model = options.modelName
    const categories = Array.isArray(options.categories) ? options.categories.map(c => `"${c}"`).join(',') : options.categories
    const roles = Array.isArray(options.roles) ? options.roles : ['$authenticated']

    const label = options.label ||
      `${_.upperFirst(machineName)} ${model}`
    const description = options.description ||
      `${_.upperFirst(machineName)} ${model} using ${formName} form.`

    const templateFile = path.join('state-machines', `${machineName}.json.ejs`)

    const filename = options.filename || (this._safeFilename(`${machineName}-${model}`) + '.json')
    const machinePath = path.join('state-machines', filename)

    const ctx = {
      label,
      description,
      model,
      uiName,
      formName,
      categories,
      roles,
      reindex: options.reindex,
      presaveFn: options.presaveFn
    }

    this._templateCopy(templateFile, machinePath, ctx)

    return path.basename(filename)
  }

  makeFunction (options) {
    this._templateCopy(
      'function.js.ejs',
      `${this._safeFilename(options.name)}.js`,
      options,
      'functions'
    )
  } // makeFunction

  makeCategory (options) {
    this._templateCopy(
      'category.json.ejs',
      `${this._safeFilename(options.name)}.json`,
      options,
      'categories'
    )
  }

  makeSearchDoc (options) {
    const pks = options.primaryKeys || [ 'id' ]
    options.primaryKeyString = pks
      .map(k => `${k}::text`)
      .join(' || ')
    options.descriptionString = options.description
      .map(k => `${_.snakeCase(k)}::text`)
      .join(' || \' \' || ')
    options.rolesString = options.roles
      .map(r => `\\"${r}\\"`)
      .join(', ')
    options.launchesString = formatLaunches(
      options.launches,
      pks
    )
    options.title = _.snakeCase(options.title)
    options.sort = _.snakeCase(options.sort)

    const fileName = options.filename ||
      `${this._safeFilename(options.model)}.json`

    this._templateCopy(
      'search-doc.json.ejs',
      fileName,
      options,
      'search-docs'
    )
  } // makeSearchDocs

  async commit () {
    return this.commit
  }
}

function formatLaunches (launches, primaryKeys) {
  if (!launches || launches.length === 0) {
    return 'NULL::text'
  }

  const input = { }
  primaryKeys.forEach(k => { input[k] = `'||${k}||'` })

  const launchArray = launches
    .map(l => {
      return {
        input: input,
        stateMachineName: l.stateMachine,
        title: l.title || 'Open'
      }
    })

  const launchObj = {
    launches: launchArray
  }

  const formattedLaunch = JSON.stringify(launchObj)
    .replace(/"/g, '\\"')
  return `'${formattedLaunch}'::text`
} // formatLaunches
