## [1.12.1](https://github.com/wmfs/tymly-scaffold/compare/v1.12.0...v1.12.1) (2019-02-06)


### 🐛 Bug Fixes

* Tweak search-doc description ([cfe7888](https://github.com/wmfs/tymly-scaffold/commit/cfe7888))

# [1.12.0](https://github.com/wmfs/tymly-scaffold/compare/v1.11.0...v1.12.0) (2019-02-02)


### ✨ Features

* makeSearchDoc first pass ([bce68e1](https://github.com/wmfs/tymly-scaffold/commit/bce68e1))

# [1.11.0](https://github.com/wmfs/tymly-scaffold/compare/v1.10.0...v1.11.0) (2019-01-31)


### ✨ Features

* Extended addRoleTemplate to include role memberships ([b0ecf02](https://github.com/wmfs/tymly-scaffold/commit/b0ecf02))


### 💎 Styles

* Remove dead code ([e84b875](https://github.com/wmfs/tymly-scaffold/commit/e84b875))

# [1.10.0](https://github.com/wmfs/tymly-scaffold/compare/v1.9.0...v1.10.0) (2019-01-30)


### ✨ Features

* add categories to makeStateMachine ([56a4694](https://github.com/wmfs/tymly-scaffold/commit/56a4694))

# [1.9.0](https://github.com/wmfs/tymly-scaffold/compare/v1.8.1...v1.9.0) (2019-01-30)


### ✨ Features

* Added makeCategory method ([ae5d856](https://github.com/wmfs/tymly-scaffold/commit/ae5d856))

## [1.8.1](https://github.com/wmfs/tymly-scaffold/compare/v1.8.0...v1.8.1) (2019-01-30)


### 🐛 Bug Fixes

* **deps:** Pull in json-schema-to-cardscript 1.3.0 ([d3ee290](https://github.com/wmfs/tymly-scaffold/commit/d3ee290))

# [1.8.0](https://github.com/wmfs/tymly-scaffold/compare/v1.7.0...v1.8.0) (2019-01-30)


### ✨ Features

* Add create statemachine template.  Generate correct state machine filename ([a67d762](https://github.com/wmfs/tymly-scaffold/commit/a67d762))


### 🐛 Bug Fixes

* Remove categories from update statemachine ([53bbe10](https://github.com/wmfs/tymly-scaffold/commit/53bbe10))

# [1.7.0](https://github.com/wmfs/tymly-scaffold/compare/v1.6.0...v1.7.0) (2019-01-30)


### ✨ Features

* Drop tymlyScaffold field in favour of meta provided by json-schema-to-cardscript ([ffe9fe6](https://github.com/wmfs/tymly-scaffold/commit/ffe9fe6))

# [1.6.0](https://github.com/wmfs/tymly-scaffold/compare/v1.5.0...v1.6.0) (2019-01-30)


### ✨ Features

* Add makeStateMachine method ([3a7f5ed](https://github.com/wmfs/tymly-scaffold/commit/3a7f5ed))
* Add StateMachines static method ([c607de4](https://github.com/wmfs/tymly-scaffold/commit/c607de4))


### 🐛 Bug Fixes

* Return base filename from makeStateMachine ([b010872](https://github.com/wmfs/tymly-scaffold/commit/b010872))

# [1.5.0](https://github.com/wmfs/tymly-scaffold/compare/v1.4.1...v1.5.0) (2019-01-29)


### ✨ Features

* Drop tymlyScaffold element into generated forms ([6dd4405](https://github.com/wmfs/tymly-scaffold/commit/6dd4405))


### 🐛 Bug Fixes

* **deps:** Fix dependency version. Explicitly pull in globby 9.0.0 because 8.0.1 didn't play with di ([4324797](https://github.com/wmfs/tymly-scaffold/commit/4324797))

## [1.4.1](https://github.com/wmfs/tymly-scaffold/compare/v1.4.0...v1.4.1) (2019-01-28)


### 🐛 Bug Fixes

* Add namespace field to blueprint.json ([f78f5a6](https://github.com/wmfs/tymly-scaffold/commit/f78f5a6))

# [1.4.0](https://github.com/wmfs/tymly-scaffold/compare/v1.3.0...v1.4.0) (2019-01-24)


### ✨ Features

* Can pass modelSchema as an option to makeEditable ([73be443](https://github.com/wmfs/tymly-scaffold/commit/73be443))

# [1.3.0](https://github.com/wmfs/tymly-scaffold/compare/v1.2.0...v1.3.0) (2019-01-21)


### ✨ Features

* makeEditable uses option.filename if provided ([2a76e30](https://github.com/wmfs/tymly-scaffold/commit/2a76e30))

# [1.2.0](https://github.com/wmfs/tymly-scaffold/compare/v1.1.1...v1.2.0) (2019-01-18)


### ✨ Features

* Implemented property subset form generation ([c1df87b](https://github.com/wmfs/tymly-scaffold/commit/c1df87b))


### 📚 Documentation

* Correct travis link ([3a84792](https://github.com/wmfs/tymly-scaffold/commit/3a84792))

## [1.1.1](https://github.com/wmfs/tymly-scaffold/compare/v1.1.0...v1.1.1) (2019-01-18)


### 🐛 Bug Fixes

* **deps:** Correct [@wmfs](https://github.com/wmfs)/json-schema-builder dependency ([5b295c2](https://github.com/wmfs/tymly-scaffold/commit/5b295c2))

# [1.1.0](https://github.com/wmfs/tymly-scaffold/compare/v1.0.0...v1.1.0) (2019-01-18)


### ✨ Features

* Expose list of available types through Scaffold.ModelTypes ([668af51](https://github.com/wmfs/tymly-scaffold/commit/668af51))


### 🐛 Bug Fixes

* Don't prefix subdirectories with 'components/' ([2e71428](https://github.com/wmfs/tymly-scaffold/commit/2e71428))
* Full resolve path in setBlueprintPath. ([4c7d12e](https://github.com/wmfs/tymly-scaffold/commit/4c7d12e))
* **deps:** correct json-schema-to-cardscript dependency ([ca05723](https://github.com/wmfs/tymly-scaffold/commit/ca05723))
* **deps:** Pull in json-schema-builder 1.1.0 to support model primary key generation ([ea564c8](https://github.com/wmfs/tymly-scaffold/commit/ea564c8))


### 📦 Code Refactoring

* add empty CHANGELOG.md to template ([cf9b3a5](https://github.com/wmfs/tymly-scaffold/commit/cf9b3a5))

# 1.0.0 (2019-01-07)


### ✨ Features

* Add more tests. ([93d914b](https://github.com/wmfs/tymly-scaffold/commit/93d914b))
* Add seed data suggestions. ([a445f22](https://github.com/wmfs/tymly-scaffold/commit/a445f22))


### 🐛 Bug Fixes

* Lint fixes. ([2c38191](https://github.com/wmfs/tymly-scaffold/commit/2c38191))


### 📚 Documentation

* add codecov badge ([883513b](https://github.com/wmfs/tymly-scaffold/commit/883513b))
