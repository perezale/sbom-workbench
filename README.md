# [SCANOSS AUDIT WORKBENCH](https://scanoss.com/product)
<div>

![GitHub release (latest by date)](https://img.shields.io/github/v/release/scanoss/audit-workbench)
![License](https://img.shields.io/badge/license-GPL--2.0-brightgreen)
[![REUSE status](https://api.reuse.software/badge/github.com/scanoss/audit-workbench)](https://api.reuse.software/info/github.com/scanoss/audit-workbench)
![test_workflow](https://github.com/scanoss/audit-workbench/actions/workflows/test.yml/badge.svg?branch=main)

</div>

The SCANOSS Audit Workbench is a graphical user interface to scan and audit source code using SCANOSS API.

<img src=".erb/img/workbench_1.c77c358" width="70%" />


Auditing your source code for license compliance has never been easier. Simply scan your source code directory to find and identify open source components. Generate your SPDX-Lite software bill of materials (SBOM) with the press of a button.


## Prerequisites
- Node.js v14+
- NPM (Node Packages Manager)

We strongly recommend handling your node versions using [nvm](https://github.com/nvm-sh/nvm)

## Install 

```bash
npm install
```

### Troubleshooting
SCANOSS Audit Workbench uses [node-gyp](https://www.npmjs.com/package/node-gyp) to compile SQLite3 native module. 
This module uses "node-pre-gyp" to download the prebuilt binary for your platform instead you need build from source. 
In case it does not exist for your platform, node-gyp going to build it.

Depending on your operating system, you will need prepare the correct environment to run node-gyp: See [https://github.com/nodejs/node-gyp#installation](https://github.com/nodejs/node-gyp#installation)



## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

For live reloading you can use `npm run start --watch` to run the app using [Electronmon](https://github.com/catdad/electronmon#readme). Warning: this tool has a high memory consumption.

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```

## Docs
This project was made using Electron React Boilerplate

See [docs and guides here](https://electron-react-boilerplate.js.org/docs/installation)


