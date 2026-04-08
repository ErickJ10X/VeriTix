import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { TicketsModule } from '../tickets/tickets.module';
import { StripeWebhookService } from './stripe-webhook.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [PrismaModule, StripeModule, TicketsModule],
  controllers: [WebhooksController],
  providers: [StripeWebhookService],
})
export class WebhooksModule {}
