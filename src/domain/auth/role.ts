import { SetMetadata } from '@nestjs/common';

export enum RoleType {
  USER = 'ROLE_USER', //1
  ADMIN = 'ROLE_ADMIN', //2
  WRITE = 'ROLE_WRITE', //2
  UPDATE = 'ROLE_UPDATE', //2
  GRANT_PERMISSION = 'ROLE_GRANT_PERMISSION', //2
  MASTER = 'ROLE_MASTER', //3
}

const getRoleGrade = (role: RoleType): number => {
  if (!RoleType[role.replace('ROLE_', '')]) throw Error('잘못된 형식입니다.');
  switch (role) {
    case RoleType.USER:
      return 1;
    case RoleType.ADMIN:
      return 2;
    case RoleType.WRITE:
      return 2;
    case RoleType.UPDATE:
      return 2;
    case RoleType.GRANT_PERMISSION:
      return 2;
    case RoleType.MASTER:
      return 3;
  }
};

// 1. user의 grade 가  가드에 필요한 롤들의 grade 보다 높으면 true
// 2. grade 상관없이 롤을 갖고있으면 true
export const roleAccessController = (
  userRoles: RoleType[],
  roles: RoleType[],
  command: 'every' | 'some',
) => {
  if (!roles || !roles.length) return true;
  if (
    Math.max(...roles.map(getRoleGrade)) <
    Math.max(...userRoles.map(getRoleGrade))
  )
    return true;
  return roles[command]((role) => userRoles.includes[role]);
};

export const Roles = (...roles: RoleType[]) => SetMetadata('roles', roles);
