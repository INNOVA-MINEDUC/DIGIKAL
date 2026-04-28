import fs from "fs";

const geojson = JSON.parse(
  fs.readFileSync("./Municipios.json", "utf8")
);

function transformar(data) {

  const departamentosMap = new Map();
  const municipiosSet = new Set();

  let departamentoId = 1;
  let municipioId = 1;

  data.features.forEach(feature => {

    const departamento = feature.properties.NAME_1.trim().toUpperCase();
    const municipio = feature.properties.NAME_2.trim().toUpperCase();

    // ❌ ignorar registros inválidos (como el lago de izabal)
    if (!municipio || municipio === "?" || municipio === "NA") {
      return;
    }

    // evitar duplicados
    const key = `${departamento}-${municipio}`;
    if (municipiosSet.has(key)) return;
    municipiosSet.add(key);

    // crear departamento si no existe
    if (!departamentosMap.has(departamento)) {
      departamentosMap.set(departamento, {
        id: departamentoId++,
        nombre: departamento,
        municipios: []
      });
    }

    const dep = departamentosMap.get(departamento);

    const municipioObj = {
      id: municipioId++,
      nombre: municipio,
      departamentoId: dep.id
    };

    dep.municipios.push(municipioObj);
  });

  return {
    departamentos: Array.from(departamentosMap.values())
  };
}

const resultado = transformar(geojson);

// guardar archivo
fs.writeFileSync(
  "./muni.json",
  JSON.stringify(resultado, null, 2),
  "utf8"
);

console.log("✅ Archivo muni.json creado sin el lago de Izabal");