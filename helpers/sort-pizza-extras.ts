const sortPizzaExtras = (array1:any,array2: any) => {
// Sort both arrays alphabetically
if(array1?.length > 0){
    array1?.sort();
}
if(array2?.length > 0){
    array2?.sort();
}

// Initialize arrays for aligned words and unique words
let alignedArray1 = [];
let alignedArray2 = [];
let uniqueArray1 = [];
let uniqueArray2 = [];

// Align the words in both arrays, move unique words to separate arrays
let i = 0, j = 0;
while (i < array1?.length && j < array2?.length) {
    if (array1[i] === array2[j]) {
        alignedArray1.push(array1[i]);
        alignedArray2.push(array2[j]);
        i++;
        j++;
    } else if (array1[i] < array2[j]) {
        uniqueArray1.push(array1[i]);
        i++;
    } else {
        uniqueArray2.push(array2[j]);
        j++;
    }
}

// Add any remaining unique elements to the unique arrays
while (i < array1?.length) {
    uniqueArray1.push(array1[i]);
    i++;
}

while (j < array2?.length) {
    uniqueArray2.push(array2[j]);
    j++;
}

// Combine aligned arrays with unique words at the end
alignedArray1 = alignedArray1?.concat(uniqueArray1);
alignedArray2 = alignedArray2?.concat(uniqueArray2);

// Output the final aligned arrays

    return {
        halfOne: alignedArray1,
        halfTwo: alignedArray2
    }
  }

  export default sortPizzaExtras;