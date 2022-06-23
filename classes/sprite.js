export class Sprite {
  constructor({ spriteIndex, crop, currentSprite, updateFrame }) {
    this.spriteIndex = spriteIndex

    this.crop = crop

    this.currentSprite = currentSprite

    this.updateFrame = 0
  }
}
