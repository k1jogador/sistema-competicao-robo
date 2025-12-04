import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TorneioService } from './torneio.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class TorneioGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  // Variáveis de memória do Cronômetro
  private cronometro: NodeJS.Timeout | null = null;
  private tempoAtualMs: number = 0;
  private rodando: boolean = false;

  // INJETANDO O SERVICE AQUI
  constructor(private torneioService: TorneioService) {}

  async handleConnection(client: any) {
    // Quando o Telão conecta, envia o Ranking atual e o Tempo
    const ranking = await this.torneioService.obterRanking();
    client.emit('ranking_atualizado', ranking);
    client.emit('tempo_atualizado', this.tempoAtualMs);
  }

  // --- GERENCIAMENTO DE EQUIPES ---

  @SubscribeMessage('pedir_equipes')
  async listarEquipes() {
    const equipes = await this.torneioService.listarEquipes();
    this.server.emit('lista_equipes', equipes);
  }

  @SubscribeMessage('criar_equipe')
  async criarEquipe(@MessageBody() data: { nome: string }) {
    await this.torneioService.criarEquipe(data.nome);
    this.listarEquipes();
  }

  // --- CRONÔMETRO ---
  @SubscribeMessage('iniciar_cronometro')
  async iniciar(@MessageBody() data: { teamId: string; teamName: string }) {
    if (this.rodando) return;

    let numeroRodada = 1;
    if (data && data.teamId) {
      try {
        numeroRodada = await this.torneioService.getProximaRodada(data.teamId);
      } catch (e) {
        console.log('Erro ao buscar rodada:', e);
      }
    }

    const nomeEquipe = data ? data.teamName : '---';

    //console.log(`Iniciando rodada: ${nomeEquipe} - ${numeroRodada}ª Tentativa`);

    this.server.emit('info_rodada_atual', {
      teamName: nomeEquipe,
      roundNumber: numeroRodada,
    });

    this.rodando = true;
    this.cronometro = setInterval(() => {
      this.tempoAtualMs += 100;
      this.server.emit('tempo_atualizado', this.tempoAtualMs);
    }, 100);
  }

  @SubscribeMessage('pausar_cronometro')
  pausar() {
    if (this.cronometro) clearInterval(this.cronometro);
    this.rodando = false;
    this.server.emit('cronometro_status', {
      status: 'pausado',
      tempo: this.tempoAtualMs,
    });
  }

  @SubscribeMessage('resetar_cronometro')
  resetar() {
    this.pausar();
    this.tempoAtualMs = 0;
    this.server.emit('tempo_atualizado', 0);
    this.server.emit('zerar_pontuacao');
  }

  // --- PONTUAÇÃO E FINALIZAÇÃO ---

  @SubscribeMessage('adicionar_pontos')
  somarPontos(@MessageBody() dados: { points: number; reason: string }) {
    // Envia para o Telão mostrar o log ao vivo
    this.server.emit('log_ao_vivo', dados);
    this.server.emit('atualizar_placar_tela', { pontos: dados.points });
  }

  @SubscribeMessage('finalizar_rodada')
  async finalizar(
    @MessageBody() dados: { teamId: string; score: number; logs: any[] },
  ) {
    console.log(`Finalizando com ${dados.logs.length} registros de histórico.`);

    // Salva tudo no banco (Nota + Logs)
    await this.torneioService.salvarRodada(
      dados.teamId,
      dados.score,
      this.tempoAtualMs,
      dados.logs,
    );

    const ranking = await this.torneioService.obterRanking();
    this.server.emit('ranking_atualizado', ranking);
    this.server.emit('rodada_salva_sucesso');
    this.resetar();
  }

  @SubscribeMessage('solicitar_relatorio')
  async pedirRelatorio() {
    const relatorio = await this.torneioService.gerarRelatorioGeral();
    this.server.emit('exibir_relatorio_telao', relatorio);
  }
}
