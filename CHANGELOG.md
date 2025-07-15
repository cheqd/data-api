# Changelog

## [2.1.1-develop.1](https://github.com/cheqd/data-api/compare/2.1.0...2.1.1-develop.1) (2025-07-15)

### Bug Fixes

* Fetch tx types from Big Dipper properly [DEV-5137] ([#346](https://github.com/cheqd/data-api/issues/346)) ([1247c8d](https://github.com/cheqd/data-api/commit/1247c8daabfd4d78c1481d58d9b5d081d37d4beb))

## [2.1.0](https://github.com/cheqd/data-api/compare/2.0.1...2.1.0) (2025-05-23)

### Features

* Upgrade project to Node.js v22 ([#318](https://github.com/cheqd/data-api/issues/318)) ([a911773](https://github.com/cheqd/data-api/commit/a911773d24d0a5eda597907080d42d66af63c33c))

## [2.1.0-develop.1](https://github.com/cheqd/data-api/compare/2.0.1...2.1.0-develop.1) (2025-05-23)

### Features

* Upgrade project to Node.js v22 ([#318](https://github.com/cheqd/data-api/issues/318)) ([a911773](https://github.com/cheqd/data-api/commit/a911773d24d0a5eda597907080d42d66af63c33c))

## [2.0.1](https://github.com/cheqd/data-api/compare/2.0.0...2.0.1) (2025-03-14)

### Bug Fixes

* Resolve ESLint issues to improve code quality [DEV-4792] ([#274](https://github.com/cheqd/data-api/issues/274)) ([0c2c7ba](https://github.com/cheqd/data-api/commit/0c2c7ba6d4b254bfe25d900d80fbc5ed28b9a89d))

## [2.0.1-develop.1](https://github.com/cheqd/data-api/compare/2.0.0...2.0.1-develop.1) (2025-03-14)

### Bug Fixes

* Resolve ESLint issues to improve code quality [DEV-4792] ([#274](https://github.com/cheqd/data-api/issues/274)) ([0c2c7ba](https://github.com/cheqd/data-api/commit/0c2c7ba6d4b254bfe25d900d80fbc5ed28b9a89d))

## [2.0.0](https://github.com/cheqd/data-api/compare/1.0.0...2.0.0) (2025-03-13)

### ⚠ BREAKING CHANGES

* Add support for non-circulating-addresses

### Features

* Add analytics endpoints to fetch identity data [DEV-4774] ([#269](https://github.com/cheqd/data-api/issues/269)) ([6ba0f6a](https://github.com/cheqd/data-api/commit/6ba0f6a914b145435dbcb7d1d4378d15758a8e0f)), closes [#270](https://github.com/cheqd/data-api/issues/270)
* Add support for non-circulating-addresses ([b775822](https://github.com/cheqd/data-api/commit/b775822141edc69e31a5d16d996cad350d0b44f0))
* Circulating supply API and vesting API fixes [DEV-1388] ([#7](https://github.com/cheqd/data-api/issues/7)) ([a3e4a12](https://github.com/cheqd/data-api/commit/a3e4a1286ce698660f5f6652854f1aa31a8658d4))
* Create circulating supply API [DEV-1028] ([3a26551](https://github.com/cheqd/data-api/commit/3a26551920bc78a2f1581fb31efe6ef0dd1774a9))
* Delegator Count for Validators ([#8](https://github.com/cheqd/data-api/issues/8)) ([63830b6](https://github.com/cheqd/data-api/commit/63830b62cc40b683011dacfb3708eabb94ad821d))
* Design and implement monitoring for price discrepancies across exchanges [DEV-1300] ([#29](https://github.com/cheqd/data-api/issues/29)) ([f2a10c3](https://github.com/cheqd/data-api/commit/f2a10c3224af2f4dd088e83bdd84e6daf9be3736))
* Remove market monitoring API and update documentation for identity analytics [DEV-4788] ([#271](https://github.com/cheqd/data-api/issues/271)) ([5d01d69](https://github.com/cheqd/data-api/commit/5d01d69bdc4b966c4c540979188fea68b5a718e6))
* Staking rewards APIs ([#11](https://github.com/cheqd/data-api/issues/11)) ([209d5f2](https://github.com/cheqd/data-api/commit/209d5f20d7168d936424f4b51d20ed435a0240cb))
* Store identity-related transactions into relational DB [DEV-4773] ([#261](https://github.com/cheqd/data-api/issues/261)) ([6ea1e62](https://github.com/cheqd/data-api/commit/6ea1e6243da93892c4686646f4d90537b83c7d4b))

### Bug Fixes

* Circulating supply response ([#41](https://github.com/cheqd/data-api/issues/41)) ([3b930d3](https://github.com/cheqd/data-api/commit/3b930d32bf8833ff45850781ce9646701dc3248e))
* Drop active validators KV ([#42](https://github.com/cheqd/data-api/issues/42)) ([bcadfc5](https://github.com/cheqd/data-api/commit/bcadfc5a9155fa3b4d37233d9f4ce1284518fa5b))
* Filter by denom when displaying total account balance [DEV-3904] ([#197](https://github.com/cheqd/data-api/issues/197)) ([5e58dce](https://github.com/cheqd/data-api/commit/5e58dcebca88c11b747e08b5d7a5b2751cf766ed))
* Fix circulating supply API endpoint [DEV-1821] ([#35](https://github.com/cheqd/data-api/issues/35)) ([301769e](https://github.com/cheqd/data-api/commit/301769eb2d689f61882613b722d4533b4bf2b491)), closes [#38](https://github.com/cheqd/data-api/issues/38) [#37](https://github.com/cheqd/data-api/issues/37)
* **graphql:** Broken upstream API fix [DEV-1726] ([#22](https://github.com/cheqd/data-api/issues/22)) ([d1365d8](https://github.com/cheqd/data-api/commit/d1365d83cd7f5c53f09a6b57b4e746b796312b3d))
* Removed mis-configs & added bindings ([29b2b66](https://github.com/cheqd/data-api/commit/29b2b66f56bba09d58fccc9af4470545a232d3fd))
* Removed mis-configs & added bindings ([3e0092c](https://github.com/cheqd/data-api/commit/3e0092cb39c8342dc0d76c5a9049787280257bc6))
* Update production KV ([e9ff2aa](https://github.com/cheqd/data-api/commit/e9ff2aa6857e80286bb0acf902152e919b80cae6))
