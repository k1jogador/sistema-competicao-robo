const socket = io();

const ITENS_POR_PAGINA = 5;
const TEMPO_PAGINA_MS = 10000;

// ESTADO
let dadosRanking = [];
let paginaAtual = 0;
let intervaloRotacao = null;
let pontosAoVivo = 0;

// DOM
const listaEl = document.getElementById('lista-ranking');
const containerEl = document.getElementById('wrapper-lista');
const areaTimer = document.getElementById('area-cronometro');
const liveScoreEl = document.getElementById('live-score-val');
const liveTeamName = document.getElementById('live-team-name');
const liveRoundNum = document.getElementById('live-round-num');

socket.on('ranking_atualizado', (ranking) => {
  dadosRanking = ranking;
  if (!intervaloRotacao) {
    renderizarPagina();
    iniciarRotacao();
  }
});

socket.on('tempo_atualizado', (ms) => {
  const seg = (ms / 1000).toFixed(1);
  document.getElementById('timer-val').innerText = seg + 's';

  if (ms > 0) {
    // MODO RODADA ATIVA
    areaTimer.style.display = 'flex';
    pararRotacao();
  } else {
    // MODO ESPERA
    areaTimer.style.display = 'none';
    pontosAoVivo = 0;
    liveScoreEl.innerText = '0 pts';
    iniciarRotacao();
  }
});

socket.on('atualizar_placar_tela', (dados) => {
  pontosAoVivo += dados.pontos;
  if (pontosAoVivo < 0) pontosAoVivo = 0;
  liveScoreEl.innerText = pontosAoVivo + ' pts';

  criarEfeitoFlutuante(dados.pontos);
});

function criarEfeitoFlutuante(pontos) {
  const el = document.createElement('div');
  el.classList.add('ponto-flutuante');
  el.innerText = (pontos > 0 ? '+' : '') + pontos;

  if (pontos < 0) el.style.color = 'red';

  document.body.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 1500);
}

socket.on('info_rodada_atual', (dados) => {
  if (liveTeamName) liveTeamName.innerText = dados.teamName;
  if (liveRoundNum) liveRoundNum.innerText = dados.roundNumber + 'ª TENTATIVA';
});

function iniciarRotacao() {
  if (intervaloRotacao) return;
  intervaloRotacao = setInterval(() => {
    if (dadosRanking.length > ITENS_POR_PAGINA) animarTrocaDePagina();
  }, TEMPO_PAGINA_MS);
}

function pararRotacao() {
  if (intervaloRotacao) {
    clearInterval(intervaloRotacao);
    intervaloRotacao = null;
  }
}

function animarTrocaDePagina() {
  containerEl.classList.remove('flip-in');
  containerEl.classList.add('flip-out');

  setTimeout(() => {
    paginaAtual++;
    const totalPaginas = Math.ceil(dadosRanking.length / ITENS_POR_PAGINA);
    if (paginaAtual >= totalPaginas) paginaAtual = 0;

    renderizarPagina();

    containerEl.classList.remove('flip-out');
    containerEl.classList.add('flip-in');
  }, 600);
}

function renderizarPagina() {
  listaEl.innerHTML = '';

  const inicio = paginaAtual * ITENS_POR_PAGINA;
  const fim = inicio + ITENS_POR_PAGINA;
  const timesDaPagina = dadosRanking.slice(inicio, fim);

  if (timesDaPagina.length === 0) {
    listaEl.innerHTML =
      '<div style="text-align:center; color:#999; margin-top:50px;">Aguardando início das rodadas...</div>';
    return;
  }

  timesDaPagina.forEach((time, index) => {
    const posicaoReal = inicio + index + 1;

    let classePos = '';
    if (posicaoReal === 1) classePos = 'pos-1';
    if (posicaoReal === 2) classePos = 'pos-2';
    if (posicaoReal === 3) classePos = 'pos-3';

    let htmlRounds = time.rounds
      .map(
        (r, index) => `
            <div class="badge-rodada">
                <div class="badge-num">${index + 1}ª Rodada</div>
                <strong>${r.score} Pontos</strong>
                <span class="time-bagde">
                    (${(r.timeMs / 1000).toFixed(1)}s)
                </span>
            </div>
        `,
      )
      .join('');

    if (time.rounds.length === 0)
      htmlRounds =
        '<span style="font-size:0.8rem; color:#aaa;">Sem tentativas</span>';

    const html = `
            <div class="team-row ${classePos}">
                
                
                <div class="team-info">
                    <div class="team-name"><span>#${posicaoReal}</span> ${time.name}</div>
                    <div class="team-rounds">
                        ${htmlRounds}
                    </div>
                </div>

                <div class="team-total">
                    <div class="score-big">${time.totalPontos}</div>
                    <div class="score-label">TOTAL PONTOS</div>
                </div>
            </div>
        `;
    listaEl.innerHTML += html;
  });

  const totalPaginas = Math.ceil(dadosRanking.length / ITENS_POR_PAGINA) || 1;
  document.getElementById('paginacao-info').innerText =
    `PÁGINA ${paginaAtual + 1} / ${totalPaginas}`;
}
