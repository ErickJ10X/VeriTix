import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';

// ── Tipos internos ────────────────────────────────────────────────────────────

type CheckoutSessionCompletedEvent = {
  id: string; // providerSessionId
  payment_intent: string | null; // providerPaymentId
  metadata: { orderId: string };
};

type CheckoutSessionExpiredEvent = {
  id: string; // providerSessionId
  metadata: { orderId: string };
};

type PaymentIntentFailedEvent = {
  id: string; // payment_intent id
  last_payment_error: { message?: string } | null;
};

type ChargeRefundedEvent = {
  payment_intent: string | null; // providerPaymentId
};

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── checkout.session.completed ───────────────────────────────────────────
  // Pago exitoso: marcar Payment COMPLETED + Order COMPLETED
  // providerPaymentId viene del payment_intent de la session

  async handleCheckoutSessionCompleted(
    data: CheckoutSessionCompletedEvent,
  ): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { providerSessionId: data.id },
      select: { id: true, orderId: true },
    });

    if (!payment) {
      this.logger.warn(
        `checkout.session.completed: Payment no encontrado para session ${data.id}`,
      );
      return;
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          providerPaymentId: data.payment_intent ?? undefined,
          paidAt: new Date(),
        },
      }),
      this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.COMPLETED },
      }),
    ]);

    this.logger.log(
      `Order ${payment.orderId} marcada COMPLETED (session ${data.id})`,
    );
  }

  // ── checkout.session.expired ─────────────────────────────────────────────
  // El usuario abandonó el checkout: marcar Payment FAILED + Order CANCELLED
  // + revertir stock de cada TicketType

  async handleCheckoutSessionExpired(
    data: CheckoutSessionExpiredEvent,
  ): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { providerSessionId: data.id },
      select: { id: true, orderId: true },
    });

    if (!payment) {
      this.logger.warn(
        `checkout.session.expired: Payment no encontrado para session ${data.id}`,
      );
      return;
    }

    // Cargar items de la orden para revertir stock
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId: payment.orderId },
      select: { ticketTypeId: true, quantity: true },
    });

    await this.prisma.$transaction(async (tx) => {
      // Revertir availableQuantity
      for (const item of orderItems) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { availableQuantity: { increment: item.quantity } },
        });
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.CANCELLED },
      });
    });

    this.logger.log(
      `Order ${payment.orderId} cancelada por expiración de sesión (session ${data.id})`,
    );
  }

  // ── payment_intent.payment_failed ────────────────────────────────────────
  // Fallo de pago: marcar Payment FAILED con razón del error

  async handlePaymentIntentFailed(
    data: PaymentIntentFailedEvent,
  ): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { providerPaymentId: data.id },
      select: { id: true, orderId: true },
    });

    if (!payment) {
      // Puede llegar antes de que se guarde providerPaymentId — no es error crítico
      this.logger.warn(
        `payment_intent.payment_failed: Payment no encontrado para intent ${data.id}`,
      );
      return;
    }

    const failureReason =
      data.last_payment_error?.message ?? 'Pago rechazado por el procesador';

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        failureReason,
      },
    });

    this.logger.log(`Payment ${payment.id} marcado FAILED: ${failureReason}`);
  }

  // ── charge.refunded ──────────────────────────────────────────────────────
  // Reembolso: marcar Payment REFUNDED + Order REFUNDED + revertir stock

  async handleChargeRefunded(data: ChargeRefundedEvent): Promise<void> {
    if (!data.payment_intent) {
      this.logger.warn('charge.refunded sin payment_intent — ignorado');
      return;
    }

    const payment = await this.prisma.payment.findUnique({
      where: { providerPaymentId: data.payment_intent },
      select: { id: true, orderId: true },
    });

    if (!payment) {
      this.logger.warn(
        `charge.refunded: Payment no encontrado para intent ${data.payment_intent}`,
      );
      return;
    }

    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId: payment.orderId },
      select: { ticketTypeId: true, quantity: true },
    });

    await this.prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { availableQuantity: { increment: item.quantity } },
        });
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REFUNDED },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.REFUNDED },
      });
    });

    this.logger.log(
      `Order ${payment.orderId} marcada REFUNDED (intent ${data.payment_intent})`,
    );
  }
}
