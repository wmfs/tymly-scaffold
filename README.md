# tymly-scaffold

> Generates stub blueprint-component files.

# Installation

``` bash
npm install @wmfs/tymly-scaffold --save
```

## <a name="Usage"></a> Usage

``` javascript

const Scaffold = require('@wmfs/tymly-scaffold')

const scaffold = new Scaffold(
  {
    target: 'file',
    targetConfig: {
      blueprintsPath: 'c:/my-blueprints'
    }
  }
)

const blueprintInfo = await scaffold.addBlueprint({
  name: 'tymly-blueprint-pizza',
  description: 'For ordering delicious pizza',
  organisation: 'West Midlands Fire Service',
  author: 'Jane Doe',
  license: 'MIT',
  githubOrg: 'wmfs',
  npmOrg: '@wmfs'

})

scaffold.setBlueprint(blueprintInfo.name)

await scaffold.addModel({
  modelName: 'pizza',
  description: 'Pizza!'
})

const model = await scaffold.getModel({
  modelName: 'pizza'
})

await scaffold.addSeedData({
  modelName: 'pizza'
})

const model = await scaffold.getSeedData({
  modelName: 'pizza'
})

await scaffold.addEditable({
  modelName: 'pizza'
})

await scaffold.addCreatable({
  modelName: 'pizza'
})

await scaffold.addQueryable({
  modelName: 'pizza',
  roles: ['$everyone']
})

await scaffold.addRoleTemplate({
  name: 'manager'
})


```

## <a name='license'></a>License
[MIT](https://github.com/wmfs/tymly-gatherer/blob/master/LICENSE)
