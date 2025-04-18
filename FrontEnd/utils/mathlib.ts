
export function argmax (array: Float32Array): number {
  if (array.length === 0) {
    return -1; // Or throw an error, depending on how you want to handle empty arrays
  }

  let maxVal = array[0];
  let maxIndex = 0;

  for (let i = 1; i < array.length; i++) {
    if (array[i] > maxVal) {
      maxVal = array[i];
      maxIndex = i;
    }
  }

  return maxIndex;
}