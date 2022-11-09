import {Injectable, NotFoundException} from '@nestjs/common';
import {Repository} from "typeorm";
import {User} from "./user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {randomBytes, scrypt as _scrypt} from "crypto";
import {promisify} from "util";

const scrypt = promisify(_scrypt);

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private repo: Repository<User>) {
    }

    create(email: string, password: string) {
        const user = this.repo.create({email, password})
        return this.repo.save(user)
    }

    findOne(id: number) {
        if (!id) {
            return null;
        }
        return this.repo.findOne({where: {id}});
    }

    find(email: string) {
        return this.repo.find({where: {email}});
    }

    async update(id: number, attr: Partial<User>) {
        const user = await this.findOne(id);
        if (!user) {
            throw new NotFoundException('User not found')
        }
        Object.assign(user, attr)
        return this.repo.save(user)
    }

    async remove(id: number) {
        const user = await this.findOne(id)
        if (!user) {
            throw new NotFoundException('User not found')
        }
        return this.repo.remove(user)
    }
}
