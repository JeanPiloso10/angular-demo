[![@coreui angular](https://img.shields.io/badge/@coreui%20-angular-lightgrey.svg?style=flat-square)](https://github.com/coreui/angular)
[![npm-coreui-angular][npm-coreui-angular-badge]][npm-coreui-angular]
[![@coreui coreui](https://img.shields.io/badge/@coreui%20-coreui-lightgrey.svg?style=flat-square)](https://github.com/coreui/coreui)
[![npm package][npm-coreui-badge]][npm-coreui]
![angular](https://img.shields.io/badge/angular-^17.2.0-lightgrey.svg?style=flat-square&logo=angular)

[npm-coreui-angular]: https://www.npmjs.com/package/@coreui/angular
[npm-coreui-angular-badge]: https://img.shields.io/npm/v/@coreui/angular.png?style=flat-square
[npm-coreui-angular-badge-next]: https://img.shields.io/npm/v/@coreui/angular/next?style=flat-square&color=red
[npm-coreui-angular-download]: https://img.shields.io/npm/dm/@coreui/angular.svg?style=flat-square
[npm-coreui]: https://www.npmjs.com/package/@coreui/coreui
[npm-coreui-badge]: https://img.shields.io/npm/v/@coreui/coreui.png?style=flat-square
[npm-coreui-download]: https://img.shields.io/npm/dm/@coreui/coreui.svg?style=flat-square

# ERP-Frontend

Aplicación frontend de sistema ERP.


## Table de Contenido

* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Basic usage](#basic-usage)
* [Directory](#directory)
* [Documentation](#documentation)
* [Creators](#creators)


## Prerequisites
Before you begin, make sure your development environment includes `Node.js®` and an `npm` package manager.

###### Node.js
[**Angular 18.1**](https://angular.io/guide/what-is-angular) requires `Node.js` LTS version `^18.13` or `^20.09`.

- To check your version, run `node -v` in a terminal/console window.
- To get `Node.js`, go to [nodejs.org](https://nodejs.org/).

###### Angular CLI
Install the Angular CLI globally using a terminal/console window.
```bash
npm install -g @angular/cli
```

### Installation

``` bash
$ npm install
$ npm update
```

### Basic usage

``` bash
# dev server with hot reload at http://localhost:4200
$ npm start
```

Navigate to [http://localhost:4200](http://localhost:4200). The app will automatically reload if you change any of the source files.

#### Build

Run `build` to build the project. The build artifacts will be stored in the `dist/` directory.

```bash
# build for production with minification
$ npm run build
```
## Directory

Project directory.

```
erp-frontend
├── src/                         # project root
│   ├── app/                     # main app directory
|   │   ├── containers/          # layout containers
|   |   │   └── default-layout/  # layout containers
|   |   |       └── _nav.js      # sidebar navigation config
|   │   ├── core/                # elementos claves de proyecto relacionados a la seguridad
|   |   │   ├── guards/          # control de acceso a rutas
|   |   │   ├── interceptors/    # intercetar y modificar solicitudes HTTP
|   |   │   ├── models/          # modelos claves del proyecto
|   |   │   └── services/        # servicios del proyecto
|   │   ├── shared-features/     # caracteristicas compartidas del proyecto
|   |   │   ├── components/      # componentes compartidos de la aplicación
|   |   │   ├── enums/           # enums compartidos de la aplicación
|   |   │   └── utilities/       # utilidades compartidas de la aplicación
|   │   ├── icons/               # icons set for the app
|   │   └── views/               # application views
│   ├── assets/                  # images, icons, etc.
│   ├── components/              # components for demo only
│   ├── environments/            # configuración de ambiente de la aplicación
│   ├── scss/                    # scss styles
│   └── index.html               # html template
│
├── angular.json
├── README.md
└── package.json
```

## Documentation

**

---

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.0.0.

## Creators

*Rodrigo Medina
*Jefferson Loor
*Jean Piloso

