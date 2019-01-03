/* eslint-env mocha */

const expect = require('chai').expect
const Scaffold = require('../lib/index')
const path = require('path')

describe('Test scaffolder', function () {
  this.timeout(process.env.TIMEOUT || 5000)

  let scaffold

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

})
