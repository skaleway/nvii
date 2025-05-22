export function analyzeContent(content: Record<string, string>) {
  let totalElem = 0;
  let totalEmpty = 0;

  for (const key in content) {
    if (Object.prototype.hasOwnProperty.call(content, key)) {
      totalElem++;
      if (content[key] === "") {
        totalEmpty++;
      }
    }
  }

  return {
    totalElem,
    totalEmpty,
  };
}
