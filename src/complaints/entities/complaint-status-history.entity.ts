import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { complaintStatusEnum } from 'src/utils/enums';
import { User } from 'src/users/entities/user.entity';
import { Complaint } from './complaint.entity';
import { AbstractEntity } from 'src/entities/abstract.entity';

@Entity('complaint_status_history')
export class ComplaintStatusHistory extends AbstractEntity {
  @ManyToOne(() => Complaint, (complaint) => complaint.statusHistory)
  @Index('complaint_id_idx')
  complaintId: Complaint;

  @Column({ enum: complaintStatusEnum })
  oldStatus: complaintStatusEnum;

  @Column({ enum: complaintStatusEnum })
  newStatus: complaintStatusEnum;

  @Column({ nullable: true })
  comment?: string;

  @ManyToOne(() => User, (user) => user.statusHistory)
  @Index('updated_by_user_id_idx')
  updatedBy: User;
}
