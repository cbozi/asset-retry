import { retryDynamicImport } from '../../dist/index.esm'

function component() {
  const element = document.createElement('div')
  const button = document.createElement('button')

  button.innerHTML = 'Click me'
  button.id = 'test-button'
  element.appendChild(button)

  // Note that because a network request is involved, some indication
  // of loading would need to be shown in a production-level site/app.
  button.onclick = () =>
    retryDynamicImport(() => import(/* webpackChunkName: "hello" */ './hello'))
      .then((module) => {
        const hello = module.default

        hello()
      })

  return element
}

document.body.appendChild(component())
