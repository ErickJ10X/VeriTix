import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { StripeModule } from '../stripe/stripe.module';
import { StripeWebhookService } from './stripe-webhook.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [PrismaModule, StripeModule],
  controllers: [WebhooksController],
  providers: [StripeWebhookService],
})
export class WebhooksModule {}
