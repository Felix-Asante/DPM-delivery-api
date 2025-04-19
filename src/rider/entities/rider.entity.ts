import { AbstractEntity } from 'src/entities/abstract.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('riders')
export class Rider extends AbstractEntity {
  @Column({ name: 'bike_registration_number' })
  bikeRegistrationNumber: string;

  @Column({ name: 'bike_type' })
  bikeType: string;

  @Column({ name: 'bike_color' })
  bikeColor: string;

  @Column({ name: 'bike_brand' })
  bikeBrand: string;

  @Column({ name: 'bike_model' })
  bikeModel: string;

  @Column({ name: 'bike_year' })
  bikeYear: number;

  @Column({ name: 'bike_image' })
  bikeImage: string;

  @Column({ name: 'identification_document_number' })
  identificationDocumentNumber: string;

  @Column({ name: 'identification_document_type' })
  identificationDocumentType: string;

  @Column({ name: 'identification_document_image' })
  identificationDocumentImage: string;

  @Column({ name: 'document_expiry_date' })
  documentExpiryDate: Date;

  @Column({ name: 'rider_id' })
  @Index()
  riderId: string;
}
