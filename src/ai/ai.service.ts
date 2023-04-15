import { Injectable } from "@nestjs/common";

import featuresKeywords from "./featuresKeywords.json";

@Injectable()
export class AiService {
    protected supportedFeatures = ["snacks", "parking", "assistance"];

    protected defaultAnswer = "Desculpe, não consegui entender o que você quis dizer, poderia reformular por favor?";

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

    buildAnswers(features: string[]) {
        if (features.length === 0 || !features.some(f => this.supportedFeatures.includes(f)))
            return [this.defaultAnswer];

        let answers = [];

        for (const feature of features) {
            switch (feature) {
                case "snacks":
                    answers.push("Vou lhe ajudar a evitar filas nas lancherias!");
                break;
                case "parking":
                    answers.push("Vou lhe ajudar a evitar filas no estacionamento!");
                break;
                case "assistance":
                    answers.push("Vou lhe ajudar a evitar filas no seu atendimento!");
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