# Guerra de Faixas Horárias — TV aberta brasileira

Dashboard interativo pronto para GitHub Pages, focado em **programação, estratégia de grade e concentração editorial** na TV aberta brasileira.

## O que este projeto entrega

- linha do tempo completa da grade de **Globo, SBT, Record TV e Band**
- leitura comparativa de **jornalismo/esporte, ficção, variedades/entretenimento e conteúdo religioso**
- recorte especial de **prime time**
- matriz de **dominância horária**
- tabela exploratória com a grade normalizada
- base de dados em CSV + JSON para reuso

## Recorte desta V1

- **Data:** 02/04/2026
- **Mercado:** TV aberta brasileira
- **Unidade de análise:** minutos por programa/faixa
- **Objetivo:** transformar grade de programação em leitura editorial comparável

## Estrutura do repositório

```text
.
├── index.html
├── style.css
├── app.js
└── data
    ├── dashboard_data.json
    ├── schedule_2026-04-02.csv
    ├── hourly_dominance_2026-04-02.csv
    ├── summary_cluster_2026-04-02.csv
    ├── summary_genre_2026-04-02.csv
    ├── prime_time_2026-04-02.csv
    ├── kpis_2026-04-02.csv
    └── metadata.json
```

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Faça upload de todos os arquivos desta pasta.
3. Vá em **Settings > Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch principal e a pasta **/** (root).
6. Salve. O GitHub vai publicar o dashboard.

## Metodologia

- coleta manual e normalização a partir de páginas públicas de guia de programação;
- recorte diário de **00:00 a 24:00**;
- classificação editorial em dois níveis:
  - **gênero normalizado**
  - **macrocluster editorial**
- projeto estruturado para receber novos dias e evoluir para série histórica, inclusive com:
  - comparação entre dias úteis vs fim de semana;
  - evolução semanal;
  - mudanças de grade;
  - leitura de elasticidade em coberturas especiais.

## Fontes públicas utilizadas

### Guias utilizados para a coleta desta versão
- https://meuguia.tv/programacao/canal/GRD
- https://meuguia.tv/programacao/canal/SBT
- https://meuguia.tv/programacao/canal/REC
- https://meuguia.tv/programacao/canal/BAN

### Páginas oficiais consultadas
- https://redeglobo.globo.com/sao-paulo/programacao/
- https://tv.sbt.com.br/programacao
- https://record.r7.com/programacao/
- https://www.band.com.br/programacao

## Próximas evoluções recomendadas

### v2
- adicionar segunda a domingo;
- criar comparação entre **manhã, tarde, access e prime time**;
- medir peso de **ao vivo** e janelas locais.

### v3
- incorporar série histórica de alterações de grade;
- criar indicador próprio de:
  - fragmentação;
  - pressão jornalística;
  - dominância de ficção;
  - sobreposição competitiva por faixa.

### v4
- integrar texto editorial + dashboard + carrossel de LinkedIn.

## Observações

Esta V1 é um **snapshot editorial robusto**, não uma leitura de audiência.  
Ela mostra **como cada emissora escolheu ocupar o dia** — o que já diz muito sobre estratégia, hábito, retenção e posicionamento.
