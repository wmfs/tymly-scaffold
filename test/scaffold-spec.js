/* eslint-env mocha */

// const expect = require('chai').expect
const Scaffold = require('../lib/index')
const path = require('path')
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
            typeHint: 'string',
            required: true,
            title: 'Unique code of the pizza',
            minLength: 3,
            maxLength: 15
          },
          {
            key: 'label',
            typeHint: 'string',
            required: true,
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
            typeHint: 'string',
            multiple: true,
            uniqueItems: true,
            title: 'List of allergens present in pizza'
          },
          {
            key: 'availabilityEnd',
            typeHint: 'date',
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
                typeHint: 'string',
                required: true,
                title: 'Who wrote the review'
              },
              {
                key: 'review',
                typeHint: 'string',
                required: true,
                title: 'Something nice to say'
              },
              {
                key: 'rating',
                title: 'Star rating (0=Awful 5=Great)',
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

  it('should stage some seed data', async () => {
    await scaffold.addSeedData(
      {
        modelName: 'pizza'
      }
    )
  })

  it('should stage a new Role Template', async () => {
    await scaffold.addRoleTemplate(
      {
        name: 'manager'
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
        modelName: 'pizza'
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

  it('should write staged things to target', async () => {
    await scaffold.commit()
  })

  it('should get a model', async () => {
    await scaffold.getModel('pizza')
  })
})
