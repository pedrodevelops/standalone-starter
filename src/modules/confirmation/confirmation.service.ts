import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfirmationType } from './enums/confirmation-type.enum';
import { Confirmation } from './models/confirmation.model';

import { addMinutes } from 'date-fns';
import { nanoid } from 'nanoid';

const CONFIRMATION_SELECT = {
  userId: true,
  token: true,
  id: true,
  type: true,
};

@Injectable()
export class ConfirmationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new confirmation request for the action type
   */
  async request(userId: number, type: ConfirmationType) {
    await this.deletePreviousByType(userId, type);
    const confirmation = await this.prisma.confirmation.create({
      data: {
        userId,
        expiry: addMinutes(new Date(), 15),
        token: ConfirmationService.generateToken(),
        type,
        used: false,
      },
      select: CONFIRMATION_SELECT,
    });

    return confirmation;
  }

  /**
   * Consumes a confirmation request for the action type
   */
  async consume(
    token: string,
    desiredType: ConfirmationType,
  ): Promise<Confirmation> {
    const confirmation = await this.prisma.confirmation.findUnique({
      where: {
        token_type: {
          token,
          type: desiredType,
        },
        expiry: {
          gte: new Date(),
        },
      },
      select: CONFIRMATION_SELECT,
    });

    if (!confirmation) {
      throw new NotFoundException(
        'This link has expired, please request again.',
      );
    }

    await this.prisma.confirmation.update({
      where: {
        id: confirmation.id,
      },
      data: {
        used: true,
      },
    });

    return confirmation;
  }

  /**
   * Gets a confirmation by the unique token
   * @param token The unique token of the confirmation
   * @param type The confirmation action type
   */
  async getValidByTokenAndTypeOrThrow(
    token: string,
    type: ConfirmationType,
  ): Promise<Confirmation> {
    const confirmation = await this.prisma.confirmation.findUnique({
      where: {
        token_type: {
          token,
          type,
        },
        expiry: {
          gte: new Date(),
        },
      },
      select: CONFIRMATION_SELECT,
    });

    if (!confirmation) {
      throw new NotFoundException(
        'This link has expired, please request again.',
      );
    }

    return {
      ...confirmation,
      type: ConfirmationType[confirmation.type],
    };
  }

  /**
   * To avoid exploit of previous tokens, delete all previous tokens of the same type
   * @param userId The user whos requesting the confirmation token
   * @param type The confirmation acti
   */
  async deletePreviousByType(userId: number, type: ConfirmationType) {
    await this.prisma.confirmation.deleteMany({
      where: {
        userId,
        type,
      },
    });
  }

  /**
   * Generates a token with not so low collision chance
   * for the sake of querying together with action types
   */
  static generateToken() {
    return nanoid(8);
  }
}
