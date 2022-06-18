export function getBoundedRandom(min, max) {
  return Math.random() * (max - min) + min
}
