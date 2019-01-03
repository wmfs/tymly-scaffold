/* eslint-env mocha */

// const expect = require('chai').expect
const Scaffold = require('../lib/index')
const path = require('path')

describe('Test scaffolder', function () {
  this.timeout(process.env.TIMEOUT || 5000)

  let scaffold
  let blueprintInfo

  it('should get a new Scaffold instance', () => {
    scaffold = new Scaffold(
      {
        target: 'file',
        targetConfig: {
          blueprintsPath: path.join(__dirname, 'output')
        }
      }
    )
  })

  it('should stage a new blueprint', async () => {
    blueprintInfo = await scaffold.addBlueprint(
      {
        name: 'tymly-blueprint-pizza',
        description: 'For ordering delicious pizza',
        organisation: 'West Midlands Fire Service',
        author: 'Jane Doe',
        license: 'MIT',
        githubOrg: 'wmfs',
        npmOrg: '@wmfs'
      }
    )
  })

  it('should set blueprint for future staging actions', () => {
    scaffold.setBlueprint(blueprintInfo.name)
  })

  it('should stage a new model', async () => {
    await scaffold.addModel(
      {
        modelName: 'pizza',
        description: 'Pizza!'
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
    await scaffold.write()
  })

  it('should get a model', async () => {
    const model = await scaffold.getModel('pizza')
    console.log(model)
  })
})
