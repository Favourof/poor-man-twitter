import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class Tweet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  author!: string;

  @Column({ length: 280 })
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
