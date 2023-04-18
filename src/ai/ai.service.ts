import { Injectable } from "@nestjs/common";

import featuresKeywords from "./featuresKeywords.json";
import parkingRules from "./parkingRules.json";

@Injectable()
export class AiService {
    protected supportedFeatures = ["snacks", "parking", "assistance", "greetings"];

    protected defaultAnswer: IAnswer = {
        message: "Desculpe, não consegui entender o que você quis dizer, poderia reformular por favor?",
        isTip: false
    };

    protected getFeatures(question: string) {
        let foundFeatures = [];

        for (const feature of featuresKeywords) {
            for (const word of feature.words) {
                if (question.toLocaleLowerCase().includes(word))
                    foundFeatures.push(feature);
            }
        }

        // sort the features by the order field, higher order is last
        // remove duplicate values
        foundFeatures = [...new Set(foundFeatures.sort((a, b) => a.order - b.order).map(f => f.name))];

        return foundFeatures;
    }

    processAnswerParking(): IAnswer[] {
        /* 
        
        OK - SE está no início do semestre ENTÃO o aluno deve evitar os horários padrões de entrada e saída 
        (tentar chegar 20 minutos antes, e sair 20 minutos antes ou após o horário padrão.

        OK - SE o horário não está muito próximo (5min) do horário padrão de saída 
        ENTÃO o aluno deve utilizar a saída do estacionamento das vans.

        OK - Dica adicional a sempre ser exibida: 
        Caso ainda não possua, vale a pena adquirir a credencial do estacionamento, 
        pois com ela é possível economizar nas tarifas, e também evitar a fila de pagamento na cabine.
        */
        let answers = [];

        const now = new Date();

        // primeiramente, vamos verificar se estamos dentro de um dos períodos de alta movimentação
        const mappedHighVolumeDateSpans = parkingRules.highVolumeParkingDates.map(d => {
            let r = d;
            while (r.includes('{year}'))
                r = r.replace('{year}', now.getFullYear().toString());

            return r.split('|');
        });
        
        let isHighVolumeDate = false;
        
        mappedHighVolumeDateSpans.forEach(span => {
            const start = new Date(span[0]);
            const end = new Date(span[1]);

            if (now >= start && now <= end)
                isHighVolumeDate = true;
        });

        // agora, vamos verificar se o horário atual está próximo do horário de saída
        let isNearToExitTime = false;

        for (const time of parkingRules.shiftEndingTimes) {
            const exitTime = new Date();
            exitTime.setHours(Number(time.split(':')[0]));
            exitTime.setMinutes(Number(time.split(':')[1]));

            const diff = Math.abs(now.getTime() - exitTime.getTime());
            const diffMinutes = Math.ceil(diff / (1000 * 60));

            if (diffMinutes <= 5)
                isNearToExitTime = true;
        }

        if (isHighVolumeDate) {
            answers.push({
                message: "Durante este período do semestre o estacionamento costuma ter um grande fluxo de veículos, tente chegar ou sair 20 minutos antes ou depois do horário padrão de entrada e saída.",
                isTip: false
            });
        }

        if (!isNearToExitTime) {
            answers.push({
                message: "Recomendo utilizar a entrada/saída do estacionamento das vans, pois costuma ter menos movimento.",
                isTip: false
            })
        }

        // dica adicional
        answers.push({
            message: "Caso ainda não possua, vale a pena adquirir a credencial do estacionamento, pois com ela é possível economizar nas tarifas, e também evitar a fila de pagamento na cabine.",
            isTip: true
        });

        return answers;
    }

    greetings() {
        const now = new Date();
        const hour = now.getHours();

        if (hour >= 5 && hour < 12)
            return [{
                message: "Bom dia!",
                isTip: false
            }];
        else if (hour >= 12 && hour < 18)
            return [{
                message: "Boa tarde!",
                isTip: false
            }];
        else
            return [{
                message: "Boa noite!",
                isTip: false
            }];
    }

    buildAnswers(features: string[]) {
        if (features.length === 0 || !features.some(f => this.supportedFeatures.includes(f)))
            return [this.defaultAnswer];

        let answers: IAnswer[] = [];

        for (const feature of features) {
            switch (feature) {
                case "greetings":
                    console.log('aquiii');
                    answers.push(...this.greetings());
                    break;
                case "snacks":
                    //
                break;
                case "parking":
                    answers.push(...this.processAnswerParking());
                break;
                case "assistance":
                    //
                break;
            }
        }

        return answers;
    }

    handleQuestion(question: string) {
        const features = this.getFeatures(question);
        console.log(features);
        
        const answers = this.buildAnswers(features);

        return {
            question,
            answers
        };
    }
}