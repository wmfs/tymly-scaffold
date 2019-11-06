/* eslint-env mocha */

const expect = require('chai').expect
const Scaffold = require('../lib/index')
const path = require('path')
const fs = require('fs-extra')
const rimraf = require('rimraf')

describe('Test scaffolder', function () {
  this.timeout(process.env.TIMEOUT || 5000)

  let scaffold

  const blueprintMeta = {
    name: 'tymly-pizza-blueprint',
    description: 'For ordering delicious pizza',
    organisation: 'West Midlands Fire Service',
    author: 'John Doe',
    license: 'MIT',
    gitHubOwner: 'wmfs',
    npmOrg: 'wmfs',
    semanticVersioning: true,
    ciProfile: 'travis'
  }

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
    scaffold.addBlueprint(blueprintMeta)
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

  it('should get editable card', () => {
    const cardTemplate = scaffold.getComponentJson('card-templates', 'pizza-editing-form')

    expect(cardTemplate.body.length).to.eql(9)
    expect(cardTemplate.body[1].id).to.eql('code')
    expect(cardTemplate.body[1].type).to.eql('Input.Text')

    expect(cardTemplate.actions.length).to.eql(2)
  })

  it('should stage objects to make the pizza model viewable', async () => {
    await scaffold.makeViewable(
      {
        modelName: 'pizza'
      }
    )
  })

  it('should get viewable card', () => {
    const cardTemplate = scaffold.getComponentJson('card-templates', 'pizza-viewing-form')

    expect(cardTemplate.body.length).to.eql(9)
    expect(cardTemplate.body[1].type).to.eql('FactSet')

    expect(cardTemplate.actions.length).to.eql(1)
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

  it('check blueprint meta', () => {
    const meta = scaffold.getComponentJson(null, 'blueprint')
    expect(meta.author).to.eql(blueprintMeta.author)
  })

  it('edit blueprint meta', () => {
    blueprintMeta.author = 'John Doe'
    scaffold.addBlueprint(blueprintMeta)
  })

  it('check blueprint meta has been updated', () => {
    const meta = scaffold.getComponentJson(null, 'blueprint')
    expect(meta.author).to.eql(blueprintMeta.author)
  })

  it('update a card template from the blueprint', async () => {
    const filename = `pizza-editing-form`
    const cardscript = scaffold.getComponentJson('card-templates', filename)
    cardscript.body.push({ type: 'TextBlock', text: 'Hello World' })
    await scaffold.updateCardTemplate({ filename: `${filename}.json`, cardscript })
  })

  it('check updated card template', () => {
    const cardscript = scaffold.getComponentJson('card-templates', 'pizza-editing-form')
    expect(cardscript.body[cardscript.body.length - 1]).to.eql({ type: 'TextBlock', text: 'Hello World' })
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

  it('make state machine to launch card to view pizza record', () => {
    const stateMachines = Scaffold.StateMachines()
    const stateMachine = stateMachines.find(s => s.name === 'view')

    scaffold.makeStateMachine({
      namespace: 'test',
      stateMachine: stateMachine.name,
      formName: 'pizza-viewing-form',
      modelName: 'pizza',
      categories: [],
      roles: [],
      // label: 'this is a label', // optional
      // description: 'this is a description', // optional
      filename: '', // optional,
      reindex: false, // whether to reindex after
      presaveFn: false // name of function to run
      // field: '' // this is for the where filter on finding
    })
  })

  it('make state machine to launch card to create pizza record', () => {
    const stateMachines = Scaffold.StateMachines()
    const stateMachine = stateMachines.find(s => s.name === 'create')

    scaffold.makeStateMachine({
      namespace: 'test',
      stateMachine: stateMachine.name,
      formName: 'pizza-editing-form',
      modelName: 'pizza',
      categories: [],
      roles: [],
      // label: 'this is a label', // optional
      // description: 'this is a description', // optional
      filename: '', // optional,
      reindex: false, // whether to reindex after
      presaveFn: false // name of function to run
      // field: '' // this is for the where filter on finding
    })
  })

  it('make state machine to launch card to update pizza record', () => {
    const stateMachines = Scaffold.StateMachines()
    const stateMachine = stateMachines.find(s => s.name === 'update')

    scaffold.makeStateMachine({
      namespace: 'test',
      stateMachine: stateMachine.name,
      formName: 'pizza-editing-form',
      modelName: 'pizza',
      categories: [],
      roles: [],
      // label: 'this is a label', // optional
      // description: 'this is a description', // optional
      filename: '', // optional,
      reindex: false, // whether to reindex after
      presaveFn: false // name of function to run
      // field: '' // this is for the where filter on finding
    })
  })

  it('should write new state machines inside existing blueprint', async () => {
    await scaffold.commit()
  })
})
