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

  it('should stage a new blueprint', async () => {
    await scaffold.addBlueprint(
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
    await scaffold.commit()
  })

  it('should get a model', async () => {
    await scaffold.getModel('pizza')
  })
})
