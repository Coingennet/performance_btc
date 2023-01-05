export function arrFromRangeGenerate(from, to, numberIncreate = 1) {
  let result = [];
  while (from <= to) {
    result.push(from);
    let next = from + numberIncreate;
    if (from < to && next > to) {
      result.push(to);
    }
    from = next;
  }
  return result;
}

export function getQuarterFromMonth(month, isNotMonthIndex = false) {
  if (!isNotMonthIndex) {
    month += 1;
  }
  if ([1, 2, 3].includes(month)) {
    return 0;
  }
  if ([4, 5, 6].includes(month)) {
    return 1;
  }
  if ([7, 8, 9].includes(month)) {
    return 2;
  }
  if ([10, 11, 12].includes(month)) {
    return 3;
  }
  return 4;
}

export * from "./number";
