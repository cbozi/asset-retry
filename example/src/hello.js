export default function () {
  const h1 = document.createElement('h1')
  h1.innerHTML = 'Hello world!'
  h1.id = 'test-dynamic-import'
  document.body.appendChild(h1)
}
