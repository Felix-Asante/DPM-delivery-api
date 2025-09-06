import { Controller } from '@nestjs/common';
import { WalletService } from './wallets.service';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletService) {}
}
