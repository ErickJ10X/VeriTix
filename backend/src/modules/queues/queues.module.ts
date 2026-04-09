import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReminderScheduler } from './reminder.scheduler';
import { ReminderProcessor } from './reminder.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          password: config.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),
    BullModule.registerQueue({ name: 'event-reminders' }),
  ],
  providers: [ReminderScheduler, ReminderProcessor],
  exports: [ReminderScheduler],
})
export class QueuesModule {}
