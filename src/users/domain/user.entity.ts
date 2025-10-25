import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { AbstractEntity } from 'src/database/abstract.entity';
import { Restaurant } from 'src/restaurants/domain/restaurant.entity';

@Entity({ name: 'users' })
export class User extends AbstractEntity<User> {
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  passwordHash: string;

  @Column({ nullable: false })
  restaurantId: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @CreateDateColumn()
  createdAt: Date;
}
