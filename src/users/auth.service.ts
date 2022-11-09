import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {UsersService} from "./users.service";
import {randomBytes, scrypt as _scrypt} from "crypto";
import {promisify} from "util";

const scrypt = promisify(_scrypt)

@Injectable()
export class AuthService {
    constructor(private userService: UsersService) {
    }

    async signUp(email: string, password: string) {
        // check if email is valid

        const candidate = await this.userService.find(email)
        if (candidate.length) {
            throw new BadRequestException('email in use')
        }
        // hash password
        // generate salt
        const salt = randomBytes(8).toString('hex')

        // hash salt and password together
        const hash = await scrypt(password, salt, 32) as Buffer;
        // join the hashed result and password together
        const result = salt + '.' + hash.toString('hex');
        // create user and save user
        const user = await this.userService.create(email, result);
        // return user
        return user;

    }

    async signIn(email: string, password: string) {
        const [user] = await this.userService.find(email)
        if (!user) {
            throw new BadRequestException('user not found')
        }

        const [salt, storedHash] = user.password.split('.')

        const hash = (await scrypt(password, salt, 32)) as Buffer;

        if (storedHash !== hash.toString('hex')  ) {
            throw new BadRequestException('bad password')
        }
        return user;
    }
}