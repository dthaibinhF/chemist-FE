import { GroupForm } from './group-form';

interface FormCreateGroupProps {
  onSuccess?: () => void;
}

export const FormCreateGroup = ({ onSuccess }: FormCreateGroupProps) => {
  return (
    <GroupForm
      mode="create"
      onSuccess={onSuccess || (() => { })}
    />
  );
};
