
const COLORS = {
  cluster: {
    'Jornalismo & Esporte': '#7C9CFF',
    'Ficção': '#FF9F6E',
    'Variedades & Entretenimento': '#4CE0B3',
    'Religioso': '#B98CFF'
  },
  genre: {
    'Jornalismo': '#7C9CFF',
    'Esportivo': '#54C7FF',
    'Novela': '#FF9F6E',
    'Filme': '#FFC66B',
    'Variedades': '#4CE0B3',
    'Humor': '#72E6C8',
    'Reality': '#FA6BE3',
    'Documentário': '#68D6A9',
    'Série/Drama': '#FFA8A8',
    'Entrevista': '#8ED7C6',
    'Religioso': '#B98CFF',
    'Infantil': '#F4EA6E'
  }
};

let DASH = null;

function percent(v){ return `${v.toFixed(1)}%`; }
function minutesToHHMM(m){
  const h = Math.floor(m/60);
  const mm = String(m%60).padStart(2,'0');
  return `${String(h).padStart(2,'0')}:${mm}`;
}
function setInsights(data){
  const kpis = data.kpis;
  const topNews = [...kpis].sort((a,b)=>b.news_sport_pct-a.news_sport_pct)[0];
  const topFiction = [...kpis].sort((a,b)=>b.fiction_pct-a.fiction_pct)[0];
  const topReligious = [...kpis].sort((a,b)=>b.religious_pct-a.religious_pct)[0];
  const mostFragmented = [...kpis].sort((a,b)=>b.program_count-a.program_count)[0];
  const container = document.getElementById('headlineInsights');
  const cards = [
    {label:'maior peso jornalístico', value:topNews.channel, desc:`${percent(topNews.news_sport_pct)} do dia em jornalismo + esporte.`},
    {label:'maior peso de ficção', value:topFiction.channel, desc:`${percent(topFiction.fiction_pct)} do dia em ficção.`},
    {label:'maior carga religiosa', value:topReligious.channel, desc:`${percent(topReligious.religious_pct)} do dia em conteúdos religiosos.`},
    {label:'grade mais fragmentada', value:mostFragmented.channel, desc:`${mostFragmented.program_count} programas no dia, sugerindo maior giro de faixas.`}
  ];
  container.innerHTML = cards.map(c=>`
    <div class="insight">
      <div class="label">${c.label}</div>
      <div class="value">${c.value}</div>
      <div class="desc">${c.desc}</div>
    </div>`).join('');
}

function populateControls(data){
  const channels = [...new Set(data.schedule.map(d=>d.channel))];
  const select = document.getElementById('channelFilter');
  channels.forEach(ch=>{
    const opt = document.createElement('option');
    opt.value = ch;
    opt.textContent = ch;
    select.appendChild(opt);
  });
  select.addEventListener('change', renderAll);
  document.getElementById('viewMode').addEventListener('change', renderAll);
}

function filteredSchedule(){
  const selected = document.getElementById('channelFilter').value;
  return selected === 'all' ? DASH.schedule : DASH.schedule.filter(d=>d.channel===selected);
}

function renderTimeline(){
  const view = document.getElementById('viewMode').value;
  const rows = filteredSchedule();
  const keyField = view === 'cluster' ? 'cluster' : 'genre';
  const groups = [...new Set(rows.map(d=>d[keyField]))];
  const traces = groups.map(group=>{
    const sub = rows.filter(d=>d[keyField]===group);
    return {
      type: 'bar',
      orientation: 'h',
      name: group,
      y: sub.map(d=>d.channel),
      x: sub.map(d=>d.duration_min),
      base: sub.map(d=>d.start_min),
      marker: {color: (COLORS[view][group] || '#ccc'), line:{width:0}},
      hovertemplate: '<b>%{customdata[0]}</b><br>Canal: %{y}<br>Início: %{customdata[1]}<br>Fim: %{customdata[2]}<br>Duração: %{customdata[3]} min<br>'+ (view === 'cluster' ? 'Cluster' : 'Gênero') + ': %{customdata[4]}<extra></extra>',
      customdata: sub.map(d=>[d.program,d.start_time,d.end_time,d.duration_min,d[keyField]])
    }
  });

  const layout = {
    barmode:'overlay',
    paper_bgcolor:'rgba(0,0,0,0)',
    plot_bgcolor:'rgba(0,0,0,0)',
    font:{color:'#eef4ff'},
    xaxis:{
      range:[0,1440],
      tickvals:[0,120,240,360,480,600,720,840,960,1080,1200,1320,1440],
      ticktext:['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00','24:00'],
      gridcolor:'rgba(255,255,255,.08)'
    },
    yaxis:{autorange:'reversed', gridcolor:'rgba(255,255,255,.04)'},
    legend:{orientation:'h', y:1.12},
    margin:{l:90,r:20,t:30,b:50},
    height:520
  };
  Plotly.newPlot('timelineChart', traces, layout, {displayModeBar:false, responsive:true});
}

function renderClusterShare(){
  const selected = document.getElementById('channelFilter').value;
  const rows = DASH.summary_cluster.filter(d=>selected==='all' || d.channel===selected);
  const channels = [...new Set(rows.map(d=>d.channel))];
  const clusters = [...new Set(rows.map(d=>d.cluster))];
  const traces = clusters.map(cluster=>{
    const vals = channels.map(ch => {
      const row = rows.find(r=>r.channel===ch && r.cluster===cluster);
      return row ? row.duration_min : 0;
    });
    return {
      type:'bar',
      name:cluster,
      x:channels,
      y:vals,
      marker:{color:COLORS.cluster[cluster]},
      hovertemplate:'%{x}<br>'+cluster+': %{y} min<extra></extra>'
    };
  });
  const layout = {
    barmode:'stack',
    paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)',
    font:{color:'#eef4ff'},
    yaxis:{title:'minutos', gridcolor:'rgba(255,255,255,.08)'},
    xaxis:{gridcolor:'rgba(255,255,255,.04)'},
    legend:{orientation:'h', y:1.18},
    margin:{l:50,r:10,t:20,b:40}
  };
  Plotly.newPlot('clusterShareChart', traces, layout, {displayModeBar:false, responsive:true});
}

function renderRadar(){
  const selected = document.getElementById('channelFilter').value === 'all' ? 'Globo' : document.getElementById('channelFilter').value;
  const row = DASH.kpis.find(d=>d.channel===selected) || DASH.kpis[0];
  const r = [row.news_sport_pct,row.fiction_pct,row.entertainment_pct,row.religious_pct,row.program_count*3];
  const theta = ['Jornalismo + Esporte','Ficção','Variedades + Entretenimento','Religioso','Fragmentação*'];
  const trace = {
    type:'scatterpolar',
    r:r,
    theta:theta,
    fill:'toself',
    line:{color:'#7C9CFF'},
    fillcolor:'rgba(124,156,255,.25)',
    hovertemplate:'%{theta}: %{r}<extra></extra>'
  };
  const layout = {
    paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)',
    font:{color:'#eef4ff'},
    polar:{
      bgcolor:'rgba(0,0,0,0)',
      radialaxis:{visible:true, gridcolor:'rgba(255,255,255,.08)'},
      angularaxis:{gridcolor:'rgba(255,255,255,.05)'}
    },
    margin:{l:30,r:30,t:20,b:20},
    annotations:[{
      text:`<b>${selected}</b><br><span style="color:#a8b7d1">* Fragmentação = nº de programas × 3 para caber na escala</span>`,
      x:0.5,y:1.14,showarrow:false,font:{size:13,color:'#dce6ff'}
    }]
  };
  Plotly.newPlot('radarChart', [trace], layout, {displayModeBar:false, responsive:true});
}

function renderPrimeTime(){
  const rows = DASH.prime.filter(d=>['Jornalismo & Esporte','Ficção','Variedades & Entretenimento','Religioso'].includes(d.cluster));
  const selected = document.getElementById('channelFilter').value;
  const use = selected==='all' ? rows : rows.filter(d=>d.channel===selected);
  const channels = [...new Set(use.map(d=>d.channel))];
  const clusters = ['Jornalismo & Esporte','Ficção','Variedades & Entretenimento','Religioso'];
  const traces = clusters.map(cluster=>{
    const vals = channels.map(ch=>use.filter(d=>d.channel===ch && d.cluster===cluster).reduce((acc,d)=>acc+d.minutes,0));
    return {
      type:'bar', x:channels, y:vals, name:cluster,
      marker:{color:COLORS.cluster[cluster]},
      hovertemplate:'%{x}<br>'+cluster+': %{y} min<extra></extra>'
    };
  });
  const layout = {
    barmode:'stack',
    paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)',
    font:{color:'#eef4ff'},
    yaxis:{title:'minutos entre 18h e 23h', gridcolor:'rgba(255,255,255,.08)'},
    legend:{orientation:'h', y:1.18},
    margin:{l:60,r:10,t:20,b:40}
  };
  Plotly.newPlot('primeTimeChart', traces, layout, {displayModeBar:false, responsive:true});
}

function renderHourly(){
  const selected = document.getElementById('channelFilter').value;
  const rows = selected==='all' ? DASH.hourly : DASH.hourly.filter(d=>d.channel===selected);
  const clusters = [...new Set(rows.map(d=>d.dominant_cluster))];
  const traces = clusters.map(cluster=>{
    const sub = rows.filter(d=>d.dominant_cluster===cluster);
    return {
      type:'scatter',
      mode:'markers',
      name:cluster,
      x:sub.map(d=>`${String(d.hour).padStart(2,'0')}:00`),
      y:sub.map(d=>d.channel),
      marker:{
        symbol:'square',
        size:28,
        color:COLORS.cluster[cluster],
        line:{width:1,color:'rgba(255,255,255,.15)'}
      },
      customdata:sub.map(d=>[d.dominant_program,d.dominant_genre,d.minutes]),
      hovertemplate:'%{y}<br>Hora: %{x}<br>Programa dominante: %{customdata[0]}<br>Gênero: %{customdata[1]}<br>Minutos dominantes: %{customdata[2]}<extra></extra>'
    };
  });
  const layout = {
    paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)',
    font:{color:'#eef4ff'},
    xaxis:{tickangle:-45, gridcolor:'rgba(255,255,255,.05)'},
    yaxis:{autorange:'reversed', gridcolor:'rgba(255,255,255,.05)'},
    legend:{orientation:'h', y:1.2},
    margin:{l:90,r:10,t:20,b:70},
    height:380
  };
  Plotly.newPlot('hourlyChart', traces, layout, {displayModeBar:false, responsive:true});
}

function renderFragmentation(){
  const rows = document.getElementById('channelFilter').value === 'all'
    ? DASH.kpis
    : DASH.kpis.filter(d=>d.channel===document.getElementById('channelFilter').value);
  const trace = {
    type:'bar',
    x:rows.map(d=>d.channel),
    y:rows.map(d=>d.program_count),
    marker:{color:rows.map(d=>d.channel==='Globo' ? '#7C9CFF' : d.channel==='SBT' ? '#4CE0B3' : d.channel==='Record TV' ? '#FF9F6E' : '#B98CFF')},
    hovertemplate:'%{x}<br>%{y} programas no dia<extra></extra>'
  };
  const layout = {
    paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)',
    font:{color:'#eef4ff'},
    yaxis:{title:'programas/dia', gridcolor:'rgba(255,255,255,.08)'},
    margin:{l:50,r:10,t:20,b:40}
  };
  Plotly.newPlot('fragmentationChart', [trace], layout, {displayModeBar:false, responsive:true});
}

function renderTable(){
  const tbody = document.querySelector('#scheduleTable tbody');
  const search = document.getElementById('searchInput').value.toLowerCase();
  const selected = document.getElementById('channelFilter').value;
  const rows = DASH.schedule.filter(d=>{
    const text = `${d.channel} ${d.program} ${d.genre} ${d.cluster}`.toLowerCase();
    const channelOk = selected==='all' || d.channel===selected;
    return channelOk && text.includes(search);
  });
  tbody.innerHTML = rows.map(d=>`
    <tr>
      <td>${d.channel}</td>
      <td>${d.start_time}</td>
      <td>${d.end_time}</td>
      <td>${d.program}</td>
      <td>${d.genre}</td>
      <td>${d.cluster}</td>
      <td>${d.duration_min} min</td>
    </tr>
  `).join('');
}

function renderMethodAndSources(){
  document.getElementById('methodList').innerHTML = DASH.metadata.methodology.map(item=>`<li>${item}</li>`).join('');
  document.getElementById('sourceList').innerHTML = DASH.metadata.sources.map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a></li>`).join('');
}

function renderAll(){
  renderTimeline();
  renderClusterShare();
  renderRadar();
  renderPrimeTime();
  renderHourly();
  renderFragmentation();
  renderTable();
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const res = await fetch('data/dashboard_data.json');
  DASH = await res.json();
  setInsights(DASH);
  populateControls(DASH);
  renderMethodAndSources();
  document.getElementById('searchInput').addEventListener('input', renderTable);
  renderAll();
});
