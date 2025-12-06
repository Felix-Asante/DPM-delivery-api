import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShippingOrder } from 'src/shipping/entities/shipping-order.entity';
import { ShipmentCost } from 'src/shipping/entities/shipment-cost.entity';
import { PayoutRequest } from 'src/wallets/entities/payout-request.entity';
import { PayoutRequestStatus } from 'src/utils/enums';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const mockShipmentCostQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  const mockShipmentCostRepo = {
    createQueryBuilder: jest.fn(() => mockShipmentCostQueryBuilder),
  };

  const mockPayoutRequestQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  const mockPayoutRequestRepo = {
    createQueryBuilder: jest.fn(() => mockPayoutRequestQueryBuilder),
  };

  const mockShippingOrderRepo = {
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(ShippingOrder),
          useValue: mockShippingOrderRepo,
        },
        {
          provide: getRepositoryToken(ShipmentCost),
          useValue: mockShipmentCostRepo,
        },
        {
          provide: getRepositoryToken(PayoutRequest),
          useValue: mockPayoutRequestRepo,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return dashboard analytics', async () => {
    // Mock return values
    mockShipmentCostQueryBuilder.getRawOne.mockResolvedValue({
      totalRevenue: '1000',
    });
    mockPayoutRequestQueryBuilder.getRawOne
      .mockResolvedValueOnce({ totalPayouts: '500' }) // First call for total payouts
      .mockResolvedValueOnce({ pendingPayouts: '200' }); // Second call for pending payouts
    mockShippingOrderRepo.count.mockResolvedValue(50);

    const result = await service.getDashboardAnalytics();

    expect(result).toEqual({
      totalRevenue: 1000,
      totalPayouts: 500,
      pendingPayouts: 200,
      totalOrders: 50,
    });

    expect(mockShipmentCostRepo.createQueryBuilder).toHaveBeenCalled();
    expect(mockPayoutRequestRepo.createQueryBuilder).toHaveBeenCalledTimes(2); // Called twice
    expect(mockShippingOrderRepo.count).toHaveBeenCalled();
  });
});
