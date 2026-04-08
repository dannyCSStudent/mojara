import { Pressable, ScrollView } from 'react-native';
import { AppText } from '../AppText';
import { AdminUser } from '../../api/users';

const ROLES: AdminUser['role'][] = ['user', 'vendor', 'moderator', 'admin'];

type AdminUserRoleChipsProps = {
  activeRole: AdminUser['role'];
  disabled?: boolean;
  pendingRole?: AdminUser['role'] | null;
  onSelectRole: (role: AdminUser['role']) => void;
};

export function AdminUserRoleChips({
  activeRole,
  disabled = false,
  pendingRole = null,
  onSelectRole,
}: AdminUserRoleChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 12 }}>
      {ROLES.map((role) => {
        const active = role === activeRole;
        const isSavingThisRole = pendingRole === role;

        return (
          <Pressable
            key={role}
            disabled={active || disabled}
            onPress={() => onSelectRole(role)}
            className={`rounded-full border px-3 py-2 ${
              active
                ? 'border-black bg-black dark:border-white dark:bg-white'
                : isSavingThisRole
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300 dark:border-gray-700'
            }`}>
            <AppText
              className={
                active ? 'text-white dark:text-black' : isSavingThisRole ? 'text-white' : ''
              }>
              {isSavingThisRole ? `Saving ${role}...` : role}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
