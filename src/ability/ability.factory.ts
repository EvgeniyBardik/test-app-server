import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Company } from 'src/companies/companies.model';
import { User } from 'src/users/users.model';
import { Actions } from './actions.enum';

type Subjects = InferSubjects<typeof Company | typeof User> | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;

@Injectable()
export class AbilityFactory {
  createForUser(user: User) {
    const { can, build } = new AbilityBuilder<Ability<[Actions, Subjects]>>(
      Ability as AbilityClass<AppAbility>,
    );

    if (user.role === 'ADMIN') {
      can(Actions.Manage, 'all');
    } else {
      can(Actions.Manage, User, { id: user.id });
      can(Actions.Manage, Company, { userId: user.id });
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
