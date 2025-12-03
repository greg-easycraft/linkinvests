import { Global, Module } from '@nestjs/common';
import { EmailService } from './services/email.service.js';

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
