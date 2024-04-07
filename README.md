<div align="center">

# Monkey Tools For Wechaty

[![License](https://img.shields.io/github/license/inf-monkeys/monkey-tools-wechaty)](http://www.apache.org/licenses/LICENSE-2.0)
[![GitHub stars](https://img.shields.io/github/stars/inf-monkeys/monkey-tools-wechaty?style=social&label=Star&maxAge=2592000)](https://github.com/inf-monkeys/monkey-tools-wechaty/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/inf-monkeys/monkey-tools-wechaty?style=social&label=Fork&maxAge=2592000)](https://github.com/inf-monkeys/monkey-tools-wechaty)

</div>

## Installation

### Install Dependency

```sh
yarn
```

## Configuration

```yaml
# Defaults run at port 3009
server:
  port: 3009

# Database Config
database:
  type: better-sqlite3
  database: data/db.sqlite
  synchronize: true
```

## Start the App

```sh
yarn start
```

## Manifest URL

Depend on the port you set(defaults to 3009), the manifest url is:

```txt
http://localhost:3009/manifest.json
```
