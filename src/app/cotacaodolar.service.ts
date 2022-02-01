import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { Cotacao } from './cotacao';
import * as moment from 'moment';

@Injectable({ providedIn: 'root' })
export class CotacaoDolarService {
  private apiServerUrl = "http://localhost:8080";

  constructor(private http: HttpClient) { }

  public getCotacaoAtualeData(): Observable<String> {
    return this.http.get<any>(`https://economia.awesomeapi.com.br/last/USD-BRL`).pipe(map(moeda => {
      let data = new Date();
      let dataFormated = moment(data, 'yyyy-MM-DD HH:mm:sss').format("DD/MM/yyyy HH:mm:ss");
      let textoReturn = `${moeda.USDBRL.code} - R$ ${Number(moeda.USDBRL.bid).toFixed(2)} - ${dataFormated}`
      return textoReturn;
    }))
  }

  public getCotacaoAtual(): Observable<number> {
    return this.http.get<any>(`https://economia.awesomeapi.com.br/last/USD-BRL`).pipe(map(moeda => {
      let moedaReturn = moeda.USDBRL.bid
      return moedaReturn;
    }))
  }

  public getCotacaoPorPeriodoFront(dataInicial: string | null, dataFinal: string | null): Observable<Cotacao[]> {
    const diff = moment(dataFinal).diff(moment(dataInicial));
    const dias = moment.duration(diff).asDays() + 1;

    const urlString =
      "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?%40dataInicial='"
      + dataInicial + "'&%40dataFinalCotacao='" + dataFinal + "'&%24format=json&%24skip=0&%24top=" + dias;
    return this.http.get<any>(urlString).pipe(map(result => {
      const retorno: Cotacao[] = [];
      result.value.forEach((value: any) => {
        let datamoment = moment(value.dataHoraCotacao, 'yyyy-MM-DD HH:mm:sss')
        const data = moment(datamoment).format("DD/MM/yyyy");
        const hora = moment(datamoment).format("HH:mm:ss");
        const cotacao: Cotacao = new Cotacao(value.cotacaoCompra, data, new String(hora));
        retorno.push(cotacao);
      });
      return retorno;
    }))
  }
}
