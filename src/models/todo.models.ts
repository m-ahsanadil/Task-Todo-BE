import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.models";

@Entity({ name: "todos" })
export class Todo {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
    user: User;

    @Column()
    title: string;

    @Column("text")
    description: string;

    @Column({ default: false })
    isCompleted: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
