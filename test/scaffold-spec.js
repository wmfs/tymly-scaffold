/* eslint-env mocha */

const expect = require('chai').expect
const Scaffold = require('../lib/index')
const path = require('path')
const fs = require('fs-extra')
const rimraf = require('rimraf')

describe('Test scaffolder', function () {
  this.timeout(process.env.TIMEOUT || 5000)

  let scaffold

  it('should make sure ./output doesn\'t exist already', (done) => {
    const outputPath = path.join(__dirname, 'output')
    rimraf(
      outputPath,
      () => {
        done()
      }
    )
  })

  it('should get a new Scaffold instance', () => {
    scaffold = new Scaffold(
      {
        basePath: path.join(__dirname, 'output')
      }
    )
  })

  it('should stage a new blueprint', () => {
    scaffold.addBlueprint(
      {
        name: 'tymly-pizza-blueprint',
        description: 'For ordering delicious pizza',
        organisation: 'West Midlands Fire Service',
        author: 'Jane Doe',
        license: 'MIT',
        gitHubOwner: 'wmfs',
        npmOrg: 'wmfs',
        semanticVersioning: true,
        ciProfile: 'travis'
      }
    )
  })

  it('should stage a new model', () => {
    scaffold.addModel(
      {
        name: 'pizza',
        title: 'Pizza',
        description: 'A model for storing details of a pizza (recipe, price etc.)',
        propertyHints: [
          {
            key: 'code',
            typeHint: 'text',
            example: 'CHEESE_TOMATO',
            required: true,
            title: 'Unique code of the pizza',
            minLength: 3,
            maxLength: 15
          },
          {
            key: 'label',
            typeHint: 'text',
            required: true,
            example: 'Cheese & Tomato',
            title: 'Customer-facing label'
          },
          {
            key: 'popularitySeq',
            typeHint: 'integer',
            required: true,
            title: 'Integer value to order lists by',
            minimum: 1
          },
          {
            key: 'imageUri',
            typeHint: 'uri',
            required: true,
            example: 'https://tinyurl.com/y8r5bbu5',
            title: 'URI to an enticing photo of the pizza'
          },
          {
            key: 'vegetarian',
            typeHint: 'boolean',
            required: true,
            default: false,
            title: 'Is the pizza suitable for vegetarians?'
          },
          {
            key: 'allergens',
            typeHint: 'text',
            example: ['Gluten', 'Wheat', 'Milk'],
            multiple: true,
            uniqueItems: true,
            title: 'List of allergens present in pizza'
          },
          {
            key: 'availabilityEnd',
            typeHint: 'date',
            example: '2019-12-31',
            required: false,
            title: 'Date when pizza is no longer available.'
          },
          {
            key: 'reviews',
            typeHint: 'object',
            multiple: true,
            title: 'Favourable customer reviews',
            propertyHints: [
              {
                key: 'username',
                example: 'joebloggs4',
                typeHint: 'text',
                required: true,
                title: 'Who wrote the review'
              },
              {
                key: 'review',
                example: 'Lovely stuff!',
                typeHint: 'text',
                required: true,
                title: 'Something nice to say'
              },
              {
                key: 'rating',
                title: 'Star rating (0=Awful 5=Great)',
                example: 5,
                typeHint: 'integer',
                required: true,
                minimum: 0,
                maximum: 5,
                default: 5
              }
            ]
          }
        ]
      }
    )
  })

  it('should get a model schema', () => {
    const schema = scaffold.getComponentJson('models', 'pizza')
    expect(schema.title).to.equal('Pizza')
    expect(schema.properties.allergens.items.type).to.equal('string')
  })

  it('should stage some seed data', () => {
    scaffold.addSeedData(
      {
        modelName: 'pizza'
      }
    )
  })

  it('should get seed data', () => {
    const seed = scaffold.getComponentJson('seed-data', 'pizza')
    expect(seed.propertyNames).to.eql([
      'code',
      'label',
      'popularitySeq',
      'imageUri',
      'vegetarian',
      'availabilityEnd'
    ])
    expect(seed.data).to.eql(
      [
        [
          'CHEESE_TOMATO',
          'Cheese & Tomato',
          1,
          'https://tinyurl.com/y8r5bbu5',
          false,
          '2019-12-31'
        ]
      ]
    )
  })

  it('should stage a new Role Template', () => {
    scaffold.addRoleTemplate(
      {
        name: 'manager',
        label: 'Manager role',
        description: 'For regional, national managers.'
      }
    )
  })

  it('should get role template', () => {
    const roleTemplate = scaffold.getComponentJson('template-roles', 'manager')
    expect(roleTemplate).to.eql(
      {
        label: 'Manager role',
        description: 'For regional, national managers.',
        grants: [],
        roleMemberships: []
      }
    )
  })

  it('should stage objects to make the pizza model editable', async () => {
    await scaffold.makeEditable(
      {
        modelName: 'pizza'
      }
    )
  })

  it('should stage objects to make the pizza model creatable', async () => {
    await scaffold.makeCreatable(
      {
        modelName: 'order'
      }
    )
  })

  it('should stage objects to make the pizza model queryable', async () => {
    await scaffold.makeQueryable(
      {
        modelName: 'pizza'
      }
    )
  })

  it('add function skeleton', async () => {
    await scaffold.makeFunction(
      {
        name: 'doathing'
      }
    )
  })

  it('should write staged things to target', async () => {
    await scaffold.commit()
  })

  it('has function?', () => {
    const fnFile = path.join(scaffold.base, scaffold.blueprintName, 'functions', 'doathing.js')
    expect(fs.pathExistsSync(fnFile)).to.eql(true)
  })

  it('should make a new instance for adding new things to an existing blueprint', async () => {
    scaffold = new Scaffold()
  })

  it('should set internals to the existing blueprint', () => {
    scaffold.setBlueprintDir(path.join(__dirname, 'output', 'tymly-pizza-blueprint'))
  })

  it('should add a new Role Template to an existing blueprint', () => {
    scaffold.addRoleTemplate(
      {
        name: 'ceo',
        label: 'Big boss',
        description: 'A special role for the big boss.'
      }
    )
  })

  it('should write new template role inside existing blueprint', async () => {
    await scaffold.commit()
  })

  it('should get newly-added role template', () => {
    const roleTemplate = scaffold.getComponentJson('template-roles', 'ceo')
    expect(roleTemplate).to.eql(
      {
        label: 'Big boss',
        description: 'A special role for the big boss.',
        grants: [],
        roleMemberships: []
      }
    )
  })

  it('Available state machines', () => {
    expect(Scaffold.StateMachines().length).to.equal(4)
  })
})
