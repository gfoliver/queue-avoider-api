import { Controller, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller()
export class AiController {
    constructor(private aiService: AiService) {}

    @Get('ask')
    askQuestion(@Query() query) {
        const question = query.question;

        return this.aiService.handleQuestion(question);
    }
}