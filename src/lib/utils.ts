import { GENERAL_QUESTIONS, LABELS, LANGUAGE_COLOURS } from "./consts";

async function download_csv() {
  const target = `https://docs.google.com/spreadsheet/ccc?key=1cnmEzRqFF_AxpEBQ01uLNofmLURNClYDHN_w9Oef9ZQ&output=csv`;
  const res = fetch(target, {
    method: "get",
    headers: { "content-type": "text/csv;charset=UTF-8" },
  })
    .then((res) => res.text())
    .then((res): [Map<string, Array<string>>, Map<string, Array<number>>] => {
      let raw = res.split("\r\n").map((line) => line.split(",").slice(1));
      let numeric = {};
      let alpha = {};
      raw[0]
        .map((_, colIndex) =>
          raw
            .map((row) => row[colIndex])
            .filter((e) => e != "")
            .map((v) => {
              let l = parseFloat(v);
              return isNaN(l) ? v : l;
            })
        )
        .map(
          (x) => ((isNaN(x[1] as any) ? alpha : numeric)[x[0]] = x.slice(1))
        );
      return [
        alpha as Map<string, Array<string>>,
        numeric as Map<string, Array<number>>,
      ];
    });
  return res;
}

function get_rgba(lang: string) {
  let hex = LANGUAGE_COLOURS[lang];
  return [`rgba(${hex},0.8)`, `rgb(${hex})`];
}

function parse_csv_numerics(numerics: Map<string, Array<number>>) {
  let averages = Object.entries(numerics)
    .map(([key, value]: [string, Array<number>]) => {
      let name = key.split(" ")[2];
      return [
        name,
        value.reduce((sum, num) => sum + num, 0) / value.length,
        ...get_rgba(name),
      ];
    })
    .sort((l, b) => (l[1] as number) - (b[1] as number));

  let data = [];
  let backgroundColor = [];
  let borderColor = [];

  averages.forEach(([label, value, bg, border]) => {
    data.push(value);
    backgroundColor.push(bg);
    borderColor.push(border);
  });

  return {
    labels: LABELS,
    datasets: [
      {
        label: "Average Rating",
        type: "bar",
        data: averages.map((k) => k[1]),
        backgroundColor,
        borderColor,
        borderWidth: 2,
      },
    ],
  };
}

function parse_csv_generals(general: Map<string, Array<string>>) {
  let datasets = [];
  GENERAL_QUESTIONS.forEach((k) => {
    let data = new Array(LABELS.length).fill(0);
    general[k[0]].forEach((k) => (data[LABELS.indexOf(k)] += 1));
    datasets.push({
      labels: LABELS,
      datasets: [
        {
          label: k[1],
          type: "bar",
          data,
          backgroundColor: `rgba(${k[2]},0.5)`,
          borderColor: `rgb(${k[2]})`,
          borderWidth: 2,
        },
      ],
    });
  });

  return datasets;
}

export { download_csv, get_rgba, parse_csv_numerics, parse_csv_generals };
