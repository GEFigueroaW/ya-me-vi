async function fetchData(game) {
  const fileMap = {
    melate: "data/melate.csv",
    revancha: "data/revancha.csv",
    revanchita: "data/revanchita.csv"
  };
  const response = await fetch(fileMap[game]);
  const csv = await response.text();
  return csv
    .trim()
    .split("\n")
    .slice(1, 51)
    .map(row => row.split(",").map(Number));
}

function analyzeNumbers(data) {
  const flat = data.flat();
  const frequency = Array(57).fill(0);
  const delay = Array(57).fill(0);
  const lastSeen = {};

  flat.forEach(num => frequency[num]++);
  flat.reverse().forEach((num, i) => {
    if (!(num in lastSeen)) lastSeen[num] = i;
  });

  const top6Freq = [...frequency.entries()]
    .slice(1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([num]) => num);

  const top6Delay = Object.entries(lastSeen)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([num]) => parseInt(num));

  const sectionCount = {
    "1-9": 0, "10-18": 0, "19-27": 0, "28-36": 0, "37-45": 0, "46-56": 0
  };
  flat.forEach(n => {
    if (n <= 9) sectionCount["1-9"]++;
    else if (n <= 18) sectionCount["10-18"]++;
    else if (n <= 27) sectionCount["19-27"]++;
    else if (n <= 36) sectionCount["28-36"]++;
    else if (n <= 45) sectionCount["37-45"]++;
    else sectionCount["46-56"]++;
  });

  return { frequency, delay, sectionCount, top6Freq, top6Delay };
}
