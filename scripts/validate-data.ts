import { existsSync } from 'node:fs';

const dataPath = 'data/2026/copa.yaml';

if (!existsSync(dataPath)) {
  console.log(
    `Nenhuma fonte de dados em ${dataPath}. A validação de dados será habilitada na fatia 2 do PLAN.md.`,
  );
  process.exit(0);
}

console.error(
  `A validação de ${dataPath} ainda não foi implementada. Conclua a fatia 2 do PLAN.md antes de publicar.`,
);
process.exit(1);
