import {
  AbilityBuilder,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  createMongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../users/entities/users.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export class Article {
  id: string;
  isPublished: boolean;
  authorId: string;
}

type Subjects = InferSubjects<typeof Article | typeof UserEntity> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: UserEntity) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    if (user.isAdmin) {
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      user.roles?.forEach((role) => {
        role.permissions?.forEach((permission) => {
          const action = permission.action as Action;
          let subject: any = permission.subject;

          if (subject === 'Article') {
            subject = Article;
          } else if (subject === 'UserEntity') {
            subject = UserEntity;
          }

          can(action, subject);
        });
      });
    }

    can(Action.Update, Article, { authorId: user.id });
    cannot(Action.Delete, Article, { isPublished: true });

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
