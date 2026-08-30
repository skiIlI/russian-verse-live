function closeToken(left: string, right: string): boolean {
  if (left === right) return true;
  if (Math.min(left.length, right.length) < 4 || Math.abs(left.length - right.length) > 1) return false;
  let differences = 0;
  let leftIndex = 0;
  let rightIndex = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex += 1;
      rightIndex += 1;
      continue;
    }
    differences += 1;
    if (differences > 1) return false;
    if (left.length > right.length) leftIndex += 1;
    else if (right.length > left.length) rightIndex += 1;
    else {
      leftIndex += 1;
      rightIndex += 1;
    }
  }
  return differences + Number(leftIndex < left.length || rightIndex < right.length) <= 1;
}

function overlapCount(reference: string[], observed: string[]): number {
  const remaining = [...observed];
  let count = 0;
  for (const token of reference) {
    const index = remaining.findIndex((candidate) => closeToken(token, candidate));
    if (index < 0) continue;
    count += 1;
    remaining.splice(index, 1);
  }
  return count;
}

function orderedCount(reference: string[], observed: string[]): number {
  const previous = new Uint16Array(observed.length + 1);
  for (const referenceToken of reference) {
    const current = new Uint16Array(observed.length + 1);
    for (let index = 1; index <= observed.length; index += 1) {
      current[index] = closeToken(referenceToken, observed[index - 1])
        ? previous[index - 1] + 1
        : Math.max(current[index - 1], previous[index]);
    }
    previous.set(current);
  }
  return previous[observed.length];
}

function longestOrderedRun(reference: string[], observed: string[]): number {
  let longest = 0;
  for (let left = 0; left < reference.length; left += 1) {
    for (let right = 0; right < observed.length; right += 1) {
      let run = 0;
      while (
        left + run < reference.length
        && right + run < observed.length
        && closeToken(reference[left + run], observed[right + run])
      ) run += 1;
      longest = Math.max(longest, run);
    }
  }
  return longest;
}

export type QuoteScore = { score: number; coverage: number; ordered: number; matched: number };

export function scoreQuote(
  reference: string[],
  observed: string[],
  { contextual = false, cued = false }: { contextual?: boolean; cued?: boolean } = {},
): QuoteScore | null {
  if (reference.length < 3 || observed.length < 3) return null;
  const matched = overlapCount(reference, observed);
  const orderedMatched = orderedCount(reference, observed);
  const longestRun = longestOrderedRun(reference, observed);
  const coverage = matched / reference.length;
  const ordered = orderedMatched / reference.length;
  const runBonus = Math.min(0.12, Math.max(0, longestRun - 3) * 0.03);
  const score = coverage * 0.66 + ordered * 0.34 + runBonus + (contextual ? 0.035 : 0) + (cued ? 0.02 : 0);

  const minimumMatched = reference.length <= 5 ? 3 : reference.length <= 11 ? 4 : 6;
  const baseCoverage = reference.length <= 5 ? 0.78 : reference.length <= 11 ? 0.6 : 0.48;
  const strongPartialQuote = (contextual || cued) && longestRun >= 5;
  const minimumCoverage = contextual || cued
    ? Math.min(baseCoverage, strongPartialQuote ? 0.5 : baseCoverage)
    : Math.max(0.66, baseCoverage);
  const minimumScore = contextual ? 0.55 : cued ? 0.6 : 0.75;
  const observedPrecision = matched / observed.length;
  const weakUncontextualizedQuote = cued
    && !contextual
    && score < 0.72
    && longestRun < 4
    && observedPrecision < 0.36;
  if (matched < minimumMatched || coverage < minimumCoverage || score < minimumScore || weakUncontextualizedQuote) return null;
  return { score: Math.min(0.99, score), coverage, ordered, matched };
}
