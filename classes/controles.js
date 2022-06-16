export class Controles {
  constructor() {
    this.right = false
    this.left = false
    this.thrust = false
    this.fire = false
    this.#addListeners()
  }
  #addListeners() {
    window.onkeydown = (e) => {
      switch (e.key) {
        case 'j':
          this.left = true
          break
        case 'l':
          this.right = true
          break
        case 'k':
          this.thrust = true
          break
        case 'a':
          this.fire = true
          break
      }
    }
    window.onkeyup = (e) => {
      switch (e.key) {
        case 'j':
          this.left = false
          break
        case 'l':
          this.right = false
          break
        case 'k':
          this.thrust = false
          break
        case 'a':
          this.fire = false
          break
      }
    }
  }
}
