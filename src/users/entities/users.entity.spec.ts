import * as bcrypt from 'bcrypt';
import { UserEntity } from './users.entity';

describe('UserEntity password hashing', () => {
  it('should validate a password that is already hashed before insert', async () => {
    const user = new UserEntity();
    user.email = 'test@example.com';
    user.name = 'Test User';
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash('Password123!', user.salt);

    await user.hashPasswordBeforeInsert();

    expect(await user.validatePassword('Password123!')).toBe(true);
  });
});
