import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { QueuesModule } from '../queues/queues.module';
import { StripeModule } from '../stripe/stripe.module';
import { TicketsModule } from '../tickets/tickets.module';
import { StripeWebhookService } from './stripe-webhook.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [PrismaModule, StripeModule, TicketsModule, QueuesModule],
  controllers: [WebhooksController],
  providers: [StripeWebhookService],
})
export class WebhooksModule {}
